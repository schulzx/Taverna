/* ============================================================
   UMA PORTA SÓ (23/11/2026) — a frase digitada tem um leitor e uma resposta.

   A décima sexta sessão jogada mediu a fiação do ouvido: 12 de 40 trocas em
   que a linha na tela, a ficha e a prosa concordaram (30%). O leitor não era
   o problema — a ligação era. Duas portas respondiam: a antiga (a mão da
   frase, os cartões de pagar e vender, a bolsa da frase) rodava ANTES do
   ouvido, e às vezes sozinha («O ela não está aqui para comprar»); noutras
   as duas falavam e se contradiziam («Você recolhe: Poção» e logo «Não há
   poção aqui que se leve»; o cartão «Pagar ◉2» junto da pergunta «A quem?»,
   e o cartão cobrou). E o que o ouvido decidia nem sempre ia à ficha («passo
   dez moedas pra Thaddeus»: lido certo, nada debitado).

   Esta função decide, e o App só executa (a lei: conta se prova, tela se
   olha). Recebe a frase, o retrato do estado e a pergunta pendente, e
   devolve UM resultado:

     caminho   — null (não é troca: as portas de hoje seguem) ·
                 "falar" (não é troca, mas o sistema sabe um fato: o preço) ·
                 "pergunta" (o turno para; a resposta completa a leitura) ·
                 "nao" | "aplicado" | "desiste" (o veredito já decidido) ·
                 "recolher" (o que está solto no chão, pelo caminho do botão) ·
                 "dado" (o teste decide: o caminho do dado de hoje, ou adiado) ·
                 "cartao" (o preço é do sistema: o cartão de sempre mostra o
                 preço e a bolsa, e a troca só acontece no clique);
     troca     — a frase é de troca: nenhuma porta antiga abre;
     veredito  — na forma de oVereditoDaTroca (tipo, estado, ficha, mudou,
                 linha, fato, veto): o que vai à ficha, à tela e à pauta;
     intencao  — a do caminho do dado de hoje (furto, pedido, tomar, suborno);
     adiado    — o dado sem caminho de hoje (aTrocaDoOuvido com a porta);
     recolher  — os ids do chão;
     pergunta  — { texto, linha, opcoes: [{ rotulo, valor }], pendente };
     fato      — o fato do turno quando não é troca (o preço que o sistema sabe);
     cartao    — { tipo, total, chave, leitura }: a leitura é a que a proposta da
                 frase já sabe compor (compras, pagar, venda, escambo); a chave
                 volta em ctx.confirmado no clique, e só então a troca aplica;
     frase     — a frase que parte como turno (a da escolha, se houve);
     transacoes — (etapa 6 da identidade e posse, 23/11) o que muda de mão, em
                 transações com ids ({ de, para, oQue, contra, consentimento,
                 prazo?, origem, chave }, a-troca-por-transacao.js): no
                 «aplicado» e no «cartao», a troca inteira; no «dado», o que o
                 dado decide. O App aplica cada uma por aplicarTransacao, uma
                 vez; a porta já as provou contra a posse (ctx.aPosse) e, se a
                 estrutura recusa, o caminho é «nao» com o motivo.

   Módulo puro, determinístico, sem React. Tudo o que é palavra mora em
   UMA_PORTA_SO; o resto é da ponte (a-cena-do-ouvido.js), do ouvido e da
   regra do improviso.
   ============================================================ */
import { aCenaDoOuvido, oOuvidoNaTroca, oVereditoDoOuvido, aTrocaDoOuvido, A_CENA_DO_OUVIDO } from "./a-cena-do-ouvido.js";
import { ligarACena, asAcoesDaFrase } from "../o-ouvido.js";
import { asDividasDaCena, asTransacoesDoVeredito, aCobrancaDaLeitura, aTransacaoDoPedido, aplicarAsTransacoes, nomesDasTransacoes, oVereditoDaRecusa, oVereditoDoQueVeio } from "../a-troca-por-transacao.js";
import { oQualComRotulos, aEscolhaDoQual } from "../quem-esta-aqui.js";

