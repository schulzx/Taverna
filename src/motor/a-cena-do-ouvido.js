/* ============================================================
   A CENA DO OUVIDO (22/11/2026) — a ponte entre o jogo e o ouvido.

   O ouvido (`o-ouvido.js`) e a regra do improviso (`a-regra-do-improviso.js`)
   nasceram medidos contra uma cena de exame: { lugar, tipo, pessoas (com o
   que vendem), ausentes, mortos, coisas, heroi: { moeda, carrega,
   companheiro } }. O jogo não guarda a cena assim: guarda a ficha, o grupo,
   as bancas, o chão e quem o sistema sabe noutro lugar. Este módulo faz as
   quatro coisas que faltavam para o Mestre vivo responder a TODA frase de
   troca antes de o Narrador ser chamado — e nunca com silêncio:

     1. aCenaDoOuvido(retrato)      — do retrato do estado real para a cena;
     2. oOuvidoNaTroca(frase, cena) — a leitura, a resposta do Mestre e o
        caminho: «nao» (a negativa, com o motivo de tabela), «pergunta» (o
        texto e as opções fechadas, cada uma com a frase completa que a
        escolha reenvia) ou «aplicar» (a intenção que o veredito de hoje lê);
     3. aTrocaDoOuvido(o, ctx)      — o menor que é verdadeiro e reversível,
        para o que nenhum caminho de hoje aplicou: o herói só recebe o que a
        pessoa vende ou o que um comprador paga; o que ele entrega sai da
        ficha; o que vai ao companheiro entra na bolsa dele. Sem fonte no
        sistema, a resposta é não — nunca item inventado;
     4. oRegistroDoOuvido(frase, o) — a linha do console (os testadores de
        sessão jogada a leem; a tela nunca).

   A RÉGUA QUE DECIDIU A REDE (22/11, medido no treino aberto e no corpus do
   ouvido): o leitor composto — o ouvido primeiro, as listas antigas onde o
   ouvido não vê troca — não ganhou NENHUMA troca que o ouvido perdesse
   (revocação igual: 100 / 99,1) e somou falsas trocas (precisão 100 → 89,3
   no treino, 100 → 96,2 no corpus). A variante mais estreita — as listas só
   onde o ouvido não vê troca E a confiança é baixa (≤ 0,35, 0,6 ou 0,8) —
   empata com o ouvido sozinho: nenhuma frase das duas réguas cai nela. Fica
   o ouvido sozinho; as listas de hoje ficam como caminho de APLICAÇÃO (a
   compra à banca, o cartão da venda, o dado do furto), e como leitor só
   quando o ouvido estoura. O gesto sem verbo conhecido que nomeia uma coisa
   (a confiança mais baixa do ouvido) vira pergunta do Mestre, e não silêncio.

   Tudo o que é palavra ou número mora em A_CENA_DO_OUVIDO. Módulo puro,
   determinístico, sem React. O veredito sai na forma de `oVereditoDaTroca`
   ({ tipo, estado, ficha, mudou, linha, fato, veto }) para ir à ficha, à
   tela e à pauta pela mesma porta (`aplicarOVereditoDaTroca`).
   ============================================================ */
import { oOuvido, O_OUVIDO } from "../o-ouvido.js";
import { aRespostaDoMestre, A_REGRA_DO_IMPROVISO } from "../a-regra-do-improviso.js";

