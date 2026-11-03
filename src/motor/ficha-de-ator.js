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
     A ÚLTIMA PALAVRA  de quem é, e o que essa pessoa quer — nunca a forma
                       (nem a fala a meio, nem a pergunta, nem o dilema)
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
                ("passa" | "falha" | "fio"); sem ela, o dado lê-se da
                própria frase (O_DADO_NA_FRASE: o envelope do teste que o
                App manda depois de rolar, e que o servidor recebe igual);
                sem dado nenhum, a aposta fica como o que está em jogo
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
   que ele disse.

   A LUTA INTEIRA (03/11, depois do teste às cegas). Em s10#58 a frase
   trazia «Turno dos inimigos (…): . Meus companheiros agiram:
   Saoirse→Capanga da faca: errou.» — e a ficha cortava-a do ACONTECEU sem
   a dizer: só lia o golpe que acerta com nome de golpe, e o do companheiro
   que «usou» alguma coisa. Nenhum dos três narradores narrou a luta. As
   fontes, todas montadas no App (resolverRevide, o golpe do herói, as
   habilidades) e todas lidas aqui pela mesma régua:
     · o golpe de quem quer que seja (`linhaParaMestre`, combate.js): o
       acerto, o erro, o erro feio, quem cai, quem é poupado, o furtivo;
     · o que o companheiro fez: o golpe, a habilidade, a cura, a guarda, a
       poção, o apoio que deixa alguém de pé com outra força;
     · a fuga e o recuo de quem dá as costas ao herói;
     · o herói que cai a zero;
     · o golpe do próprio herói (o envelope COMBATE) e as habilidades dele
       (HABILIDADES, resolvidas e declaradas), com as aflições que deixam;
     · as aflições do golpe inimigo e a salvaguarda (na nota, como
       envelopes), os golpes de oportunidade, o custo da fuga, e a luta que
       acaba sem saída.
   Cada entrada vira um fato na língua do ator (A_LUTA_DITA); a que a régua
   não conhece fica «sem tradução» no rastro — a suíte di-lo no dia em que
   o App mudar a forma. */
export const FRASE_DO_SISTEMA = Object.freeze({
  corte: /\s*(?:Turno dos inimigos \(|Meus companheiros agiram:|ATENÇÃO: eu caí|\[(?!CAIU\b)[\p{Lu}][\p{Lu} ]{2,})/u,
  inimigos: /Turno dos inimigos \([^)]*\):\s*/u,
  companheiros: /Meus companheiros agiram:\s*/u,
  /* onde começa cada pedaço do que o sistema resolveu */
  marca: /Turno dos inimigos \([^)]*\):|Meus companheiros agiram:|ATENÇÃO: (?=eu caí)|\[(?!CAIU\b)(\p{Lu}[\p{Lu} ]{2,}[^\]]*)\]/gu,
  /* quem dá as costas (resolverRevide): a fuga, e o recuo que custa a queda */
  fuga: / (FUGIU da luta(?: levando \d+ de dano ao dar as costas| ileso)|tentou fugir e CAIU com o golpe de oportunidade \(\d+\)|recuou para disparar e CAIU com o golpe de oportunidade \(\d+\))/u,
  fimDaFuga: /^(?:; |\s*\(rolado pelo sistema — [^)]*\)\.|\. Com isso a luta ACABOU — [^.]*\.|\.)/u,
  acabou: /^\. Com isso a luta ACABOU/u,
  /* as cabeças: o golpe do herói e as habilidades dele */
  combate: /^\[COMBATE — RESOLVIDO PELO SISTEMA\] Minha sequência de [^:]*: ([\s\S]*?)\. O dano já foi aplicado\.([\s\S]*?)(?: NÃO recalcule nem mude números[\s\S]*?Ação declarada: ([\s\S]*))?$/u,
  habilidades: /^\[HABILIDADES — RESOLVIDAS PELO SISTEMA\] No MESMO turno usei ([\s\S]*?)\. O SISTEMA já rolou o acerto, calculou e APLICOU tudo: ([\s\S]*?)(?: Narre a sequência inteira como UM só turno meu[\s\S]*?Minha intenção: ([\s\S]*))?$/u,
  declaradas: /^\[HABILIDADES\] No MESMO turno uso ([\s\S]*?) \(PM já descontados; tenho \d+\)\. COMO eu as uso: ([\s\S]*?)(?: Narre a sequência conforme minha intenção[\s\S]*)?$/u,
  nomeDaHabilidade: /"([^"]+)"(?: \[[^\]]*\])?/gu,
  /* o golpe: «A (Golpe)→B: errou | erro desastroso | N de dano = …» */
  seta: /^(.+?)(?: \(([^)]+)\))?→(.+?): (.+)$/u,
  dano: /^\d+ de dano = ([^(,[\]—]+)/u,
  dePe: /, de pé com (\d+)\/(\d+)/u,
  caiu: /, CAIU\b/u,
  guia: /\[narre como: ([^\];\]]+)/u,
  poupado: / — mas foi poupado\b/u,
  furtivo: / — o Ataque Furtivo soma\b/u,
  critico: /\(crítico\)/u,
  heroiCaiu: /^eu caí a 0 PV e estou (à beira da morte|inconsciente)/u,
});

