/* ============================================================
   A MEMÓRIA NÃO GUARDA O INVENTADO (NE8, 13/11/2026) — src/motor/memoria-do-inventado.js

   A Fase NE (mente/plano-nada-entra.md): «nenhuma IA escreve estado de
   jogo». A NE1 fechou o cânone ao objeto que o sistema não conhece
   (cronista.js#oCanoneQueExiste) e a NE2 contou todas as portas — mas
   fechar as portas tira o inventado do ESTADO, não da CONVERSA. A prosa
   do Narrador volta-lhe pelo histórico, e ele lê-se a si mesmo como
   verdade. Na 19.ª sessão (mente/sessao-19.md, §5, T16→T17): um teste
   de Prestidigitação passou, o sistema não deu item nenhum, e a prosa deu
   «a chave mestra de ferro forjado»; no turno seguinte o herói desceu às
   celas e o Narrador «abriu com a chave mestra» que tinha inventado.

   Esta peça lê a narração do turno que acabou contra o que o sistema
   conhece e devolve os OBJETOS que a prosa pôs nas mãos do herói (ou na
   cena, para ele pegar) e que não existem; e cada um vira um veto para o
   turno seguinte: «pôr em jogo «a chave mestra»: não existe, o herói não
   a tem».

   ---------------- POR ONDE O VETO VAI À PAUTA ----------------

   Pelo livro de vetos do Juiz (`vetosDoJuiz`, motor/correcao-do-juiz.js),
   que já é o canal da «invenção da resposta anterior»: a secção
   `vetoDoJuiz` de pauta.js (rótulo NÃO PODE, prio 4,5), dentro do
   TETO_DA_PAUTA, sem bloco estático nenhum. O veto entra com a mesma
   porta do Juiz (`vetosParaAPauta`): no turno logo a seguir, ou quando a
   frase do jogador toca a coisa («abro com a chave»), até a `vida` acabar.
   O campo do save não muda de forma — o veto daqui tem os campos de um
   veto do Juiz (`especie`, `alvo`, `linha`, `toques`, `turno`, `ate`,
   `cidade`), e a versão antiga lê-o como lê os dela.

   POR QUE NÃO NA PAUTA DIRETO (relendo as últimas falas a cada turno): a
   pauta do motor é provada byte a byte contra o recorte do App sobre 275
   turnos gravados (teste-motor-pauta-do-turno.mjs); a leitura nova
   mudaria fotos de sessões que já não se podem rejogar. O livro de vetos
   anda DEPOIS da resposta — onde o estado do turno já está aplicado e o
   item que o sistema deu neste turno já está na bolsa.

   ---------------- O PORTÃO MORDE SÓ O NECESSÁRIO ----------------

   Um veto errado proíbe o Narrador de dizer o que estava certo
   (memory/portao-morde-so-o-necessario.md). Por isso a régua é estreita
   nos dois lados:

   · SÓ OBJETO PORTÁTIL. A cabeça do nome tem de estar na tabela
     `objetos` (a chave, o fólio, o anel, a adaga, o frasco…). Cenário fixo
     (a mesa, a porta, a lareira, o cepo, o baú) nunca é item, e as coisas
     que o sistema conta por número e não por nome (as moedas, as tochas,
     as rações, as flechas) também não: não há nome para conferir.
   · SÓ O QUE CHEGA AO HERÓI. O objeto tem de vir depois de um verbo de
     posse com o herói por sujeito («você pega», «seus dedos encontram»,
     «guardas»), de um verbo de dar com o herói por destino («lhe
     entrega», «estende-te»), de uma descoberta («a laje revela»), ou de
     estar na manga, no bolso, na mão DELE. Menção não é presença: o
     objeto dito numa fala («— Traga-me a chave mestra»), negado («você
     não encontra chave nenhuma») ou na mão de outro («o guarda pega a
     chave») não morde.
   · O CONHECIDO É O DO CÂNONE. `oQueOSistemaConhece` (cronista.js) — o
     inventário e o equipamento do herói e do grupo, o que o livro de
     factos diz que alguém recebeu, o enredo da espinha, das quests e das
     missões, o registo de gente, o mapa, o lugar, a masmorra e o cânone —
     e `casaONome` para o nome inteiro. Mais quatro folgas, todas para o
     lado de não morder:
       – a CABEÇA conhecida basta (o herói tem «Adaga» e a prosa diz «a
         adaga curta»: é a adaga dele com um adjetivo; e a família — o
         punhal é adaga, o tônico é frasco, a gazua é das ferramentas);
       – o que o jogador nomeou na frase do turno («surrupio o molho de
         chaves») não é invenção do Narrador: o que o jogador traz é da
         escuta, não deste veto;
       – a chave da masmorra, quando a masmorra diz que o herói a achou;
       – o saque que quem chama passa (o que caiu neste turno).
     O preço destas folgas está escrito na suíte: com uma «Chave» na
     bolsa, «a chave mestra» passa.

     oInventadoDaProsa(narrativa, estado, opcoes) → [{ nome, artigo, plural, cabeca, como, trecho }]
     lembrarOInventado(vivos, narrativa, estado, ctx) → o livro de vetos do turno
       ctx: { turno, cidade, frase, saque, lugarDoTurno }

   Puro, sem React, determinístico (não há sorte nenhuma). Provado em
   testes/teste-memoria-do-inventado.mjs, com as frases da 19.ª.
   ============================================================ */
