/* Função de servidor (Vercel) — o Narrador, roteado por PLANO (v9.466).

   A pessoa decidiu em 13/10, depois de duas rodadas de teste cego de
   provedores (mente/ab-provedores.md): "já que teremos duas assinaturas,
   uma de entrada e a superior, colocamos o modelo barato na de entrada e
   o gpt sol na superior; entretanto agora nos testes e desenvolvimento
   vamos trabalhar apenas com a base."

   Então o Narrador deixa de ter modelo escrito no código. Tem PLANO, e o
   plano diz qual modelo responde — por variável de ambiente, com padrão
   aqui na tabela (PLANOS, logo abaixo):

     plano      variável            padrão                 casa (chave)
     base       NARRADOR_BASE       gemini-3.8-flash       Google direto (GEMINI_API_KEY)
     superior   NARRADOR_SUPERIOR   openai/gpt-5.6-sol     OpenRouter (OPENROUTER_API_KEY)
     cronista   CRONISTA_MODELO     gemini-3.5-flash-lite  Google direto (GEMINI_API_KEY)

   PLANO_PADRAO (padrão "base") é o plano de quem não pede nenhum.

   A CASA SAI DO NOME DO MODELO, não de uma segunda variável: um id com
   barra ("openai/gpt-5.6-sol") é do OpenRouter, "gemini-…" é do Google,
   "deepseek-…" é da DeepSeek. Trocar o modelo de um plano é mudar UMA
   variável na Vercel, e a casa vem junto — duas variáveis para a mesma
   decisão é como esta casa fabrica configuração que se contradiz.

   O SUPERIOR ESTÁ DESLIGADO até existir assinatura. Só se usa quando as
   TRÊS coisas valem: o pedido pede `plano: "superior"`, a chave da casa
   dele existe, e PLANO_SUPERIOR_LIGADO=1 na Vercel. Sem a terceira, o
   pedido cai no base em silêncio — senão qualquer um que abrisse o
   console do navegador escolhia o modelo caro sozinho, e a conta seria
   de quem paga, não de quem pediu.

   A RESERVA. Se o modelo do plano falha (erro, 402, 429, resposta vazia),
   o turno vai para o DeepSeek v4-pro — o Narrador de antes, que já se
   conhece —, e depois para o que houver (RESERVAS). O jogador nunca vê a
   troca: o sistema não fala de si mesmo. Quem investiga vê no corpo da
   resposta (`provedor`, `fila`, `falharam`) e no console do App.

   As chaves ficam AQUI, nas variáveis de ambiente — nunca no navegador.

   O jogo chama POST /api/narrador com
   { system, messages, maxTokens, formato, tarefa, plano }.
   formato "json" liga saída JSON garantida (response_format / responseMimeType).
   tarefa "leve" (livro/resumo/burocracia) vai para o Cronista; o resto
   ("narrador", o padrão) vai para o modelo do plano. */
import { createHmac } from "node:crypto";
import { lerUso } from "../src/custo.js";
import { CACHE_EXPLICITO, decidirOCache } from "../src/janela.js";
import { repararJsonTruncado } from "../src/json.js";

import { deixarEntrar } from "./_portao.js";

/* ---------------- AS CASAS ----------------
   Onde mora a chave de cada provedor, e como reconhecer um modelo dele
   pelo id. A ordem importa: a barra vem primeiro, porque o OpenRouter
   serve também modelos que se chamam "google/gemini-…" e "deepseek/…" —
   e esses pedem a chave do OpenRouter, não a do Google. */
export const PROVEDORES = [
  { id: "openrouter", chave: "OPENROUTER_API_KEY", reconhece: (m) => m.includes("/") },
  { id: "gemini", chave: "GEMINI_API_KEY", reconhece: (m) => m.startsWith("gemini") },
  { id: "deepseek", chave: "DEEPSEEK_API_KEY", reconhece: (m) => m.startsWith("deepseek") },
];
const casaDoModelo = (modelo) => PROVEDORES.find((p) => p.reconhece(String(modelo || "").toLowerCase())) || null;