/* A LUTA DITA: cada coisa que o sistema resolveu, como fato de cena. {A}
   quem age, {B} quem leva, {C} com quê (o golpe, entre parênteses), {S} a
   força do golpe, {F} o corpo que fica, {X}/{Y} a coisa (habilidade, item,
   condição), {L} uma lista, {H} o herói. Nenhum número: o corpo vai em
   palavras (CORPO_FALADO), o dano pela força que o sistema já mediu. */
export const A_LUTA_DITA = Object.freeze({
  erra: "{A} ataca {B}{C}, e falha",
  erraFeio: "{A} ataca {B}{C}, e falha feio",
  acerta: "{A} acerta {B}{C}: {S}",
  emCheio: "em cheio",
  fica: "; {B} fica {F}",
  furtivo: "; {B} não viu o golpe chegar",
  derruba: "{A} derruba {B}{C}: {B} cai",
  poupa: "{A} derruba {B}{C}, mas poupa-lhe a vida: {B} cai sem sentidos",
  imune: "{A} acerta {B}, e o golpe atravessa sem encontrar carne: aquele corpo não cede a arma comum",
  aflige: "{B} fica {X}",
  resiste: "{B} resiste, e não fica {X}",
  cura: "{A} usa {X} em {B}, e as feridas fecham",
  ergue: "{A} ergue {X} — {Y}",
  reforca: "{A} firma de novo a guarda que já sustenta",
  daItem: "{A} dá {X} a {B}",
  apoio: "{A} usa {X}",
  deixa: "{A} usa {X}, e {B} fica {Y}",
  foge: "{A} foge da luta",
  fogeFerido: "{A} foge da luta, golpeado ao dar as costas",
  fogeECai: "{A} tenta fugir, e cai, golpeado ao dar as costas",
  recuaECai: "{A} recua para disparar, e cai, golpeado ao sair",
  acabou: "A luta acaba ali",
  heroiBeira: "{H} cai, e está à beira da morte",
  heroiCai: "{H} cai sem sentidos, entre a vida e a morte; um aliado ainda pode erguer {H}",
  dePe: "Ainda de pé: {L}",
  noChao: "No chão: {L}",
  fugiram: "Fugiram da luta: {L}",
  habUsa: "{H} usa {X}",
  habAcerta: "{H} acerta {B} com {X}",
  habCritico: "{H} acerta {B} com {X}, em cheio",
  habCai: ": {B} cai",
  habParcial: "{B} aguenta parte de {X}",
  habSalta: "{X} salta também para {B}",
  habArea: "{X} apanha também {B}",
  habFogoAmigo: "{X} apanha também {B}, do lado de {H}",
  habDrena: "{H} bebe a vida que tira, e as feridas fecham um pouco",
  habImune: "{X} não fere {B}: aquele corpo não cede a poder comum",
  habErra: "{H} tenta {X} contra {B}, e falha",
  habErraFeio: "{H} tenta {X} contra {B}, e falha feio",
  habColhe: "{X} derruba {B}",
  habNinguem: "{X} passa pelo campo, e não derruba ninguém",
  habExecuta: "{X} acaba com {B}: {B} cai",
  oportunidade: "Ao recuar, {H} dá as costas: {L}",
  custoDaFuga: "Ao fugir, {H} dá as costas: {L}",
  acertaOHeroi: "{A} acerta {H}",
  falhaOHeroi: "{A} falha",
});
/* a luta que acaba sem saída (saida-da-luta.js) vem na primeira pessoa do
   herói: aqui ela passa à terceira, forma a forma */
const A_LUTA_NA_TERCEIRA = [
  [/deixou-nos no chão/g, "deixou {H} e o grupo no chão"], [/deixou-me no chão/g, "deixou {H} no chão"],
  [/deu-nos as costas/g, "deu as costas a {H} e ao grupo"], [/deu-me as costas/g, "deu as costas a {H}"],
  [/o que carregávamos/g, "o que levavam"], [/o que eu carregava/g, "o que {H} levava"],
  [/amarrou-nos, levou a bolsa e levou-nos consigo: acordamos presos, nas mãos dele/g, "amarrou {H} e o grupo, levou a bolsa e levou-os consigo: acordam presos, nas mãos dele"],
  [/atou-me as mãos, levou a bolsa e levou-me consigo: acordo preso, nas mãos dele/g, "atou as mãos a {H}, levou a bolsa e levou {H} consigo: acorda preso, nas mãos dele"],
  [/recolheu o meu corpo e recuou/g, "recolheu o corpo de {H} e recuou"],
  [/Ninguém me acudiu, e o corpo não aguentou: morri no chão onde caí/g, "Ninguém acudiu {H}, e o corpo não aguentou: {H} morreu no chão onde caiu"],
  [/Levou \d+ moedas — a bolsa está vazia/g, "Levou as moedas todas: a bolsa está vazia"],
  [/(\d+) (horas?) depois acordo com \d+ PV(, e quem caiu comigo também)?/g, (_, n, h, comigo) => `${maiuscula(n === "1" ? "uma" : porExtenso(Number(n)))} ${h} depois, {H} acorda, a custo${comigo ? ", e quem caiu com {H} também" : ""}`],
];
/* O DADO NA FRASE (03/11, antes do teste às cegas). Quando é que o dado já
   rolou? No App, o jogador declara, o sistema pede o teste, o dado rola na
   tela, e só então `concluirRolagem` chama `enviar` — com o ENVELOPE do
   teste como frase do turno («[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA]
   … Resultado: SUCESSO.», o «POR UM FIO» quando passou pagando, o social, a
   busca vazia). A pauta desse turno monta-se sobre essa frase, e é aí que A
   APOSTA pode vir com o dado já decidido. O servidor recebe a mesma frase
   no corpo. Logo o resultado não precisa de outra via: lê-se da frase, pela
   mesma regra nos dois lados. A primeira que bate ganha (o fio antes do
   sucesso, porque o fio também diz SUCESSO). */
