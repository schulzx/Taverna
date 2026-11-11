/* ============================================================
   O MESTRE CHAMA O DADO (Fase MC, MC2 · 10/11/2026)

   A 18.ª sessão: a luta já era jogo; os dados fora dela eram ritual. A
   frase do jogador virava teste, o dado rolava sozinho, e o resultado
   chegava dentro da narração — o jogador nunca via o momento em que podia
   perder. Numa mesa, entre a frase e o dado há uma linha: «Sobrevivência.
   Precisa de 14. Se a chuva apagou o rasto, perdes meia hora.» É essa
   linha que faz o dado pesar.

   ESTE MÓDULO É ESSA LINHA, E SÓ ELA. Não lê a frase (isso é `lerAcao`,
   desafios.js), não rola (isso é a bandeja, depois do toque) e não narra.
   Recebe o veredito que o catálogo já deu e decide duas coisas:

   1. SE o Mestre chama. A régua contra o dado-ritual (QUANDO_O_MESTRE_CHAMA,
      §2.3 da planta): não chama onde não há obstáculo, onde o bónus já
      decidiu, onde o mundo respondeu NÃO antes do dado, na luta (que tem o
      seu d20 e a sua previsão) nem na conversa (que não se rola).
   2. O QUE a linha diz: a perícia (o nome da ficha), o número a bater, e o
      preço de falhar — a linha de CUSTO_DE_FALHAR do alvo, com o `aviso` e
      a etiqueta `efeito` que a suíte prova serem o que a falha cobra.

   A CD é a do veredito, número por número: o chamado não a mexe, e por isso
   a linha nunca mente sobre o dado que vem. A busca com e sem achado tem a
   mesma CD (desafios.js, §2.6) — o número não denuncia o segredo.

   Puro, sem React, sem relógio, sem sorte: o mesmo veredito e o mesmo
   contexto dão sempre o mesmo chamado. Quem o liga é o App (MC3), entre a
   frase e a chamada do Narrador.
   ============================================================ */

import { custoPorAlvo, dificuldadePorId, mordidaDoDegrau, EFEITOS_DA_FALHA } from "../desafios.js";
import { periciaPorId, resolucaoAutomatica } from "../pericias.js";
import { nomeDoAtributo } from "../testes.js";

/* ---------------- A LINHA ----------------
   `molde`: o que o Mestre diz, nesta ordem e só isto. `{porque}` é a
   situação que pesou na CD (SITUACAO_DA_CD: «com a chuva», «no escuro»),
   e só aparece quando pesou.
   `esperaSozinho`: com a preferência «o Mestre rola por mim», o tempo de
   ler a linha antes de o dado se lançar sozinho (ms).
   `tetoDoAviso`: o comprimento máximo da frase do preço — uma linha, numa
   tela de 375 px.
   `ordemDoAviso`: que variante do aviso vence quando o contexto liga mais
   de uma (a chuva diz mais do que a noite, a noite mais do que a cidade). */
export const O_CHAMADO = Object.freeze({
  molde: "{pericia}. Precisa de {dc}{porque}. {aviso}",
  glifo: "dado",
  dado: "d20",
  rolar: "Rolar",
  recuo: "mudar de ideia",
  esperaSozinho: 2600,
  tetoDoAviso: 60,
  ordemDoAviso: Object.freeze(["chuva", "noite", "cidade"]),
  /* a queda: 1d6 por cada dado de queda (desafios.js, quedaDe) */
  facesDaQueda: 6,
});

/* ---------------- SABER COMUM NÃO SE ROLA (Fase EM, EM3 · 10/11/2026) ----------------
   O estudo do Mestre (mente/estudo-do-mestre.md, L4) contou: a «o que sei
   de…» uma mesa a sério responde SEM dado em 78% das vezes, e às perguntas
   de facto sobre a cena em ~90%. Rola-se o raro — o bicho que ninguém viu,
   o segredo do passo, a terra estrangeira. A MC1 mandava toda pergunta de
   saber a Saberes, e o herói nascido em Alto Negro rolava para saber o que
   é Alto Negro.

   A régua: o que a ficha do herói já sabe sai como FACTO, sem dado.
   `fontes`, pela ordem em que se pergunta (a primeira que casa diz de onde
   veio o saber), e o campo de `ctx.saber` que cada uma lê:
     · aqui   — o lugar onde o herói está (o registo do lugar: quem lá está
                sabe o que é a cidade, quem manda, onde fica a forja);
     · terra  — a terra de onde vem;
     · oficio — o antecedente: o ofício ensina o vocabulário dele
                (SABER_DO_OFICIO, mais abaixo);
     · livro  — o que o livro de factos já tem (as pessoas conhecidas, o
                que se descobriu);
     · visto  — os sítios por onde já passou.
   `raro`: o que nunca é comum, ainda que o nome bata — «o segredo de Alto
   Negro» rola mesmo para quem lá nasceu. `aquiSemNome`: «o que sei desta
   cidade?» — o sítio dito pelo nome comum é o sítio onde se está.
   `alvo`: os números do estudo, para a suíte conferir a régua contra um
   saco de perguntas típicas (não é sorte: é a conferência). */