/* ---------------- OS PLANOS ----------------
   O padrão de cada um é o vencedor do teste cego de 13/10:
   · base — Gemini 3.8 Flash: nota 8,7 contra 6,8 do DeepSeek em produção,
     o único barato melhor em TODOS os critérios (cumpre a pauta 1,92
     contra 1,08). US$ 0,60 por sessão com o cache a 85%.
   · superior — GPT-5.6 Sol: o único que cumpriu tudo (9,4), PT-BR
     impecável; US$ 1,67 por sessão. Medido em só 5 pautas.
   · cronista — era o DeepSeek v4 Flash (~1% da conta). Na 11.ª sessão
     (13/10) a conta da DeepSeek estava SEM SALDO: cada uma das 68
     chamadas leves levou dois 402 (o Flash e o Pro, a mesma conta morta)
     antes de o Gemini 3.8 responder — +US$ 0,19 e +1–2 idas por chamada.
     Agora o Cronista é o Flash-Lite do Google (o 3.5, estável, o mais
     novo da doc em 13/10: 0,30 / 2,50 por milhão, pensamento MINIMAL), e o
     DeepSeek fica só de reserva. Ver SEM_SALDO, logo abaixo.
   O id do Gemini é o da API do Google ("gemini-3.8-flash", estável, sem
   "-preview", conferido na doc oficial em 13/10). */
export const PLANOS = {
  base: { variavel: "NARRADOR_BASE", padrao: "gemini-3.8-flash" },
  superior: { variavel: "NARRADOR_SUPERIOR", padrao: "openai/gpt-5.6-sol", trava: "PLANO_SUPERIOR_LIGADO" },
};
export const CRONISTA = { variavel: "CRONISTA_MODELO", padrao: "gemini-3.5-flash-lite" };

/* A fila de reserva por tarefa. "@base" é o modelo do plano base e
   "@cronista" o do Cronista, sejam eles quais forem na Vercel. Um modelo
   já tentado não entra duas vezes, e um modelo sem chave configurada não
   entra nenhuma. O Narrador ganha o Cronista no FIM da fila: se o 3.8
   Flash bate no limite de taxa (429) e a DeepSeek está sem saldo, o
   Flash-Lite — outra cota, a mesma casa — ainda salva o turno. */
export const RESERVAS = {
  narrador: ["deepseek-v4-pro", "@base", "deepseek-v4-flash", "@cronista"],
  leve: ["deepseek-v4-flash", "@base"],
};

/* A régua da rede. Um 5xx merece UMA retentativa com pausa antes do
   próximo modelo; um 429 não — limite de taxa não passa em 1,2 s, e a
   reserva responde mais depressa do que a segunda tentativa falharia. */
export const REGUA_DA_REDE = { retentaEm: [500, 502, 503, 504], pausaMs: 1200, corpoMax: 250 };

/* SEM SALDO É DA CONTA, NÃO DO MODELO (11.ª sessão). Um 402 diz que a
   CASA não tem crédito: tentar outro modelo da mesma casa no mesmo pedido
   é pagar a ida para ouvir o mesmo não — e foi o que as 68 chamadas leves
   fizeram, duas vezes cada. Um 402 risca a casa da fila por `minutos`
   (na memória da instância da Vercel, que vive entre pedidos enquanto
   está quente; uma instância fria tenta de novo, e é o certo: o saldo
   pode ter voltado). Nunca há segunda tentativa num 402. */
export const SEM_SALDO = { status: [402], minutos: 10 };

/* O CHÃO DO PENSAMENTO, por modelo. O 3.8 Flash não aceita menos que
   LOW (doc do Google, 13/10); o Flash-Lite aceita MINIMAL, e é nele que
   o Cronista roda — burocracia não pede raciocínio, e pensamento é pago
   como saída. Um modelo fora da lista fica no LOW, que todos aceitam. */
export const PISO_DO_PENSAMENTO = [
  { prefixo: "gemini-3.8-flash", nivel: "LOW" },
  { prefixo: "gemini-3.5-flash-lite", nivel: "MINIMAL" },
  { prefixo: "gemini-3.1-flash-lite", nivel: "MINIMAL" },
];
const pisoDoPensamento = (modelo) => (PISO_DO_PENSAMENTO.find((p) => String(modelo).startsWith(p.prefixo)) || { nivel: "LOW" }).nivel;