export const O_DADO_NA_FRASE = Object.freeze([
  { de: /\bPOR UM FIO\b/u, ramo: "fio" },
  { de: /Resultado: (?:SUCESSO|sucesso)\b|\[TESTE — SUCESSO AUTOMÁTICO\]|\[SOCIAL — [^\]]*\][^[]*? e CONSEGUI\b|\[BUSCA CONCLUÍDA/u, ramo: "passa" },
  { de: /Resultado: (?:FALHA|falha)\b|\[SOCIAL — [^\]]*\][^[]*? e NÃO consegui\b/u, ramo: "falha" },
]);
export function oDadoDaFrase(frase) {
  const t = str(frase);
  const r = O_DADO_NA_FRASE.find((x) => x.de.test(t));
  return r ? r.ramo : null;
}
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));
/* parte em «;» fora de parênteses e colchetes (o «[narre como: a; b]» e o
   «(GD 5 vs meu GD 2; …)» são de uma entrada só); um pedaço que não
   começa outra entrada (sem seta nem verbo de quem age) cola ao anterior;
   no desfecho de uma habilidade cada parte é uma entrada (`colar` falso) */
const COMECA_ENTRADA = /→| usou | lançou | ergueu | reforçou | deu | ficou | resistiu e não ficou | — IMUNE|^drenei |^ninguém estava abaixo|\[CAIU/u;
function partir(s, colar = true) {
  const out = []; let d = 0, cur = "";
  for (const ch of str(s)) {
    if (ch === "(" || ch === "[") d++;
    else if ((ch === ")" || ch === "]") && d > 0) d--;
    if (ch === ";" && d === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  const fica = [];
  for (const p of out.map((x) => limpo(x).replace(/[.\s]+$/, "")).filter(Boolean)) {
    if (colar && fica.length && !COMECA_ENTRADA.test(p)) fica[fica.length - 1] += "; " + p; else fica.push(p);
  }
  return fica;
}
/* quem dá as costas: o nome é o que vem antes do verbo, desde a última
   pausa — palavras com maiúscula, e as ligadas por «da/de/do» («Capanga
   da faca») */
const LIGA = /^d[aeo]s?$/u;
function nomeNoFim(antes) {
  const pal = str(antes).split(/\s+/);
  let ini = -1;
  for (let i = pal.length - 1; i >= 0; i--) {
    const p = pal[i];
    if (!p || /[.,;:!?»\])]$/.test(p)) break;
    if (/^\p{Lu}/u.test(p)) { ini = i; continue; }
    if (LIGA.test(p) && i > 0 && /^\p{Lu}/u.test(pal[i - 1])) continue;
    if (ini < 0 && i > 0 && LIGA.test(pal[i - 1])) continue;
    break;
  }
  if (ini < 0) return null;
  const nome = pal.slice(ini).join(" ");
  return { nome, ini: str(antes).lastIndexOf(nome) };
}
/* um golpe («A (Golpe)→B: …», linhaParaMestre) → o fato, ou null */
function oGolpe(txt, c, poe, com) {
  const S = FRASE_DO_SISTEMA, D = A_LUTA_DITA;
  const m = str(txt).match(S.seta);
  if (!m) return null;
  const A = m[1].trim(), B = m[3].trim(), r = m[4];
  const golpe = com || m[2];
  const v = { A, B, C: golpe ? ` (${golpe.toLowerCase()})` : "" };
  poe(A, "de pé");
  if (/^erro desastroso/u.test(r)) { poe(B, "de pé"); return tpl(D.erraFeio, v); }
  if (/^errou/u.test(r)) { poe(B, "de pé"); return tpl(D.erra, v); }
  const d = r.match(S.dano);
  if (!d) return null;
  const rotulo = d[1].trim();
  if (S.caiu.test(r) || rotulo === "abate") { poe(B, "no chão", true); return tpl(S.poupado.test(r) ? D.poupa : D.derruba, v); }
  const pe = r.match(S.dePe), g = r.match(S.guia);
  poe(B, "de pé", true);
  return tpl(D.acerta, { ...v, S: S.critico.test(r) ? `${rotulo}, ${D.emCheio}` : rotulo })
    + (g ? ` — ${g[1].trim()}` : "")
    + (pe ? tpl(D.fica, { B, F: corpo(Number(pe[1]), Number(pe[2])) }) : "")
    + (S.furtivo.test(r) ? tpl(D.furtivo, { B }) : "");
}
/* o que o companheiro (e o herói) faz na luta, primeiro o mais estreito */
const LINHAS_DA_LUTA = [
  { de: /^(.+?) usou (.+?): (.+?→.+)$/u, o: (m, c, poe) => oGolpe(m[3], c, poe, m[2]) },
  { de: /→/u, o: (m, c, poe) => oGolpe(m.input, c, poe) },
  { de: /^(.+?) lançou (.+?) em (.+?) \(\+\d+ PV, agora ([^)]*)\)/u, o: (m, c, poe) => { poe(m[3], "de pé", true); const pv = m[4].match(/(\d+)\/(\d+)/); return tpl(A_LUTA_DITA.cura, { A: m[1], X: m[2], B: m[3] }) + (pv ? tpl(A_LUTA_DITA.fica, { B: m[3], F: corpo(Number(pv[1]), Number(pv[2])) }) : ""); } },
  { de: /^(.+?) ergueu (.+?) — ([^.]+)/u, o: (m) => tpl(A_LUTA_DITA.ergue, { A: m[1], X: m[2], Y: m[3].trim() }) },
  { de: /^(.+?) reforçou uma guarda/u, o: (m) => tpl(A_LUTA_DITA.reforca, { A: m[1] }) },
  { de: /^(.+?) usou (.+?) em mim\b/u, o: (m, c) => tpl(A_LUTA_DITA.daItem, { A: m[1], X: m[2], B: c.H }) },
  { de: /^(.+?) deu (.+?) a (.+?) — /u, o: (m) => tpl(A_LUTA_DITA.daItem, { A: m[1], X: m[2], B: m[3] }) },
  { de: /^(.+?) usou (.+?) e deixou (no grupo inteiro|em (.+?)) (\S.*?) — /u, o: (m) => tpl(A_LUTA_DITA.deixa, { A: m[1], X: m[2], B: m[4] || "o grupo inteiro", Y: m[5] }) },
  { de: /^(.+?) usou ([^(]+?)(?: \(efeito de apoio[^)]*\))?$/u, o: (m) => tpl(A_LUTA_DITA.apoio, { A: m[1], X: m[2] }) },
  { de: /^(.+?) resistiu e não ficou (.+)$/u, o: (m) => tpl(A_LUTA_DITA.resiste, { B: m[1], X: m[2] }) },
  { de: /^(.+?) ficou (.+)$/u, o: (m) => tpl(A_LUTA_DITA.aflige, { B: m[1], X: m[2] }) },
  { de: /^(.+?) — IMUNE\b/u, o: (m, c, poe) => { poe(m[1], "de pé"); return tpl(A_LUTA_DITA.imune, { A: c.H, B: m[1] }); } },
];
/* uma parte do desfecho de uma habilidade (ENVELOPES_DO_DESFECHO); `cai`
   diz onde a parte marca a queda (o grupo do «[CAIU]», ou 0: sempre) */