export const UMA_PORTA_SO = Object.freeze({
  /* o resultado lido na proposta da frase vale para o turno da mesma frase por este tempo (ms) */
  guardadaMs: 15000,
  tela: Object.freeze({
    pergunta: "🤝 {texto} {lista}",
    opcao: "{n}. {rotulo}",
    separador: " · ",
    desiste: "🤝 Fica assim: nada muda de mão.",
    semTroco: "◉ Não há troco: nada foi pago aqui.",
    naoHa: "✋ Não há {coisa} aqui que se leve.",
    /* a bancada da troca (B64): o que está à venda numa banca não se leva da banca sem pagar */
    daBanca: "🛒 {Coisa} é de {Nome}: só sai da banca pago.",
    ausente: "🤝 {Nome} não está aqui.",
    semCaminho: "🤝 Nada muda de mão.",
    /* 23/11 (as frases novas da bancada, N43): a moeda oferecida a quem é do grupo — a bolsa do grupo é uma só */
    subornoAoGrupo: "🤝 {Nome} é do seu grupo: a moeda fica na bolsa comum, e a conversa segue sem ela.",
    /* 23/11 (N08): a segunda ação da frase que não pode seguir agora — dita numa linha, nunca descartada calada */
    depois: "🤝 Uma coisa de cada vez: «{frase}» fica para depois.",
  }),
  fato: Object.freeze({
    desiste: "Não respondi ao que o Mestre perguntou: a troca não aconteceu, e nada mudou de mão.",
    semTroco: "Quis ficar com um troco, e não houve pagamento aqui que deixasse troco: nada mudou de mão.",
    naoHa: "Quis pegar «{coisa}», e não há tal coisa aqui que se leve: nada entrou na minha mochila.",
    daBanca: "Quis levar {Coisa} da banca de {Nome} sem pagar: não levei, e nada mudou de mão.",
    ausente: "{Nome} não está aqui: não houve com quem trocar, e nada mudou de mão.",
    semCaminho: "Quis {gesto}: nada mudou de mão.",
    subornoAoGrupo: "Ofereci moedas a {Nome}, que é do meu grupo: o dinheiro do grupo é um só, e nada mudou de mão.",
    depois: "Disse também «{frase}»: isso fica para depois, e nesta resposta não aconteceu.",
    preco: "O preço é do sistema: {Coisa} custa ◉ {Preco} ({Quem}). É este o preço; não diga outro.",
  }),
  /* o rótulo de cada ação oferecida quando o verbo não se reconheceu */
  acao: Object.freeze({
    comprar: "Comprar", vender: "Vender", pagar: "Pagar", dar: "Dar", pedir: "Pedir", pegar: "Pegar", furtar: "Furtar",
    emprestar: "Emprestar", devolver: "Devolver", subornar: "Subornar", escambo: "Trocar", cobrar: "Cobrar",
  }),
  /* o que o caminho do dado de hoje rola por si (oVereditoDaTroca espera a rolagem) */
  dadoDeHoje: Object.freeze(["furto", "deGraca", "tomar", "suborno", "pegar"]),
  /* a quem se entrega (o nome próprio depois da preposição) — para quem o sistema não conhece */
  /* a bancada da troca (B80): o «\b» antes de «à» nunca casava (o «à» não é letra para o \b do JS) — e
     «devolvo o símbolo à Mercy», com a Mercy longe, perguntava «a quem?» em vez de dizer que ela não está */
  aQuem: /(?<![\p{L}\p{N}])(?:a|ao|à|pra|pro|para)\s+((?:[A-ZÀ-Ý][\p{Ll}\p{Lu}'-]+)(?:\s+(?:(?:de|da|do|dos|das)\s+)?[A-ZÀ-Ý][\p{Ll}\p{Lu}'-]+)*)/gu,
  /* quem precisa de alguém do outro lado, para a negativa do nome desconhecido */
  precisaDeQuem: Object.freeze(["dar", "pagar", "emprestar", "devolver", "vender", "subornar", "escambo", "cobrar", "pedir"]),
  /* 23/11 (N17): o pronome que retoma a COISA da frase anterior («Cornelius, que corda é essa?» → «levo ela»):
     o verbo de levar/comprar seguido do pronome (sem acento, a frase inteira em minúsculas) */
  retomaACoisa: /^(?:eu\s+)?(?:(?:vou|quero)\s+)?(lev\w*|compr\w*|quero|fico com|peg\w*|vend\w*)\s+(ela|ele|essa|esse|esta|este|isso|isto|aquela|aquele|aquilo)\b/,
  /* 23/11 (N08): o que a primeira ação pode ser para a segunda seguir na mesma resposta, e o que a segunda pode ser */
  seguinteAgora: Object.freeze({ primeira: Object.freeze(["aplicado", "nao", "desiste", "recolher", "dado"]), segunda: Object.freeze(["aplicado", "nao", "cartao"]) }),
  /* a segunda que é só o pagamento da primeira («compro uma ração e pago sete moedas»): a mesma ação */
  mesmaAcao: Object.freeze({ primeira: Object.freeze(["comprar", "pedir"]), segunda: "pagar" }),
  /* quantas ações encadeadas a porta lê numa frase */
  maxAcoes: 3,
});

const str = (x) => (x == null ? "" : String(x));
const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const sem = (s) => str(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const tpl = (t, o) => str(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? "" : String(o[k])));
const nomeDe = (r) => (typeof r === "string" ? r : (r && r.nome) || "");
const semAposto = (n) => str(n).split(",")[0].trim();
const maiuscula = (s) => (str(s) ? str(s).charAt(0).toUpperCase() + str(s).slice(1) : "");
const primeiroNome = (n) => sem(semAposto(n)).split(/\s+/)[0] || "";

const negada = (motivo, linha, fato) => Object.freeze({
  tipo: "ouvido", estado: "negada", ficha: null, mudou: Object.freeze([]), motivo, linha, fato, veto: Object.freeze([A_CENA_DO_OUVIDO.veto.nada]),
});
const oGesto = (l) => {
  const s = (l && l.subtipo) || "";
  const inf = A_CENA_DO_OUVIDO.infinitivo[s] || "trocar";
  const coisa = l && l.coisaTipo === "moeda" ? (l.quantia ? `◉ ${l.quantia}` : "moedas") : str(l && l.coisa);
  return coisa ? `${inf} ${coisa}` : inf;
};

/* ============================================================
   oFocoDaConversa(anteriores, cena) → nome | null
   A quem a frase anterior foi dita (a gente que ela nomeia, ou a banca de
   quem ela comprou) e, sem ela, quem a última fala do Mestre pôs por último.
   É o «ele/ela» de uma mesa: nunca um terceiro ao acaso.
   anteriores: { jogador: "a frase anterior", mestre: "a última fala do Mestre" }
   ============================================================ */