import { oQueOSistemaConhece, casaONome } from "./cronista.js";
import { andarOsVetos } from "./correcao-do-juiz.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const palavrasDe = (s) => sem(s).replace(/[^a-z0-9]+/g, " ").trim();

/* as formas finitas de um verbo, a partir da 3.ª do singular (você/ele):
   presente, plural, pretérito, e as do «tu» (que dispensam o sujeito) */
const AR = (x) => { const r = x.slice(0, -1); return { voce: [x, x + "m", r + "ou", r + "aram"], tu: [x + "s", r + "aste"] }; };
const ER = (x) => { const r = x.slice(0, -1); return { voce: [x, x + "m", r + "eu", r + "eram"], tu: [x + "s", r + "este"] }; };
const IR = (x, r) => ({ voce: [x, x + "m", r + "iu", r + "iram"], tu: [x + "s", r + "iste"] });

/* ---------------- A TABELA ----------------
   `vida`: quantos turnos o veto fica no livro depois do turno em que a
   prosa inventou (o Juiz guarda 3; o objeto vive mais, porque o jogador
   volta a ele — «abro com a chave» — e a prosa fica no histórico).
   `porTurno`: vetos novos por narração (o livro do Juiz guarda 6 e a
   pauta mostra 2). `janela`: palavras entre o verbo e o objeto. `junto`:
   palavras entre o herói e o verbo. `modificadores`: quantas palavras do
   nome depois da cabeça («chave mestra», não «chave mestra de ferro
   forjado»). `letras`: o teto da linha. */