export const SABER_COMUM = Object.freeze({
  desafios: Object.freeze(["lembrar"]),
  fontes: Object.freeze([
    Object.freeze({ id: "aqui", campo: "lugar", diz: "é o sítio onde estou" }),
    Object.freeze({ id: "terra", campo: "terra", diz: "é da minha terra" }),
    Object.freeze({ id: "oficio", campo: "antecedente", diz: "é do meu ofício" }),
    Object.freeze({ id: "livro", campo: "factos", diz: "já o sei (o livro de factos tem-no)" }),
    Object.freeze({ id: "visto", campo: "visitados", diz: "já lá estive" }),
  ]),
  raro: /\b(segredo|segredos|escondid\w*|oculto|oculta|verdade sobre|maldi[cç][aã]o|fraqueza|ponto fraco|quem (matou|mandou|traiu)|desaparecid\w*|lenda antiga|profecia)\b/,
  aquiSemNome: /^(?:(?:a|o|esta|este|essa|esse|aqui|daqui)\s+)?(cidade|vila|aldeia|lugar|sitio|terra|regiao|bairro|povoado|porto|vale)$/,
  palavraMinima: 4,
  alvo: Object.freeze({ saberSemDado: 0.78, factoSemDado: 0.9, tolerancia: 0.1 }),
});

/* O ofício ensina o vocabulário dele: quem cresceu na forja sabe o que é
   aço de Alto Negro; o soldado sabe o que é a guarnição; o náufrago sabe o
   porto. Uma linha por antecedente (antecedentes.js); o antecedente sem
   aprendizado (o órfão, a praga) fica com a rua e a doença que viveu. As
   palavras casam inteiras no assunto da pergunta, sem acento. */
export const SABER_DO_OFICIO = Object.freeze({
  orfao: Object.freeze(["estrada", "estradas", "rua", "ruas", "mendigo", "mendigos", "beco", "becos", "albergue"]),
  soldado: Object.freeze(["guerra", "regimento", "caserna", "quartel", "exercito", "batalha", "guarnicao", "patrulha", "milicia", "armas", "sargento", "capitao"]),
  nobre_caido: Object.freeze(["nobre", "nobres", "nobreza", "corte", "brasao", "brasoes", "lorde", "dama", "familia", "casa", "heraldica", "senhor"]),
  erudito: Object.freeze(["historia", "arquivo", "arquivos", "biblioteca", "livro", "livros", "lingua", "linguas", "escrita", "reino", "reinos", "cronica"]),
  ladrao: Object.freeze(["guilda", "ladrao", "ladroes", "contrabando", "receptador", "mercado negro", "beco", "becos", "vigia", "fechadura"]),
  acolito: Object.freeze(["templo", "templos", "deus", "deuses", "deusa", "santo", "santos", "santuario", "sacerdote", "igreja", "reza", "fe"]),
  pragado: Object.freeze(["praga", "pragas", "doenca", "febre", "peste", "contagio"]),
  artista: Object.freeze(["cancao", "cancoes", "musica", "teatro", "balada", "baladas", "trupe", "feira", "festa", "palco"]),
  cacador: Object.freeze(["recompensa", "recompensas", "procurado", "procurados", "cartaz", "cartazes", "fera", "feras", "lobo", "lobos", "urso", "ursos", "caca"]),
  ferreiro: Object.freeze(["forja", "forjas", "ferro", "aco", "metal", "metais", "espada", "espadas", "ferraria", "bigorna", "minerio", "armadura", "armaduras"]),
  ex_cultista: Object.freeze(["culto", "cultos", "seita", "seitas", "sacrificio", "iniciado", "iniciados"]),
  naufrago: Object.freeze(["mar", "barco", "barcos", "navio", "navios", "porto", "cais", "mare", "mares", "tempestade", "marinheiro", "marinheiros", "pesca"]),
});

const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
const ARTIGO = /^(?:o|a|os|as|um|uma|de|do|da|dos|das|em|no|na)\s+/;
const contemInteiro = (frase, termo) => !!termo && new RegExp(`(?:^|\\s)${termo.replace(/[-]/g, "\\-")}(?:\\s|$)`).test(frase);