export const A_CENA_DO_OUVIDO = Object.freeze({
  /* os usos da mochila que viram coisa da ficha quando há ao menos um */
  usos: Object.freeze({ racoes: "ração", agua: "água", tochas: "tocha" }),
  /* o verbo na primeira pessoa (a frase que a escolha reenvia) e no infinitivo (o fato) */
  verbo: Object.freeze({
    comprar: "compro", vender: "vendo", pagar: "pago", dar: "dou", pedir: "peço", pegar: "pego", furtar: "furto",
    emprestar: "empresto", devolver: "devolvo", subornar: "suborno", escambo: "troco", cobrar: "cobro", usar: "uso",
  }),
  infinitivo: Object.freeze({
    comprar: "comprar", vender: "vender", pagar: "pagar", dar: "dar", pedir: "pedir", pegar: "pegar", furtar: "furtar",
    emprestar: "emprestar", devolver: "devolver", subornar: "subornar", escambo: "trocar", cobrar: "cobrar", usar: "usar",
  }),
  /* a coisa que vem de outro: a opção diz «de Fulano»; o resto, «a Fulano» */
  vemDeOutro: Object.freeze(["comprar", "pedir", "pegar", "furtar", "cobrar"]),
  /* o que o dado decide pelo caminho de hoje (resolverATrocaDoDado e o momento) */
  dadoDeHoje: Object.freeze(["furtar", "pedir", "pegar", "subornar"]),
  /* a coisa que faz do gesto sem verbo uma troca a perguntar (a confiança é a semVerbo do ouvido) */
  gestoSemVerbo: Object.freeze(["dele", "minha", "moeda"]),
  /* as palavras que guardam o lugar da coisa que faltou («dou isso pro Ivo») */
  lugarDaCoisa: /\b(isso|isto|aquilo|algo|alguma coisa)\b/i,
  pronomes: /\b(dele|dela|ele|ela|lhe)\b/i,
  /* O QUE A TELA DIZ (a voz da mesa: «você», nunca o nome do mecanismo) */
  tela: Object.freeze({
    nao: Object.freeze({
      /* o ausente: a linha de quem não está já vem da ficha da cena (falaDeQuemNaoEsta) */
      ausente: "",
      morto: "🤝 {Nome} está morto: não recebe nem dá nada.",
      sem_moeda: "◉ Não chega: você tem ◉ {Bolsa}.",
      nao_tem: "🎒 Você não tem {coisa}.",
      nao_vende: "🛒 {Nome} não vende {coisa}.",
      nao_vendeNinguem: "🛒 Ninguém aqui vende {coisa}.",
      ninguem_aqui: "🤝 Não há ninguém aqui para isso.",
    }),
    pergunta: "🤝 {texto} {lista}",
    opcao: "{n}. {rotulo}",
    separador: " · ",
    dar: "🤝 {Coisa} agora é de {Quem}.",
    darSemQuem: "🤝 Você deixa {coisa}.",
    darMoeda: "◉ −{Q}: {Quem} recebe (bolsa: ◉ {B}).",
    darMoedaSemQuem: "◉ −{Q} (bolsa: ◉ {B}).",
    darMoedaAoGrupo: "🤝 {Nome} devolve: o dinheiro do grupo fica na sua bolsa.",
    darEmUso: "🤝 Você usa {Coisa}: tire antes de dar.",
    emprestar: "🤝 {Coisa} fica emprestado com {Quem}.",
    devolver: "🤝 Você devolve {Coisa} a {Quem}.",
    pagar: "◉ −{Q}: pago a {Quem} (bolsa: ◉ {B}).",
    pagarSemQuem: "◉ −{Q} (bolsa: ◉ {B}).",
    pagarQuanto: "◉ Quanto você paga? Diga a quantia.",
    comprar: "🛒 {Coisa} de {Quem}: ◉ −{Q} (bolsa: ◉ {B}).",
    vender: "◉ +{Q}: {Quem} fica com {Coisa} (bolsa: ◉ {B}).",
    venderSemQuem: "🛒 Ninguém aqui compra {coisa}.",
    escambo: "🤝 Você troca {Coisa} por {Outra} com {Quem}.",
    pegarDoMorto: "✋ Não há {coisa} com {Nome} que se leve.",
    dadoSemDado: "🤝 {Nome} não cede: nada muda de mão.",
  }),
  /* O QUE O NARRADOR RECEBE (bastidor, na pauta do turno: o fato e o veto, em primeira pessoa) */
  fato: Object.freeze({
    nao: Object.freeze({
      ausente: "{Nome} não está aqui: não houve com quem trocar, e nada mudou de mão.",
      morto: "{Nome} está morto: não recebe nem dá nada, e nada mudou de mão.",
      sem_moeda: "Quis {gesto}, e não tenho moeda que chegue (tenho ◉ {Bolsa}): nada saiu da minha bolsa.",
      nao_tem: "Quis {gesto}, e não tenho isso comigo: nada mudou de mão.",
      nao_vende: "{Nome} não vende {coisa}: nada mudou de mão.",
      nao_vendeNinguem: "Ninguém aqui vende {coisa}: nada mudou de mão.",
      ninguem_aqui: "Não há ninguém aqui com quem {gesto}: nada mudou de mão.",
    }),
    dar: "Dei {Coisa} a {Quem}; saiu da minha bolsa e está com {Quem}.",
    darSemQuem: "Deixei {coisa}; saiu da minha bolsa.",
    darMoeda: "Dei ◉ {Q} a {Quem}; saiu da minha bolsa (agora tenho ◉ {B}).",
    darMoedaSemQuem: "Deixei ◉ {Q}; saiu da minha bolsa (agora tenho ◉ {B}).",
    darMoedaAoGrupo: "Quis dar moedas a {Nome}; o dinheiro do grupo fica na minha bolsa, e nada mudou de mão.",
    darEmUso: "Quis dar {Coisa}, mas estou usando: não dei, e nada mudou de mão.",
    emprestar: "Emprestei {Coisa} a {Quem}; saiu da minha bolsa e está com {Quem} até me devolver.",
    devolver: "Devolvi {Coisa} a {Quem}; saiu da minha bolsa e está com {Quem}.",
    pagar: "Paguei ◉ {Q} a {Quem}; saiu da minha bolsa (agora tenho ◉ {B}).",
    pagarSemQuem: "Paguei ◉ {Q}; saiu da minha bolsa (agora tenho ◉ {B}).",
    pagarQuanto: "Quis pagar sem dizer quanto: nada saiu da minha bolsa ainda.",
    comprar: "Comprei {Coisa} de {Quem} por ◉ {Q}; já está comigo, e a moeda saiu da minha bolsa (agora tenho ◉ {B}).",
    vender: "Vendi {Coisa} a {Quem} por ◉ {Q}; saiu da minha bolsa e a moeda entrou (agora tenho ◉ {B}).",
    venderSemQuem: "Quis vender {coisa}, e ninguém aqui compra: nada mudou de mão.",
    escambo: "Troquei {Coisa} por {Outra} com {Quem}; {Coisa} saiu da minha bolsa e {Outra} entrou.",
    pegarDoMorto: "Quis levar «{coisa}» de {Nome}, e não há tal coisa com {Nome}: nada entrou na minha mochila.",
    dadoSemDado: "Tentei {gesto}, e {Nome} não cedeu: nada mudou de mão.",
    dadoPendente: "Tentei {gesto}; o que {Nome} responde depende do teste, e nesta resposta nada muda de mão.",
  }),
  veto: Object.freeze({
    nada: "fazer esta troca acontecer nesta resposta, ou pôr nas minhas mãos ou tirar delas qualquer coisa",
    feita: "desfazer esta troca, ou pôr nas minhas mãos ou tirar delas outra coisa além do que está dito",
  }),
  /* quem não tem nome na frase: a palavra que a linha usa */
  alguem: "alguém",
});