const PARTES_DA_HABILIDADE = [
  { de: /^(.+?) — CRÍTICO, \d+ de dano \([^)]*\)( \[CAIU\])?$/u, o: (m, v) => tpl(A_LUTA_DITA.habCritico, { ...v, B: m[1] }) + (m[2] ? tpl(A_LUTA_DITA.habCai, { B: m[1] }) : ""), cai: 2 },
  { de: /^(.+?) — \d+ de dano \([^)]*\)( \[CAIU\])?$/u, o: (m, v) => tpl(A_LUTA_DITA.habAcerta, { ...v, B: m[1] }) + (m[2] ? tpl(A_LUTA_DITA.habCai, { B: m[1] }) : ""), cai: 2 },
  { de: /^(.+?) — resistiu parcialmente \([^)]*\)( \[CAIU\])?$/u, o: (m, v) => tpl(A_LUTA_DITA.habParcial, { ...v, B: m[1] }) + (m[2] ? tpl(A_LUTA_DITA.habCai, { B: m[1] }) : ""), cai: 2 },
  { de: /^(.+?) — \d+ de dano pela magia GEMINADA( \[CAIU\])?$/u, o: (m, v) => tpl(A_LUTA_DITA.habSalta, { ...v, B: m[1] }) + (m[2] ? tpl(A_LUTA_DITA.habCai, { B: m[1] }) : ""), cai: 2 },
  { de: /^(.+?) — \d+ de dano pela área( \[CAIU\])?$/u, o: (m, v) => tpl(A_LUTA_DITA.habArea, { ...v, B: m[1] }) + (m[2] ? tpl(A_LUTA_DITA.habCai, { B: m[1] }) : ""), cai: 2 },
  { de: /^(.+?) apanhou \d+ de (.+?), o meu próprio ataque$/u, o: (m, v) => tpl(A_LUTA_DITA.habFogoAmigo, { ...v, B: m[1] }) },
  { de: /^(.+?) resistiu e não ficou (.+)$/u, o: (m) => tpl(A_LUTA_DITA.resiste, { B: m[1], X: m[2] }) },
  { de: /^(.+?) ficou (.+)$/u, o: (m) => tpl(A_LUTA_DITA.aflige, { B: m[1], X: m[2] }) },
  { de: /^drenei \d+ PV$/u, o: (m, v) => tpl(A_LUTA_DITA.habDrena, v) },
  { de: /^(.+?) — IMUNE\b/u, o: (m, v) => tpl(A_LUTA_DITA.habImune, { ...v, B: m[1] }) },
  { de: /^(.+?) — (errou|erro desastroso) \(/u, o: (m, v) => tpl(m[2] === "errou" ? A_LUTA_DITA.habErra : A_LUTA_DITA.habErraFeio, { ...v, B: m[1] }) },
  { de: /^(.+?) \[CAIU — estava abaixo de [^\]]*\]$/u, o: (m, v) => tpl(A_LUTA_DITA.habColhe, { ...v, B: m[1] }), cai: 0 },
  { de: /^ninguém estava abaixo de .*NÃO derrubou ninguém$/u, o: (m, v) => tpl(A_LUTA_DITA.habNinguem, v) },
  { de: /^(.+?) \[CAIU — .+? executa quem está abaixo de [^\]]*\]$/u, o: (m, v) => tpl(A_LUTA_DITA.habExecuta, { ...v, B: m[1] }), cai: 0 },
];
/* a frase do turno: o que o herói disse, e cada coisa que o sistema já
   resolveu, em fato. `luta` é quem esteve na luta e como ficou (para o
   «ainda de pé»); `soltas`, o que a régua não conhece. */
