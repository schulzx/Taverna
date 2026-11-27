/* ============================================================
   A IA LEITORA (25/11/2026) — uma pergunta só: «esta frase pede troca?»

   A decisão da pessoa, depois da medida (testes/medida-da-leitora/): «Pode
   ligar a IA». Um modelo pequeno, chamado à parte pela rota de sempre
   (/api/narrador, tarefa «leve»), respondeu «esta frase pede troca?» melhor
   que o ouvido de regras nas frases inéditas (57 de 59 contra 47 de 59), a
   ~US$ 0,014 por mil turnos, com 1,37 s de média e 2,15 s no p95. E foi PIOR
   em duas classes: a condicional («se eu pagar… você…?») e o tomar sem
   consentimento (pegar, enfiar na mochila).

   O desenho, e a lei de que nada entra pela IA:
   · ela responde UMA coisa, de uma lista fechada (A_LEITORA.respostas);
     qualquer outra coisa é «sem resposta». Não diz quem, nem o quê, nem
     quanto, e não escreve estado nenhum;
   · ela só DESEMPATA onde é melhor: o ouvido disse troca e ela diz que não
     → não é troca; o ouvido disse que não e ela diz troca → o ouvido RELÊ a
     frase como troca, pelo caminho que já tem (o-ouvido.js, opcoes.pedeTroca),
     e o que ele não souber extrair vira a pergunta que a porta única já faz;
   · onde o ouvido lê a condicional, o tomar ou a pergunta do preço que o
     sistema sabe, o ouvido manda e ela nem é chamada; e a frase em que o
     ouvido não vê posse nenhuma (nem troca, nem coisa, nem moeda, nem
     quantia) também não a chama — medido nas 367 frases da medida: poupa 47
     chamadas, perde uma troca (T44, que a bancada já acertava sem ela) e evita
     três erros dela (B127, L07, T-111);
   · atraso acima do teto, erro, recusa do portão ou resposta fora da lista →
     vale o ouvido sozinho, em silêncio. Nunca custa o turno.

   Módulo puro, determinístico, sem React: o App só chama a rota com o pedido
   daqui e entrega a resposta crua a aRespostaDaLeitora; a porta única
   (motor/uma-porta-so.js) aplica oDesempate.
   ============================================================ */
import { O_OUVIDO, VERBOS_DO_OUVIDO } from "./o-ouvido.js";
import { aCenaDoOuvido } from "./motor/a-cena-do-ouvido.js";