export const MEMORIA_DO_INVENTADO = Object.freeze({
  porque: "fechar as portas tira o objeto inventado do estado, não da conversa: a prosa volta ao Narrador pelo histórico, e na 19.ª ele abriu com a chave mestra que inventara no turno anterior",
  especie: "objeto-inventado",
  vida: 6,
  porTurno: 2,
  janela: 8,
  junto: 5,
  modificadores: 1,
  letras: 110,
  /* a linha da pauta, no infinitivo como as outras do NÃO PODE */
  linha: (o) => `pôr em jogo «${o.artigo} ${o.nome}»: não ${o.plural ? "existem" : "existe"}, o herói não ${o.artigo} tem`,
  /* o objeto portátil: a cabeça do nome (sem acento, no singular) e o
     artigo dela. O que não está aqui não morde. */
  objetos: Object.freeze({
    chave: "a", gazua: "a", adaga: "a", espada: "a", lamina: "a", faca: "a", lanca: "a", machadinha: "a",
    varinha: "a", luva: "a", manopla: "a", joia: "a", gema: "a", coroa: "a", tiara: "a", insignia: "a",
    medalha: "a", pulseira: "a", ampola: "a", pocao: "a", carta: "a", missiva: "a", pagina: "a", cunha: "a",
    estatueta: "a", reliquia: "a", bussola: "a", luneta: "a", lupa: "a", mascara: "a", algema: "a", fivela: "a",
    flauta: "a", runa: "a",
    anel: "o", colar: "o", amuleto: "o", medalhao: "o", pingente: "o", broche: "o", bracelete: "o", talisma: "o",
    punhal: "o", machado: "o", martelo: "o", cajado: "o", bastao: "o", escudo: "o", elmo: "o", arco: "o",
    folio: "o", livro: "o", caderno: "o", diario: "o", tomo: "o", codice: "o", registo: "o", registro: "o",
    pergaminho: "o", mapa: "o", bilhete: "o", documento: "o", contrato: "o", mandado: "o", sinete: "o", selo: "o",
    frasco: "o", frasquinho: "o", elixir: "o", antidoto: "o", tonico: "o", cristal: "o", orbe: "o", idolo: "o",
    relicario: "o", estojo: "o", lenco: "o", botao: "o", cachimbo: "o", artefato: "o", fragmento: "o",
  }),
  /* os plurais que não são «+s» */
  plurais: Object.freeze({ medalhao: "medalhoes", bastao: "bastoes", botao: "botoes", anel: "aneis", talisma: "talismas", pocao: "pocoes" }),
  /* o que junta: «o molho de chaves», «o par de luvas» — o nome leva o
     quantificador, e a cabeça é a coisa */
  quantos: Object.freeze({ molho: "o", par: "o", maco: "o", punhado: "o", rolo: "o", feixe: "o" }),
  /* nomes diferentes para a mesma coisa: a cabeça conhecida de um é a do outro */
  familias: Object.freeze([
    Object.freeze(["espada", "lamina", "adaga", "punhal", "faca"]),
    Object.freeze(["machado", "machadinha", "martelo"]),
    Object.freeze(["cajado", "bastao", "lanca"]),
    Object.freeze(["livro", "caderno", "diario", "tomo", "folio", "codice", "registo", "registro", "pagina"]),
    Object.freeze(["carta", "bilhete", "missiva", "pergaminho", "documento", "contrato", "mandado"]),
    Object.freeze(["frasco", "frasquinho", "ampola", "pocao", "elixir", "antidoto", "tonico"]),
    Object.freeze(["colar", "pingente", "medalhao", "amuleto", "talisma"]),
    Object.freeze(["pulseira", "bracelete"]),
    Object.freeze(["joia", "gema"]),
    Object.freeze(["luva", "manopla"]),
    Object.freeze(["selo", "sinete"]),
    Object.freeze(["gazua", "ferramenta"]),
  ]),
  /* cenário fixo e o que o sistema conta por número: nunca item (a suíte
     confere que nenhum destes está em `objetos`) */
  cenario: Object.freeze(["mesa", "porta", "lareira", "parede", "chao", "janela", "cepo", "bau", "arca", "cofre", "prateleira", "gaveta", "cadeira", "banco", "balcao", "cama", "grade", "fechadura", "cadeado", "laje", "alcapao", "escada", "muro", "telhado", "moeda", "tocha", "racao", "flecha", "agua", "corda", "vela", "lanterna", "bolsa", "garrafa", "caneca", "maca"]),
  /* o herói como sujeito: o pronome, ou a mão dele */
  heroi: Object.freeze(["voce", "voces", "vc", "tu"]),
  posse: Object.freeze(["seu", "sua", "seus", "suas", "teu", "tua", "teus", "tuas"]),
  corpo: Object.freeze(["dedo", "dedos", "mao", "maos", "palma", "palmas", "braco", "bracos"]),
  /* onde a coisa fica quando é dele: na manga, no bolso, na mão */
  noCorpo: Object.freeze(["manga", "bolso", "algibeira", "alforje", "mochila", "cinto", "bolsa", "mao", "maos", "palma"]),
  /* a mão, a palma, a bolsa e o cinto são de qualquer um: só contam com «sua/tua» */
  comDono: Object.freeze(["mao", "maos", "palma", "bolsa", "cinto"]),
  prepLugar: Object.freeze(["na", "no", "nas", "nos", "em", "para", "dentro", "pela", "pelo"]),
  /* os verbos, pela 3.ª do singular */
  pega: Object.freeze([...["pega", "apanha", "agarra", "guarda", "embolsa", "enfia", "surrupia", "furta", "rouba", "arranca", "leva", "segura", "ganha", "herda", "empunha", "encontra", "acha"].map(AR),
    ...["recolhe", "esconde", "recebe"].map(ER), IR("descobre", "descobr")]),
  da: Object.freeze([...["entrega", "estende", "passa", "joga", "atira", "deixa", "coloca", "devolve", "empresta"].map(AR), ...["oferece"].map(ER),
    { voce: ["da", "dao", "deu", "deram", "poe", "poem", "pos", "puseram"], tu: [] }]),
  revela: Object.freeze([AR("revela")]),
  /* o destinatário do dar: o clítico, ou a frase */
  aoHeroi: Object.freeze(["lhe", "te"]),
  /* o que nega o verbo, logo antes dele */
  nega: Object.freeze(["nao", "nem", "nunca", "jamais", "sem", "nada", "nenhum", "nenhuma"]),
  /* quem é sujeito entre o herói e o verbo: «você chama o guarda, que segura
     a chave», «você vê Margarida pegar» — a mão é de outro */
  outroSujeito: Object.freeze(["que", "quem", "enquanto", "quando", "onde", "cujo", "cuja", "ele", "ela", "eles", "elas"]),
  /* o verbo no começo da frase herda o herói da frase de antes */
  abre: Object.freeze(["e", "entao", "depois", "logo", "agora", "ja"]),
  /* o texto da abertura é do sistema (abertura.js: a razão que o herói traz,
     o que sabe, a chegada): «uma carta sem assinatura chamou-o» põe a carta
     no mundo antes da primeira cena */
  daAbertura: Object.freeze(["razao", "sabe", "historia", "chegada"]),
  /* o que não é o objeto: o artigo, a preposição (o lugar, não a coisa),
     e o que fecha a frase do objeto */
  artigos: Object.freeze(["o", "a", "os", "as", "um", "uma", "uns", "umas", "este", "esta", "esse", "essa", "aquele", "aquela", "outro", "outra", "seu", "sua", "teu", "tua", "mesmo", "mesma", "velho", "velha", "pequeno", "pequena", "grande", "unico", "unica"]),
  preposicoes: Object.freeze(["de", "do", "da", "dos", "das", "na", "no", "nas", "nos", "em", "ao", "aos", "a", "pela", "pelo", "com", "sob", "sobre", "entre", "atras", "ate", "contra", "para", "por", "dentro", "perto", "junto", "num", "numa", "dum", "duma"]),
  fecha: Object.freeze(["que", "enquanto", "quando", "mas", "porem", "onde", "se", "porque", "como", "ate", "e", "ou", "nem", "sem", "com", "dele", "dela", "deles", "delas"]),
});