function aFraseDoTurno(frase, c) {
  const S = FRASE_DO_SISTEMA, D = A_LUTA_DITA, H = c.H;
  let t = limpo(frase);
  const fatos = [], envelopes = [], soltas = [], luta = new Map();
  const poe = (n, e, forte) => { const k = limpo(n); if (k && (forte || !luta.has(k))) luta.set(k, e); };
  const entrada = (p, regras, extra) => {
    for (const r of regras) {
      const m = p.match(r.de);
      if (!m) continue;
      const o = r.o(m, extra || c, poe);
      if (!o) continue;
      if (r.cai != null) poe(m[1], r.cai === 0 || m[r.cai] ? "no chão" : "de pé", true);
      return o;
    }
    soltas.push(p);
    return null;
  };
  /* 0. quem deu as costas (a fuga e o recuo) sai primeiro: vem colado à
     fala do herói, sem marca nenhuma antes */
  const fugas = []; let acabou = false;
  for (let guarda = 0; guarda < 20; guarda++) {
    const m = t.match(S.fuga);
    if (!m) break;
    const nm = nomeNoFim(t.slice(0, m.index));
    const ini = nm ? nm.ini : m.index;
    let fim = m.index + m[0].length;
    const f = t.slice(fim).match(S.fimDaFuga);
    if (f) { if (S.acabou.test(f[0])) acabou = true; fim += f[0].length; }
    if (nm) fugas.push({ A: nm.nome, como: m[1] }); else soltas.push(m[1]);
    t = limpo(`${t.slice(0, ini)} ${t.slice(fim)}`);
  }
  /* 1. a cabeça: o golpe do herói, as habilidades, ou a fala e o resto */
  let fala, rodada = "", mc;
  const heroi = [];
  const aoCorte = (s) => { const i = str(s).search(S.corte); return i < 0 ? [str(s), ""] : [s.slice(0, i), s.slice(i)]; };
  if ((mc = t.match(S.combate))) {
    fala = limpo(mc[3] || "");
    for (const p of partir(mc[1])) { const o = entrada(p, LINHAS_DA_LUTA); if (o) heroi.push(o); }
    rodada = mc[2];
  } else if ((mc = t.match(S.habilidades))) {
    fala = limpo(mc[3] || "");
    const [desf, depois] = aoCorte(mc[2]);
    for (const d of limpo(desf).replace(/\.$/, "").split(/\s·\s/)) {
      const hm = d.match(/^"([^"]+)"(?: \[[^\]]*\])?: ([\s\S]+)$/u);
      if (!hm) { soltas.push(d); continue; }
      for (const p of partir(hm[2], false)) { const o = entrada(p, PARTES_DA_HABILIDADE, { H, X: hm[1] }); if (o) heroi.push(o); }
    }
    rodada = depois;
  } else if ((mc = t.match(S.declaradas))) {
    const [acao, depois] = aoCorte(mc[2]);
    fala = limpo(acao).replace(/\.$/, "");
    const nomes = [...mc[1].matchAll(S.nomeDaHabilidade)].map((x) => x[1]);
    if (nomes.length) heroi.push(tpl(D.habUsa, { H, X: nomes.join(" e depois ") }));
    rodada = depois;
  } else {
    const i = t.search(S.corte);
    fala = i < 0 ? t : t.slice(0, i).trim();
    rodada = i < 0 ? "" : t.slice(i);
  }
  fatos.push(...heroi);
  for (const f of fugas) {
    const q = /^FUGIU da luta levando/u.test(f.como) ? D.fogeFerido : /^FUGIU/u.test(f.como) ? D.foge : /^tentou fugir/u.test(f.como) ? D.fogeECai : D.recuaECai;
    poe(f.A, /^FUGIU/u.test(f.como) ? "fugiu" : "no chão", true);
    fatos.push(tpl(q, { A: f.A }));
  }
  if (acabou) fatos.push(D.acabou);
  /* 2. a rodada, pedaço a pedaço */
  const marcas = [...str(rodada).matchAll(S.marca)];
  marcas.forEach((m, k) => {
    const txt = rodada.slice(m.index + m[0].length, k + 1 < marcas.length ? marcas[k + 1].index : rodada.length).trim();
    if (m[1]) { envelopes.push({ tipo: m[1].split("—")[0].trim(), texto: txt }); return; }
    if (/^ATENÇÃO/u.test(m[0])) {
      const a = txt.match(S.heroiCaiu);
      if (!a) { soltas.push(txt); return; }
      poe(H, "no chão", true);
      fatos.push(tpl(a[1] === "à beira da morte" ? D.heroiBeira : D.heroiCai, { H }));
      return;
    }
    for (const p of partir(txt)) { const o = entrada(p, LINHAS_DA_LUTA); if (o) fatos.push(o); }
  });
  return { fala, fatos: fatos.map((f) => ponto(maiuscula(f))), envelopes, soltas, luta };
}
/* quem esteve na luta e como ficou, quando a pauta não o disse */
function oQueFicouDaLuta(luta) {
  const de = (e) => [...luta].filter(([, x]) => x === e).map(([n]) => n);
  const out = [];
  if (de("de pé").length) out.push(tpl(A_LUTA_DITA.dePe, { L: de("de pé").join(", ") }));
  if (de("no chão").length) out.push(tpl(A_LUTA_DITA.noChao, { L: de("no chão").join(", ") }));
  if (de("fugiu").length) out.push(tpl(A_LUTA_DITA.fugiram, { L: de("fugiu").join(", ") }));
  return out.map(ponto);
}
/* UMA PESSOA, UMA LINHA (03/11, depois do teste às cegas): em s10#58 as
   FRONTEIRAS disseram «Godfrey está longe, em Monte Rasa» e «Godfrey da Foz
   está longe, em Monte Rasa» — o registo tem os dois nomes, e a mesma
   linha para os dois. Quando o nome curto é o começo do longo e o lugar é o
   mesmo, fica o mais longo (a regra que `vistosDaNarrativa`, elenco.js, já
   segue desde 92c17be); a linha igual também conta uma vez, e o «não
   está aqui» sem lugar (s9: «Brina» e «Brina Pedra») também. Lugares
   diferentes são duas pessoas, e ficam as duas. */