export const A_LEITORA = Object.freeze({
  /* a releitura que só tira do herói, numa pergunta, não se aplica direto (aRelidaSoPerde) */
  relida: Object.freeze({ caminhoDireto: "aplicado", heroi: "heroi" }),
  /* quanto o turno espera pela resposta (ms): acima disto vale o ouvido sozinho.
     Medido: média 1366, p95 2151, pior 3913 (428 chamadas) */
  tetoMs: 2500,
  /* o pedido, como foi medido (testes/medida-da-leitora/chamar.mjs, variante «minima») */
  pedido: Object.freeze({
    system: [
      "Você lê a frase que um jogador digitou num RPG de mesa e diz o que ela pede ao Mestre AGORA.",
      "Responda com UMA palavra desta lista, e nada mais:",
      "pede_troca — o herói quer que moeda ou coisa mude de mão agora: comprar, vender, pagar, dar, entregar, devolver, emprestar, pedir algo de graça ou fiado, cobrar uma dívida, subornar, trocar, roubar, furtar. Vale mesmo que a cena não permita ou que ele não tenha o bastante.",
      "fala — conversa, pergunta (inclusive de preço), elogio, comentário, lembrança, hipótese, recusa, ameaça ou piada, sem pedir que nada mude de mão agora.",
      "outra_acao — age no mundo sem trocar nada: anda, olha, usa, luta, espera.",
      "Sem explicação, sem pontuação: só a palavra.",
    ].join("\n"),
    usuario: "Cena: {cena}\nFrase do jogador: «{frase}»\nResposta:",
    maxTokens: 800,
    formato: "texto",
    tarefa: "leve",
  }),
  /* as respostas válidas: se pedem troca e, quando não, a família que a leitura toma */
  respostas: Object.freeze({
    pede_troca: Object.freeze({ troca: true, familia: "trocar" }),
    fala: Object.freeze({ troca: false, familia: "falar" }),
    outra_acao: Object.freeze({ troca: false, familia: "agir" }),
  }),
  /* o que se apara da resposta crua antes de conferir com a lista */
  apara: /^[\s"'«»`*.:-]+|[\s"'«»`*.:!-]+$/g,
  /* ONDE O OUVIDO MANDA (a medida: a IA errou mais que ele aqui). Classes da leitura, nunca palavras:
     a condicional; o gesto de tomar (o herói recebe sem que ninguém dê — a classe da forma da troca,
     O_OUVIDO.gestoDoLema); e a pergunta do preço que o sistema sabe (a coisa de alguém, com preço, lida
     como conversa — a porta única a responde com o preço) */
  ouvidoManda: Object.freeze({
    condicional: true,
    classesDoGesto: Object.freeze(["tomar"]),
    precoDoSistema: Object.freeze({ familia: "falar", coisaTipo: "dele" }),
  }),
  /* o resumo da cena que vai com a frase (só ficção do jogo: lugar, quem está, o que o herói tem, o que se vende) */
  cena: Object.freeze({
    lugar: "Lugar: {lugar}{tipo}.",
    tipo: " ({tipo})",
    presentes: "Presentes: {lista}.",
    ninguem: "ninguém",
    companheiro: "a companheira/o companheiro {nome}",
    ausentes: "Ausentes: {lista}.",
    mortos: "Mortos: {lista}.",
    heroi: "Herói: tem {moeda} moedas e carrega {carrega}.",
    nada: "nada",
    venda: "À venda: {lista}.",
    semVenda: "Ninguém vende nada aqui.",
    item: "{item} ({preco})",
    quemVende: "{nome} vende {itens}",
    coisas: "Coisas à vista: {lista}.",
    antes: "Antes, o jogador disse: «{frase}».",
    oficio: "{nome} ({oficio})",
    separador: ", ",
    separadorDeBanca: "; ",
  }),
  /* o tamanho máximo da frase e de cada lista no pedido (o pedido medido tinha ~415 tokens) */
  maxFrase: 400,
  maxLista: 12,
});

const str = (x) => (x == null ? "" : String(x));
const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const tpl = (t, o) => str(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? "" : String(o[k])));

/* os subtipos do gesto de tomar, tirados das tabelas do ouvido (o lema → o subtipo do verbo) */
const SUBTIPOS_DE_TOMAR = Object.freeze(
  Object.entries(O_OUVIDO.gestoDoLema)
    .filter(([, g]) => A_LEITORA.ouvidoManda.classesDoGesto.includes(g.classe))
    .map(([lema]) => (VERBOS_DO_OUVIDO[lema] || {}).sub)
    .filter(Boolean),
);

/* o resumo da cena em texto (o formato da medida) */
function aCenaEmTexto(cn, antes) {
  const C = A_LEITORA.cena, sep = C.separador, M = A_LEITORA.maxLista;
  const c = obj(cn) || {};
  const h = obj(c.heroi) || {};
  const partes = [tpl(C.lugar, { lugar: str(c.lugar) || "?", tipo: str(c.tipo) ? tpl(C.tipo, { tipo: c.tipo }) : "" })];
  const pessoas = arr(c.pessoas).slice(0, M).map((p) => (str(p && p.oficio) ? tpl(C.oficio, { nome: str(p.nome), oficio: str(p.oficio) }) : str(p && p.nome))).filter(Boolean);
  if (str(h.companheiro)) pessoas.push(tpl(C.companheiro, { nome: str(h.companheiro) }));
  partes.push(tpl(C.presentes, { lista: pessoas.length ? pessoas.join(sep) : C.ninguem }));
  if (arr(c.ausentes).length) partes.push(tpl(C.ausentes, { lista: arr(c.ausentes).slice(0, M).join(sep) }));
  if (arr(c.mortos).length) partes.push(tpl(C.mortos, { lista: arr(c.mortos).slice(0, M).join(sep) }));
  partes.push(tpl(C.heroi, { moeda: Number.isFinite(Number(h.moeda)) ? Number(h.moeda) : "?", carrega: arr(h.carrega).slice(0, M).join(sep) || C.nada }));
  const vendem = [...arr(c.pessoas), ...arr(c.bancas)]
    .filter((p) => arr(p && p.vende).length)
    .slice(0, M)
    .map((p) => tpl(C.quemVende, { nome: str(p.nome), itens: arr(p.vende).slice(0, M).map((v) => tpl(C.item, { item: str(v && v.item), preco: Number(v && v.preco) || 0 })).join(sep) }));
  partes.push(vendem.length ? tpl(C.venda, { lista: vendem.join(C.separadorDeBanca) }) : C.semVenda);
  if (arr(c.coisas).length) partes.push(tpl(C.coisas, { lista: arr(c.coisas).slice(0, M).join(sep) }));
  if (str(antes).trim()) partes.push(tpl(C.antes, { frase: str(antes).trim().slice(0, A_LEITORA.maxFrase) }));
  return partes.join(" ");
}