export function oFocoDaConversa(anteriores, cena) {
  try {
    const a = obj(anteriores) || {};
    const c = obj(cena) || {};
    const gente = [...arr(c.pessoas).map(nomeDe), ...(obj(c.heroi) && c.heroi.companheiro ? [c.heroi.companheiro] : [])].filter(Boolean);
    const j = str(a.jogador).trim();
    if (j) {
      const L = ligarACena(j, { ...c, foco: undefined });
      const ditos = [...new Set(L.marcas.filter((m) => m.tipo === "PESSOA" && m.estado === "aqui" && m.nome).map((m) => m.nome))];
      if (ditos.length === 1) return ditos[0];
      if (ditos.length > 1) return null;
      /* a bancada da troca (Q10): a coisa da banca é da banca, ainda que o mercador da praça a atenda */
      const deles = L.marcas.filter((m) => m.tipo === "COISA").flatMap((m) => m.leituras).filter((x) => x && x.tipo === "dele" && x.dono);
      const dele = deles.find((x) => arr(c.bancas).some((b) => sem(nomeDe(b)) === sem(x.dono))) || deles[0];
      if (dele) return dele.dono;
    }
    const m = str(a.mestre);
    if (m && gente.length) {
      let melhor = null, onde = -1;
      for (const n of gente) {
        const p = primeiroNome(n);
        if (p.length < 3) continue;
        const rx = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
        let k; const t = sem(m);
        while ((k = rx.exec(t))) if (k.index > onde) { onde = k.index; melhor = n; }
      }
      return melhor;
    }
    return null;
  } catch { return null; }
}

/* a pergunta com as opções fechadas e válidas: { texto, linha, opcoes, pendente } | null (um só: sem pergunta) */
function aPerguntaValida(o, cena, frase, vezes) {
  const R = UMA_PORTA_SO;
  const l = o.leitura, r = o.resposta;
  const motivo = r.motivo;
  const pessoas = arr(cena.pessoas).map(nomeDe);
  const comp = obj(cena.heroi) ? str(cena.heroi.companheiro) : "";
  let campo, valores;
  if (motivo === "falta_quem" || motivo === "dois_com_o_nome") {
    campo = "quem";
    const bruto = motivo === "dois_com_o_nome" ? arr(r.pergunta.opcoes) : [...pessoas, ...(comp ? [comp] : [])];
    /* só quem está (nunca a loja), sem quem a frase já nomeou, e o companheiro não recebe moeda (o dinheiro é do grupo) */
    valores = bruto.filter((n) => n && (motivo === "dois_com_o_nome" || pessoas.includes(n) || n === comp))
      .filter((n) => !(l.coisaTipo === "moeda" && n === comp && ["dar", "pagar", "emprestar", "devolver"].includes(l.subtipo)));
  } else if (motivo === "falta_o_que" && !l.subtipo && l.familia === "trocar") {
    campo = "subtipo";
    valores = arr(r.pergunta.opcoes).filter((x) => R.acao[x]);
  } else {
    campo = "coisa";
    valores = arr(r.pergunta.opcoes).filter(Boolean);
  }
  /* 23/11 (identidade · etapa 2): quem traz o id é uma pessoa — dois homônimos são duas opções, e
     a escolha leva o id junto (completar). Sem ids, as opções de sempre (uma por nome). */
  const idsDoQual = motivo === "dois_com_o_nome" && arr(l.opcoesIdsDeQuem).length === arr(r.pergunta.opcoes).length ? arr(l.opcoesIdsDeQuem) : [];
  const idDoValor = (n, k) => (campo !== "quem" ? "" : motivo === "dois_com_o_nome" ? str(idsDoQual[arr(r.pergunta.opcoes).indexOf(n, k)] || "") : str((arr(cena.pessoas).filter((p) => nomeDe(p) === n)[k] || {}).id || ""));
  const vistos = new Map();
  const itens = [];
  for (const v of valores.map(str)) {
    const k = vistos.get(v) || 0;
    vistos.set(v, k + 1);
    const id = idDoValor(v, k);
    if (itens.some((x) => (id && x.id ? x.id === id : x.v === v))) continue;
    itens.push({ v, id });
  }
  valores = itens.map((x) => x.v);
  if (!valores.length) return { nenhum: true, campo };
  if (valores.length === 1) return { um: valores[0], umId: itens[0].id, campo };
  const rotulo = (v) => (campo === "subtipo" ? R.acao[v] : maiuscula(semAposto(v)));
  const opcoes0 = itens.map((x) => Object.freeze({ rotulo: rotulo(x.v), valor: x.v, ...(x.id ? { id: x.id } : {}) }));
  /* identidade · etapa 3: dois de mesmo nome são ditos pelo que os distingue («1. Tabitha, taverneira · 2. Tabitha, recruta»);
     o ofício da cena chega como papel, que é o que o rótulo lê (quem-esta-aqui.js#oQualComRotulos) */
  const opcoes = motivo === "dois_com_o_nome" ? oQualComRotulos(opcoes0, arr(cena.pessoas).map((p) => (obj(p) ? { ...p, papel: str(p.papel || p.oficio) } : p))) : opcoes0;
  const lista = opcoes.map((x, i) => tpl(R.tela.opcao, { n: i + 1, rotulo: x.rotulo })).join(R.tela.separador);
  return {
    texto: r.pergunta.texto,
    linha: tpl(R.tela.pergunta, { texto: r.pergunta.texto, lista }),
    opcoes: Object.freeze(opcoes),
    pendente: Object.freeze({ texto: r.pergunta.texto, campo, leitura: l, frase, vezes: vezes || 0 }),
  };
}