/* ---------------- os índices da tabela ---------------- */
const T = MEMORIA_DO_INVENTADO;
const S = (xs) => new Set(xs);
const HEROI = S(T.heroi), POSSE = S(T.posse), CORPO = S(T.corpo), NO_CORPO = S(T.noCorpo), PREP_LUGAR = S(T.prepLugar);
const OUTRO = S(T.outroSujeito), ABRE = S(T.abre);
const NEGA = S(T.nega), ARTIGOS = S(T.artigos), PREPS = S(T.preposicoes), FECHA = S(T.fecha), AO_HEROI = S(T.aoHeroi);
const formas = (vs) => { const voce = new Set(), tu = new Set(); for (const v of vs) { v.voce.forEach((x) => voce.add(x)); v.tu.forEach((x) => tu.add(x)); } return { voce, tu }; };
const PEGA = formas(T.pega), DA = formas(T.da), REVELA = formas(T.revela);
/* a cabeça pela forma (singular e plural) → { cabeca, plural } */
const CABECAS = new Map();
for (const c of Object.keys(T.objetos)) {
  CABECAS.set(c, { cabeca: c, plural: false });
  CABECAS.set(T.plurais[c] || c + "s", { cabeca: c, plural: true });
}
const FAMILIA = new Map();
for (const f of T.familias) for (const c of f) FAMILIA.set(c, [...new Set([...(FAMILIA.get(c) || [c]), ...f])]);
const formasDe = (c) => [c, T.plurais[c] || c + "s"];

/* ---------------- a prosa em frases e palavras ---------------- */
/* tira as falas: «…», “…”, "…", e na linha que abre com travessão os
   trechos de fala (— fala — narração — fala) */
