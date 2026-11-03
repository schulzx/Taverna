/* ============================================================
   O PEDIDO DO ATOR (o Narrador ator, etapa 2 · 03/11/2026) — src/motor/pedido-do-ator.js

   A pessoa decidiu em 03/11 (mente/plano-narrador-ator.md): *"o narrador é
   só a boca… nada entra por ele, tudo entra pelo sistema e é devolvido pelo
   sistema."* A etapa 1 escreveu a FICHA (ficha-de-ator.js: o que o sistema
   decidiu, dito como fato e vontade); a etapa 3 fechou as PORTAS
   (portas-do-narrador.js: no modo `ator`, nada da resposta vira estado).
   Esta peça é o meio: o pedido que vai à rede no modo `ator`.

   O PEDIDO TEM TRÊS COISAS, e só três:
     - o OFÍCIO (o system): como dizer — igual em todo turno, curto, e por
       isso o prefixo que se repete (OFICIO_DO_ATOR);
     - HÁ POUCO: as duas últimas trocas, tal qual, só para não repetir;
     - a FICHA do turno.
   Nada de regra de jogo: o código já a aplicou antes de o ator ler uma
   linha (a anatomia mediu 54% do pedido de hoje em regra).

   O OFÍCIO NÃO PODE SEMEAR OS TIQUES. O diagnóstico da voz
   (mente/narrador-ator-voz.md, §1–2) achou a causa: instrução de Mestre
   escrita como frase de ator, e o gesto gasto NOMEADO num veto (nomear a
   palavra põe-na no contexto). Por isso o ofício diz o que fazer pela
   positiva, e `GATILHOS_DE_TIQUE` é a catraca: nenhuma das frases que o
   diagnóstico apontou como causa, e nenhum dos gestos e imagens que ele
   contou, aparece no ofício.

   A RESPOSTA É SÓ PROSA. Sem JSON, sem campos: não há o que declarar,
   porque nada entra pelo Narrador. `aProsaDoAtor` tira a prosa do texto
   que voltou (e, se o modelo mandar JSON velho por engano, fica só com o
   texto da narrativa). `aRespostaDoAtor` é o caminho inteiro sobre uma
   porta `chamar` — a mesma no App (chamarModelo) e no servidor (o provedor)
   —, com uma segunda escrita quando a primeira volta vazia, e a guarda da
   fala do herói (semFalaInventada), que é guarda e fica nos dois modos.

   O FORMATO À REDE é o do pedido do Mestre (`PEDIDO_AO_NARRADOR`):
   `{ system, messages, maxTokens, formato, tarefa, comCache }` — o App e o
   servidor chamam os dois pela mesma forma, e o que muda é a tabela.

   Puro, sem React. Provado em `testes/teste-pedido-do-ator.mjs`.
   ============================================================ */
import { aFichaDeAtor } from "./ficha-de-ator.js";
import { TAMANHO_DA_NARRATIVA, ETIQUETA_DO_PEDIDO, lerOPedido } from "../escuta.js";
import { extrairJSON } from "../json.js";
import { semFalaInventada } from "../fala-do-heroi.js";
import { MOTIVO_SEM_NARRATIVA } from "../guardado.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));

/* ---------------- O PEDIDO À REDE ----------------
   A mesma forma de PEDIDO_AO_NARRADOR (pedido-do-turno.js). `formato:
   "texto"`: a saída não é JSON. `comCache: false`: o ofício tem ~1 mil
   tokens, abaixo do mínimo do cache explícito (janela.js,
   CACHE_EXPLICITO.minTokens = 4096) — pedir cache só faria o servidor
   tentar escrever um que não pega. `maxTokens` é a rede do Narrador de
   turno (api/_provedor.js, REDE_DE_SAIDA.narrador): o pensamento conta
   dentro dela, e a prosa do ator cabe folgada. `tarefa` é a do Narrador:
   o mesmo modelo responde aos dois modos, e o teste às cegas (etapa 4) é
   que decide se muda. */
export const PEDIDO_AO_ATOR = Object.freeze({ maxTokens: 1200, formato: "texto", tarefa: "narrador", comCache: false });

/* ---------------- O OFÍCIO ----------------
   O system do ator. `{min}`/`{max}` saem de TAMANHO_DA_NARRATIVA (escuta.js),
   o mesmo tamanho que o Mestre de hoje pede. `teto` é a meta do plano
   (~3–4 mil caracteres): a suíte prova que o ofício cabe nele. */