const str = (x) => (x == null ? "" : String(x));
const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const sem = (s) => str(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const tpl = (t, o) => str(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? "" : String(o[k])));
const nomeDe = (r) => (typeof r === "string" ? r : (r && r.nome) || "");
/* «Faca herdada (única lembrança…)» diz-se «faca herdada» */
const curto = (r) => nomeDe(r).replace(/\s*\(.*\)\s*$/, "").trim();
const maiuscula = (s) => (str(s) ? str(s).charAt(0).toUpperCase() + str(s).slice(1) : "");
const mesmaCoisa = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.replace(/s$/, "") === y.replace(/s$/, "")); };
const primeiro = (n) => str(n).split(/[\s,]+/)[0];

/* ============================================================
   aCenaDoOuvido(retrato) → cena (o formato do exame)
   retrato: {
     lugar    — { nome, tipo } | nome;
     pessoas  — [{ nome, papel, ehCompanheiro }] (pessoasDaCena);
     grupo    — [{ nome }] (o primeiro é o companheiro);
     bancas   — [{ nome, tipo, oficio, estoque: [{ nome, preco }] }] (bancasDaCena, o balcão);
     ausentes — [{ nome, morto }] (osAusentes);
     chao     — [nome | { nome }] (pertoDaqui);
     ficha    — { moedas, inventario, equipamento, equipados, suprimentos }
   }
   ============================================================ */
export function aCenaDoOuvido(retrato) {
  const r = obj(retrato) || {};
  const f = obj(r.ficha) || {};
  const grupo = arr(r.grupo).map(nomeDe).filter(Boolean);
  const doGrupo = new Set(grupo.map(sem));
  const lugar = obj(r.lugar) ? r.lugar : { nome: str(r.lugar), tipo: "" };
  const pessoas = [];
  const ja = new Set();
  for (const p of arr(r.pessoas)) {
    const nome = nomeDe(p).trim();
    if (!nome || doGrupo.has(sem(nome)) || (obj(p) && p.ehCompanheiro) || ja.has(sem(nome))) continue;
    ja.add(sem(nome));
    pessoas.push({ nome, oficio: str(obj(p) ? p.papel || p.oficio : ""), vende: null });
  }
  for (const b of arr(r.bancas)) {
    const nome = nomeDe(b).trim();
    if (!nome) continue;
    const vende = arr(obj(b) ? b.estoque : null).filter((x) => nomeDe(x)).map((x) => ({ item: curto(x), preco: Math.max(0, Number(x && x.preco) || 0) }));
    const i = pessoas.findIndex((p) => sem(p.nome) === sem(nome));
    if (i >= 0) { pessoas[i] = { ...pessoas[i], vende: [...arr(pessoas[i].vende), ...vende] }; continue; }
    ja.add(sem(nome));
    pessoas.push({ nome, oficio: str(obj(b) ? b.oficio || b.tipo : ""), vende });
  }
  const presentes = new Set([...pessoas.map((p) => sem(p.nome)), ...doGrupo]);
  const longe = arr(r.ausentes).filter((a) => nomeDe(a) && !presentes.has(sem(nomeDe(a))));
  const sup = obj(f.suprimentos) || {};
  const carrega = [];
  for (const raw of [...arr(f.inventario), ...arr(f.equipamento), ...Object.values(obj(f.equipados) || {})]) {
    const n = curto(raw);
    if (n && !carrega.some((x) => sem(x) === sem(n))) carrega.push(n);
  }
  for (const [id, n] of Object.entries(A_CENA_DO_OUVIDO.usos)) if ((Number(sup[id]) || 0) > 0 && !carrega.some((x) => mesmaCoisa(x, n))) carrega.push(n);
  return {
    lugar: str(lugar.nome), tipo: str(lugar.tipo),
    pessoas,
    ausentes: longe.filter((a) => !(obj(a) && a.morto)).map(nomeDe),
    mortos: longe.filter((a) => obj(a) && a.morto).map(nomeDe),
    coisas: arr(r.chao).map(curto).filter(Boolean),
    heroi: { moeda: Math.max(0, Number(f.moedas) || 0), carrega, companheiro: grupo[0] || null },
  };
}