function semFalas(texto) {
  const s = String(texto == null ? "" : texto).replace(/«[^»]*»/g, " ").replace(/“[^”]*”/g, " ").replace(/"[^"]*"/g, " ");
  return s.split(/\n/).map((linha) => {
    const l = linha.trim();
    if (!/^[—–]/.test(l)) return linha;
    return l.split(/[—–]/).filter((_, i) => i >= 2 && i % 2 === 0).join(" ");
  }).join("\n");
}
const frasesDe = (texto) => semFalas(texto).split(/[.!?…;]+(?=\s|$)|\n+/).map((x) => x.trim()).filter(Boolean);
/* as palavras, com o original (para o nome) e o normal (para a régua);
   o hífen fica — «entrega-lhe», «esconde-a» — e parte-se em base e clíticos */
function palavras(frase) {
  return [...String(frase).matchAll(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu)].map((m) => {
    const n = sem(m[0]);
    const partes = n.split("-");
    return { o: m[0], n, base: partes[0], cliticos: partes.slice(1) };
  });
}

/* o herói é o sujeito do verbo na posição i? (o pronome ou a mão dele, até
   `junto` palavras antes; e o verbo no começo da frase com o herói na
   frase anterior — o sujeito calado do português) */
function heroiAntes(ws, i, heroiNaAnterior) {
  for (let k = i - 1; k >= Math.max(0, i - T.junto); k--) {
    /* «atrás de você», «para você»: o herói regido por preposição não é o sujeito */
    if (HEROI.has(ws[k].base) && !(k > 0 && PREPS.has(ws[k - 1].base))) return true;
    if (CORPO.has(ws[k].base) && k > 0 && POSSE.has(ws[k - 1].base)) return true;
    /* outro sujeito no meio: o relativo, o pronome, um nome próprio (maiúscula fora do começo) */
    if (OUTRO.has(ws[k].base) || (k > 0 && /^\p{Lu}/u.test(ws[k].o))) return false;
  }
  return heroiNaAnterior && ws.slice(0, i).every((w) => ABRE.has(w.base));
}
const temHeroi = (ws) => ws.some((w, k) => HEROI.has(w.base) || (CORPO.has(w.base) && k > 0 && POSSE.has(ws[k - 1].base)));
const negado = (ws, i) => [ws[i - 1], ws[i - 2]].some((w) => w && NEGA.has(w.base));

/* o objeto que começa em j (a cabeça, ou o quantificador + de + cabeça):
   → { nome, artigo, cabeca, plural, fim } ou null */
function objetoEm(ws, j) {
  const w = ws[j];
  if (!w) return null;
  let cab = CABECAS.get(w.base), ini = j, art = null, fim = j;
  if (!cab && T.quantos[w.base] && ws[j + 1] && (ws[j + 1].base === "de") && ws[j + 2] && CABECAS.get(ws[j + 2].base)) {
    cab = CABECAS.get(ws[j + 2].base); art = T.quantos[w.base]; fim = j + 2;
  }
  if (!cab) return null;
  /* a coisa num lugar («na manga», «da porta») não é o objeto do verbo */
  if (j > 0 && PREPS.has(ws[j - 1].base) && !ARTIGOS.has(ws[j - 1].base)) return null;
  if (j > 1 && ARTIGOS.has(ws[j - 1].base) && PREPS.has(ws[j - 2].base) && !ARTIGOS.has(ws[j - 2].base)) return null;
  const mods = [];
  for (let k = fim + 1; k < ws.length && mods.length < T.modificadores; k++) {
    const b = ws[k].base;
    if (PREPS.has(b) || ARTIGOS.has(b) || FECHA.has(b) || HEROI.has(b) || POSSE.has(b) || /mente$/.test(b) || /^\d/.test(b) || CABECAS.has(b)) break;
    mods.push(ws[k].o);
  }
  const artigoSing = art || T.objetos[cab.cabeca];
  const plural = art ? false : cab.plural;
  const artigo = plural ? artigoSing + "s" : artigoSing;
  const nome = [...ws.slice(ini, fim + 1).map((x) => x.o), ...mods].join(" ").toLowerCase();
  /* o miolo: o nome sem os modificadores («molho de chaves», «chave») */
  const miolo = ws.slice(ini, fim + 1).map((x) => x.o).join(" ").toLowerCase();
  return { nome, miolo, artigo, cabeca: cab.cabeca, plural, quantos: !!art, fim: fim + mods.length };
}