/* A REDE DE SAÍDA do Narrador no Gemini (11.ª sessão). O tamanho se pede
   na mensagem do turno (escuta.js, TAMANHO_DA_NARRATIVA), que é onde o
   Gemini obedece; o teto aqui é só a rede para o desembestado. No 3.8
   Flash o pensamento CONTA dentro de `maxOutputTokens` (doc do Google),
   e a 11.ª mediu 647 tokens no máximo, pensamento incluído — 1200 não
   corta resposta nenhuma daquelas e corta a que dobrasse. Se cortar, o
   JSON é reparado na última frase (repararJsonTruncado) ou o turno vai à
   reserva; nunca chega quebrado à tela.

   UMA REDE POR TAREFA (12.ª sessão, 19/10). A linha antiga aplicava os
   1200 a TODA tarefa que não fosse `leve` — e o Léxico (a leitura do
   mundo, uma vez por campanha) pensa uns 5 mil tokens antes de escrever.
   No 3.8 Flash o pensamento conta dentro do teto: o Gemini morreu por
   MAX_TOKENS em toda campanha, a reserva (DeepSeek v4 pro) escreveu o
   mundo, e a criação esperou 57 s. A rede é do Narrador de turno; quem
   não está na tabela vai ao teto que pediu (`maxTokens`, já limitado a
   8192 acima). O Léxico manda a sua tarefa ("lexico"), e não tem rede.

   E A RESPOSTA CORTADA PELA REDE NÃO É A DO "…" (a mesma sessão). Das 27
   respostas, a maior saída medida foi 778 tokens (a abertura, pensamento
   incluído) e a maior de turno 453 — nenhuma chegou perto dos 1200. Os
   seis finais em "…" são o fecho `silencio` (fecho.js: "deixa uma fala a
   meio, e a resposta acaba nela"), pedido pelo sistema. Para a próxima
   sessão poder separar as duas coisas, a resposta que a rede aparar
   chega marcada (`uso.aparado`), e custo.js conta-as. */
export const REDE_DE_SAIDA = { narrador: 1200 };
export const redeDaTarefa = (tarefa, teto) => {
  const rede = Number(REDE_DE_SAIDA[String(tarefa || "narrador")]) || 0;
  return rede ? Math.min(teto, rede) : teto;
};

const modeloDe = (entrada, env) => String(env[entrada.variavel] || entrada.padrao).trim();

/* A memória da instância: as casas riscadas por falta de saldo, e até
   quando o cache explícito descansa depois de uma falha. Substituídas,
   nunca mutadas. */
let casasSemSaldo = {};
let explicitoDescansaAte = 0;

/* O plano que vale para este pedido — nunca o superior sem a trava. */
export function planoDoPedido(pedido, env = process.env) {
  const e = env || {};
  const pedidoNome = pedido && typeof pedido === "object" ? pedido.plano : null;
  const nome = String(pedidoNome || e.PLANO_PADRAO || "base").toLowerCase();
  if (nome !== "superior") return "base";
  const casa = casaDoModelo(modeloDe(PLANOS.superior, e));
  const ligado = String(e[PLANOS.superior.trava] || "") === "1";
  return ligado && casa && e[casa.chave] ? "superior" : "base";
}

/* A ROTA: a lista ordenada de { provedor, modelo } que este pedido vai
   tentar. É função pura do pedido, do ambiente e das casas sem saldo
   (`semSaldo`: casa → até quando, em ms; `agora` entra por argumento) — a
   suíte a prova sem rede nenhuma. */
export function rotaDoPedido(pedido, env = process.env, opcoes = {}) {
  const e = env || {};
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const riscadas = o.semSaldo && typeof o.semSaldo === "object" ? o.semSaldo : {};
  const agora = Number(o.agora) || 0;
  const leve = !!(pedido && typeof pedido === "object" && pedido.tarefa === "leve");
  const plano = planoDoPedido(pedido, e);
  const apelidos = { "@base": modeloDe(PLANOS.base, e), "@cronista": modeloDe(CRONISTA, e) };
  const primeiro = leve ? apelidos["@cronista"] : modeloDe(PLANOS[plano], e);
  const candidatos = [primeiro, ...RESERVAS[leve ? "leve" : "narrador"].map((m) => apelidos[m] || m)];
  const passos = [], vistos = new Set();
  for (const modelo of candidatos) {
    const casa = casaDoModelo(modelo);
    if (!modelo || vistos.has(modelo) || !casa || !e[casa.chave]) continue;
    if (Number(riscadas[casa.id]) > agora) continue;
    vistos.add(modelo);
    passos.push({ provedor: casa.id, modelo });
  }
  return { plano, passos };
}