/* ============================================================
   oPedidoDaLeitora(frase, cena) → { system, messages, maxTokens, formato, tarefa } | null
   cena: a cena do ouvido (aCenaDoOuvido) ou o retrato de que ela sai (o do App, com
   `anteriores.jogador`, a frase anterior). Vai só a frase e a ficção da cena.
   ============================================================ */
export function oPedidoDaLeitora(frase, cena) {
  try {
    const f = str(frase).trim().slice(0, A_LEITORA.maxFrase);
    if (!f) return null;
    const x = obj(cena) || {};
    const cn = obj(x.heroi) ? x : aCenaDoOuvido(x);
    const antes = str(obj(x.anteriores) && x.anteriores.jogador);
    const P = A_LEITORA.pedido;
    return Object.freeze({
      system: P.system,
      messages: Object.freeze([Object.freeze({ role: "user", content: tpl(P.usuario, { cena: aCenaEmTexto(cn, antes), frase: f }) })]),
      maxTokens: P.maxTokens,
      formato: P.formato,
      tarefa: P.tarefa,
    });
  } catch {
    return null;
  }
}

/* aRespostaDaLeitora(bruto) → "pede_troca" | "fala" | "outra_acao" | null (fora da lista = sem resposta) */
export function aRespostaDaLeitora(bruto) {
  try {
    if (typeof bruto !== "string") return null;
    const s = bruto.trim().toLowerCase().replace(A_LEITORA.apara, "");
    return Object.prototype.hasOwnProperty.call(A_LEITORA.respostas, s) ? s : null;
  } catch {
    return null;
  }
}

/* ============================================================
   perguntarALeitora(chamar, pedido, opcoes?) → Promise<resposta | null>
   O recuo, provável em Node: `chamar(pedido)` é quem vai à rede (o App passa a
   chamada da rota) e devolve o texto cru. Atraso acima do teto, erro (o 402, o
   429, a rede), resposta fora da lista → null, e vale o ouvido sozinho. Nunca
   rejeita. opcoes.tetoMs: o teto (padrão, o da tabela).
   ============================================================ */
export function perguntarALeitora(chamar, pedido, opcoes) {
  return new Promise((ok) => {
    let feito = false;
    const fim = (r) => { if (!feito) { feito = true; ok(r); } };
    try {
      if (typeof chamar !== "function" || !obj(pedido)) return fim(null);
      const teto = Number(obj(opcoes) && opcoes.tetoMs) > 0 ? Number(opcoes.tetoMs) : A_LEITORA.tetoMs;
      const relogio = setTimeout(() => fim(null), teto);
      Promise.resolve()
        .then(() => chamar(pedido))
        .then((bruto) => { clearTimeout(relogio); fim(aRespostaDaLeitora(bruto)); }, () => { clearTimeout(relogio); fim(null); });
    } catch {
      fim(null);
    }
  });
}