/* a leitura completada pela escolha (a estrutura, nunca o texto) */
function completar(l0, campo, valor, cena, id) {
  const comp = obj(cena.heroi) ? str(cena.heroi.companheiro) : "";
  /* o id de quem a escolha deu substitui o da leitura (que era de ninguém, ou da pergunta) */
  const { quemId: _q, opcoesIdsDeQuem: _o, ...semId } = obj(l0) || {};
  const l = campo === "quem" ? { ...semId, ...(id ? { quemId: id } : {}) } : l0;
  if (campo === "quem") {
    if (valor === comp) return Object.freeze({ ...l, quem: null, companheiro: comp, quemEstado: "aqui", opcoesDeQuem: Object.freeze([]), quemPronomeSemDono: false, quemDito: true });
    return Object.freeze({ ...l, quem: valor, companheiro: null, quemEstado: "aqui", opcoesDeQuem: Object.freeze([]), quemPronomeSemDono: false, quemDito: true });
  }
  if (campo === "subtipo") return Object.freeze({ ...l, familia: "trocar", subtipo: valor });
  const carrega = arr(obj(cena.heroi) && cena.heroi.carrega);
  const dele = [...arr(cena.pessoas), ...arr(cena.bancas)].flatMap((p) => arr(p.vende).map((v) => ({ ...v, dono: p.nome }))).find((v) => sem(v.item) === sem(valor));
  if (carrega.some((x) => sem(x) === sem(valor))) return Object.freeze({ ...l, coisa: valor, coisaTipo: "minha", dono: null, preco: null });
  if (dele) return Object.freeze({ ...l, coisa: valor, coisaTipo: "dele", dono: dele.dono, preco: dele.preco });
  return Object.freeze({ ...l, coisa: valor, coisaTipo: "livre" });
}

/* a frase que parte como turno depois da escolha (o Narrador lê a intenção inteira) */
function aFraseDaLeitura(l) {
  const C = A_CENA_DO_OUVIDO;
  const s = l.subtipo || "";
  const quem = semAposto(l.quem || l.companheiro || "");
  const coisa = l.coisaTipo === "moeda" ? (l.quantia ? `${l.quantia} moedas` : "moedas") : str(l.coisa);
  const prep = C.vemDeOutro.includes(s) || l.direcao === "recebe" ? "de" : "a";
  return [C.verbo[s] || "faço", coisa, quem ? `${prep} ${quem}` : ""].filter(Boolean).join(" ");
}

/* a resposta à pergunta pendente: o número, o nome inteiro ou o primeiro nome da opção */
/* a opção escolhida inteira (com o id, quando a tem) */
function aOpcaoEscolhida(pendente, opcoes, texto) {
  const ops = arr(opcoes);
  const t = sem(texto).replace(/[.!?]+$/, "").trim();
  if (!ops.length || !t) return null;
  if (/^\d+$/.test(t)) { const k = Number(t) - 1; return ops[k] || null; }
  const exato = ops.filter((o) => sem(o.rotulo) === t || sem(o.valor) === t);
  if (exato.length === 1) return exato[0];
  const peloPrimeiro = ops.filter((o) => sem(o.rotulo).split(" ").includes(t) || (t.length >= 3 && sem(o.rotulo).startsWith(t)));
  return peloPrimeiro.length === 1 ? peloPrimeiro[0] : null;
}

/* o nome próprio a quem a frase entrega e que a cena não tem (o desconhecido, o que só a quest nomeia) */
function oNomeDeFora(frase, cena) {
  const gente = [...arr(cena.pessoas).map(nomeDe), ...(obj(cena.heroi) && cena.heroi.companheiro ? [cena.heroi.companheiro] : [])];
  const fora = [...arr(cena.bancas).map(nomeDe), str(cena.lugar), ...arr(cena.coisas)].map(sem);
  for (const m of str(frase).matchAll(UMA_PORTA_SO.aQuem)) {
    const nome = m[1].trim();
    const p = sem(nome).split(/\s+/)[0];
    if (p.length < 3 || gente.some((g) => primeiroNome(g) === p) || fora.some((x) => x && x.includes(sem(nome)))) continue;
    return nome;
  }
  return "";
}

/* ============================================================
   aPortaUnica(frase, retrato, ctx) → o resultado (veja o cabeçalho)
   retrato: o de aCenaDoOuvido, mais
     chao       — [{ id, nome }] (os ids vão ao «recolher»);
     anteriores — { jogador, mestre } (o foco do pronome), ou foco já dito;
     casa       — os pratos da casa (osPratosDaCasa).
   ctx: {
     pendente    — a pergunta pendente (a de um resultado «pergunta»), ou null;
     ofertaDe    — (item) → { valor, quem } (quem compra aqui);
     ofertaDoUso — (id, quantos) → { valor, quem } (a revenda do que é de uso);
     vaiAoCorpo  — os tipos de item que entram no equipamento;
     confirmado  — a chave do cartão que o jogador viu e confirmou (o clique)
   }
   ============================================================ */