/* a frase completa que uma escolha reenvia */
function aFraseDaEscolha(frase, l, motivo, op) {
  const R = A_CENA_DO_OUVIDO;
  const s = l.subtipo || (l.familia === "usar" ? "usar" : "");
  const quem = l.quem || l.companheiro || "";
  const prep = R.vemDeOutro.includes(s) ? "de" : "a";
  if (motivo === "dois_com_o_nome") {
    const p = primeiro(op);
    const rx = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return rx.test(frase) ? frase.replace(rx, op) : `${frase} ${prep} ${op}`;
  }
  if (motivo === "falta_quem") {
    const m = frase.match(R.pronomes);
    if (m) return frase.replace(R.pronomes, /^d/i.test(m[1]) ? `de ${op}` : m[1].toLowerCase() === "lhe" ? "" : op).replace(/\s{2,}/g, " ").trim() + (m[1].toLowerCase() === "lhe" ? ` a ${op}` : "");
    return `${frase.replace(/[.!?\s]+$/, "")} ${prep} ${op}`;
  }
  /* falta o quê: a ação (o verbo que ninguém previu) ou a coisa */
  if (!l.subtipo && l.familia === "trocar" && R.verbo[op]) {
    const p2 = R.vemDeOutro.includes(op) ? "de" : "a";
    return `${R.verbo[op]} ${l.coisa || "isso"}${quem ? ` ${p2} ${quem}` : ""}`;
  }
  if (R.lugarDaCoisa.test(frase)) return frase.replace(R.lugarDaCoisa, op);
  return `${R.verbo[s] || "uso"} ${op}${quem ? ` ${prep} ${quem}` : ""}`;
}

/* a intenção que o veredito de hoje (oVereditoDaTroca) lê, por subtipo; null = sem caminho de hoje */
function aIntencaoDeHoje(l) {
  const s = l.subtipo;
  if (s === "dar") return l.coisaTipo === "moeda" ? null : Object.freeze({ tipo: "dar" });
  if (s === "furtar") return Object.freeze({ tipo: "furto", coisa: str(l.coisa) });
  if (s === "pedir") {
    if (l.companheiro) return Object.freeze({ tipo: "companheiro", quem: l.companheiro, oQue: l.coisaTipo === "moeda" ? "moeda" : "coisa", coisa: str(l.coisa) });
    return Object.freeze({ tipo: "deGraca", coisa: str(l.coisa) });
  }
  if (s === "pegar") return l.quemEstado === "morto" ? null : Object.freeze({ tipo: "pegar", coisa: str(l.coisa), dono: l.quem ? primeiro(l.quem).toLowerCase() : null });
  if (s === "subornar") return Object.freeze({ tipo: "suborno" });
  return null;
}

const oGesto = (l) => {
  const R = A_CENA_DO_OUVIDO;
  const s = l.subtipo || (l.familia === "usar" ? "usar" : "");
  const inf = R.infinitivo[s] || "trocar";
  const coisa = l.coisaTipo === "moeda" ? (l.quantia ? `◉ ${l.quantia}` : "moedas") : str(l.coisa);
  return coisa ? `${inf} ${coisa}` : inf;
};

/* a negativa, na forma do veredito de hoje */
function aNegativa(l, r, cena) {
  const R = A_CENA_DO_OUVIDO;
  const motivo = r.motivo;
  const Nome = str(l.quem || (motivo === "ausente" || motivo === "morto" ? l.quemDito : "") || "").trim()
    || (motivo === "ausente" || motivo === "morto" ? str(arr(l.opcoesDeQuem)[0] || "") : "");
  const Bolsa = Number(obj(cena) && obj(cena.heroi) ? cena.heroi.moeda : 0) || 0;
  const coisa = str(l.coisa) || "isso";
  const chave = motivo === "nao_vende" && !Nome ? "nao_vendeNinguem" : motivo;
  const o = { Nome: Nome || R.alguem, Bolsa, coisa, gesto: oGesto(l) };
  return Object.freeze({
    tipo: "ouvido", estado: "negada", ficha: null, mudou: Object.freeze([]), motivo,
    linha: tpl(R.tela.nao[chave], o), fato: tpl(R.fato.nao[chave], o), veto: Object.freeze([R.veto.nada]),
  });
}

/* ============================================================
   oOuvidoNaTroca(frase, cena) → {
     lido, leitura, resposta,
     caminho   — null (não é troca nem uso) | "nao" | "pergunta" | "aplicar",
     intencao  — a do veredito de hoje (caminho «aplicar»), ou null,
     negada    — o veredito negado (caminho «nao»),
     pergunta  — { texto, linha, opcoes: [{ rotulo, frase }] } (caminho «pergunta»)
   }
   ============================================================ */