/* ---------------- A FICHA DO CACHE EXPLÍCITO ----------------
   O jogo guarda o nome do cache e devolve-o no turno seguinte (a conta e
   o porquê moram em janela.js, CACHE_EXPLICITO). O selo é um HMAC com a
   chave do Google, que só o servidor conhece: uma ficha que o navegador
   inventasse — apontando para um cache que não é desta conversa — não
   passa daqui. */
const CAMPOS_DA_FICHA = ["nome", "modelo", "m", "impressao", "criado", "expira", "tokens"];
const seloDe = (f, segredo) => createHmac("sha256", String(segredo)).update(JSON.stringify(CAMPOS_DA_FICHA.map((k) => f[k]))).digest("hex");
function selarFicha(f, segredo) {
  const limpa = Object.fromEntries(CAMPOS_DA_FICHA.map((k) => [k, f[k]]));
  return { ...limpa, selo: seloDe(limpa, segredo) };
}
function lerFicha(bruta, segredo) {
  if (!segredo || !bruta || typeof bruta !== "object" || typeof bruta.selo !== "string") return null;
  if (typeof bruta.nome !== "string" || !/^cachedContents\/[A-Za-z0-9_-]+$/.test(bruta.nome)) return null;
  return seloDe(bruta, segredo) === bruta.selo ? bruta : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  /* v9.155: O PORTAO. Sem ele esta rota respondia a internet inteira —
     e quem achasse a URL gastaria as chaves de graca, sem nem abrir o
     jogo. Vem antes de tudo: nao se paga pela contagem de um robo. */
  { const p = await deixarEntrar(req); if (!p.ok) { res.status(p.status).json({ erro: p.erro, motivo: p.motivo, origem: p.origem }); return; } }
  try {
    const corpo = req.body || {};
    const { system, messages, maxTokens, formato, tarefa } = corpo;
    if (!system || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ erro: "Pedido inválido" }); return;
    }
    const teto = Math.min(Math.max(Number(maxTokens) || 1500, 800), 8192);
    const emJson = formato === "json";
    const env = process.env;
    const agora = Date.now();
    const leve = tarefa === "leve";
    /* o cache explícito é OPT-IN: só o turno do Narrador (chamarMestre)
       manda o campo `cache` — um objeto, vazio no primeiro turno. Outra
       chamada do Narrador, com outro system, trocaria o cache da conversa
       por um seu a cada vez. */
    const querCache = !leve && corpo.cache && typeof corpo.cache === "object" && String(env.GM_CACHE_EXPLICITO || "1") !== "0";
    const fichaRecebida = querCache ? lerFicha(corpo.cache, env.GEMINI_API_KEY) : null;

    const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
    /* Um pedido, com a retentativa da régua. Devolve a resposta boa, ou o
       erro no formato que `guardado.js` lê ("<modelo>: <status>" e o
       começo do corpo — é nele que viaja o "insufficient balance"). */
    const pedir = async (modelo, fazer) => {
      let r = null;
      for (let tentativa = 0; tentativa < 2; tentativa++) {
        r = await fazer();
        if (r.ok) return { r };
        if (tentativa === 0 && REGUA_DA_REDE.retentaEm.includes(r.status)) { await pausa(REGUA_DA_REDE.pausaMs); continue; }
        break;
      }
      const txt = await r.text().catch(() => "");
      return { erro: `${modelo}: ${r.status}`, status: r.status, corpo: String(txt || "").slice(0, REGUA_DA_REDE.corpoMax) };
    };
    const msgsOpenAI = () => [{ role: "system", content: String(system) },
      ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") }))];
    const textoOpenAI = (data) => (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

    /* ---------- DeepSeek (OpenAI-compatível) ----------
       Hoje: o Cronista (v4-flash) e a reserva do Narrador (v4-pro).
       Thinking DESLIGADO: raciocínio oculto queima tokens de saída e atrasa a
       narrativa sem ganho visível para mestre de RPG com regras por código. */
    const chamarDeepSeek = async (modelo) => {
      const p = await pedir(modelo, () => fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: msgsOpenAI(),
          max_tokens: teto,
          /* TEMPERATURA POR TAREFA. A burocracia (livro/resumo) fica a
             0.3: ali criatividade é defeito — queremos fidelidade aos fatos.

             v9.45 — O NARRADOR DESCE DE 1.1 PARA 0.85. A recomendação de
             1.3 para "escrita criativa" é dada para inglês, prosa livre e
             prompt curto. Aqui não é nada disso: é português, é saída em
             JSON e o prompt de sistema passa de 90 mil caracteres. Nessas
             três condições a temperatura alta para de produzir surpresa e
             passa a produzir ERRO DE SINTAXE — o jogador mandou uma
             captura com "o Arco tinha fome; a laje esta; o segundo andar
             mordiscava à toa" e "Nicolau se interessa por ninguém e por
             dívida", frases que não querem dizer nada e não são escolha
             estilística de ninguém.

             v9.75 — SOBE PARA 1.0, a pedido de quem joga: "o narrador
             ficou muito contido". O relato é o outro lado da mesma moeda
             da v9.45, e as duas coisas são verdade ao mesmo tempo — a
             janela entre "contido" e "agramatical" é estreita neste jogo,
             e 1.0 fica dentro dela por pouco. É meio degrau abaixo do
             1.1 que produziu as frases quebradas, e o prompt de sistema
             encolheu bastante desde então (58,7k na cena comum contra os
             90k daquela época), o que dá mais folga.

             SE VOLTAR A SAIR PROSA QUEBRADA, o conserto não pede
             redeploy: DS_TEMPERATURA desce para 0.9 na Vercel e vale no
             pedido seguinte. É variável de ambiente justamente para isso. */
          temperature: tarefa === "leve" ? 0.3 : Number(env.DS_TEMPERATURA || 1),
          /* ---------------- A REPETIÇÃO TEM ALAVANCA PRÓPRIA (v9.75) ----------------
             "Fica sempre repetindo coisas" é a outra metade da queixa, e
             temperatura é o remédio errado para ela: temperatura mexe no
             quanto o modelo ARRISCA, não no quanto ele se repete. Quem
             mexe nisso é a penalidade de frequência, que cobra do modelo
             cada vez que ele reusa um token que já usou — é ela que
             desmancha o tique de reabrir toda cena com o mesmo cheiro de
             cevada e o mesmo "o salão prende a respiração".

             0.3 é conservador de propósito. Penalidade alta em português
             estraga a concordância (o modelo foge das preposições e dos
             artigos que ele já gastou), e este canal devolve JSON — o
             mesmo risco que derrubou a temperatura na v9.45. A presença
             fica em 0: ela empurra o modelo para ASSUNTOS novos, e assunto
             novo é justamente o que ele não pode inventar aqui. */
          frequency_penalty: Number(env.DS_PENALIDADE || 0.3),
          presence_penalty: 0,
          thinking: { type: "disabled" },
          ...(emJson ? { response_format: { type: "json_object" } } : {}),
        }),
      }));
      if (!p.r) return p;
      const data = await p.r.json();
      const texto = textoOpenAI(data);
      const uso = lerUso(data);
      return texto ? { texto, uso: uso ? { ...uso, modelo: data.model || modelo } : null } : { erro: "resposta vazia", corpo: "" };
    };

    /* ---------- Google Gemini (o plano base) ---------- */
    const chamarGemini = async (modelo) => {
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));
      /* v9.75: o Gemini também obedece à mesma régua. Ele nunca teve
         temperatura nenhuma configurada — rodava no padrão da casa do
         Google —, e por isso trocar de provedor trocava o tom do narrador
         sem que nada no jogo tivesse mudado. */
      const generationConfig = {
        maxOutputTokens: redeDaTarefa(tarefa, teto),
        /* O PENSAMENTO NO CHÃO (v9.466). Os tokens de pensamento do Gemini
           são cobrados como SAÍDA (US$ 3,75/M no 3.8 Flash), e o teste cego
           correu sem eles. Pela doc do Google (13/10), o 3.8 Flash aceita só
           LOW, MEDIUM e HIGH — o MINIMAL dos Flash anteriores ele recusa, e
           desligar de todo não existe na família 3. LOW é o chão. Se um dia
           o NARRADOR_BASE for um modelo que aceite menos, GM_PENSAMENTO
           desce sem redeploy. */
        thinkingConfig: { thinkingLevel: String((leve ? env.CRONISTA_PENSAMENTO : env.GM_PENSAMENTO) || pisoDoPensamento(modelo)) },
        /* ---------------- O MESMO NÚMERO NÃO É A MESMA COISA (v9.115) ----------------
           A v9.75 pôs os dois provedores sob a mesma régua, e a razão escrita
           era boa: "duas configurações para a mesma decisão é a mesma coisa
           que duas portas para a mesma regra". Só que aqui não são duas
           portas para a mesma regra — são duas ESCALAS diferentes com o
           mesmo nome. `frequency_penalty` da OpenAI e `frequencyPenalty` do
           Gemini não têm a mesma unidade nem o mesmo efeito, e 0,3 num não
           quer dizer 0,3 no outro. Copiar o número entre os dois é a mesma
           classe de erro que copiar uma tabela de peso: parece uma regra só,
           e são duas contas.

           E o risco não é hipotético neste arquivo: o comentário do DeepSeek
           logo acima já avisa que penalidade alta em português "estraga a
           concordância — o modelo foge das preposições e dos artigos que ele
           já gastou". É exatamente o defeito que o jogador relatou. No
           Gemini, que ninguém nunca mediu, ela vai a ZERO: a anti-repetição
           que ela comprava vale menos do que a gramática que ela pode custar,
           e o Gemini repete menos que o DeepSeek de saída.

           v9.466 — E A ZERO ELA NEM VIAJA. O teste cego de 13/10 correu o
           3.8 Flash a 0,85 e sem penalidade (e foi o melhor barato), e o
           OpenRouter nem lista `frequency_penalty` entre os parâmetros que
           ele aceita: há modelos Gemini que devolvem 400 só por o campo
           existir. Um 400 aqui mandaria TODO turno para a reserva, em
           silêncio. Então o campo só vai quando GM_PENALIDADE pede um
           número diferente de zero. */
        temperature: tarefa === "leve" ? 0.3 : Number(env.GM_TEMPERATURA || 0.85),
      };
      const penalidade = Number(env.GM_PENALIDADE || 0);
      if (penalidade) generationConfig.frequencyPenalty = penalidade;
      if (emJson) generationConfig.responseMimeType = "application/json";
      const safetySettings = [
        "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT",
      ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" }));
      /* O CACHE DO GEMINI. O implícito (o Google relê sozinho o prefixo
         que já viu) creditou na 11.ª sessão só o `system` — 25,4%. Quando o
         turno pede (`querCache`), entra o EXPLÍCITO: a decisão é de
         janela.js (decidirOCache), e aqui só se fala com o Google. Tudo o
         que falhar no cache cai no pedido inteiro de sempre — o cache
         nunca pode custar o turno. */
      const API = "https://generativelanguage.googleapis.com/v1beta";
      const cab = { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY };
      const inteiro = { systemInstruction: { parts: [{ text: system }] }, contents, generationConfig, safetySettings };
      let usado = null, devolver, escrita = 0, guardado = 0, apagar = null, novo = null;
      if (querCache && env.GEMINI_API_KEY && agora >= explicitoDescansaAte && modelo === rota.passos[0].modelo) {
        const dec = decidirOCache({ ficha: fichaRecebida, system, mensagens: messages, agora, modelo });
        devolver = fichaRecebida;
        if (dec.acao === "usar") usado = { nome: fichaRecebida.nome, m: dec.m };
        else if (dec.acao === "criar") {
          const r = await fetch(`${API}/cachedContents`, {
            method: "POST", headers: cab,
            body: JSON.stringify({ model: `models/${modelo}`, systemInstruction: inteiro.systemInstruction, contents: contents.slice(0, dec.m), ttl: `${CACHE_EXPLICITO.ttlSegundos}s` }),
          }).catch(() => null);
          const d = r && r.ok ? await r.json().catch(() => null) : null;
          if (d && typeof d.name === "string") {
            escrita = Number(d.usageMetadata && d.usageMetadata.totalTokenCount) || 0;
            novo = d.name;
            usado = { nome: d.name, m: dec.m };
            devolver = selarFicha({ nome: d.name, modelo, m: dec.m, impressao: dec.impressao, criado: agora, expira: agora + CACHE_EXPLICITO.ttlSegundos * 1000, tokens: escrita }, env.GEMINI_API_KEY);
            apagar = dec.apagar;
          } else {
            /* o Google recusou o cache: o turno segue inteiro, e o explícito
               descansa — senão cada turno pagaria a ida que falha */
            explicitoDescansaAte = agora + SEM_SALDO.minutos * 60000;
          }
        } else { apagar = dec.apagar; devolver = null; }
        /* o cache trocado é apagado na hora: o Google cobra a GUARDA por
           hora, e um cache que ninguém mais lê não pode ficar a cobrar */
        if (apagar && fichaRecebida && apagar === fichaRecebida.nome) {
          guardado = (Number(fichaRecebida.tokens) || 0) * Math.max(0, agora - Number(fichaRecebida.criado)) / 3.6e6;
        }
      }
      const gerar = (corpoDoPedido) => pedir(modelo, () => fetch(`${API}/models/${modelo}:generateContent`, { method: "POST", headers: cab, body: JSON.stringify(corpoDoPedido) }));
      const apagando = apagar ? fetch(`${API}/${apagar}`, { method: "DELETE", headers: cab }).catch(() => null) : null;
      let p = await gerar(usado ? { cachedContent: usado.nome, contents: contents.slice(usado.m), generationConfig, safetySettings } : inteiro);
      if (usado && !p.r && [400, 403, 404].includes(p.status)) {
        /* o cache sumiu (expirou, foi apagado) ou o Google o recusou: o
           mesmo turno, inteiro, e a ficha morre com ele */
        explicitoDescansaAte = novo ? agora + SEM_SALDO.minutos * 60000 : explicitoDescansaAte;
        if (novo) fetch(`${API}/${novo}`, { method: "DELETE", headers: cab }).catch(() => null);
        devolver = null;
        p = await gerar(inteiro);
      }
      if (apagando) await apagando;
      if (!p.r) return p;
      const data = await p.r.json();
      const cand = data.candidates && data.candidates[0];
      let texto = ((cand && cand.content && cand.content.parts) || []).filter((x) => !x.thought).map((x) => x.text || "").filter(Boolean).join("\n");
      /* a rede de saída cortou: repara na última frase, ou vai à reserva */
      const aparado = !!(texto && emJson && cand && cand.finishReason === "MAX_TOKENS");
      if (aparado) texto = repararJsonTruncado(texto);
      const uso = lerUso(data);
      /* 12.ª sessão: a tentativa que falhou também pagou (o pensamento é
         cobrado como saída) — o uso vai junto do erro, e o jogo soma-o */
      if (!texto) return { erro: `sem texto (${(cand && cand.finishReason) || (data.promptFeedback && data.promptFeedback.blockReason) || "vazio"})`, corpo: "", uso: uso ? { ...uso, ...(escrita ? { escrita } : {}), modelo: data.modelVersion || modelo } : null };
      const extra = { ...(escrita ? { escrita } : {}), ...(guardado ? { guardado } : {}), ...(aparado ? { aparado: true } : {}) };
      return { texto, cache: devolver, uso: uso ? { ...uso, ...extra, modelo: data.modelVersion || modelo } : null };
    };

    /* ---------- OpenRouter (o plano superior) ----------
       OpenAI-compatível, como o DeepSeek. Só o superior passa por aqui —
       o base vai direto ao Google, que é mais barato e tem cache implícito
       sem intermediário. Os cabeçalhos HTTP-Referer e X-Title são os que o
       OpenRouter recomenda para identificar o aplicativo. */
    const chamarOpenRouter = async (modelo) => {
      const site = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || "";
      const ordem = String(env.OR_PROVEDORES || "").split(",").map((s) => s.trim()).filter(Boolean);
      const p = await pedir(modelo, () => fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          ...(site ? { "HTTP-Referer": `https://${String(site).replace(/^https?:\/\//, "")}` } : {}),
          "X-Title": "Taverna",
        },
        body: JSON.stringify({
          model: modelo,
          messages: msgsOpenAI(),
          max_tokens: teto,
          /* A temperatura do teste cego (0,85), e sem penalidade: o GPT-5.6
             Sol não lista nenhuma das duas entre os parâmetros que aceita,
             e o OpenRouter descarta em silêncio o que o modelo não aceita —
             por isso NÃO vai `require_parameters`, que transformaria isso
             num erro. O raciocínio desligado é o mesmo do teste (0 tokens
             de raciocínio em todos os modelos). */
          temperature: tarefa === "leve" ? 0.3 : Number(env.OR_TEMPERATURA || 0.85),
          reasoning: { enabled: false },
          usage: { include: true },
          ...(ordem.length ? { provider: { order: ordem, allow_fallbacks: true } } : {}),
          ...(emJson ? { response_format: { type: "json_object" } } : {}),
        }),
      }));
      if (!p.r) return p;
      const data = await p.r.json();
      const texto = textoOpenAI(data);
      const uso = lerUso(data);
      return texto ? { texto, uso: uso ? { ...uso, modelo: data.model || modelo } : null } : { erro: "resposta vazia", corpo: "" };
    };

    const CHAMAR = { deepseek: chamarDeepSeek, gemini: chamarGemini, openrouter: chamarOpenRouter };
    const rota = rotaDoPedido(corpo, env, { semSaldo: casasSemSaldo, agora });
    if (!rota.passos.length) {
      const riscadas = Object.keys(casasSemSaldo).filter((k) => casasSemSaldo[k] > agora);
      res.status(riscadas.length ? 502 : 500).json({ erro: riscadas.length ? `Todos os provedores falharam — sem saldo: ${riscadas.join(", ")} (402)` : "Nenhuma chave configurada (GEMINI_API_KEY / DEEPSEEK_API_KEY / OPENROUTER_API_KEY)" });
      return;
    }

    const tentativas = [];
    /* 12.ª sessão: o que as tentativas que falharam gastaram — a conta do
       save (custo.js) via só a que respondeu */
    const perdidos = [];
    for (const passo of rota.passos) {
      /* a casa que disse 402 NESTE pedido não é tentada outra vez nele */
      if (Number(casasSemSaldo[passo.provedor]) > agora) continue;
      const out = await CHAMAR[passo.provedor](passo.modelo);
      if (!out.texto && SEM_SALDO.status.includes(out.status)) casasSemSaldo = { ...casasSemSaldo, [passo.provedor]: agora + SEM_SALDO.minutos * 60000 };
      /* QUEM ESTAVA NA FILA, e não só quem respondeu (v9.116).

         Custou uma investigação inteira: o cliente no ar já tinha o código
         de hoje, o pedido pedia `gemini`, e a resposta vinha `deepseek`.
         O único ramo que produz isso é a fila não TER o gemini — mas de
         fora não havia como distinguir "não configurado" de "configurado e
         falhou em silêncio", porque as duas coisas devolvem a mesma
         palavra. Uma linha aqui responde as duas para sempre.

         E `falharam` responde a pergunta seguinte, que so apareceu depois:
         a fila TINHA o gemini, ele estava na FRENTE, e mesmo assim quem
         respondeu foi o deepseek. Ou seja, o reserva foi tentado e caiu —
         em silencio, porque so o 502 (todos falharam) contava o motivo. Um
         reserva que nunca funciona nao e um reserva: e um jogo sem Mestre
         no dia em que o primeiro sair do ar.

         v9.466: a fila diz também o MODELO de cada passo, e a resposta diz
         o plano — com dois modelos na mesma casa (o Cronista e a reserva
         são os dois DeepSeek), o nome da casa sozinho já não responde. */
      /* a ficha do cache volta sempre a quem a pediu: a nova, a mesma, ou
         nula (morreu); se quem respondeu foi a reserva, a que veio */
      const ficha = querCache ? { cache: out.cache !== undefined ? out.cache : fichaRecebida } : {};
      const gastos = perdidos.length ? { perdidos } : {};
      if (out.texto) { res.status(200).json({ texto: out.texto, provedor: passo.provedor, plano: rota.plano, fila: rota.passos.map((x) => `${x.provedor}:${x.modelo}`), falharam: tentativas, ...ficha, ...gastos, uso: out.uso ? { ...out.uso, tarefa: tarefa || "narrador" } : null }); return; }
      if (out.uso) perdidos.push({ ...out.uso, tarefa: tarefa || "narrador" });
      tentativas.push(`${passo.provedor} (${out.erro}${out.corpo ? `: ${out.corpo}` : ""})`);
    }
    res.status(502).json({ erro: `Todos os provedores falharam — ${tentativas.join(" · ")}`.slice(0, 400), ...(perdidos.length ? { perdidos } : {}) });
  } catch (e) {
    res.status(500).json({ erro: String((e && e.message) || e).slice(0, 200) });
  }
}