export function aPortaUnica(frase, retrato, ctx) {
  const R = UMA_PORTA_SO;
  const f = str(frase).trim();
  const inteira = aPortaDeUmaAcao(frase, retrato, ctx);
  /* DUAS AÇÕES NA FRASE (23/11, N08): «dou uma moeda pra Prudence e compro uma ração do Cornelius». A
     primeira é lida sozinha (a quantia de uma não vaza para a outra); a segunda, com a ficha que a
     primeira deixou. Se a segunda pode seguir agora, vai em `seguinte.r` e o App a executa logo depois;
     se não pode, `seguinte.linha` diz isso numa linha. A resposta à pergunta e o clique do cartão não se
     cortam (já são de uma ação só). */
  try {
    const c = obj(ctx) || {};
    if (!f || c.confirmado || obj(c.pendente) || (Number(c.profundidade) || 0) >= R.maxAcoes - 1) return inteira;
    const partes = asAcoesDaFrase(f);
    if (partes.length < 2) return inteira;
    const primeira = partes[0], resto = partes.slice(1).join(" e ");
    const r1 = aPortaDeUmaAcao(primeira, retrato, ctx);
    if (!r1.troca || !r1.caminho) return inteira;
    const r0 = obj(retrato) || {};
    const ret2 = r1.caminho === "aplicado" && r1.veredito && obj(r1.veredito.ficha) ? { ...r0, ficha: r1.veredito.ficha } : r0;
    const r2 = aPortaUnica(resto, ret2, { ...c, profundidade: (Number(c.profundidade) || 0) + 1 });
    if (!r2.troca || !r2.caminho) return inteira;
    const s1 = r1.leitura && r1.leitura.subtipo, l2 = r2.leitura || {};
    if (R.mesmaAcao.primeira.includes(s1) && l2.subtipo === R.mesmaAcao.segunda && (!l2.coisa || l2.coisaTipo === "moeda")) return inteira;
    const agora = R.seguinteAgora.primeira.includes(r1.caminho) && R.seguinteAgora.segunda.includes(r2.caminho);
    return Object.freeze({
      ...r1,
      frase: ["cartao", "pergunta"].includes(r1.caminho) ? primeira : f,
      seguinte: Object.freeze({ frase: resto, r: r2, agora, linha: agora ? "" : tpl(R.tela.depois, { frase: resto }), fato: agora ? "" : tpl(R.fato.depois, { frase: resto }) }),
    });
  } catch { return inteira; }
}

/* o pronome que retoma a coisa da frase anterior → a frase com a coisa no lugar dele, ou "" */
function aCoisaRetomada(frase, cena, anteriores) {
  const ant = str(obj(anteriores) && anteriores.jogador).trim();
  if (!ant) return "";
  const m = sem(frase).match(UMA_PORTA_SO.retomaACoisa);
  if (!m) return "";
  const L = ligarACena(ant, { ...cena, foco: undefined });
  const porNome = new Map();
  for (const x of L.marcas.filter((y) => y.tipo === "COISA")) {
    const l = arr(x.leituras).find((y) => y.tipo === "dele") || arr(x.leituras)[0];
    if (l && l.nome) porNome.set(sem(l.nome), l.nome);
  }
  if (porNome.size !== 1) return "";
  const nome = [...porNome.values()][0];
  return str(frase).replace(new RegExp("(?<![\\p{L}])" + m[2] + "(?![\\p{L}])", "iu"), nome);
}