export function oOuvidoNaTroca(frase, cena) {
  const vazio = Object.freeze({ lido: false, leitura: null, resposta: null, caminho: null, intencao: null, negada: null, pergunta: null });
  try {
    const R = A_CENA_DO_OUVIDO;
    const f = str(frase).trim();
    if (!f) return vazio;
    const lida = oOuvido(f, cena);
    /* o gesto sem verbo conhecido que nomeia uma coisa de alguém, minha ou moeda
       («aceito o pão e a água que ela oferece», sessão 15): a confiança é a mais
       baixa do ouvido, e o Mestre pergunta o que se faz com ela em vez de calar.
       Medido: nenhuma frase do treino nem do corpus cai aqui (os números não mudam) */
    const semVerbo = !["trocar", "usar"].includes(lida.familia) && Number(lida.confianca) <= O_OUVIDO.confianca.semVerbo && R.gestoSemVerbo.includes(lida.coisaTipo);
    const leitura = semVerbo ? Object.freeze({ ...lida, familia: "trocar", subtipo: null }) : lida;
    const resposta = aRespostaDoMestre(leitura, cena);
    const base = { lido: true, leitura, resposta, caminho: null, intencao: null, negada: null, pergunta: null };
    if (!["trocar", "usar"].includes(leitura.familia) || !A_REGRA_DO_IMPROVISO.vereditos.includes(resposta.veredito)) return Object.freeze(base);
    if (resposta.veredito === "nao") return Object.freeze({ ...base, caminho: "nao", negada: aNegativa(leitura, resposta, cena) });
    if (resposta.veredito === "pergunta" && resposta.pergunta) {
      const opcoes = arr(resposta.pergunta.opcoes).filter(Boolean).map((op) => Object.freeze({ rotulo: maiuscula(op), frase: aFraseDaEscolha(f, leitura, resposta.motivo, str(op)) }));
      if (!opcoes.length) return Object.freeze(base);
      const lista = opcoes.map((o, i) => tpl(R.tela.opcao, { n: i + 1, rotulo: o.rotulo })).join(R.tela.separador);
      return Object.freeze({ ...base, caminho: "pergunta", pergunta: Object.freeze({ texto: resposta.pergunta.texto, linha: tpl(R.tela.pergunta, { texto: resposta.pergunta.texto, lista }), opcoes: Object.freeze(opcoes) }) });
    }
    /* o uso que a ficha permite segue pelos caminhos de hoje (a água, a tocha, a ração) */
    if (leitura.familia === "usar") return Object.freeze(base);
    return Object.freeze({ ...base, caminho: "aplicar", intencao: aIntencaoDeHoje(leitura) });
  } catch {
    return vazio;
  }
}

/* ============================================================
   aRespostaDaPergunta(pergunta, texto) → a frase completa da opção | null
   O toque responde pelo número («2») ou pelo nome («Dorva»); o resto é
   uma frase nova, e segue como turno.
   ============================================================ */
export function aRespostaDaPergunta(pergunta, texto) {
  try {
    const ops = arr(obj(pergunta) && pergunta.opcoes).filter((o) => obj(o) && str(o.frase));
    const t = sem(texto).replace(/[.!?]+$/, "").trim();
    if (!ops.length || !t) return null;
    if (/^\d+$/.test(t)) { const k = Number(t) - 1; return ops[k] ? ops[k].frase : null; }
    const exato = ops.filter((o) => sem(o.rotulo) === t);
    if (exato.length === 1) return exato[0].frase;
    const peloPrimeiro = ops.filter((o) => sem(o.rotulo).split(" ").includes(t) || (t.length >= 3 && sem(o.rotulo).startsWith(t)));
    return peloPrimeiro.length === 1 ? peloPrimeiro[0].frase : null;
  } catch { return null; }
}

/* ============================================================
   aFichaMudou(antes, agora) → bool
   Algum caminho de hoje já mexeu na bolsa neste turno (a compra à banca, o
   cartão de pagar ou vender, a dádiva, o veredito da troca): o ouvido não
   aplica de novo.
   ============================================================ */
export function aFichaMudou(antes, agora) {
  try {
    const a = obj(antes), b = obj(agora);
    if (!a || !b) return false;
    const retrato = (f) => JSON.stringify([
      Number(f.moedas) || 0,
      arr(f.inventario).map(nomeDe), arr(f.equipamento).map(nomeDe), Object.values(obj(f.equipados) || {}).map(nomeDe),
      obj(f.suprimentos) || {}, arr(f.grupo).map((g) => [nomeDe(g), arr(g && g.inventario).map(nomeDe), Number(g && g.moedas) || 0]),
    ]);
    return retrato(a) !== retrato(b);
  } catch { return false; }
}

