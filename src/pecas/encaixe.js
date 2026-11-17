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

   A2 (17/11/2026, os ajustes que a medida da fase A pediu):
     { tipo: "cena", acao, dado }           — o 4.º destino: a ação legítima
                                              com dado no catálogo que não é
                                              de nenhuma solução nem família
                                              da peça (estancar, arrebentar,
                                              uma magia). O Mestre rola como
                                              hoje; não gasta o relógio, não
                                              aquece nada.
     · a frase é lida POR ORAÇÃO (partirEmOracoes): «vou até X e pergunto
       Y» é duas; vale a de maior peso (PESO_DO_ENCAIXE) e as livres seguem
       em `saidas`. A negação e a intenção não são ação (NAO_E_ACAO);
     · a conversa com quem a etapa pede é solução na hora (CONVERSA_DIRETA);
     · o alvo dito pelo papel, pelo ofício ou pelo pronome (ALVO_POR_DESCRICAO);
     · a família só troca dentro de ACOES_QUE_SE_TROCAM (moldes.js);
     · a solução que o calor já abriu aciona-se pela frase que aponta para ela.

   PURO E DETERMINÍSTICO. O `null` e o lixo dão null.
   ============================================================ */
import { lerAcao, NAO_E_IMPROVISO, custoPorAlvo } from "../desafios.js";
import { ehDeclaracaoDeAtaque } from "../agressao.js";
import { ehFuga } from "../fuga.js";
import { descansoDaFrase } from "../descanso.js";
import { quemNaFrase } from "../em-cena.js";
import { alvoDescrito } from "../social.js";
import { BIBLIOTECA_DE_QUESTS } from "../biblioteca-de-quests.js";
import { FAMILIA_DA_ACAO, acoesQueTrocamCom } from "./moldes.js";
import { memoriaDe, bonusDoCalor, CALOR_DAS_PECAS } from "./calor.js";

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
  capturar: /\b(capturo|capturar|amarro|amarrar|laco|lacar|lanco o laco|imobilizo|imobilizar|prendo-[ao](?!\s+(a|ao|no|na)\s+(cintura|cinto))|prende-l[ao]|atiro a rede|jogo a rede|ponho-lhe a coleira)\b/,
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
  /* A2: a resposta, o imperativo da fala e o encarar também são conversa;
     ler, olhar e escutar no gerúndio também são olhar (os frios da A2) */
  social: /\b(pergunt\w*|convers\w*|digo|falo|peco|conto|explico|insisto|chamo|cumprimento|apresento-me|me apresento|pedido|ajuda|por favor|senhor|senhora|amigo|respondo|diga|diz|conte|fale|responda|encaro)\b|["“”«»?]/,
  ameaca: /\b(amea\w*|intimid\w*|assust\w*|ou eu|ou entao|encosto a lamina|seguro-[oa] pelo)\b/,
  engano: /\b(minto|mentir|blef\w*|finj\w*|fingir|disfar\w*|engan\w*|me faco passar|faco-me passar)\b/,
  troca: /\b(moedas?|prata|ouro|recompensa|pagamento|troco|em troca)\b/,
  furtiva: /\b(escond\w*|esgueir\w*|sorrateir\w*|nas sombras|sem ser vist[oa]|em silencio|devagar|de mansinho|sigo-[oa]|vigio)\b/,
  caminho: /\b(rast\w*|pegadas?|trilh\w*|marcas?|sangue|caminho|por onde)\b/,
  saber: /\b(lembro|recordo|sei (algo|alguma|o que)|o que sei|conheco|ja ouvi|ouvi falar|historias?|lendas?|reconheco)\b/,
  /* A2: ler a pessoa à frente — separado do saber (FAMILIA_DA_ACAO.mentira) */
  intuicao: /\b(mente|mentindo|esconde algo|nervos[oa]|olho nos olhos|leio (o rosto|a expressao|o olhar)|desconfio|sincer\w*)\b/,
  olhar: /\b(olho|observo|reparo|examino|vejo|procuro|inspeciono|analiso|estudo|escuto|ouco|cheiro|toco|apalpo|vasculho|leio|olhando|observando|escutando|ouvindo|ouvir|prestando atencao|de olho)\b/,
  luta: /\b(armas?|espada|lamina|machado|arco|flecha|lanca|adaga|escudo|preparo-me|em guarda|desembainho|ataque)\b/,
  corpo: /\b(corda|laco|rede|escal\w*|muro|janela|telhado|porta|forc\w*)\b/,
  cuidado: /\b(acalm\w*|assobi\w*|bicho|besta|fera|animal|comida|carne|isca)\b/,
  arte: /\b(canto|cancao|musica|danco|recito|toco o|toco a|historia engracada|piada)\b/,
});
/* A2 · O QUE A LEITURA DA CASA LÊ E NÃO É (os falsos encaixes das 60
   soluções lidas): a fuga no passado («de que fugi») e a procura de uma
   PESSOA pelo nome («procuro a Lourdes ao balcão» não é revistar o sítio —
   é perguntar por ela, e aquece a conversa). Lidas sobre a frase sem acento,
   menos a procura, que precisa da maiúscula do nome. */