function aPortaDeUmaAcao(frase, retrato, ctx) {
  const R = UMA_PORTA_SO;
  const f = str(frase).trim();
  const vazio = Object.freeze({ lido: false, troca: false, caminho: null, frase: f, leitura: null, resposta: null, veredito: null, intencao: null, adiado: false, recolher: null, pergunta: null, fato: null, cartao: null });
  try {
    if (!f) return vazio;
    const r0 = obj(retrato) || {};
    const c = obj(ctx) || {};
    /* o foco do pronome: o que o retrato já diz, ou o que a conversa diz */
    let ret = r0;
    if (!Object.prototype.hasOwnProperty.call(r0, "foco")) {
      const semFoco = aCenaDoOuvido(r0);
      ret = { ...r0, foco: oFocoDaConversa(r0.anteriores, semFoco) };
    }
    let cena = aCenaDoOuvido(ret);
    const ficha = { ...(obj(r0.ficha) || {}), grupo: arr((obj(r0.ficha) || {}).grupo).length ? r0.ficha.grupo : arr(r0.grupo) };
    /* as bancas para aplicar: as do retrato (com o estoque inteiro e o id) e a casa, como banca de quem a serve */
    /* a bancada da troca (L01): a casa é de TODOS os que servem (a taverneira e a serviçal) — uma banca por quem serve */
    const quemServe = arr(cena.pessoas).filter((p) => A_CENA_DO_OUVIDO.quemServe.test(sem(p.oficio)));
    const estoqueDaCasa = arr(r0.casa).map((x) => ({ nome: x.nome, preco: x.preco, consumo: true }));
    const casaBanca = !estoqueDaCasa.length ? [] : quemServe.length ? quemServe.map((p) => ({ nome: p.nome, estoque: estoqueDaCasa })) : [{ nome: str(cena.lugar) || A_CENA_DO_OUVIDO.aCasa, estoque: estoqueDaCasa }];
    const ctxT = { ficha, bancas: [...arr(r0.bancas), ...casaBanca], porta: "", vaiAoCorpo: arr(c.vaiAoCorpo), ofertaDe: c.ofertaDe, ofertaDoUso: c.ofertaDoUso, confirmado: obj(c.confirmado) ? str(c.confirmado.chave) : str(c.confirmado) };
    /* etapa 6: a posse (o registro e o mundo de agora) e a base da chave: o turno, a frase, a ação */
    const aPosse = obj(c.aPosse) || {};
    ctxT.posse = { ...aPosse, bancas: ctxT.bancas };
    ctxT.troca = { grupo: ficha.grupo, bancas: ctxT.bancas, pessoas: arr(cena.pessoas), posses: aPosse.posses || null, mercado: aPosse.mercado || null, ficha, posse: ctxT.posse, base: { turno: c.turno, frase: f, profundidade: c.profundidade } };
    /* etapa 8 (a forma da troca): quem deve a quem vai na cena que o ouvido lê — a dívida é traço da forma */
    try {
      const comp = obj(cena.heroi) && cena.heroi.companheiro ? [{ nome: cena.heroi.companheiro }] : [];
      const dividas = asDividasDaCena([...arr(cena.pessoas), ...comp], ctxT.troca);
      if (dividas.length) cena = { ...cena, dividas };
    } catch { /* sem registro, sem dívida na cena */ }

    /* 1. A PERGUNTA PENDENTE: a resposta completa a leitura (a estrutura), e não se cola ao texto */
    const pend = obj(c.pendente) && obj(c.pendente.pendente) ? c.pendente.pendente : obj(c.pendente);
    let o = null, fraseDoTurno = f, vezes = 0;
    if (pend && obj(pend.leitura)) {
      const ops = arr(obj(c.pendente) && c.pendente.opcoes);
      /* identidade · etapa 3: o número, o nome inteiro, o rótulo, ou uma palavra que só um rótulo tem */
      const op = aEscolhaDoQual(f, ops) || aOpcaoEscolhida(pend, ops, f);
      const v = op ? op.valor : null;
      if (v != null) {
        const l2 = completar(pend.leitura, pend.campo, v, cena, op && op.id);
        o = oVereditoDoOuvido(l2, cena, aFraseDaLeitura(l2));
        fraseDoTurno = aFraseDaLeitura(l2);
        vezes = (Number(pend.vezes) || 0) + 1;
      }
    }
    if (!o) o = oOuvidoNaTroca(f, cena);
    /* 23/11 (N17): «levo ela» depois de «que corda é essa que você vende?» — sem coisa na frase, o pronome retoma a da anterior */
    if (!pend && o && o.lido && !str(o.leitura && o.leitura.coisa)) {
      const f2 = aCoisaRetomada(f, cena, r0.anteriores);
      if (f2) { const o2 = oOuvidoNaTroca(f2, cena); if (o2 && o2.lido && o2.leitura.familia === "trocar" && str(o2.leitura.coisa)) o = o2; }
    }
    if (!o || !o.lido) return vazio;
    const l = o.leitura;
    const base = { lido: true, troca: l.familia === "trocar", frase: fraseDoTurno, leitura: l, resposta: o.resposta, veredito: null, intencao: null, adiado: false, recolher: null, pergunta: null, fato: null, cartao: null };
    const sai = (x) => Object.freeze({ ...base, ...x });

    /* a bancada da troca (L07): «peço à Tabitha o nome do homem de manto cinza» — o pedido sem coisa nenhuma
       que mude de mão (o nome, a ajuda, a informação) é conversa, e nenhuma porta de troca abre (antes, o
       pedido de graça do caminho de hoje inventava um item: «Tabitha lhe dá: Fita de couro»). A leitura do
       ouvido fica como está (o exame a mede); é a porta que não a trata como troca. */
    if (l.familia === "trocar" && l.subtipo === "pedir" && !str(l.coisa) && l.quantia == null && !l.companheiro && !l.pedidoDirigido && !pend) {
      return sai({ caminho: null, troca: false, leitura: Object.freeze({ ...l, familia: "falar", subtipo: null }) });
    }

    /* não é troca: o preço que o sistema sabe vai ao Narrador como fato (frase 43) */
    if (l.familia !== "trocar") {
      if (l.familia === "falar" && l.coisaTipo === "dele" && Number(l.preco) > 0) {
        return sai({ caminho: "falar", fato: tpl(R.fato.preco, { Coisa: maiuscula(l.coisa), Preco: Number(l.preco), Quem: semAposto(l.dono) || A_CENA_DO_OUVIDO.alguem }) });
      }
      return sai({ caminho: null, troca: false });
    }

    /* «fico com o troco»: sem pagamento que deixe troco, não há troco — nem pergunta de quem (frase 5) */
    if (l.troco) return sai({ caminho: "nao", veredito: negada("semTroco", R.tela.semTroco, R.fato.semTroco) });
    /* a mesma pergunta duas vezes seguidas: o Mestre desiste, e o turno segue (frases 14 a 16) */
    const pendTexto = pend ? str(pend.texto) : "";
    const desiste = () => sai({ caminho: "desiste", veredito: negada("desiste", R.tela.desiste, R.fato.desiste) });

    /* o nome próprio que a cena não tem, a quem se entrega: está fora (frase 40) */
    if (!l.quem && !l.companheiro && R.precisaDeQuem.includes(l.subtipo) && !l.quemPronomeSemDono) {
      const fora = oNomeDeFora(f, cena);
      if (fora) return sai({ caminho: "nao", veredito: negada("ausente", tpl(R.tela.ausente, { Nome: fora }), tpl(R.fato.ausente, { Nome: fora })) });
    }

    /* a bancada da troca (B45 B65 L15 X05): o ausente da ponte vem sem linha (ela contava com a ficha da cena,
       que não roda quando a troca já fechou) — e a frase ficava sem resposta nenhuma. A linha é a desta porta. */
    if (o.caminho === "nao" && o.negada && o.negada.motivo === "ausente" && !str(o.negada.linha)) {
      const quemFora = semAposto(str(l.quem || l.quemDito || arr(l.opcoesDeQuem)[0] || "")) || A_CENA_DO_OUVIDO.alguem;
      return sai({ caminho: "nao", veredito: Object.freeze({ ...o.negada, linha: tpl(R.tela.ausente, { Nome: quemFora }) }) });
    }
    if (o.caminho === "pergunta") {
      const pq = aPerguntaValida(o, cena, f, vezes);
      if (pq.nenhum) return sai({ caminho: "nao", veredito: negada("ninguem_aqui", tpl(A_CENA_DO_OUVIDO.tela.nao.ninguem_aqui, {}), tpl(A_CENA_DO_OUVIDO.fato.nao.ninguem_aqui, { gesto: oGesto(l) })) });
      if (pq.um) {
        /* um candidato só: não há pergunta — a leitura completa-se com ele */
        const l2 = completar(l, pq.campo, pq.um, cena, pq.umId);
        const o2 = oVereditoDoOuvido(l2, cena, f);
        if (o2.caminho === "pergunta") return desiste();
        return decidir(o2, sai, ctxT, cena, r0, R);
      }
      if (pendTexto && sem(pq.texto) === sem(pendTexto)) return desiste();
      return sai({ caminho: "pergunta", pergunta: Object.freeze({ texto: pq.texto, linha: pq.linha, opcoes: pq.opcoes, pendente: pq.pendente }) });
    }
    return decidir(o, sai, ctxT, cena, r0, R);
  } catch {
    return vazio;
  }
}