export const OFICIO_DO_ATOR = Object.freeze({
  teto: 4000,
  texto: [
    "Você dá voz e corpo a uma cena de RPG de mesa. O que acontece nela já está decidido e vem escrito na ficha a seguir; o seu trabalho é fazer quem joga sentir isso: o lugar, as pessoas, as palavras delas. Você não decide nada. Você atua a ficha.",
    "",
    "COMO LER A FICHA",
    "- CENA: onde e quando. Uma ou duas pinceladas do que se vê, ouve ou cheira; nunca um inventário.",
    "- ACONTECEU: a frase do herói e o que dela resultou. É coisa feita: conte a consequência, nunca a desdiga, e não repita a fala do herói.",
    "- QUEM ESTÁ: cada pessoa, com a sua «Fala:» (o vocabulário, o ritmo, o trato com o herói), o que faz «Agora», o que «Sabe» e o que «Quer». O «Teme, e não o diz» aparece no comportamento, nunca em palavras. «Não sabe responder a» é uma pergunta para a qual essa pessoa não tem resposta: ela mostra-o à sua maneira, e não inventa a resposta.",
    "- O QUE SE DIZ: o conteúdo que tem de chegar ao herói, na boca de quem está indicado. Diga-o inteiro e com as palavras da pessoa, sem mudar nome, número, preço ou condição. «Livre:» quer dizer que nada de novo precisa ser dito: a conversa é cor, ambiente, gente a ser gente, e não promete, não cobra, não revela, não oferece.",
    "- A ÚLTIMA PALAVRA: quem fecha a cena, e de que forma. Siga-a.",
    "- O TOM: quando vem, é a temperatura da cena.",
    "- AS FRONTEIRAS: só falam os que estão ali. Quem não tem nome usa um dos nomes à mão, se precisar de um. Não existe mais ninguém com nome, nem outro lugar, item ou moeda: não os crie, nem de passagem.",
    "",
    "A VOZ",
    "- Cada pessoa soa como a sua «Fala:» e como mais ninguém. Duas pessoas da mesma cena nunca falam do mesmo jeito.",
    "- A fala entra limpa. Para a atribuir, «diz», ou nada. Um gesto só quando conta o que a fala não conta, e nenhum gesto volta na mesma resposta.",
    "- A frase que importa vem curta, dita por alguém, e não se explica depois.",
    "- Fale ao herói por «você», no presente. O herói não fala nem decide além do que a frase dele disse.",
    "- O nome do herói, na boca de alguém, no máximo uma vez.",
    "",
    "O QUE NÃO SE FAZ",
    "- Não acabe perguntando ao herói o que ele vai fazer, nem lhe ponha caminhos à escolha, em pergunta ou em prosa. A vez volta para ele sozinha.",
    "- Não feche com frase de efeito, nem com o resumo do que a cena significou.",
    "- Não enumere de três em três para soar bonito.",
    "- Não explique o mundo: a razão das coisas não se diz, e ninguém fala em números de jogo, em distâncias exatas, em regras ou no que se pode ou não fazer.",
    "- Não repita a imagem, o gesto, a abertura ou o fecho das respostas de «Há pouco».",
    "",
    "A FORMA",
    "Só a cena, em prosa, de {min} a {max} palavras, e menos quando a cena é pequena. Sem título, sem marcação, sem JSON, nada antes nem depois.",
  ].join("\n"),
  /* a segunda escrita, quando a primeira volta sem prosa */
  reforco: "A resposta anterior chegou vazia. Escreva a cena outra vez: só a prosa.",
  /* o cabeçalho da memória curta, e como cada troca se escreve nela */
  haPouco: "HÁ POUCO",
  frase: "Frase",
  cena: "Cena",
});

/* o ofício com o tamanho dito (TAMANHO_DA_NARRATIVA) */
export function oOficioDoAtor() {
  return OFICIO_DO_ATOR.texto.replace("{min}", String(TAMANHO_DA_NARRATIVA.min)).replace("{max}", String(TAMANHO_DA_NARRATIVA.max));
}

/* ---------------- A CATRACA DOS TIQUES ----------------
   O que o ofício NÃO pode conter: cada frase que o diagnóstico da voz
   (mente/narrador-ator-voz.md) apontou como causa de um tique, e cada
   gesto, verbo de dizer e imagem que ele contou na 13.ª. `de` diz de onde
   veio. Vale para o ofício inteiro, já com o tamanho dito. */