/* os objetos depois do verbo na posição i, até a janela ou o que fecha
   (o «e» junta dois objetos: «a lamparina e a chave») */
function objetosDepois(ws, i) {
  const out = [];
  for (let j = i + 1; j < ws.length && j <= i + T.janela; j++) {
    const b = ws[j].base;
    if (FECHA.has(b) && b !== "e") break;
    const o = objetoEm(ws, j);
    if (o) { out.push(o); j = o.fim; continue; }
    if (b === "e" && !out.length) break;
  }
  return out;
}

/* o que a prosa põe na manga, no bolso, na mão dele: o objeto antes do lugar */
function noCorpoDoHeroi(ws, heroiNaFrase) {
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    if (!PREP_LUGAR.has(ws[i].base)) continue;
    let k = i + 1;
    if (ws[k] && ARTIGOS.has(ws[k].base) && !POSSE.has(ws[k].base)) k++;
    const dono = ws[k] && POSSE.has(ws[k].base);
    if (dono) k++;
    const lugar = ws[k] && NO_CORPO.has(ws[k].base) ? ws[k].base : null;
    if (!lugar) continue;
    const precisaDono = T.comDono.includes(lugar);
    if (!(dono || (!precisaDono && heroiNaFrase))) continue;
    for (let j = i - 1; j >= Math.max(0, i - T.janela); j--) {
      if (NEGA.has(ws[j].base)) break;
      const o = objetoEm(ws, j);
      if (o && o.fim < i) { out.push(o); break; }
    }
  }
  return out;
}

/* ============================================================
   oInventadoDaProsa(narrativa, estado, opcoes) → os objetos que a prosa
   deu ao herói (ou pôs à mão dele) e que o sistema não conhece.
   opcoes: { frase, saque, lugarDoTurno }
   ============================================================ */
export function oInventadoDaProsa(narrativa, estado, opcoes) {
  if (typeof narrativa !== "string" || !narrativa.trim()) return [];
  const E = obj(estado), O = obj(opcoes);
  const achados = [];
  let heroiNaAnterior = false;
  for (const frase of frasesDe(narrativa)) {
    const ws = palavras(frase);
    const heroiAqui = temHeroi(ws);
    for (let i = 0; i < ws.length; i++) {
      const w = ws[i];
      let como = null;
      if (PEGA.tu.has(w.base)) como = "pega";
      else if (PEGA.voce.has(w.base) && heroiAntes(ws, i, heroiNaAnterior)) como = "pega";
      else if (DA.voce.has(w.base) || DA.tu.has(w.base)) {
        const cliticoAntes = i > 0 && AO_HEROI.has(ws[i - 1].base);
        const cliticoDepois = w.cliticos.some((c) => AO_HEROI.has(c));
        const depois = ws.slice(i + 1, i + 1 + T.janela);
        const paraVoce = depois.some((x, k) => (x.base === "a" || x.base === "para") && depois[k + 1] && HEROI.has(depois[k + 1].base));
        const naSuaMao = depois.some((x, k) => POSSE.has(x.base) && depois[k + 1] && CORPO.has(depois[k + 1].base));
        /* «da» é também a preposição: só é o verbo com o clítico («lhe dá», «dá-te») */
        const ambiguo = w.base === "da" && !cliticoAntes && !cliticoDepois;
        /* o herói que dá («você lhe entrega», «você entrega a carta para ela») não recebe */
        const heroiDa = heroiAntes(ws, cliticoAntes ? i - 1 : i, false);
        if (!ambiguo && !heroiDa && (cliticoAntes || cliticoDepois || paraVoce || naSuaMao)) como = "recebe";
      } else if (REVELA.voce.has(w.base)) como = "acha";
      if (!como || negado(ws, i)) continue;
      for (const o of objetosDepois(ws, i)) achados.push({ ...o, como, trecho: frase.slice(0, 160) });
    }
    for (const o of noCorpoDoHeroi(ws, heroiAqui)) achados.push({ ...o, como: "guarda", trecho: frase.slice(0, 160) });
    heroiNaAnterior = heroiAqui;
  }
  if (!achados.length) return [];
  /* o que o sistema conhece (a régua do cânone), e as folgas */
  const K = oQueOSistemaConhece(E, O.lugarDoTurno);
  const todos = [...K.objeto, ...K.gente, ...K.lugar];
  const abertura = T.daAbertura.map((c) => obj(E.abertura)[c]).filter((x) => typeof x === "string");
  const palavrasConhecidas = new Set([...K.objeto, ...abertura, ...arr(O.saque).map((x) => palavrasDe(typeof x === "string" ? x : obj(x).nome))].flatMap((n) => palavrasDe(n).split(" ")));
  const daFrase = ` ${palavrasDe(O.frase)} `;
  const chaveDaMasmorra = !!obj(E.masmorra).chave;
  const conhecido = (o) => {
    const fam = FAMILIA.get(o.cabeca) || [o.cabeca];
    if (fam.some((c) => formasDe(c).some((f) => palavrasConhecidas.has(f)))) return true;
    if (o.cabeca === "chave" && chaveDaMasmorra) return true;
    if (casaONome(o.nome, todos, false)) return true;
    /* o que o jogador nomeou: o nome inteiro; o quantificador basta pelo miolo
       («o molho de chaves» que ele surrupiou); a cabeça sozinha, só quando a
       prosa também a disse sozinha — «chaves» na frase não deixa passar «a
       chave mestra» */
    if (daFrase.includes(` ${palavrasDe(o.nome)} `)) return true;
    if (o.quantos && daFrase.includes(` ${palavrasDe(o.miolo)} `)) return true;
    return o.nome === o.miolo && !o.quantos && fam.some((c) => formasDe(c).some((f) => daFrase.includes(` ${f} `)));
  };
  const out = [];
  for (const o of achados) {
    if (conhecido(o)) continue;
    if (out.some((x) => palavrasDe(x.nome) === palavrasDe(o.nome))) continue;
    out.push({ nome: o.nome, artigo: o.artigo, plural: o.plural, cabeca: o.cabeca, como: o.como, trecho: o.trecho });
  }
  return out;
}