/* ============================================================
   O VEREDITO ANTES DO CLIQUE (23/11) — quem pôs o preço?
   A lei da casa: toda ação irreversível mostra o resultado antes de acontecer.
   Quando o jogador disse a quantia («pago cinco moedas ao altar», «passo dez
   moedas pra Thaddeus») ou entregou uma coisa nomeada a alguém, ele já viu o
   que sai da mão: aplica direto. Quando é o sistema que põe o preço (a compra
   da banca ou da casa, a venda, o serviço pago sem dizer quanto, o escambo com
   a casa), o resultado é o cartão de sempre (a-proposta-da-frase.js) com o
   preço e a bolsa, e a troca só acontece no clique (ctx.confirmado = chave).
   → null (direto) | { tipo, total, chave, leitura }
   ============================================================ */
function oCartao(l, t, ficha) {
  const s = l.subtipo;
  const disse = Number(l.quantia) > 0 && l.quantiaDe !== "coisa";
  const bolsa = Math.max(0, Number(obj(ficha) && ficha.moedas) || 0);
  const m = arr(t.mudou);
  const moeda = m.find((x) => x && x.coisa === "moedas");
  const coisa = m.find((x) => x && x.coisa !== "moedas");
  const total = moeda ? Math.max(0, Number(moeda.quantos) || 0) : 0;
  const cartao = (tipo, leitura, extra) => Object.freeze({ tipo, total, chave: [tipo, total, ...(extra || [])].join("|"), leitura: Object.freeze(leitura) });
  if (s === "comprar") {
    if (disse || !coisa) return null;
    const nome = maiuscula((t.comprado && t.comprado.nome) || coisa.coisa);
    const quantos = Math.max(1, Number(coisa.quantos) || 1);
    /* 23/11 (N05, B13): as outras coisas da mesma compra vão no mesmo cartão, cada uma com a quantia dela */
    const outras = m.filter((x) => x && x.coisa !== "moedas" && x !== coisa).map((x) => ({ nome: maiuscula(x.coisa), quantos: Math.max(1, Number(x.quantos) || 1) }));
    const itens = [{ nome, quantos }, ...outras];
    return cartao("compra", { compras: [{ fecha: true, total, bolsa, itens }] }, itens.flatMap((x) => [sem(x.nome), x.quantos]));
  }
  if (s === "pagar") {
    if (disse) return null;
    const nome = maiuscula(str(l.coisa));
    return cartao("pagar", { pagar: { total, bolsa, itens: nome ? [{ nome, quantos: 1 }] : [] } }, [sem(nome)]);
  }
  if (s === "vender" && coisa) {
    const quantos = Math.max(1, Number(coisa.quantos) || 1);
    /* 23/11 (Q11): a venda de mais de uma coisa diz todas no rótulo, e o valor é a soma */
    const vendidas = m.filter((x) => x && x.coisa !== "moedas");
    const rotulo = vendidas.length > 1 ? vendidas.map((x) => maiuscula(x.coisa)).join(A_CENA_DO_OUVIDO.juntaCoisas) : (quantos > 1 ? `${quantos} × ` : "") + maiuscula(coisa.coisa);
    return cartao("venda", { venda: { item: coisa.coisa, rotulo, valor: total, bolsa, quem: str(coisa.para) } }, [...vendidas.map((x) => sem(x.coisa)), quantos]);
  }
  if (s === "escambo" && m.length >= 2) {
    const da = maiuscula(m[0].coisa), por = maiuscula(m[1].coisa);
    return cartao("escambo", { escambo: { da, por, quem: str(m[0].para) } }, [sem(da), sem(por)]);
  }
  return null;
}