/* O saber que o herói já tem sobre o assunto deste veredito, ou null (o
   dado decide). `ctx.saber`: { lugar, terra, antecedente, factos: [nomes],
   visitados: [nomes] } — tudo opcional; sem nada, nada é comum e o
   comportamento é o de antes. Devolve { fonte, diz, sobre }. */
export function saberComumDe(v, ctx) {
  if (!v || typeof v !== "object" || v.tipo !== "teste" || !SABER_COMUM.desafios.includes(v.id)) return null;
  const sobre = semAcento(v.sobre);
  if (!sobre || SABER_COMUM.raro.test(sobre)) return null;
  const s = ctx && typeof ctx === "object" && ctx.saber && typeof ctx.saber === "object" ? ctx.saber : null;
  if (!s) return null;
  const lista = (x) => (Array.isArray(x) ? x : x == null ? [] : [x]).map((n) => semAcento(n).replace(ARTIGO, "")).filter((n) => n.length >= SABER_COMUM.palavraMinima);
  for (const f of SABER_COMUM.fontes) {
    const valor = s[f.campo];
    if (valor == null) continue;
    if (f.id === "aqui" && SABER_COMUM.aquiSemNome.test(sobre)) return { fonte: f.id, diz: f.diz, sobre: String(v.sobre) };
    const termos = f.id === "oficio" ? [...(SABER_DO_OFICIO[String(valor)] || [])] : lista(valor);
    if (termos.some((n) => contemInteiro(sobre, n))) return { fonte: f.id, diz: f.diz, sobre: String(v.sobre) };
  }
  return null;
}

/* O envelope ao Narrador quando o saber é comum: sai o facto, e não houve
   dado. O facto vem da ficha (o lugar na base, a pessoa no livro) pelo
   mesmo caminho do sucesso do `lembrar`; isto diz só que é sabido, e de
   onde — para o Narrador não encenar esforço onde não houve. */
export function envelopeDoSaberComum(v, sc) {
  if (!sc || !v) return "";
  return `[SEM DADO — O HERÓI JÁ SABE] Perguntei o que sei de ${sc.sobre || "isto"}, e não houve teste: ${sc.diz}.
REGRA DESTE ENVELOPE (obrigatória): responda com o que qualquer um na minha pele saberia — um ou dois factos verdadeiros, ditos como coisa sabida, em até duas frases. NÃO encene esforço de memória nem dúvida, NÃO revele segredo nem o que está escondido (isso continua a pedir dado), e devolva a palavra para mim.`;
}

/* ---------------- QUANDO O MESTRE NÃO CHAMA ----------------
   A régua de §2.3. A primeira linha que cala decide, e diz porquê e o que
   acontece em vez do chamado. Todas devolvem o turno ao caminho de hoje —
   nenhuma inventa um caminho novo.
   `ctx.emCombate`: a mesa está em luta.
   `ctx.bonus`: o bónus total do herói na perícia (bonusDePericia), se o
     App o souber; sem ele, a régua do automático não cala.
   `ctx.mundoDisseNao`: o oráculo respondeu NÃO à pergunta do teste
     (`v.oportunidade`) — perguntado ANTES do chamado.
   `ctx.saber`: o que a ficha do herói sabe (SABER_COMUM, EM3). */
export const QUANDO_O_MESTRE_CHAMA = Object.freeze([
  Object.freeze({
    id: "naoETeste", porque: "o catálogo não viu obstáculo (livre, já revirado, já tentado, não se pede)",
    emVez: "o turno de hoje: narra-se acontecendo, ou o «já revirei»",
    cala: (v) => !v || typeof v !== "object" || v.tipo !== "teste",
  }),
  Object.freeze({
    id: "luta", porque: "a luta tem o seu d20 e a sua previsão",
    emVez: "o tabuleiro",
    cala: (v, ctx) => !!ctx.emCombate,
  }),
  Object.freeze({
    id: "conversa", porque: "conversa não se rola; ler quem fala, sim",
    emVez: "o turno normal, com a escada do pedido",
    cala: (v) => !!v.social,
  }),
  /* EM3: o saber que a ficha já tem (SABER_COMUM) — `ctx.saber` */
  Object.freeze({
    id: "saberComum", porque: "o herói já sabe isto — o sítio onde está, a terra, o ofício, o livro de factos",
    emVez: "o facto, sem dado (envelopeDoSaberComum)",
    cala: (v, ctx) => !!saberComumDe(v, ctx),
  }),
  Object.freeze({
    id: "trivial", porque: "não há obstáculo",
    emVez: "narra-se acontecendo",
    cala: (v) => !(Number(v.dc) > (dificuldadePorId("trivial") || { dc: 5 }).dc),
  }),
  Object.freeze({
    id: "automatico", porque: "o bónus torna o resultado certo",
    emVez: "sucesso ou falha automáticos, como hoje",
    cala: (v, ctx) => typeof ctx.bonus === "number" && Number.isFinite(ctx.bonus) && resolucaoAutomatica(ctx.bonus, Number(v.dc)) !== null,
  }),
  Object.freeze({
    id: "mundoDisseNao", porque: "não se rola contra o que não existe",
    emVez: "o envelope do vazio (envelopeSemOportunidade)",
    cala: (v, ctx) => ctx.mundoDisseNao === true,
  }),
]);