export const GATILHOS_DE_TIQUE = Object.freeze([
  /* §1.1 e §2, causas 1–3: o fecho */
  { id: "falaAMeio", rx: /\ba meio\b|interromp|reticências|…/iu, de: "§2 causa 1: o fecho `silencio` e «deixe os personagens se interromperem»" },
  { id: "perguntaDireta", rx: /pergunta direta|acaba nela|o que (você|voce) faz\b|termine (sempre )?(em|com|devolvendo)|devolv\w+ a palavra/iu, de: "§2 causa 2: o fecho `pergunta` e o «Termine SEMPRE devolvendo a palavra»" },
  { id: "dilema", rx: /n[aã]o cabem juntas|duas coisas nas m[aã]os|as duas custam/iu, de: "§2 causa 3: o fecho `escolha`" },
  /* §1.2 e §2, causas 4–5: as fórmulas da fala */
  { id: "naoSei", rx: /n[aã]o sei\b|ningu[eé]m (daqui )?sabe|desconvers|diz que n[aã]o sabe/iu, de: "§2 causa 4: o RUMO e O QUE É FATO, escritos como fala" },
  { id: "apresentacao", rx: /pr[oó]prio nome|se apresent/iu, de: "§2 causa 5: a pista da batida 1" },
  { id: "vocativo", rx: /\bmulher\b/iu, de: "§1.2: o «mulher» em cinco bocas" },
  /* §1.3: o verbo de dizer e a rubrica */
  { id: "verboDeDizer", rx: /resmung|rosn|grunh|murmur|pigarr|\bsolt[ao]u?\b|entre os dentes|voz (rouca|corrida|apressada)|meio passo|d[aá] um passo|sem rodeios/iu, de: "§1.3: o verbo de dizer e a rubrica antes da fala" },
  /* §1.4 e §2, causa 7: os gestos gastos (nomeá-los semeia-os) */
  { id: "gesto", rx: /cusp|cosp|escarr|bra[cç]os cruzados|cruza os bra|olhar fixo|crava a vista|sem erguer os olhos|encara|inclina a cabe|sem pressa|fica no ar|como quem|com um olhar|sil[eê]ncio antes/iu, de: "§1.4 e §2 causa 7: os gestos gastos e o pedido de gesto" },
  /* §1.5: as imagens que voltam */
  { id: "imagem", rx: /\bpesad[oa]s?\b|\bpesa\b|carca[cç]a|\btalho\b|\bqueima/iu, de: "§1.5: as imagens que voltam" },
  /* §2, causa 8: a voz do mundo na boca de todos */
  { id: "vozDoMundo", rx: /palavr[aã]o|['‘’]t[aá]['‘’]|['‘’]c[eê]['‘’]|['‘’]pra['‘’]|fala bonito|solto, sujo/iu, de: "§2 causa 8: «COMO AS PESSOAS FALAM» do Taverneiro" },
  /* §2, causa 9 e 6: a razão do Mestre e o rumo como coisa a dizer */
  { id: "razaoDoMestre", rx: /\bo sistema\b|\bpauta\b|\bcomporta\b|aponta para|o pr[oó]ximo passo/iu, de: "§2 causas 6 e 9: o rumo e a razão do Mestre no canal do ator" },
]);

/* a catraca: o texto contra a tabela → [{ id, trecho, de }] */
export function osTiquesDoOficio(texto) {
  const t = str(texto);
  const out = [];
  for (const g of GATILHOS_DE_TIQUE) { const m = t.match(g.rx); if (m) out.push({ id: g.id, trecho: m[0], de: g.de }); }
  return out;
}

/* ---------------- HÁ POUCO ----------------
   As trocas da ficha (`ficha.trocas`: { jogador, mestre }), tal qual. Uma
   troca sem resposta não é memória: fica de fora. */
function oHaPouco(trocas) {
  const L = [];
  for (const tr of arr(trocas)) {
    if (!ehObj(tr)) continue;
    const j = str(tr.jogador).trim(), m = str(tr.mestre).trim();
    if (!m) continue;
    if (j) L.push(`${OFICIO_DO_ATOR.frase}: «${j}»`);
    L.push(`${OFICIO_DO_ATOR.cena}: ${m}`);
  }
  return L.length ? [OFICIO_DO_ATOR.haPouco, ...L].join("\n") : "";
}