/* a classe da leitura em que o ouvido manda, ou null */
function ondeOOuvidoManda(l) {
  const M = A_LEITORA.ouvidoManda;
  if (M.condicional && l.condicional) return "condicional";
  if (l.familia === "trocar" && (SUBTIPOS_DE_TOMAR.includes(l.subtipo) || l.tomar)) return "tomar";
  if (obj(l.forma) && M.classesDoGesto.includes(l.forma.gesto)) return "tomar";
  const P = M.precoDoSistema;
  if (l.familia === P.familia && l.coisaTipo === P.coisaTipo && Number(l.preco) > 0) return "preco";
  return null;
}

/* a leitura em que o ouvido não vê posse nenhuma: nem troca, nem coisa, nem moeda, nem quantia */
const semPosse = (l) => l.familia !== "trocar" && !l.coisaTipo && l.quantia == null;

/* ============================================================
   aLeitoraDecide(leituraDoOuvido) → bool
   A resposta dela pode mudar alguma coisa nesta frase? (Não: nem se chama.)
   ============================================================ */
export function aLeitoraDecide(leitura) {
  try {
    const l = obj(leitura);
    if (!l) return false;
    return !ondeOOuvidoManda(l) && !semPosse(l);
  } catch {
    return false;
  }
}

/* ============================================================
   oDesempate(leituraDoOuvido, respostaDaLeitora) → {
     acao   — "ouvido" (vale o ouvido: sem resposta, ou classe dele) ·
              "concorda" · "naoETroca" · "releComoTroca";
     troca  — a frase pede troca, depois do desempate;
     familia — a família da leitura quando ela deixa de ser troca;
     motivo — "semResposta" | "semPosse" | "condicional" | "tomar" | "preco" | null
   }
   ============================================================ */
export function oDesempate(leitura, resposta) {
  const sai = (acao, troca, familia, motivo) => Object.freeze({ acao, troca, familia: familia || null, motivo: motivo || null });
  try {
    const l = obj(leitura);
    const ouvTroca = !!(l && l.familia === "trocar");
    const r = aRespostaDaLeitora(resposta);
    if (!l) return sai("ouvido", false, null, "semResposta");
    if (!r) return sai("ouvido", ouvTroca, null, "semResposta");
    const manda = ondeOOuvidoManda(l);
    if (manda) return sai("ouvido", ouvTroca, null, manda);
    if (semPosse(l)) return sai("ouvido", ouvTroca, null, "semPosse");
    const R = A_LEITORA.respostas[r];
    if (R.troca === ouvTroca) return sai("concorda", ouvTroca);
    if (ouvTroca) return sai("naoETroca", false, R.familia);
    return sai("releComoTroca", true);
  } catch {
    return sai("ouvido", false, null, "semResposta");
  }
}

/* ============================================================
   A RELEITURA NÃO ENTREGA SOZINHA (26/11)
   A leitora diz «é troca» e o ouvido relê; mas a frase que PERGUNTA O PREÇO
   (a tabela do ouvido, O_OUVIDO.precoPergunta) espera algo de volta. Se o resultado da porta fosse aplicar direto (sem cartão,
   sem dado, sem pergunta ao jogador) transações em que o herói só perde — tudo
   sai dele e nada chega a ele —, a releitura não vale: fica a leitura do ouvido
   sozinho. Ganhar, abrir cartão, rolar dado ou perguntar continuam valendo.
   leitura = a relida; saida = o que a porta ia devolver; frase = a do turno → boolean
   ============================================================ */
export function aRelidaSoPerde(leitura, saida, frase) {
  const l = leitura && typeof leitura === "object" ? leitura : null;
  const x = saida && typeof saida === "object" ? saida : null;
  if (!l || !x || !l.pergunta || x.caminho !== A_LEITORA.relida.caminhoDireto) return false;
  const txt = String(frase == null ? "" : frase).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!O_OUVIDO.precoPergunta.some((w) => new RegExp("\\b" + w + "\\b").test(txt))) return false;
  const ts = Array.isArray(x.transacoes) ? x.transacoes.filter((t) => t && typeof t === "object") : [];
  if (!ts.length) return false;
  const h = A_LEITORA.relida.heroi;
  return ts.every((t) => t.de === h && !t.contra) && !ts.some((t) => t.para === h);
}