const obj = (x) => x && typeof x === "object" && !Array.isArray(x);

/* Porque é que o Mestre NÃO chama este veredito, ou null se chama. */
export function porQueNaoChama(v, ctx) {
  const c = obj(ctx) ? ctx : {};
  for (const r of QUANDO_O_MESTRE_CHAMA) {
    try { if (r.cala(v, c)) return r.id; } catch { return r.id; }
  }
  return null;
}

/* A variante do aviso que o contexto pede. */
function avisoDoContexto(aviso, contexto) {
  if (typeof aviso === "string") return aviso;
  if (!obj(aviso)) return "";
  const c = obj(contexto) ? contexto : {};
  for (const k of O_CHAMADO.ordemDoAviso) if (c[k] && typeof aviso[k] === "string") return aviso[k];
  return typeof aviso.base === "string" ? aviso.base : "";
}

/* O dado do preço, quando a falha morde: a mordida pelo degrau
   (MORDIDA_POR_DEGRAU) ou a queda (1d6 por dado). Só o da falha SECA, que é
   o que o aviso diz. */
function dadoDoPreco(c, v) {
  const p = c && c.peleSeca;
  if (!p) return null;
  if (p.queda && v.queda) return `${Math.max(1, Number(v.queda.dados) || 1)}d${O_CHAMADO.facesDaQueda}`;
  if (p.mordida) return `${Math.max(1, Number(p.mordida) || 1)}d${mordidaDoDegrau(v.dc).faces}`;
  return null;
}

/* ---------------- O CHAMADO ----------------
   `v`: o veredito de `lerAcao`.
   `ctx`: { emCombate, bonus, mundoDisseNao, contexto: { chuva, noite, cidade } }.
   Devolve null (o Mestre não chama: o turno segue como hoje) ou
   { pericia, periciaNome, dc, aviso, efeito, dado, chave, linha, porque }. */
export function oChamado(v, ctx) {
  const c = obj(ctx) ? ctx : {};
  if (porQueNaoChama(v, c)) return null;
  const custo = custoPorAlvo(v.alvoDoCusto != null ? v.alvoDoCusto : v.alvo);
  /* todo chamado tem aviso: sem linha de custo, não há preço a dizer, e o
     Mestre não chama — o teste rola como hoje */
  const situacoes = Array.isArray(v.situacoes) ? v.situacoes : [];
  /* a situação que pesou na CD também escolhe o aviso: a chuva que subiu o
     número é a chuva que apaga a trilha — uma fonte só, e as duas não se
     desmentem mesmo que o App só passe uma delas */
  const pesou = (id) => situacoes.some((s) => s && s.id === id);
  const contexto = { ...(obj(c.contexto) ? c.contexto : {}) };
  if (pesou("chuva")) contexto.chuva = true;
  if (pesou("escuro")) contexto.noite = true;
  const aviso = custo ? avisoDoContexto(custo.aviso, contexto) : "";
  if (!aviso || !custo.efeito) return null;
  const per = v.pericia ? periciaPorId(v.pericia) : null;
  const periciaNome = (per && per.nome) || nomeDoAtributo(v.atributo || "percepcao");
  const dc = Number(v.dc);
  const porque = situacoes.map((s) => s && s.diz).filter(Boolean).join(" e ");
  const linha = O_CHAMADO.molde
    .replace("{pericia}", periciaNome)
    .replace("{dc}", String(dc))
    .replace("{porque}", porque ? `, ${porque}` : "")
    .replace("{aviso}", aviso);
  const efeito = EFEITOS_DA_FALHA.some((e) => e.id === custo.efeito) ? custo.efeito : "fecha";
  return Object.freeze({
    pericia: v.pericia || "",
    periciaNome,
    dc,
    aviso,
    efeito,
    dado: Object.freeze({ teste: O_CHAMADO.dado, preco: dadoDoPreco(custo, v) }),
    chave: String(v.chave || ""),
    linha,
    porque,
  });
}