const LONGE_DITO = /^(.+?) (?:está longe, em (.+?)(?:, a .+ daqui)?|não está aqui(?:: vive em (.+?)(?:, fora desta cena)?)?)\.?$/u;
function umaPessoaUmaLinha(longe) {
  const lidos = longe.map((l) => { const m = limpo(l).match(LONGE_DITO); return { l, nome: m ? m[1] : null, onde: m ? m[2] || m[3] || "" : null }; });
  const fica = lidos.filter((x, i) => !lidos.some((y, j) => j !== i && x.nome && y.nome && y.onde === x.onde && (y.nome.startsWith(x.nome + " ") || (y.nome === x.nome && j < i))));
  return [...new Set(fica.map((x) => x.l))];
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
  /* o fecho do Mestre diz a FORMA da última frase; a ficha só guarda DE
     QUEM ela é (A_ULTIMA_PALAVRA): alguém em cena, ou a cena */
  "O FECHO": [
    { de: /^termine em alguém em cena faz-me uma pergunta direta/, vai: "ultima", como: () => ({ de: "gente" }) },
    { de: /^termine em alguém em cena deixa uma fala a meio/, vai: "ultima", como: () => ({ de: "gente" }) },
    { de: /^termine em um corte seco/, vai: "ultima", como: () => ({ de: "cena" }) },
    { de: /^termine em a consequência do que eu fiz/, vai: "ultima", como: () => ({ de: "consequencia" }) },
    { de: /^termine em a ficção põe-me nas mãos duas coisas que não cabem juntas/, vai: "ultima", como: () => ({ de: "cena" }) },
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

/* A ÚLTIMA PALAVRA (03/11, antes do teste às cegas; decidido pelo
   coordenador). A ficha traduzia o O FECHO à letra, e o fecho do Mestre é
   uma FORMA: dos 434 casos, 44 pediam «uma fala que fica a meio» (o tique
   maior da voz: diagnóstico 1.1, causa 1), 29 «duas coisas nas
   mãos que não cabem juntas» (o dilema que o ofício proíbe, causa 3) e 142
   «uma pergunta direta» (o «Vai X… ou Y?», causa 2). A forma é do ator; a
   ficha diz só DE QUEM é a última palavra e o que essa pessoa quer — o fato
   ou a vontade. A pergunta só entra quando o SISTEMA decidiu que alguém
   pergunta uma coisa concreta ao herói (o que se diz, com o «?»), e então é
   a pergunta dela, nunca a forma «Vai X ou Y?». {Q} é quem, {O} o que quer,
   {H} o herói. `querMax`: o querer mais longo corta-se na primeira pausa. */
export const A_ULTIMA_PALAVRA = Object.freeze({
  cena: "É da cena: o que acabou de acontecer.",
  consequencia: "É da cena: a consequência do que {H} fez, à vista.",
  pergunta: "É de {Q}, e é a pergunta que tem a fazer a {H}.",
  diz: "É de {Q}, e é o que tem a dizer a {H}.",
  quer: "É de {Q}, que quer {O}.",
  so: "É de {Q}.",
  querMax: 140,
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
  /* o custo da fuga (oEnvelopeDoCorpo «custoDaFuga») é FUGA também: os
     golpes de quem ficou, ditos um a um */
  { tipo: /^FUGA$/, vai: "aconteceu", como: (t, c) => (/^Ao dar as costas:/.test(t) ? osGolpesNasCostas(t, c, A_LUTA_DITA.custoDaFuga) : ponto(t.replace(/\bdo herói\b/g, "de {H}").replace(/\bo herói\b/g, "{H}"))) },
  { tipo: /^(CRIME|PROPÓSITO CUMPRIDO)/, vai: "aconteceu", como: (t) => ponto(t.replace(/\bdo herói\b/g, "de {H}").replace(/\bo herói\b/g, "{H}")) },
  /* A LUTA NA NOTA E NA FRASE (03/11): o golpe nas costas, a aflição que o
     golpe deixou ou que se resistiu (aflicoes.js), e a luta que acaba sem
     saída (saida-da-luta.js) */
  { tipo: /^ATAQUES DE OPORTUNIDADE/, vai: "aconteceu", como: (t, c) => osGolpesNasCostas(t, c, A_LUTA_DITA.oportunidade) },
  { tipo: /^(AFLIÇÃO APLICADA|SALVAGUARDA|AFLIÇÃO RESISTIDA)/, vai: "aconteceu", como: (t) => { const a = t.match(/^(.+?) deixou (.+?): falhou\b/u); if (a) return `${a[1]} deixa ${a[2]}.`; const r = t.match(/^(.+?) carregava (.+?); (.+?) passou\b/u); return r ? `${r[1]} podia deixar ${r[3]} ${r[2]}, mas ${r[3]} resiste.` : ponto(t.split(/ \(| Narre/u)[0]); } },
  { tipo: /^EFEITO APLICADO/, vai: "aconteceu", como: (t) => { const a = t.match(/^(.+?) deixou (.+?) \(/u); return a ? `${a[1]} deixa ${a[2]}.` : ponto(t.split(/ \(| Já está/u)[0]); } },
  { tipo: /^A LUTA ACABOU/, vai: "aconteceu", como: (t, c) => { let o = t.split(/ A luta NÃO continua\b/u)[0]; for (const [de, para] of A_LUTA_NA_TERCEIRA) o = o.replace(de, para); return `${ponto(o.replace(/\{H\}/g, c.H))} ${A_LUTA_DITA.acabou}.`; } },
  { tipo: /^QUEST GERADA/, vai: "diz", como: (t) => ({ o: `chega agora: ${t}` }) },
  { tipo: /^RUMOR/, vai: "diz", como: (t) => ({ o: `corre um boato: ${t}` }) },
  { tipo: /^TRABALHO PREGADO NO MURAL/, vai: "cena", como: (t) => `No mural: ${ponto(t)}` },
  { tipo: /^O MUNDO LEMBROU/, vai: "aconteceu", como: (t) => { const m = t.match(/alguém ainda comenta — por (".+?"), (.+?)\. Isto/); return m ? `No lugar onde aconteceu, alguém ainda comenta ${m[1]} (${m[2]}).` : ponto(t.split(". Isto não")[0]); } },
  { tipo: /^A LUTA VIROU/, vai: "aconteceu", como: (t) => ponto(t.split(". Mostre")[0]) },
  { tipo: /^O COMPANHEIRO FOI EMBORA/, vai: "aconteceu", como: (t) => ponto(t.split(". Narre")[0]) },
  { tipo: /^MOVIMENTO/, vai: "aconteceu", como: (t, c) => { const m = t.match(/AGORA estou (n[ao]s? .+?)\./); return m ? `${c.H} chegou: está agora ${m[1]}.` : `${c.H} mudou de lugar.`; } },
  /* O TESTE QUE JÁ ROLOU (03/11): a frase do turno é o envelope do dado
     (O_DADO_NA_FRASE). O ator recebe o resultado em palavras — o que o
     herói tentou e se conseguiu —, nunca o d20, a dificuldade ou a ordem.
     O «SEM TESTE» (o veredito sem dado, sete formas em desafios.js e
     social.js) ainda não tem regra: fica «sem tradução», e a suíte di-lo
     no dia em que chegar. */
  { tipo: /^TESTE PEDIDO POR MIM/, vai: "aconteceu", como: (t, c) => oTesteEmPalavras(t, c, (t.match(/Pedi um teste de .+? para (.+?)\.(?= Sou| NÃO tenho| O sistema)/u) || [])[1]) },
  { tipo: /^ROLAGEM/, vai: "aconteceu", como: (t, c) => oTesteEmPalavras(t, c, (t.match(/^Teste de [^(]*\(([^)]+)\)/u) || [])[1]) },
  { tipo: /^TESTE$/, vai: "aconteceu", como: (t, c) => `${c.H} faz ${(t.match(/^"(.+?)"/u) || [])[1] || "o que quis"} sem dificuldade.` },
  { tipo: /^SOCIAL/, vai: "aconteceu", como: (t, c) => { const m = t.match(/Tentei (.+?) e (CONSEGUI|NÃO consegui)/u); const pedia = (t.match(/O que eu pedia era (.+?), e a resposta é não/u) || [])[1]; return m ? `${c.H} tentou ${m[1]}, e ${m[2] === "CONSEGUI" ? "conseguiu" : "não conseguiu"}${pedia ? `: pedia ${pedia}, e a resposta é não` : ""}.` : `${c.H} tentou a conversa.`; } },
  { tipo: /^BUSCA CONCLUÍDA/, vai: "aconteceu", como: (t, c) => `${c.H} revistou o lugar do chão ao teto, e aqui não há nada escondido.` },
]);
/* os golpes nas costas: «X acertou (3); Y errou» → quem acerta, quem falha */
function osGolpesNasCostas(t, c, modelo) {
  const m = t.match(/(?:dei as costas|Ao dar as costas): (.+?)\. Levei\b/u);
  const L = m ? m[1].split(/;\s*/).map((x) => { const g = x.match(/^(.+?)(?: \((?:golpe|disparo)\))? (acertou|errou)\b/u); return g ? tpl(g[2] === "acertou" ? A_LUTA_DITA.acertaOHeroi : A_LUTA_DITA.falhaOHeroi, { A: g[1], H: c.H }) : ""; }).filter(Boolean) : [];
  return L.length ? ponto(tpl(modelo, { H: c.H, L: L.join("; ") })) : `${c.H} dá as costas à luta.`;
}
/* o teste em palavras: o que se tentou, e o que o dado deu (a mesma régua
   da aposta, O_DADO_NA_FRASE, sobre o texto do envelope) */
function oTesteEmPalavras(t, c, motivo) {
  const o = motivo ? motivo.trim() : "o que quis";
  const ramo = oDadoDaFrase(t);
  const preco = (t.match(/E o preço, que o sistema já cobrou: (.+?)\.(?= NÃO|$)/u) || [])[1];
  if (ramo === "fio") return `${c.H} tentou ${o}, e conseguiu por um fio${preco ? `, pagando: ${preco}` : ", e pagou por isso"}.`;
  if (ramo === "passa") return `${c.H} tentou ${o}, e conseguiu.`;
  if (ramo === "falha") return `${c.H} tentou ${o}, e não conseguiu.`;
  return `${c.H} tentou ${o}.`;
}

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
  const daFrase = aFraseDoTurno(ent.frase, c);
  const frase = daFrase.fala;
  const { secoes, envelopes: envNota } = lerANota(ent.nota);
  const envelopes = [...daFrase.envelopes, ...envNota];
  const rastro = [];
  const cena = [], cenaExtra = [], aconteceu = [], diz = [], tom = [], fronteira = [], longe = [];
  const pessoas = new Map();
  let ultima = null, naoSabe = false, aponta = "", nomesAMao = [], venda = [], aposta = [], temLuta = false;
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
  /* o que a régua da luta não conhece é defeito à vista, nunca silêncio */
  for (const x of daFrase.soltas) marca("a luta", x, null, "semTraducao");
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
        temLuta = true;
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

  /* quem ficou de pé na luta, quando a pauta não traz a linha dela (a da
     pauta já põe o corpo em cada pessoa) */
  if (!temLuta) aconteceu.splice(daFrase.fatos.length, 0, ...oQueFicouDaLuta(daFrase.luta));

  /* a aposta: o ramo que o dado deu, ou o que está em jogo */
  if (aposta.length) {
    /* o dado: o que veio dito, senão o que a frase do turno traz */
    const dado = str(ent.rolagem) || oDadoDaFrase(ent.frase);
    const qual = { passa: "passa", falha: "falha", fio: "passa por um fio" }[dado];
    /* o fio sem versão própria (a situação sem raspão) é o sim */
    const ramo = qual && (aposta.find((a) => a.ramo === qual) || (dado === "fio" ? aposta.find((a) => a.ramo === "passa") : null));
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

  /* a última palavra: de quem é, e o que essa pessoa quer (A_ULTIMA_PALAVRA) */
  let ultimaTxt = "";
  if (ultima) {
    const U = A_ULTIMA_PALAVRA;
    const dela = ultima.de === "gente" ? diz.find((d) => d.quem) : null;
    const dono = ultima.de !== "gente" ? null : (dela && pessoas.get([...pessoas.keys()].find((k) => mesmo(k, dela.quem)))) || responde;
    const oDono = dono ? diz.find((d) => d.quem && mesmo(d.quem, dono.nome)) : null;
    const querer = dono ? str(dono.queroAgora || dono.quer) : "";
    const curto = querer.length > U.querMax ? querer.split(/;\s+|,\s+(?=e |mas )/)[0] : querer;
    const modelo = !dono ? (ultima.de === "consequencia" ? U.consequencia : U.cena)
      : oDono ? (/\?/.test(oDono.o) ? U.pergunta : U.diz)
      : curto && curto.length <= U.querMax ? U.quer
      : U.so;
    ultimaTxt = modelo.replace(/\{Q\}/g, dono ? dono.nome : "").replace(/\{O\}/g, curto.replace(/[.\s]+$/, "")).replace(/\{H\}/g, H);
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
    L.push(...umaPessoaUmaLinha(longe).map(ponto));
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
   frases do jogador com a resposta que veio depois de cada uma.
   SÓ AS RESPONDIDAS (03/11, etapa 2): no App a frase do turno já está no
   relato quando `enviar` monta o pedido (a tela empurra-a antes), e sem
   resposta ela não é memória — contá-la gastava uma das duas trocas na
   própria frase que a ficha já diz em ACONTECEU. */
function asUltimasTrocas(estado) {
  const ms = arr(ehObj(estado) ? estado.mensagens : null).filter((m) => ehObj(m) && (m.autor === "jogador" || m.autor === "mestre") && typeof m.texto === "string");
  const out = [];
  for (let i = ms.length - 1; i >= 0 && out.length < FICHA_DE_ATOR.trocas; i--) {
    if (ms[i].autor !== "jogador") continue;
    const resp = ms.slice(i + 1).find((m) => m.autor === "mestre");
    if (!resp) continue;
    out.unshift({ jogador: ms[i].texto.slice(0, FICHA_DE_ATOR.trocaMax), mestre: resp.texto.slice(0, FICHA_DE_ATOR.trocaMax) });
  }
  return out;
}