/* o veto de um objeto inventado, na forma de um veto do Juiz */
function vetoDe(o, turno) {
  const linha = T.linha(o);
  const corta = linha.length > T.letras ? linha.slice(0, T.letras - 1) + "…" : linha;
  const toques = [...new Set([palavrasDe(o.nome), ...formasDe(o.cabeca)])].filter((x) => x.length >= 3);
  return { especie: T.especie, alvo: `objeto:${palavrasDe(o.nome)}`, linha: corta, toques, turno, ate: turno == null ? null : turno + T.vida, cidade: "" };
}

/* ============================================================
   lembrarOInventado(vivos, narrativa, estado, ctx) → o livro de vetos
   do turno: os vivos (os do Juiz e os daqui), sem os objetos que o
   sistema entretanto passou a conhecer (a quest plantou-o, a busca
   achou-o), mais os inventados desta narração. Anda pelo
   `andarOsVetos` do Juiz: o prazo, o teto do livro, o novo que
   substitui o velho com o mesmo alvo.
   ctx: { turno, cidade, frase, saque, lugarDoTurno } — o turno é o da
   pauta (o mesmo que o App passa ao Juiz).
   ============================================================ */
export function lembrarOInventado(vivos, narrativa, estado, ctx) {
  const c = obj(ctx);
  const turno = Number.isFinite(Number(c.turno)) && c.turno !== null && c.turno !== "" ? Number(c.turno) : null;
  const opc = { frase: c.frase, saque: c.saque, lugarDoTurno: c.lugarDoTurno };
  /* o objeto que deixou de ser inventado sai do livro */
  const ficam = arr(vivos).filter((x) => {
    if (!x || typeof x !== "object" || x.especie !== T.especie) return true;
    const nome = String(x.alvo || "").replace(/^objeto:/, "");
    const cab = palavrasDe(nome).split(" ").map((p) => CABECAS.get(p)).find(Boolean);
    if (!cab) return true;
    const prova = `você pega ${T.objetos[cab.cabeca]} ${nome}.`;
    return oInventadoDaProsa(prova, estado, { saque: c.saque, lugarDoTurno: c.lugarDoTurno }).length > 0;
  });
  const novos = oInventadoDaProsa(narrativa, estado, opc).slice(0, T.porTurno).map((o) => vetoDe(o, turno));
  return andarOsVetos(ficam, novos, { turno, cidade: typeof c.cidade === "string" ? c.cidade : undefined });
}