/* o veredito de uma leitura já sem pergunta: nao, dado, recolher, cartao, aplicado */
function decidir(o, sai, ctxT, cena, r0, R) {
  const l = o.leitura;
  if (o.caminho === "nao" && o.negada) return sai({ caminho: "nao", veredito: o.negada });
  if (o.caminho !== "aplicar") return sai({ caminho: "nao", veredito: negada("semCaminho", R.tela.semCaminho, tpl(R.fato.semCaminho, { gesto: oGesto(l) })) });
  const v = o.resposta.veredito;
  const s = l.subtipo;
  /* «fico com o troco»: sem pagamento que deixe troco, não há troco (frase 5) */
  if (l.troco) return sai({ caminho: "nao", veredito: negada("semTroco", R.tela.semTroco, R.fato.semTroco) });
  /* pegar sem dono: o que está solto no chão vai pelo caminho do botão; o que o sistema não tem, não há */
  if (s === "pegar" && !l.quem && !l.companheiro && l.quemEstado !== "morto") {
    const chao = arr(r0.chao).filter((x) => obj(x) && x.id && x.nome);
    const achado = l.coisaTipo === "solta" ? chao.find((x) => sem(x.nome) === sem(l.coisa) || sem(x.nome).startsWith(sem(l.coisa))) : null;
    if (achado) return sai({ caminho: "recolher", recolher: Object.freeze([achado.id]) });
    /* a bancada da troca (B64): «pego a corda da banca» — a coisa está à venda, e da banca só sai paga */
    if (l.coisaTipo === "dele" && l.dono) {
      const o2 = { Coisa: maiuscula(str(l.coisa)), Nome: semAposto(l.dono) };
      return sai({ caminho: "nao", veredito: negada("daBanca", tpl(R.tela.daBanca, o2), tpl(R.fato.daBanca, o2)) });
    }
    if (l.coisaTipo !== "solta") return sai({ caminho: "nao", veredito: negada("naoHa", tpl(R.tela.naoHa, { coisa: str(l.coisa) || "isso" }), tpl(R.fato.naoHa, { coisa: str(l.coisa) || "isso" })) });
  }
  /* 23/11 (N43): a moeda oferecida a quem é do grupo não vai ao dado — a bolsa do grupo é uma só */
  if (s === "subornar" && l.companheiro) {
    const Nome = semAposto(l.companheiro).split(/\s+/)[0];
    return sai({ caminho: "nao", veredito: negada("grupo", tpl(R.tela.subornoAoGrupo, { Nome }), tpl(R.fato.subornoAoGrupo, { Nome })) });
  }
  /* etapa 6 (identidade e posse): o que vem de quem deve ao herói é `devido` — com dívida aberta no
     registro, aplica sem dado; o subtipo que só existe pela dívida (cobrar), sem ela, a estrutura recusa */
  const cob = aCobrancaDaLeitura(l, { ...ctxT.troca, l });
  if (cob && cob.transacoes.length) {
    const nomes = { ...nomesDasTransacoes(null, cob.transacoes, l), [cob.transacoes[0].de]: semAposto(str(l.quem)) };
    const prova = aplicarAsTransacoes(ctxT.troca.posses, ctxT.ficha, cob.transacoes, ctxT.posse);
    if (!prova.ok) return sai({ caminho: "nao", veredito: oVereditoDaRecusa(prova, nomes, A_CENA_DO_OUVIDO.veto.nada) });
    return sai({ caminho: "aplicado", veredito: Object.freeze({ ...oVereditoDoQueVeio(prova, nomes, A_CENA_DO_OUVIDO.veto.feita, cob.devido > 0), transacoes: Object.freeze(cob.transacoes) }), transacoes: Object.freeze(cob.transacoes) });
  }
  /* o dado: o caminho de hoje rola o furto, o pedido de graça, o tomar, o suborno e o pegar de alguém */
  if (v === "dado") {
    const it = l.tomar ? Object.freeze({ tipo: "tomar", coisa: str(l.coisa) }) : o.intencao;
    if (it && R.dadoDeHoje.includes(it.tipo)) {
      const tsD = aTransacaoDoPedido(l, it, { ...ctxT.troca, l });
      return sai({ caminho: "dado", intencao: it, ...(tsD.length ? { transacoes: Object.freeze(tsD) } : {}) });
    }
    return sai({ caminho: "dado", adiado: true });
  }
  const t = aTrocaDoOuvido(o, ctxT);
  if (t && t.estado === "aplicada") {
    /* etapa 6: o que a ponte decidiu vira transações, provadas contra a posse ANTES do cartão e da ficha —
       se a estrutura recusa (quem entrega não tem, não há dívida), o jogador lê o motivo e nada muda */
    const ts = asTransacoesDoVeredito(t, { ...ctxT.troca, l });
    if (ts.length) {
      const prova = aplicarAsTransacoes(ctxT.troca.posses, ctxT.ficha, ts, { ...ctxT.posse, aceito: true });
      if (!prova.ok && prova.motivo !== "jaAplicada") return sai({ caminho: "nao", veredito: oVereditoDaRecusa(prova, nomesDasTransacoes(t, ts, l), A_CENA_DO_OUVIDO.veto.nada) });
    }
    const comT = ts.length ? { transacoes: Object.freeze(ts) } : {};
    /* o veredito antes do clique: o preço que o jogador não disse vira o cartão, e só o clique aplica */
    const k = oCartao(l, t, ctxT.ficha);
    if (k && k.chave !== ctxT.confirmado) return sai({ caminho: "cartao", cartao: k, ...comT });
    return sai({ caminho: "aplicado", veredito: ts.length ? Object.freeze({ ...t, transacoes: Object.freeze(ts) }) : t, ...comT });
  }
  if (t && t.estado === "negada") return sai({ caminho: "nao", veredito: t });
  /* sem caminho que aplique (nunca o silêncio, nunca item inventado): nada muda de mão */
  return sai({ caminho: "nao", veredito: negada("semCaminho", R.tela.semCaminho, tpl(R.fato.semCaminho, { gesto: oGesto(l) })) });
}