/* ============================================================
   aTrocaDoOuvido(o, ctx) → veredito | null
   O que nenhum caminho de hoje aplicou, e o ouvido aplica por si — o menor
   que é verdadeiro. `o`: o de oOuvidoNaTroca (caminho «aplicar»). ctx: {
     ficha      — a do herói agora;
     bancas     — as da cena, com o estoque inteiro (o item que entra);
     porta      — a do momento (oQueOMomentoFaz): "rola" espera o dado;
     vaiAoCorpo — os tipos de item que entram no equipamento;
     ofertaDe   — (item) → { valor, quem: { nome } | null } (quem compra aqui)
   }
   O veredito traz `comprado: { banca, nome }` quando o item saiu de uma
   banca (quem chama dá a baixa no estoque).
   ============================================================ */
export function aTrocaDoOuvido(o, ctx) {
  try {
    const R = A_CENA_DO_OUVIDO, T = R.tela, F = R.fato;
    const x = obj(o);
    if (!x || x.caminho !== "aplicar" || !obj(x.leitura) || !obj(x.resposta)) return null;
    const l = x.leitura, v = x.resposta.veredito, s = l.subtipo;
    const c = obj(ctx) || {};
    const ficha = obj(c.ficha);
    if (!ficha) return null;
    const moedas = Math.max(0, Number(ficha.moedas) || 0);
    const quemDoOutro = str(l.quem).trim();
    const comp = str(l.companheiro).trim();
    const Quem = comp || quemDoOutro;
    const NomeCurto = primeiro(Quem) || R.alguem;
    const aplicada = (tipo, nova, mudou, linha, fato, extra) => Object.freeze({ tipo, estado: "aplicada", ficha: nova, mudou: Object.freeze(mudou), linha, fato, veto: Object.freeze([R.veto.feita]), ...(extra || {}) });
    const negada = (tipo, motivo, linha, fato) => Object.freeze({ tipo, estado: "negada", ficha: null, mudou: Object.freeze([]), motivo, linha, fato, veto: Object.freeze([R.veto.nada]) });

    /* o dado: o caminho de hoje rola o furto, o pedido, o tomar e o suborno; o resto não muda de mão sem o teste */
    if (v === "dado") {
      if (c.porta === "rola" && R.dadoDeHoje.includes(s)) return null;
      const o2 = { Nome: Quem || R.alguem, gesto: oGesto(l) };
      if (c.porta === "rola") return negada("ouvido", "dado", "", tpl(F.dadoPendente, o2));
      return negada("ouvido", "dado", tpl(T.dadoSemDado, o2), tpl(F.dadoSemDado, o2));
    }
    if (v !== "sim" && v !== "sim_com_preco") return null;

    /* a coisa da ficha: da mochila, do equipamento que se carrega, do que se veste, dos usos */
    const inv = arr(ficha.inventario), eqp = arr(ficha.equipamento);
    const vestidos = Object.values(obj(ficha.equipados) || {}).map(curto).filter(Boolean);
    const achar = (coisa) => {
      const i = inv.findIndex((r) => mesmaCoisa(curto(r), coisa));
      if (i >= 0) return { onde: "inventario", i, raw: inv[i], nome: curto(inv[i]) };
      const j = eqp.findIndex((r) => mesmaCoisa(curto(r), coisa));
      if (j >= 0) return { onde: "equipamento", i: j, raw: eqp[j], nome: curto(eqp[j]) };
      if (vestidos.some((n) => mesmaCoisa(n, coisa))) return { onde: "equipados", nome: vestidos.find((n) => mesmaCoisa(n, coisa)) };
      const uso = Object.entries(R.usos).find(([, n]) => mesmaCoisa(n, coisa));
      if (uso && (Number((obj(ficha.suprimentos) || {})[uso[0]]) || 0) > 0) return { onde: "suprimentos", id: uso[0], nome: uso[1] };
      return null;
    };
    const tirar = (f0, k) => {
      if (k.onde === "inventario") return { ...f0, inventario: arr(f0.inventario).filter((_, i) => i !== k.i) };
      if (k.onde === "equipamento") return { ...f0, equipamento: arr(f0.equipamento).filter((_, i) => i !== k.i) };
      if (k.onde === "suprimentos") { const sp = obj(f0.suprimentos) || {}; return { ...f0, suprimentos: { ...sp, [k.id]: Math.max(0, (Number(sp[k.id]) || 0) - 1) } }; }
      return f0;
    };
    const aoCompanheiro = (f0, item) => ({ ...f0, grupo: arr(f0.grupo).map((g) => (obj(g) && sem(nomeDe(g)) === sem(comp) ? { ...g, inventario: [...arr(g.inventario), item] } : g)) });

    /* entregar: dar, emprestar, devolver (o que sai da ficha; ao companheiro, entra na bolsa dele) */
    if (s === "dar" || s === "emprestar" || s === "devolver") {
      if (l.coisaTipo === "moeda") {
        /* a moeda emprestada ou devolvida sai da bolsa como a dada (o «até devolver» é da prosa, não da ficha) */
        if (comp) return negada("ouvido", "grupo", tpl(T.darMoedaAoGrupo, { Nome: primeiro(comp) }), tpl(F.darMoedaAoGrupo, { Nome: primeiro(comp) }));
        const Q = Math.max(1, Number(l.quantia) || 1);
        if (Q > moedas) return null;
        const B = moedas - Q;
        const nova = { ...ficha, moedas: B };
        return quemDoOutro
          ? aplicada("ouvido", nova, [{ coisa: "moedas", quantos: Q, de: "heroi", para: quemDoOutro }], tpl(T.darMoeda, { Q, Quem: quemDoOutro, B }), tpl(F.darMoeda, { Q, Quem: quemDoOutro, B }))
          : aplicada("ouvido", nova, [{ coisa: "moedas", quantos: Q, de: "heroi", para: "" }], tpl(T.darMoedaSemQuem, { Q, B }), tpl(F.darMoedaSemQuem, { Q, B }));
      }
      const k = achar(l.coisa);
      if (!k) return null;
      if (k.onde === "equipados") return negada("ouvido", "emUso", tpl(T.darEmUso, { Coisa: maiuscula(k.nome) }), tpl(F.darEmUso, { Coisa: k.nome }));
      let nova = tirar(ficha, k);
      const item = k.onde === "suprimentos" ? k.nome : k.raw;
      if (comp) nova = aoCompanheiro(nova, item);
      const mudou = [{ coisa: k.nome, quantos: 1, de: "heroi", para: Quem }];
      if (!Quem) return aplicada("ouvido", nova, mudou, tpl(T.darSemQuem, { coisa: k.nome }), tpl(F.darSemQuem, { coisa: k.nome }));
      const chave = s === "dar" ? "dar" : s;
      return aplicada("ouvido", nova, mudou, tpl(T[chave], { Coisa: maiuscula(k.nome), Quem }), tpl(F[chave], { Coisa: k.nome, Quem }));
    }

    if (s === "pagar") {
      const preco = l.coisaTipo === "dele" && Number(l.preco) > 0 ? Number(l.preco) : 0;
      const Q = Number(l.quantia) > 0 ? Number(l.quantia) : preco;
      if (!Q) return negada("ouvido", "quanto", T.pagarQuanto, F.pagarQuanto);
      if (Q > moedas) return null;
      const B = moedas - Q;
      const nova = { ...ficha, moedas: B };
      const mudou = [{ coisa: "moedas", quantos: Q, de: "heroi", para: Quem }];
      return Quem
        ? aplicada("ouvido", nova, mudou, tpl(T.pagar, { Q, Quem, B }), tpl(F.pagar, { Q, Quem, B }))
        : aplicada("ouvido", nova, mudou, tpl(T.pagarSemQuem, { Q, B }), tpl(F.pagarSemQuem, { Q, B }));
    }

    /* o que vem de uma banca: o item inteiro do estoque (sem o preço), ou o uso do balcão */
    const doEstoque = (coisa, dono) => {
      for (const b of arr(c.bancas)) {
        if (!obj(b) || (dono && sem(nomeDe(b)) !== sem(dono))) continue;
        const it = arr(b.estoque).find((e) => mesmaCoisa(curto(e), coisa));
        if (it) return { banca: b, item: it };
      }
      return null;
    };
    const entrar = (f0, achado, nomeItem, vezes) => {
      /* o balcão de mantimentos diz o uso pelo id (racoes, agua, tochas, kit) */
      const usoId = achado && obj(achado.item) ? str(achado.item.uso) : "";
      if (usoId) { const sp = obj(f0.suprimentos) || {}; return { ...f0, suprimentos: { ...sp, [usoId]: usoId === "kit" ? true : (Number(sp[usoId]) || 0) + vezes } }; }
      const uso = Object.entries(R.usos).find(([, n]) => mesmaCoisa(n, nomeItem));
      if (uso) { const sp = obj(f0.suprimentos) || {}; return { ...f0, suprimentos: { ...sp, [uso[0]]: (Number(sp[uso[0]]) || 0) + vezes } }; }
      const raw = achado && obj(achado.item) ? (() => { const { preco, detalhe, uso: _u, ...limpo } = achado.item; return limpo; })() : maiuscula(nomeItem);
      const corpo = obj(raw) && arr(c.vaiAoCorpo).includes(raw.tipo);
      const varios = Array.from({ length: vezes }, () => raw);
      return corpo ? { ...f0, equipamento: [...arr(f0.equipamento), ...varios] } : { ...f0, inventario: [...arr(f0.inventario), ...varios] };
    };

    if (s === "comprar") {
      if (l.coisaTipo !== "dele" || !l.dono) return null;
      const achado = doEstoque(l.coisa, l.dono);
      if (achado && obj(achado.item) && achado.item.tipo === "mapa") return null;
      const preco = achado ? Number(achado.item.preco) || 0 : Number(l.preco) || 0;
      const vezes = l.quantiaDe === "coisa" && Number(l.quantia) > 1 ? Number(l.quantia) : 1;
      const oferta = l.quantiaDe !== "coisa" && Number(l.quantia) > 0 ? Number(l.quantia) : 0;
      const Q = oferta || preco * vezes;
      if (!Q || Q > moedas) return null;
      const B = moedas - Q;
      const nova = entrar({ ...ficha, moedas: B }, achado, l.coisa, vezes);
      const Coisa = (vezes > 1 ? `${vezes} × ` : "") + (achado ? curto(achado.item) : l.coisa);
      return aplicada("ouvido", nova, [{ coisa: l.coisa, quantos: vezes, de: l.dono, para: "heroi" }, { coisa: "moedas", quantos: Q, de: "heroi", para: l.dono }],
        tpl(T.comprar, { Coisa: maiuscula(Coisa), Quem: l.dono, Q, B }), tpl(F.comprar, { Coisa, Quem: l.dono, Q, B }),
        achado && achado.banca.id ? { comprado: Object.freeze({ banca: achado.banca.id, nome: nomeDe(achado.item), vezes }) } : null);
    }

    if (s === "vender") {
      const k = achar(l.coisa);
      if (!k || k.onde === "suprimentos") return null;
      if (k.onde === "equipados") return negada("ouvido", "emUso", tpl(T.darEmUso, { Coisa: maiuscula(k.nome) }), tpl(F.darEmUso, { Coisa: k.nome }));
      let of = null;
      try { of = typeof c.ofertaDe === "function" ? c.ofertaDe(k.raw) : null; } catch { of = null; }
      const comprador = (obj(of) && obj(of.quem) && nomeDe(of.quem)) || "";
      const Q = obj(of) ? Math.max(0, Math.floor(Number(of.valor) || 0)) : 0;
      if (!comprador || !Q) return negada("ouvido", "semComprador", tpl(T.venderSemQuem, { coisa: k.nome }), tpl(F.venderSemQuem, { coisa: k.nome }));
      const Para = quemDoOutro || comprador;
      const B = moedas + Q;
      const nova = { ...tirar(ficha, k), moedas: B };
      return aplicada("ouvido", nova, [{ coisa: k.nome, quantos: 1, de: "heroi", para: Para }, { coisa: "moedas", quantos: Q, de: Para, para: "heroi" }],
        tpl(T.vender, { Q, Quem: Para, Coisa: k.nome, B }), tpl(F.vender, { Q, Quem: Para, Coisa: k.nome, B }), { vendido: Object.freeze({ banca: (of.quem && of.quem.id) || "", valor: Q }) });
    }

    if (s === "escambo") {
      const alvo = obj(l.propostaDeEmTroca);
      const k = achar(l.coisa);
      if (!k || !alvo || !quemDoOutro || k.onde === "equipados" || k.onde === "suprimentos") return null;
      const achado = doEstoque(alvo.nome, quemDoOutro);
      if (!achado) return null;
      const nova = entrar(tirar(ficha, k), achado, alvo.nome, 1);
      const Outra = curto(achado.item);
      return aplicada("ouvido", nova, [{ coisa: k.nome, quantos: 1, de: "heroi", para: quemDoOutro }, { coisa: Outra, quantos: 1, de: quemDoOutro, para: "heroi" }],
        tpl(T.escambo, { Coisa: k.nome, Outra, Quem: quemDoOutro }), tpl(F.escambo, { Coisa: k.nome, Outra, Quem: quemDoOutro }),
        achado.banca.id ? { comprado: Object.freeze({ banca: achado.banca.id, nome: nomeDe(achado.item), vezes: 1 }) } : null);
    }

    /* pegar do morto: o sistema não sabe o que ele levava — nada entra */
    if (s === "pegar" && l.quemEstado === "morto") {
      const Nome = str(l.quemDito || arr(l.opcoesDeQuem)[0] || NomeCurto);
      return negada("ouvido", "doMorto", tpl(T.pegarDoMorto, { coisa: str(l.coisa) || "nada", Nome }), tpl(F.pegarDoMorto, { coisa: str(l.coisa) || "nada", Nome }));
    }
    return null;
  } catch { return null; }
}

/* ============================================================
   oRegistroDoOuvido(frase, o) → a linha do console (nunca a tela)
   ============================================================ */
export function oRegistroDoOuvido(frase, o) {
  try {
    const x = obj(o) || {};
    const l = obj(x.leitura) || {}, r = obj(x.resposta) || {};
    return "[o ouvido] " + JSON.stringify({
      frase: str(frase), familia: l.familia || null, subtipo: l.subtipo || null, quem: l.quem || l.companheiro || null, quemEstado: l.quemEstado || null,
      coisa: l.coisa || null, coisaTipo: l.coisaTipo || null, quantia: l.quantia == null ? null : l.quantia, confianca: l.confianca == null ? null : l.confianca,
      veredito: r.veredito || null, motivo: r.motivo || null, caminho: x.caminho || null, intencao: (obj(x.intencao) && x.intencao.tipo) || null,
    });
  } catch { return "[o ouvido] (sem registro)"; }
}