export const LEITURAS_QUE_NAO_SAO = Object.freeze({
  fugaPassada: /\b(fugi|fugiu|fugimos|fugiram|de que fugi|tinha fugido)\b/,
  procuraDeAlguem: /\b(?:[Pp]rocuro|[Pp]rocurando|[Pp]rocurar|à procura d[eoa]s?|a procura d[eoa]s?|[Ee]m busca d[eoa]s?)\s+(?:o |a |pel[oa] |por )?(?:mestre |dona |seu |senhor |senhora )?[A-ZÁÉÍÓÚÂÊÔÃÕ][a-zà-ÿ]/,
  porque: "a palavra do catálogo acerta o verbo e erra a cena: a procura de alguém é conversa, a fuga contada é passado",
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
  /* A2: «a ordem de que fugi» é a história do herói, não a fuga de agora */
  if (fuga && !LEITURAS_QUE_NAO_SAO.fugaPassada.test(t)) return { acao: "fugir", familia: "fuga", v: null };
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

/* ---------------- A2 · AS TABELAS DOS AJUSTES ---------------- */

/* O PESO DE CADA DESTINO, para a frase com várias orações: vale a de maior
   peso para a etapa (a ordem que o coordenador fixou: solução > cena >
   aquecimento > livre). O aquecimento FRIO fica abaixo do livre: «vou ao
   mercado e penso na vida» é ir — a oração que não aponta para nada não
   apaga o passo que a frase deu. */
export const PESO_DO_ENCAIXE = Object.freeze({ solucao: 5, cena: 4, aquece: 3, livre: 2, frio: 1 });

/* AS ORAÇÕES: partir por «e», «depois», «então», vírgula e fim de frase.
   Nunca dentro de aspas (a fala é uma oração só), nunca entre dois nomes
   com maiúscula («Sal e Pedra» é um sítio), nunca na vírgula entre
   algarismos. */
export const ORACAO = Object.freeze({
  pontuacao: /[.,;!?]/,
  conjuncao: /^\s+(e depois|e entao|e então|depois|entao|então|e)\s+/i,
  aspas: Object.freeze({ "\"": "\"", "“": "”", "«": "»" }),
  porque: "a frase composta é várias ações: cada uma encaixa por si (furo 2 da fase A)",
});

/* A NEGAÇÃO E A INTENÇÃO não são gesto: «Não vou ao homem ainda», «penso
   em ir», «se eu fosse». A oração só aquece (é conversa com a mesa). */
export const NAO_E_ACAO = Object.freeze({
  rx: /^(nao|ainda nao|nem)\b|\b(nao vou|nao quero|nao vamos|nao entro|nao saio|penso em|pretendo|planejo|meu plano|se eu|caso eu|talvez|quem sabe|imagino|considero)\b/,
  porque: "negar ou planear não move a cena (o «Não vou ao homem ainda» da fase A saía pela porta de ir)",
});

/* SAIR DA CENA: a oração de ir que leva para outro sítio. O que vem depois
   dela acontece na CHEGADA, não aqui — e a frase é «ir» (o jogo de hoje).
   O resto do «ir» (até ao balcão, ao fundo do armazém) fica nesta cena. */
export const SAIDA_DA_CENA = Object.freeze({
  rx: /\b(saio|saimos|parto|partimos|volto|voltamos|regresso|retorno|vou embora|vamos embora|sigo viagem|seguimos viagem|deixo (o|a) (cidade|vila|aldeia))\b/,
  /* o destino com maiúscula depois da preposição, que não é este sítio nem
     ninguém daqui («sigo até Nova Profundo») */
  destino: /\b(?:até|ate|para|pra|ao|à|aos|às|rumo a|em direção a|em direcao a|entro no|entro na|entro em|entramos no|entramos na)\s+(?:o |a |os |as )?([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ÿ'-]+)/,
  porque: "quem sai, age na chegada: a busca que diz depois é lá, não aqui",
});

/* A CONVERSA DIRETA (ajuste 3). Falar com a pessoa que a etapa pede, com
   um verbo de pergunta ou de pedido dirigido a ela, aciona a solução da
   conversa NA HORA, com dado — a fase A só a abria pelo calor, depois de
   três frases (11 de 187 conversas eram solução). O calor continua a
   servir a conversa com outras pessoas e o olhar. `ligada: false` volta a
   regra da fase A numa linha, se a prova jogada mostrar que isto tirou a
   conversa do jogo. */
export const CONVERSA_DIRETA = Object.freeze({
  ligada: true,
  pergunta: Object.freeze({ rx: /\b(pergunt\w*|indag\w*|question\w*|interrog\w*|quero saber|me (diga|conte|fale)|diga-me|conte-me|fale-me|o que (voce|tu|o senhor|a senhora) (viu|sabe|ouviu))\b/, acoes: Object.freeze(["fazer_falar", "convencer"]) }),
  pedido: Object.freeze({ rx: /\b(convenc\w*|persuad\w*|peco|peço|imploro|insisto|proponho|suplico|rogo|argument\w*|pe[cç]o-lhe)\b/, acoes: Object.freeze(["convencer", "fazer_falar"]) }),
  porque: "quem fala com a pessoa certa já está fazendo a etapa — o dado vem agora",
});

/* O ALVO POR DESCRIÇÃO (ajuste 4): «o tratador», «a taverneira», «a fera»,
   «ele/ela». Resolve-se contra a cena fechada — o papel da quest, o ofício
   do sítio e, para quem veio do covil, os nomes de bicho. Um só = é ele;
   vários = aquece os vários (o desempate sem pergunta). */
export const ALVO_POR_DESCRICAO = Object.freeze({
  artigo: "(?:o|a|os|as|ao|à|aos|do|da|no|na|pelo|pela|pro|pra|esse|essa|este|esta|aquele|aquela)",
  /* os nomes de bicho, para quem é a fera do covil */
  doCovil: Object.freeze(["fera", "besta", "bicho", "criatura", "monstro", "coisa", "animal"]),
  pronome: Object.freeze({ homem: /\b(ele|dele|nele|com ele)\b/, mulher: /\b(ela|dela|nela|com ela)\b/ }),
  /* a palavra do ofício precisa de corpo: «o» e «um» não descrevem ninguém */
  minimo: 4,
  porque: "o jogador diz «o tratador» e não «Corwin da Foz» — a cena sabe quem é",
});

/* os papéis de gente da biblioteca («pastora», «tratador», «estalajadeiro»):
   a frase que diz «o tratador» numa cena sem tratador fala de alguém que
   não está — o mesmo que o catálogo faz com os ofícios (alvoDescrito) */
export const PAPEIS_DO_ELENCO = Object.freeze([...new Set(BIBLIOTECA_DE_QUESTS.flatMap((F) => Object.entries((F && F.papeis) || {}).filter(([, d]) => d && d.de === "elenco").map(([k]) => sem(k)).filter((k) => /^[a-z]+$/.test(k) && k.length >= ALVO_POR_DESCRICAO.minimo)))]);

/* AS FAMÍLIAS QUE PEDEM A PALAVRA: a bolsa e a espada não se abrem pela
   conversa nem pelo calor — só pela frase do jogador que as diz. A seta
   «ela só fala por moedas» fica à vista; quem continua a perguntar não
   pagou. */
export const FAMILIAS_QUE_PEDEM_A_PALAVRA = Object.freeze(["troca", "luta"]);

/* AS FAMÍLIAS QUE SÃO TRABALHO DE QUALQUER ETAPA (ajuste 1). A ação do
   catálogo que não está na peça vira TESTE DE CENA — salvo se a família
   dela é a de uma solução da peça e está aqui: falar (pedir, ameaçar,
   mentir, ler alguém), olhar e seguir são o que a etapa pede, e a ação
   vizinha aquece. O corpo, o cuidado, o saber e a arte não: arrebentar
   amarras não é escalar o muro da toca, e estancar o sangue não é acalmar
   a fera. */
export const FAMILIAS_QUE_AQUECEM = Object.freeze({
  social: "conversa", ameaca: "conversa", engano: "conversa", troca: "conversa", intuicao: "conversa",
  olhar: "olhar", caminho: "olhar", furtiva: "furtiva",
});

/* o que o catálogo não rola e é ação de cena: a magia vai pelo grimório */
export const CENA_SEM_CATALOGO = Object.freeze({
  magia: Object.freeze({ rx: /\b(rezo|conjuro|invoco|lanco (a |uma )?(magia|feitico|encanto)|uso (a |uma )?(magia|feitico)|recito o feitico)\b/, porta: "grimorio", porque: "a magia tem a sua porta (o grimório), e não é de nenhuma etapa" }),
});

/* ---------------- AS ORAÇÕES ---------------- */
export function partirEmOracoes(frase) {
  const s = String(frase == null ? "" : frase);
  const out = [];
  let cur = "";
  let dentro = null;
  const fecha = () => { if (/[a-zà-ÿ]/i.test(cur)) out.push(cur.trim()); cur = ""; };
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (dentro) { cur += ch; if (ch === dentro) dentro = null; continue; }
    if (ORACAO.aspas[ch]) { dentro = ORACAO.aspas[ch]; cur += ch; continue; }
    if (ORACAO.pontuacao.test(ch)) {
      if (ch === "," && /\d/.test(s[i - 1] || "") && /\d/.test(s[i + 1] || "")) { cur += ch; continue; }
      /* a interrogação e a exclamação ficam com a oração: «?» é pergunta */
      if (ch === "?" || ch === "!") cur += ch;
      fecha();
      continue;
    }
    if (/\s/.test(ch)) {
      const m = s.slice(i).match(ORACAO.conjuncao);
      if (m) {
        const antes = (cur.trim().split(/\s+/).pop() || "");
        const depois = (s.slice(i + m[0].length).match(/^\S+/) || [""])[0];
        const nomeComposto = /^[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(antes) && /^[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(depois) && m[1].toLowerCase() === "e";
        if (!nomeComposto) { fecha(); i += m[0].length - 1; continue; }
      }
    }
    cur += ch;
  }
  fecha();
  return out;
}

/* ---------------- QUEM A FRASE NOMEIA ---------------- */
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
  const t = sem(frase);
  for (const x of lista) if (x.tipo === "lugar" && semArtigo(x.nome).length >= 4 && t.includes(semArtigo(x.nome))) ids.add(x.id);
  return ids;
}
const chaveDoAlvo = (s) => (s.alvo.tipo === "pessoa" ? "q:" : "l:") + sem(s.alvo.nome);

/* as palavras que descrevem uma pessoa da cena: o papel, o ofício, e os
   nomes de bicho para quem veio do covil */
function palavrasDe(q) {
  const ws = [];
  const junta = (x) => { for (const w of sem(x).split(/[^a-z]+/)) if (w.length >= ALVO_POR_DESCRICAO.minimo) ws.push(w); };
  junta(q.papel || "");
  junta(q.oficio || "");
  if (q.deOnde === "covil" || q.papel === "fera") ws.push(...ALVO_POR_DESCRICAO.doCovil);
  return [...new Set(ws)];
}
const raiz = (w) => w.replace(/(as|os|es|a|o)$/, "");
const descreve = (t, w) => { const r = raiz(w); return r.length >= 3 && new RegExp(`\\b${ALVO_POR_DESCRICAO.artigo}\\s+${r}(a|o|as|os|es|eira|eiro)?\\b`).test(t); };

/* aDescricao(frase, cena) → { ids, fora, palavra } — quem da cena a frase
   descreve pelo papel, ofício ou pronome; `fora`: descreve alguém (pela
   palavra do catálogo, `descrito`) que ninguém daqui veste */
export function aDescricao(frase, cena, opcoes) {
  const t = sem(frase);
  const quem = arr(cena && cena.quem);
  const ids = new Set();
  for (const q of quem) if (palavrasDe(q).some((w) => descreve(t, w))) ids.add("q:" + sem(q.nome));
  /* fora: a frase descreve (pelo ofício do catálogo, ou por um papel da
     biblioteca) alguém que ninguém daqui veste. O nome próprio não conta
     aqui — é o nome, e o nome tem a sua regra (os conhecidos) */
  const veste = (w) => quem.some((q) => palavrasDe(q).some((x) => raiz(x).length >= 3 && (raiz(w).startsWith(raiz(x)) || raiz(x).startsWith(raiz(w)))));
  let of = null;
  try { of = alvoDescrito(String(frase || "")); } catch { of = null; }
  const ofs = [...(of && of.oficio ? [sem(of.oficio)] : []), ...PAPEIS_DO_ELENCO.filter((w) => descreve(t, w))];
  const foraDesc = !ids.size && ofs.some((w) => !veste(w));
  /* o pronome só quando a frase não chama ninguém de fora pelo nome («Digo a
     Dário que… se ele quer» fala de Dário, não de quem está aqui) */
  /* nem quando a frase descreve alguém de fora («pergunto ao taverneiro como
     ele se chama»: «ele» é o taverneiro) */
  if (!ids.size && !foraDesc && !(opcoes && opcoes.semPronome)) {
    const genero = (q) => (/^(f|mulher)/.test(sem(q.genero)) ? "mulher" : /^(m|homem)/.test(sem(q.genero)) ? "homem" : "");
    for (const g of ["homem", "mulher"]) {
      if (!ALVO_POR_DESCRICAO.pronome[g].test(t)) continue;
      const cands = quem.filter((q) => q.deOnde !== "covil" && (genero(q) === g || genero(q) === ""));
      if (cands.length) for (const q of cands) ids.add("q:" + sem(q.nome));
    }
  }
  const fora = foraDesc;
  return { ids, fora };
}

/* a oração de ir leva para outro sítio? (SAIDA_DA_CENA) */
function saiDaCena(f, t, nomeados, peca) {
  const aqui = "l:" + sem(peca.cena.onde.nome);
  const outroSitio = [...nomeados].some((id) => id.startsWith("l:") && id !== aqui)
    || peca.solucoes.some((s) => s.alvo.tipo === "lugar" && s.alvo.papel && chaveDoAlvo(s) !== aqui && descreve(t, sem(s.alvo.papel)));
  const m = String(f).match(SAIDA_DA_CENA.destino);
  const destinoFora = !!m && !sem(peca.cena.onde.nome).includes(sem(m[1])) && !peca.cena.quem.some((q) => sem(q.nome).includes(sem(m[1])));
  return SAIDA_DA_CENA.rx.test(t) || outroSitio || destinoFora;
}

/* ---------------- O ENCAIXE DE UMA ORAÇÃO ---------------- */
const pesoDe = (r) => (!r ? 0 : r.tipo === "aquecimento" ? (r.esquenta.length ? PESO_DO_ENCAIXE.aquece : PESO_DO_ENCAIXE.frio) : PESO_DO_ENCAIXE[r.tipo] || 0);

function encaixarOracao(f, C, herdado) {
  const { peca, E, mem, queimadas, naCena, foraDaCena } = C;
  const t = sem(f);
  const soAquece = NAO_E_ACAO.rx.test(t);
  const nomeados = nomeadosNaFrase(f, peca, foraDaCena);
  const leitura0 = aLeitura(f, peca.cena, E);
  /* a procura de alguém pelo nome não é o «buscar» do sítio: é conversa */
  const procuraAlguem = ["buscar", "investigar"].includes(leitura0.acao) && LEITURAS_QUE_NAO_SAO.procuraDeAlguem.test(f) && !peca.solucoes.some((s) => s.alvo.tipo === "lugar" && nomeados.has(chaveDoAlvo(s)));
  const leitura = soAquece ? { acao: null, familia: leitura0.familia, v: null } : procuraAlguem ? { acao: null, familia: "social", v: null } : leitura0;
  const desc = aDescricao(f, peca.cena, { semPronome: !!C.outroNome || herdado === "fora" });
  const temPessoa = () => [...nomeados].some((id) => id.startsWith("q:"));
  /* o nome dito pela descrição conta como dito; sem nome nenhum, herda-se
     o da oração anterior («Cumprimento Torvald e pergunto…») */
  if (!temPessoa()) for (const id of desc.ids) nomeados.add(id);
  if (!temPessoa() && !desc.fora) for (const id of arr(herdado)) nomeados.add(id);
  const nomeiaFora = [...nomeados].some((id) => id.startsWith("q:") && !naCena.has(id) && !peca.solucoes.some((s) => chaveDoAlvo(s) === id));
  /* quem a oração anterior pôs fora («convencer o guarda com lábia e charme»)
     continua fora na seguinte, que não diz outra pessoa */
  const descritoFora = desc.fora && ![...nomeados].some((id) => naCena.has(id));
  /* a herança só tira a solução, a cena e a conversa direta — a oração ainda aquece pelas palavras */
  const bloqueia = descritoFora || (herdado === "fora" && !temPessoa());
  const pistaDe = (id) => (peca.pistas.find((p) => p.solucao === id) || {}).diz || "";
  const viva = (s) => !queimadas.has(s.id) && s.aVista;
  const comoSolucao = (s) => ({
    tipo: "solucao", solucao: s.id,
    dado: {
      acao: s.acao, pericia: s.pericia, luta: s.luta, semDado: s.semDado,
      dc: s.dc == null ? null : s.dc + mem.pior,
      bonus: bonusDoCalor(mem, s.id) + (mem.abertas[s.id] || 0),
      dcDoCatalogo: leitura.v && leitura.v.dc != null ? leitura.v.dc : null,
    },
    pista: pistaDe(s.id),
  });
  const fim = (r) => ({ ...r, _nomeados: [...nomeados].filter((id) => naCena.has(id)), _fora: descritoFora });

  /* 0. quem sai da cena age na chegada: «Volto ao templo à procura do
     Godfrey» é ir, e a procura é lá */
  const saidaJa = soAquece ? null : aSaidaLivre(f, E);
  /* salvo o caminho que É a solução («sigo as pegadas até à toca») */
  const rumoDaAcao = !!leitura.acao && peca.solucoes.some((s) => s.pede === "rumo" && acoesQueTrocamCom(leitura.acao).includes(s.acao) && !queimadas.has(s.id));
  if (saidaJa && saidaJa.qual === "ir" && !rumoDaAcao && saiDaCena(f, t, nomeados, peca)) return fim({ tipo: "livre", porque: saidaJa.porque, qual: "ir", _sai: true });

  /* 1. a solução que a frase aciona: a ação exata, ou uma que troca com
     ela (ACOES_QUE_SE_TROCAM) — nunca a «mesma família» larga */
  if (leitura.acao) {
    const trocam = acoesQueTrocamCom(leitura.acao);
    const exatas = peca.solucoes.filter((s) => s.acao === leitura.acao);
    const daTroca = peca.solucoes.filter((s) => s.acao !== leitura.acao && trocam.includes(s.acao));
    const mesmas = exatas.length && exatas.filter(viva).length ? exatas : daTroca.length ? [...exatas, ...daTroca] : exatas;
    const alvoOk = (s) => {
      const k = chaveDoAlvo(s);
      const nomeiaAlguem = [...nomeados].some((id) => id.startsWith(k.slice(0, 2)));
      if (nomeados.has(k)) return true;
      if (s.pede === "rumo") return !nomeiaAlguem || s.alvo.tipo !== "lugar";
      /* a pessoa da cena nomeada não impede a solução «alguém daqui» */
      if (s.pede === "alguem" && s.alvo.tipo === "lugar") return !nomeiaFora && !bloqueia;
      return !nomeiaAlguem && !nomeiaFora;
    };
    const vivas0 = mesmas.filter((s) => viva(s) && alvoOk(s));
    const comNome = vivas0.filter((s) => nomeados.has(chaveDoAlvo(s)));
    const vivas = comNome.length ? comNome : bloqueia ? [] : vivas0;
    const porAlvo = [...new Map(vivas.map((s) => [chaveDoAlvo(s), s])).values()];
    if (porAlvo.length === 1) return fim(comoSolucao(porAlvo[0]));
    if (porAlvo.length > 1) return fim({ tipo: "aquecimento", esquenta: porAlvo.map((s) => s.id), nomeadas: porAlvo.filter((s) => nomeados.has(chaveDoAlvo(s))).map((s) => s.id), pista: pistaDe(porAlvo[0].id), porque: "duas" });
    const queimada = mesmas.find((s) => queimadas.has(s.id) && s.falha && s.falha.para && !queimadas.has(s.falha.para));
    if (queimada) return fim({ tipo: "aquecimento", esquenta: [queimada.falha.para], nomeadas: [], pista: pistaDe(queimada.falha.para), porque: "queimada" });
  }

  /* 2. a conversa direta: com quem a etapa pede, pergunta ou pedido */
  if (CONVERSA_DIRETA.ligada && !soAquece && !nomeiaFora && !bloqueia && (!leitura.acao || FAMILIAS_QUE_AQUECEM[leitura.familia] === "conversa")) {
    /* «pergunto quanto custa» é o balcão, não a etapa */
    const doBalcao = (() => { const l = aSaidaLivre(f, E); return !!l && ["comercio", "espera", "mestre", "painel"].includes(l.qual); })();
    const intento = doBalcao ? null : CONVERSA_DIRETA.pedido.rx.test(t) ? CONVERSA_DIRETA.pedido : CONVERSA_DIRETA.pergunta.rx.test(t) ? CONVERSA_DIRETA.pergunta : null;
    if (intento) {
      const pessoas = peca.cena.quem.filter((q) => q.deOnde !== "covil");
      const ditas = pessoas.filter((q) => nomeados.has("q:" + sem(q.nome)));
      /* sem nome: a única pessoa da cena (a frase transplantada fala com quem
         está) — salvo se a frase chama alguém por um nome que a cena não
         tem («Hakon, de onde nos conhecemos?»: fala com o companheiro) */
      const com = ditas.length === 1 ? ditas[0] : !ditas.length && pessoas.length === 1 && !C.outroNome && intento === CONVERSA_DIRETA.pergunta ? pessoas[0] : null;
      if (com) {
        const k = "q:" + sem(com.nome);
        for (const acao of intento.acoes) {
          const dela = peca.solucoes.find((s) => viva(s) && s.acao === acao && s.alvo.tipo === "pessoa" && chaveDoAlvo(s) === k);
          if (dela) return fim(comoSolucao(dela));
        }
        /* ninguém pedido pelo nome: a conversa «com alguém daqui» da etapa */
        const daqui = (acao) => peca.solucoes.filter((s) => viva(s) && s.acao === acao && s.pede === "alguem");
        /* a conversa dela já falhou: a seta da falha é o caminho — a
           pergunta seguinte aciona-a se o Mestre já a abriu (salvo a bolsa
           e a espada, que pedem a palavra), senão aquece-a */
        const falhadas = peca.solucoes.filter((s) => queimadas.has(s.id) && intento.acoes.includes(s.acao) && (chaveDoAlvo(s) === k || s.pede === "alguem") && s.falha && s.falha.para && !queimadas.has(s.falha.para));
        const seta = falhadas.map((s) => peca.solucoes.find((x) => x.id === s.falha.para)).filter(Boolean)[0];
        if (seta && !peca.solucoes.some((s) => viva(s) && intento.acoes.includes(s.acao) && (chaveDoAlvo(s) === k || s.pede === "alguem"))) {
          if (mem.abertas[seta.id] != null && seta.aVista && !FAMILIAS_QUE_PEDEM_A_PALAVRA.includes(seta.familia)) return fim({ ...comoSolucao(seta), porque: "seta" });
          /* a seta que pede a palavra (a bolsa) não aquece pela conversa: a
             pista mostra-a, e o tempo corre como o de quem enrola */
          if (FAMILIAS_QUE_PEDEM_A_PALAVRA.includes(seta.familia)) return fim({ tipo: "aquecimento", esquenta: [], nomeadas: [], pista: pistaDe(seta.id), porque: "pedeAPalavra" });
          return fim({ tipo: "aquecimento", esquenta: [seta.id], nomeadas: [], pista: pistaDe(seta.id), porque: "queimada" });
        }
        const temDela = peca.solucoes.some((s) => s.alvo.tipo === "pessoa" && chaveDoAlvo(s) === k && FAMILIAS_QUE_AQUECEM[s.familia] === "conversa");
        if (!temDela) {
          for (const acao of intento.acoes) {
            const l = daqui(acao);
            const comLugar = l.filter((s) => nomeados.has(chaveDoAlvo(s)));
            const um = comLugar.length === 1 ? comLugar[0] : l.length === 1 ? l[0] : null;
            if (um) return fim(comoSolucao(um));
          }
        }
      }
    }
  }

  /* 3. o teste de cena: a ação com dado que não é de nenhuma solução nem
     família de trabalho da peça (FAMILIAS_QUE_AQUECEM), com o alvo aqui */
  if (!soAquece && !nomeiaFora && !bloqueia) {
    const magia = CENA_SEM_CATALOGO.magia.rx.test(t);
    const v = leitura.v;
    if (magia) return fim({ tipo: "cena", acao: "magia", dado: { acao: "magia", porta: CENA_SEM_CATALOGO.magia.porta } });
    if (v && v.tipo === "teste" && v.id !== "improviso" && leitura.acao) {
      const trocam = acoesQueTrocamCom(leitura.acao);
      const naPeca = peca.solucoes.some((s) => trocam.includes(s.acao));
      const grupo = FAMILIAS_QUE_AQUECEM[leitura.familia];
      const familiaNaPeca = !!grupo && peca.solucoes.some((s) => FAMILIAS_QUE_AQUECEM[s.familia] === grupo);
      if (!naPeca && !familiaNaPeca) {
        const custo = (() => { try { return custoPorAlvo(v.id); } catch { return null; } })();
        return fim({ tipo: "cena", acao: v.id, dado: { acao: v.id, pericia: v.pericia || null, atributo: v.atributo || null, dc: v.dc == null ? null : v.dc, custo: custo ? custo.efeito || null : null } });
      }
    }
  }

  /* 4. a saída universal */
  const livre = soAquece ? null : aSaidaLivre(f, E);
  if (livre) {
    const sai = livre.qual === "ir" && saiDaCena(f, t, nomeados, peca);
    return fim({ tipo: "livre", porque: livre.porque, qual: livre.qual, ...(sai ? { _sai: true } : {}) });
  }

  /* 5. o aquecimento: para onde a frase aponta */
  const familias = new Set();
  if (leitura.familia) familias.add(leitura.familia);
  for (const [fam, rx] of Object.entries(PALAVRAS_DO_CALOR)) if (rx.test(t)) familias.add(fam);
  const mesmaAcao = leitura.acao ? peca.solucoes.filter((s) => s.acao === leitura.acao) : [];
  const doAlvo = peca.solucoes.filter((s) => nomeados.has(chaveDoAlvo(s)));
  let esquenta;
  let porque;
  if (mesmaAcao.length) { esquenta = mesmaAcao; porque = "alvoFora"; }
  else if ((nomeiaFora || descritoFora) && !doAlvo.length) { esquenta = []; porque = "nomeiaQuemNaoEsta"; }
  else {
    const base = doAlvo.length ? doAlvo : peca.solucoes.filter((s) => s.aVista);
    esquenta = base.filter((s) => familias.has(s.familia));
    if (!esquenta.length && doAlvo.length) esquenta = doAlvo.filter((s) => ["social", "cuidado", "olhar"].includes(s.familia));
    porque = esquenta.length ? (doAlvo.length ? "nomeia" : "palavras") : familias.size ? "familiaSemSolucao" : "nadaAponta";
  }
  esquenta = esquenta.filter((s) => !s.semDado && !queimadas.has(s.id));
  /* a solução que o calor JÁ abriu e para onde a frase aponta: o Mestre
     pediu o dado, e a conversa nessa direção é a ação (as-pecas.md §3.4) */
  if (CALOR_DAS_PECAS.abertaAcionaPelaFrase && !soAquece) {
    const aberta = esquenta.filter((s) => mem.abertas[s.id] != null && s.aVista && !FAMILIAS_QUE_PEDEM_A_PALAVRA.includes(s.familia)).sort((a, b) => (mem.calor[b.id] || 0) - (mem.calor[a.id] || 0))[0];
    if (aberta) return fim({ ...comoSolucao(aberta), porque: "aberta" });
  }
  const ids = esquenta.map((s) => s.id);
  const quente = (id) => mem.calor[id] || 0;
  const ordem = (lista) => [...lista].sort((a, b) => quente(b) - quente(a) || peca.solucoes.findIndex((s) => s.id === a) - peca.solucoes.findIndex((s) => s.id === b));
  const daPista = ordem(ids)[0] || ordem(peca.solucoes.filter((s) => s.aVista && !s.semDado).map((s) => s.id))[0] || (peca.solucoes[0] && peca.solucoes[0].id);
  return fim({ tipo: "aquecimento", esquenta: ids, nomeadas: esquenta.filter((s) => nomeados.has(chaveDoAlvo(s))).map((s) => s.id), pista: pistaDe(daPista), porque: soAquece ? "naoEAcao" : porque });
}

/* ---------------- O ENCAIXE ---------------- */
export function encaixar(frase, peca, estado, opcoes) {
  try {
    const f = String(frase == null ? "" : frase);
    if (!f.trim() || !obj(peca) || !Array.isArray(peca.solucoes)) return null;
    const E = obj(estado) || {};
    const o = obj(opcoes) || {};
    const mem = memoriaDe(E, peca);
    const naCena = new Set(peca.cena.quem.map((q) => "q:" + sem(q.nome)));
    const C = {
      peca, E, mem, naCena,
      queimadas: new Set(arr(mem.queimadas)),
      foraDaCena: [...arr(o.conhecidos), ...Object.values(obj(E.npcs) || {}).map((n) => obj(n) && n.nome).filter(Boolean)].filter((n) => !naCena.has("q:" + sem(n))),
    };
    /* algum nome próprio (maiúscula fora do começo da oração) que não é de
       ninguém nem de nada desta cena? */
    const daCena = [...peca.cena.quem.map((q) => q.nome), peca.cena.onde.nome, ...peca.solucoes.map((x) => x.alvo && x.alvo.nome)].map((x) => sem(x)).join(" ");
    C.outroNome = [...f.matchAll(/(^|[^\s]?)(\s*)([A-ZÁÉÍÓÚÂÊÔÃÕ][a-zà-ÿ]{2,})/g)].filter((m) => { const ini = m.index + m[1].length + m[2].length; const comeco = ini === 0 || /[.!?…"“«:—-]$/.test(f.slice(0, ini).trimEnd()); return !comeco || f[ini + m[3].length] === ","; }).map((m) => m[3]).some((w) => !daCena.includes(sem(w)) && !/^(Mestre|Narrador|Deus|Deuses)$/.test(w));
    const oracoes = partirEmOracoes(f);
    if (oracoes.length <= 1) {
      const r = encaixarOracao(oracoes[0] || f, C, []);
      const { _nomeados, _sai, _fora, ...limpo } = r;
      return limpo;
    }
    /* várias orações: a de maior peso; as livres seguem em `saidas`; quem
       sai da cena age na chegada, e o que diz depois não é daqui */
    /* falar com o Mestre é a frase inteira fora da cena («Mestre, quantas
       horas faltam?»): a oração do vocativo manda */
    if (aSaidaLivre(oracoes[0], E) && aSaidaLivre(oracoes[0], E).qual === "mestre") return { tipo: "livre", porque: SAIDAS_LIVRES.mestre.porque, qual: "mestre", oracoes: oracoes.length };
    let melhor = null;
    const saidas = [];
    let herdado = [];
    let naChegada = [];
    for (let i = 0; i < oracoes.length; i++) {
      const r = encaixarOracao(oracoes[i], C, herdado);
      if (r._nomeados.length) herdado = r._nomeados; else if (r._fora) herdado = "fora";
      if (r.tipo === "livre") saidas.push({ qual: r.qual, porque: r.porque, oracao: oracoes[i] });
      if (!melhor || pesoDe(r) > pesoDe(melhor)) melhor = r;
      if (r._sai) { naChegada = oracoes.slice(i + 1); break; }
    }
    const { _nomeados, _sai, _fora, ...limpo } = melhor;
    const resto = limpo.tipo === "livre" ? saidas.filter((s) => s.qual !== limpo.qual) : saidas;
    return { ...limpo, oracoes: oracoes.length, ...(resto.length ? { saidas: resto } : {}), ...(naChegada.length ? { naChegada } : {}) };
  } catch {
    return null;
  }
}