/* ---------------- O PEDIDO ----------------
   `entrada`: o que a ficha lê — `{ nota, frase, estado, rolagem }` (a nota
   do turno, a frase do jogador, o estado do fim da montagem; ver o
   cabeçalho de ficha-de-ator.js). Devolve `{ pedido, ficha }`: o pedido à
   rede (a mesma forma do do Mestre) e a ficha, de onde quem chama tira
   `falam` (quem a ficha pôs a falar — a recência do elenco no `ator`). */
export function oPedidoDoAtor(entrada) {
  const ent = ehObj(entrada) ? entrada : {};
  const ficha = aFichaDeAtor(ent);
  const conteudo = [oHaPouco(ficha.trocas), ficha.texto].filter(Boolean).join("\n\n");
  return {
    pedido: { system: oOficioDoAtor(), messages: [{ role: "user", content: conteudo }], ...PEDIDO_AO_ATOR },
    ficha,
  };
}

/* ---------------- A LEITURA ----------------
   O texto que voltou → a prosa. O cerco de código sai; um JSON velho (o
   modelo que ainda responde no molde do Mestre) dá só a narrativa — os
   campos, se vierem, não existem para o ator. Uma linha que é só o
   cabeçalho da ficha («CENA») é eco do pedido, e sai. Nada → "". */
const CABECALHOS = new Set(["CENA", "ACONTECEU", "QUEM ESTÁ", "O QUE SE DIZ", "A ÚLTIMA PALAVRA", "O TOM", "AS FRONTEIRAS", OFICIO_DO_ATOR.haPouco]);
export function aProsaDoAtor(texto) {
  let t = str(texto).replace(/\r\n?/g, "\n").replace(/^\s*```[a-z]*\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();
  if (!t) return "";
  if (t.startsWith("{")) {
    let r = null;
    try { r = extrairJSON(t); } catch { r = null; }
    const n = ehObj(r) && typeof r.narrativa === "string" ? r.narrativa : "";
    /* o resgate de extrairJSON devolve a frase de recurso quando não acha
       narrativa: para o ator, isso é resposta vazia */
    t = n && !/^O Mestre hesita/.test(n) && n !== "…" ? n.trim() : "";
  }
  return t.split("\n").filter((l) => !CABECALHOS.has(l.trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------------- O CAMINHO INTEIRO, SOBRE UMA PORTA ----------------
   `chamar(corpo)` recebe o corpo do /api/narrador (`{ system, messages,
   maxTokens, formato, tarefa }`) e devolve o texto, ou `{ texto }` (o App
   e o servidor têm portas diferentes; as duas servem). Lança o que a porta
   lança. Sem prosa nem na segunda escrita, lança MOTIVO_SEM_NARRATIVA
   (guardado.js), como o Mestre: o turno não aconteceu. `opcoes.frase`: a
   frase do jogador, para a guarda da fala do herói; `opcoes.calou`.
   → { resposta: { narrativa, mudancas: null }, chamadas, retornos } */
export async function aRespostaDoAtor(pedido, chamar, opcoes) {
  const p = ehObj(pedido) ? pedido : {};
  const { frase, calou } = ehObj(opcoes) ? opcoes : {};
  const msgs = arr(p.messages);
  const corpo = { system: p.system, messages: msgs, maxTokens: p.maxTokens, formato: p.formato, tarefa: p.tarefa };
  const retornos = [];
  const ir = async (c) => { const r = await chamar(c); retornos.push(r); return aProsaDoAtor(ehObj(r) ? r.texto : r); };
  let prosa = await ir(corpo);
  if (!prosa) prosa = await ir({ ...corpo, messages: [...msgs, { role: "user", content: OFICIO_DO_ATOR.reforco }] });
  if (!prosa) throw new Error(MOTIVO_SEM_NARRATIVA);
  /* A FALA DO HERÓI É DO JOGADOR (guarda, aberta nos dois modos): a régua
     lê a frase depois da etiqueta do pedido, como lê a do Mestre */
  try {
    const pb = lerOPedido(str(frase));
    const doJogador = pb && pb.doJogador ? pb.texto : "";
    if (doJogador) {
      const podada = semFalaInventada(prosa, `${ETIQUETA_DO_PEDIDO}\n${doJogador}`);
      if (podada.cortadas.length) prosa = podada.narrativa;
    }
  } catch (e) { if (typeof calou === "function") calou("a fala do herói (ator)", e); }
  return { resposta: { narrativa: prosa, mudancas: null }, chamadas: retornos.length, retornos };
}
