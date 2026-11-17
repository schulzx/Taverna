/* ============================================================
   AS PEÇAS · O ENCAIXE (17/11/2026, Fase A da prova) — src/pecas/encaixe.js

   encaixar(frase, peca, estado, opcoes) → um de três (decisão da pessoa:
   nada de «A ou B?», nada de empurrar para a mais parecida):
     { tipo: "solucao", solucao, dado }      — a frase aciona UMA solução da
                                              peça, com o alvo na cena
     { tipo: "aquecimento", esquenta, nomeadas, pista, porque }
                                            — todo o resto: a conversa, o
                                              olhar, a ação plausível com o
                                              alvo fora da cena, a frase que
                                              caberia em duas (aquece as duas)
     { tipo: "livre", porque }              — as saídas universais, que não
                                              são da etapa e seguem o jogo de
                                              hoje: ir, descansar, comprar ou
                                              vender, abrir um painel, falar
                                              com o Mestre

   A LEITURA É A DA CASA: a agressão (ehDeclaracaoDeAtaque), a fuga
   (ehFuga), o descanso (descansoDaFrase) e o catálogo (lerAcao) leem a
   frase; este módulo só junta a leitura à peça. As palavras que o
   catálogo não tem (capturar, pagar, ir, abrir um painel) e as que apontam
   o calor estão em tabela aqui, com o porquê.

   A ORDEM, e porquê: a solução que se aciona JÁ (alvo na cena) ganha; se
   não há, a saída universal (quem diz «vou à toca e procuro rastos» quer
   primeiro ir — a busca é na chegada); senão, aquecimento.

   PURO E DETERMINÍSTICO. O `null` e o lixo dão null.
   ============================================================ */
import { lerAcao, NAO_E_IMPROVISO } from "../desafios.js";
import { ehDeclaracaoDeAtaque } from "../agressao.js";
import { ehFuga } from "../fuga.js";
import { descansoDaFrase } from "../descanso.js";
import { quemNaFrase } from "../em-cena.js";
import { FAMILIA_DA_ACAO } from "./moldes.js";
import { memoriaDe, bonusDoCalor } from "./calor.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");

/* ---------------- AS SAÍDAS UNIVERSAIS ----------------
   Lidas sobre a frase sem acento. `aoMestre` é a do catálogo
   (NAO_E_IMPROVISO); o descanso é o da casa (descansoDaFrase); as outras
   são verbos de movimento, de balcão e de painel — o catálogo de desafios
   não os tem porque não são obstáculo. */
const aoMestre = (NAO_E_IMPROVISO.find((x) => x.id === "aoMestre") || { rx: /\b(mestre|narrador)\b/ }).rx;
export const SAIDAS_LIVRES = Object.freeze({
  mestre: Object.freeze({ rx: aoMestre, porque: "falar com o Mestre é fora da cena" }),
  painel: Object.freeze({ rx: /\b(abro|abrir|consulto|consultar|vejo|ver|olho)\s+(o |a |meu |minha |no |na )?(mapa|inventario|diario|ficha|mochila|equipamento|grimorio)\b/, porque: "abrir um painel não é gesto na cena" }),
  /* «pago a sopa», «pago os três cobres»: a conta é do balcão. O suborno
     («pago a X para…») é lido antes, como verbo da peça */
  comercio: Object.freeze({ rx: /\b(compro|comprar|vendo|vender|quanto custa|quanto e\b|quanto sai|pechincho|regateio|encomendo|pago)\b/, porque: "o balcão tem a sua porta (a bolsa da frase)" }),
  espera: Object.freeze({ rx: /\b(espero|esperamos|aguardo|aguardamos)\b/, porque: "esperar é o tempo do mundo (a espera da frase)" }),
  ir: Object.freeze({
    rx: /\b(vou|volto|voltamos|vamos|sigo|seguimos|corro|parto|partimos|regresso|caminho|ando|dirijo-me|me dirijo|rumo|retorno|subo|desco|atravesso)\s+(direto\s+|logo\s+|depressa\s+|de volta\s+)?(ate|para|pra|ao|aos|a|as|rumo|em direcao)\s(?!(ver|falar|perguntar|procurar|buscar|tentar|conversar|dar|fazer|investigar|examinar)\b)|\b(entro|entramos|saio|saimos)\s+(no|na|nos|nas|em|do|da|para|pela|pelo)\b|\b(sigo|seguimos|parto|partimos)\s+(viagem|caminho|estrada|pela estrada)\b|\b(avanco|avancamos|sigo|seguimos|parto|partimos|saio|saimos|desco|descemos|subo|subimos|caminho|caminhamos|corro|corremos|volto|voltamos|vamos|regresso|tomamos|tomo)\b(?!\s+(ver|falar|perguntar|procurar|buscar|tentar|conversar|dar|fazer|investigar|examinar|pensar|as pegadas|o rastro|o rasto|as marcas)\b)[^.!?"“”«»]{0,50}?\b(ate|para|pra|pela estrada|pelo caminho|pela rua|pela ladeira|pelo tunel|pelo portao|pela porta|em direcao|rumo|adiante|de volta|atras dele|atras dela)\b/,
    porque: "ir é a porta do passo e da estrada (a proposta da frase)",
  }),
});

/* As palavras do «capturar» e do «pagar», que o catálogo não tem: são
   verbos da peça (ACOES_SEM_CATALOGO), não desafios. */
export const VERBOS_DA_PECA = Object.freeze({
  capturar: /\b(capturo|capturar|amarro|amarrar|laco|lacar|lanco o laco|imobilizo|imobilizar|prendo-[ao]|prende-l[ao]|atiro a rede|jogo a rede|ponho-lhe a coleira)\b/,
  /* pagar A ALGUÉM PARA algo — não «deixo uma moeda pela cerveja», que é
     a conta, e é do balcão (o corpus da mesa tem seis destas) */
  pagar: /\b(suborno|subornar|ofereco\s+(\S+\s+){0,2}(moedas?|prata|ouro|dinheiro|pagamento|recompensa)|pago\s+(a|ao|aos|as)\s+[^.,;!?]{1,40}?\s+(para|pra|umas?|algumas|\d+|moedas?)\b|dou-lhe\s+(\S+\s+){0,2}moedas?\s+(para|pra|se)\b|ponho\s+(\S+\s+){0,2}moedas?\s+na mao)/,
});

/* ---------------- PARA ONDE A FRASE APONTA (o calor) ----------------
   A frase que não aciona nada aquece as soluções da família para onde as
   palavras dela apontam. Lidas sobre a frase sem acento; uma frase pode
   apontar para várias famílias. A régua é a do estudo do lado de cá (a
   INTENCAO_PELA_PALAVRA do teste do corpus), com as palavras da conversa
   à frente — a conversa é a família que mais aparece nas mesas reais. */
export const PALAVRAS_DO_CALOR = Object.freeze({
  social: /\b(pergunt\w*|convers\w*|digo|falo|peco|conto|explico|insisto|chamo|cumprimento|apresento-me|me apresento|pedido|ajuda|por favor|senhor|senhora|amigo)\b|["“”«»?]/,
  ameaca: /\b(amea\w*|intimid\w*|assust\w*|ou eu|ou entao|encosto a lamina|seguro-[oa] pelo)\b/,
  engano: /\b(minto|mentir|blef\w*|finj\w*|fingir|disfar\w*|engan\w*|me faco passar|faco-me passar)\b/,
  troca: /\b(moedas?|prata|ouro|recompensa|pagamento|troco|em troca)\b/,
  furtiva: /\b(escond\w*|esgueir\w*|sorrateir\w*|nas sombras|sem ser vist[oa]|em silencio|devagar|de mansinho|sigo-[oa]|vigio)\b/,
  caminho: /\b(rast\w*|pegadas?|trilh\w*|marcas?|sangue|caminho|por onde)\b/,
  saber: /\b(lembro|recordo|sei (algo|alguma|o que)|o que sei|conheco|ja ouvi|ouvi falar|historias?|lendas?|reconheco)\b/,
  olhar: /\b(olho|observo|reparo|examino|vejo|procuro|inspeciono|analiso|estudo|escuto|ouco|cheiro|toco|apalpo|vasculho)\b/,
  luta: /\b(armas?|espada|lamina|machado|arco|flecha|lanca|adaga|escudo|preparo-me|em guarda|desembainho|ataque)\b/,
  corpo: /\b(corda|laco|rede|escal\w*|muro|janela|telhado|porta|forc\w*)\b/,
  cuidado: /\b(acalm\w*|assobi\w*|bicho|besta|fera|animal|comida|carne|isca)\b/,
  arte: /\b(canto|cancao|musica|danco|recito|toco o|toco a|historia engracada|piada)\b/,
});
/* a família que o improviso diz pelo atributo */
const FAMILIA_DO_IMPROVISO = Object.freeze({ presenca: "social", percepcao: "olhar", intelecto: "saber", forca: "corpo", destreza: "corpo", vigor: "corpo" });

/* ---------------- A LEITURA ----------------
   aLeitura(frase, cena, estado) → { acao, familia, v } — a ação que a frase
   declara (ou null) e a família dela. */
export function aLeitura(frase, cena, estado) {
  const E = obj(estado) || {};
  const nomes = arr(cena && cena.quem).map((q) => q.nome);
  let atk = false;
  try { atk = ehDeclaracaoDeAtaque(frase, { nomes }); } catch { atk = false; }
  if (atk) return { acao: "lutar", familia: "luta", v: null };
  const t = sem(frase);
  if (VERBOS_DA_PECA.capturar.test(t)) return { acao: "capturar", familia: FAMILIA_DA_ACAO.capturar, v: null };
  let fuga = false;
  try { fuga = ehFuga(frase); } catch { fuga = false; }
  if (fuga) return { acao: "fugir", familia: "fuga", v: null };
  if (VERBOS_DA_PECA.pagar.test(t)) return { acao: "pagar", familia: "troca", v: null };
  let v = null;
  try {
    v = lerAcao(frase, { personagem: obj(E.personagem) || {}, semente: String((obj(E.mundo) && E.mundo.semente) || E.semente || ""), lugar: (cena && cena.onde && cena.onde.nome) || "", tentativas: {}, dia: Number(E.dia) || 0 });
  } catch { v = null; }
  if (v && v.tipo === "teste") {
    if (v.id === "improviso") {
      const p = String(v.chave || "").split("|");
      const fam = FAMILIA_DO_IMPROVISO[p[p.indexOf("improviso") + 1]] || FAMILIA_DO_IMPROVISO[v.atributo] || "";
      return { acao: null, familia: fam, v };
    }
    return { acao: v.id, familia: FAMILIA_DA_ACAO[v.id] || "", v };
  }
  return { acao: null, familia: "", v };
}

/* a saída universal da frase, ou null */
export function aSaidaLivre(frase, estado) {
  const t = sem(frase);
  if (!t) return null;
  if (String(frase).trimStart().startsWith("(")) return { porque: SAIDAS_LIVRES.mestre.porque, qual: "mestre" };
  for (const k of ["mestre", "painel"]) if (SAIDAS_LIVRES[k].rx.test(t)) return { porque: SAIDAS_LIVRES[k].porque, qual: k };
  let d = null;
  try { d = descansoDaFrase(frase, { emCombate: !!(obj(estado) && estado.emCombate) }); } catch { d = null; }
  if (d) return { porque: "descansar é a porta do descanso", qual: "descanso" };
  for (const k of ["comercio", "espera", "ir"]) if (SAIDAS_LIVRES[k].rx.test(t)) return { porque: SAIDAS_LIVRES[k].porque, qual: k };
  return null;
}

/* quem e o que a frase nomeia, entre a cena, os alvos da peça e os nomes
   conhecidos de fora (`fora`: gente que existe e não está aqui) */
function nomeadosNaFrase(frase, peca, fora) {
  const lista = [];
  const por = (tipo, nome, chave) => { if (nome && !lista.some((x) => x.id === chave)) lista.push({ id: chave, nome, tipo, papel: "" }); };
  for (const q of arr(peca.cena.quem)) por("pessoa", q.nome, "q:" + sem(q.nome));
  for (const s of peca.solucoes) if (s.alvo && s.alvo.nome && (s.alvo.tipo === "pessoa" || s.alvo.tipo === "lugar")) por(s.alvo.tipo, s.alvo.nome, (s.alvo.tipo === "pessoa" ? "q:" : "l:") + sem(s.alvo.nome));
  for (const n of arr(fora)) por("pessoa", n, "q:" + sem(n));
  let achados = [];
  try { achados = quemNaFrase(frase, lista); } catch { achados = []; }
  const ids = new Set(arr(achados).map((a) => a && a.id).filter(Boolean));
  /* a primeira palavra do nome, com quatro letras ou mais, também nomeia
     («falo com Torvald») — quemNaFrase já o faz para pessoas; para os
     sítios, o nome sem artigo dentro da frase */
  const t = sem(frase);
  for (const x of lista) if (x.tipo === "lugar" && semArtigo(x.nome).length >= 4 && t.includes(semArtigo(x.nome))) ids.add(x.id);
  return ids;
}
const chaveDoAlvo = (s) => (s.alvo.tipo === "pessoa" ? "q:" : "l:") + sem(s.alvo.nome);

/* ---------------- O ENCAIXE ---------------- */
export function encaixar(frase, peca, estado, opcoes) {
  try {
    const f = String(frase == null ? "" : frase);
    if (!f.trim() || !obj(peca) || !Array.isArray(peca.solucoes)) return null;
    const E = obj(estado) || {};
    const o = obj(opcoes) || {};
    const mem = memoriaDe(E, peca);
    const queimadas = new Set(arr(mem.queimadas));
    const naCena = new Set(peca.cena.quem.map((q) => "q:" + sem(q.nome)));
    const foraDaCena = [...arr(o.conhecidos), ...Object.values(obj(E.npcs) || {}).map((n) => obj(n) && n.nome).filter(Boolean)].filter((n) => !naCena.has("q:" + sem(n)));
    const nomeados = nomeadosNaFrase(f, peca, foraDaCena);
    const nomeiaFora = [...nomeados].some((id) => id.startsWith("q:") && !naCena.has(id) && !peca.solucoes.some((s) => chaveDoAlvo(s) === id));
    const leitura = aLeitura(f, peca.cena, E);
    /* quem a frase DESCREVE («o tratador», «o guarda») e ninguém da cena
       veste — nem pelo nome, nem pelo papel: o alvo está fora (a mesma
       regra do catálogo, alvoDescrito, que o 12/10 ensinou) */
    const descrito = leitura.v && leitura.v.tipo === "teste" && !leitura.v.pessoa ? sem(leitura.v.quem) : "";
    const veste = (q) => { const w = descrito.replace(/^(o|a|os|as|um|uma)\s+/, "").split(" ")[0]; return w.length >= 4 && (sem(q.nome).includes(w) || sem(q.papel).includes(w)); };
    const descritoFora = !!descrito && !nomeados.size && !peca.cena.quem.some(veste);
    const pistaDe = (id) => (peca.pistas.find((p) => p.solucao === id) || {}).diz || "";

    /* 1. a solução que a frase aciona */
    /* A FAMÍLIA, QUANDO A AÇÃO EXATA NÃO ESTÁ: «convencer» e «fazer falar»
       são a mesma conversa com outra força, e «vasculhar» e «investigar» o
       mesmo olhar — o catálogo distingue-os pela palavra, a peça pela
       família. A ação exata ganha; só sem ela a família conta, e com a
       mesma régua de alvo (um alvo só, na cena). A luta, a fuga e a troca
       não têm família larga: são elas mesmas. */
    const familiaLarga = leitura.familia && !["luta", "fuga", "troca"].includes(leitura.familia);
    if (leitura.acao || familiaLarga) {
      const exatas = leitura.acao ? peca.solucoes.filter((s) => s.acao === leitura.acao) : [];
      const daFamilia = familiaLarga ? peca.solucoes.filter((s) => s.familia === leitura.familia) : [];
      const vivaDe = (lista) => lista.filter((s) => !queimadas.has(s.id) && s.aVista);
      const mesmas = exatas.length && vivaDe(exatas).length ? exatas : daFamilia.length ? daFamilia : exatas;
      const alvoOk = (s) => {
        const k = chaveDoAlvo(s);
        const nomeiaAlguem = [...nomeados].some((id) => id.startsWith(k.slice(0, 2)));
        if (nomeados.has(k)) return true;
        if (s.pede === "rumo") return !nomeiaAlguem || s.alvo.tipo !== "lugar";
        return !nomeiaAlguem && !nomeiaFora;
      };
      const vivas0 = mesmas.filter((s) => !queimadas.has(s.id) && s.aVista && alvoOk(s));
      /* o nome vence: havendo soluções do alvo que a frase nomeia, só elas
         (convencer a pastora não é convencer «alguém» a deixar passar) */
      const comNome = vivas0.filter((s) => nomeados.has(chaveDoAlvo(s)));
      const vivas = comNome.length ? comNome : descritoFora ? [] : vivas0;
      /* a mesma ação, uma vez por alvo: duas soluções do mesmo alvo e da
         mesma ação (raro: o molde não as repete) contam como uma */
      const porAlvo = [...new Map(vivas.map((s) => [chaveDoAlvo(s), s])).values()];
      if (porAlvo.length === 1) {
        const s = porAlvo[0];
        return {
          tipo: "solucao", solucao: s.id,
          dado: {
            acao: s.acao, pericia: s.pericia, luta: s.luta, semDado: s.semDado,
            dc: s.dc == null ? null : s.dc + mem.pior,
            bonus: bonusDoCalor(mem, s.id) + (mem.abertas[s.id] || 0),
            dcDoCatalogo: leitura.v && leitura.v.dc != null ? leitura.v.dc : null,
          },
          pista: pistaDe(s.id),
        };
      }
      if (porAlvo.length > 1) {
        return { tipo: "aquecimento", esquenta: porAlvo.map((s) => s.id), nomeadas: porAlvo.filter((s) => nomeados.has(chaveDoAlvo(s))).map((s) => s.id), pista: pistaDe(porAlvo[0].id), porque: "duas" };
      }
      /* o que já falhou e queimou aponta para onde a seta dele foi */
      const queimada = mesmas.find((s) => queimadas.has(s.id) && s.falha && s.falha.para && !queimadas.has(s.falha.para));
      if (queimada) return { tipo: "aquecimento", esquenta: [queimada.falha.para], nomeadas: [], pista: pistaDe(queimada.falha.para), porque: "queimada" };
    }

    /* 2. a saída universal */
    const livre = aSaidaLivre(f, E);
    if (livre) return { tipo: "livre", porque: livre.porque, qual: livre.qual };

    /* 3. o aquecimento: para onde a frase aponta */
    const t = sem(f);
    const familias = new Set();
    if (leitura.familia) familias.add(leitura.familia);
    for (const [fam, rx] of Object.entries(PALAVRAS_DO_CALOR)) if (rx.test(t)) familias.add(fam);
    const mesmaAcao = leitura.acao ? peca.solucoes.filter((s) => s.acao === leitura.acao) : [];
    const doAlvo = peca.solucoes.filter((s) => nomeados.has(chaveDoAlvo(s)));
    let esquenta;
    let porque;
    if (mesmaAcao.length) { esquenta = mesmaAcao; porque = "alvoFora"; }
    else if (nomeiaFora && !doAlvo.length) { esquenta = []; porque = "nomeiaQuemNaoEsta"; }
    else {
      const base = doAlvo.length ? doAlvo : peca.solucoes.filter((s) => s.aVista);
      esquenta = base.filter((s) => familias.has(s.familia));
      /* falar com quem a frase nomeia aquece as vias da conversa dele,
         mesmo sem palavra de conversa */
      if (!esquenta.length && doAlvo.length) esquenta = doAlvo.filter((s) => ["social", "cuidado", "olhar"].includes(s.familia));
      porque = esquenta.length ? (doAlvo.length ? "nomeia" : "palavras") : familias.size ? "familiaSemSolucao" : "nadaAponta";
    }
    esquenta = esquenta.filter((s) => !s.semDado && !queimadas.has(s.id));
    const ids = esquenta.map((s) => s.id);
    /* a pista: a da solução mais quente das aquecidas; sem nenhuma, a da
       mais quente da peça (o jogador nunca fica sem um caminho à vista) */
    const quente = (id) => mem.calor[id] || 0;
    const ordem = (lista) => [...lista].sort((a, b) => quente(b) - quente(a) || peca.solucoes.findIndex((s) => s.id === a) - peca.solucoes.findIndex((s) => s.id === b));
    const daPista = ordem(ids)[0] || ordem(peca.solucoes.filter((s) => s.aVista && !s.semDado).map((s) => s.id))[0] || (peca.solucoes[0] && peca.solucoes[0].id);
    return { tipo: "aquecimento", esquenta: ids, nomeadas: esquenta.filter((s) => nomeados.has(chaveDoAlvo(s))).map((s) => s.id), pista: pistaDe(daPista), porque };
  } catch {
    return null;
  }
}
