/* ============================================================
   A MESA QUE FECHA O BURACO (Fase 4, trilha B · 29/10/2026) — src/mesa-do-buraco.js

   O Juiz de fidelidade apanha os números que a prosa inventa; a correção
   (motor/correcao-do-juiz.js) veta o que CONTRADIZ o sistema. A medida
   dela deixou a outra metade escrita: dos 28 números inventados que o Juiz
   apanha no corpus rotulado, 23 não contradizem nada — o turno não trouxe o
   número, e o Mestre pôs um. O pouso, a comida, a distância até um sítio
   que o mapa conhece. O veto não cura isto (não há verdade para dar depois);
   cura-o a mesa trazer o número ANTES de o Mestre falar.

   As fichas da mesa já existem e respondem quase tudo: o pouso e a
   distância (cidade-por-dentro.js#fichaParaPauta), a caneca e o prato
   (mercado.js#precoComumParaPauta), a banca e o balcão. O buraco está nas
   PALAVRAS que elas não ouvem, e nos NOMES pela metade:

   · "quanto custa uma cama para as duas?" — a cama não é "quarto",
     "estalagem" nem "pernoite": PERGUNTAS_DA_CIDADE não a ouvia, e o pouso
     ficava de fora (a 8.ª, M47; a 9.ª, M3 e M35; a 11.ª, M18 e M63);
   · "quanto tempo a pé daqui até Pedra Rasa?" — "quanto tempo a pé" não é
     pergunta de distância para a ficha, e o mapa chama-lhe "Cerco de Pedra
     Rasa" (a 8.ª, M71);
   · "quanto tempo leva a pé até a forja do Tomas?" — a forja do Tomas é a
     Ferraria do Leste, o sítio onde o registo de gente põe o Tomas (a 9.ª, M2);
   · "quanto ele cobra para afiar minha faca?" — afiar é o reparo simples
     da tabela, com outro verbo (a 9.ª, M7); "há taxa para entrar de noite?"
     é o pedágio da porta (a 8.ª, M45);
   · "procuro uma espada longa. Pergunto quanto custa a melhor que ele tem"
     — a espada está na oração de antes da pergunta, e a banca só procura
     na mesma (a 10.ª, M67: o estoque não tinha espada, e o Mestre vendeu-a
     por cem).

   Esta peça é o segundo ouvido: corre DEPOIS das fichas, com o que elas
   já responderam (`ja`), e só fala do que ficou sem resposta. Cada linha
   sai da conta de quem a tem — a linha do pouso de cidade-por-dentro, a da
   distância de cidade-por-dentro, o preço comum de mercado.js, a banca de
   mercado.js. NENHUM número nasce aqui: a tabela abaixo só diz que
   palavras são que coisa.

   ---------------- O PORTÃO MORDE SÓ O NECESSÁRIO ----------------

   Só com a pergunta: o pouso e o serviço precisam de uma pergunta de preço
   ou de um pedido na frase ("quanto", "cobra", "peço"); a distância, de uma
   pergunta de caminho ("quanto tempo", "a que distância", "como se chega").
   "Subo para o quarto e durmo" não leva o preço do quarto. E nunca o que
   uma ficha já disse: se o PERGUNTOU já tem "pouso:", o pouso não volta.

   A linha vai na secção PERGUNTOU (prio 4) pela mesma junta das outras
   (`juntarRespostas`, perguntas.js, até RESPOSTAS_DA_MESA): é resposta ao
   que se perguntou, e corta como as respostas cortam. Nenhum bloco
   estático: o teto de ~82 mil não se mexe; o TETO_DA_PAUTA corta pela
   prioridade como corta tudo. A medida (testes/teste-mesa-do-buraco.mjs):
   quantos dos 23 a mesa fecha, em quantas frases dos turnos gravados a
   linha entra, e o que ela tira nas 204 pautas cheias da 5.ª à 7.ª.

   ---------------- O QUE SAI ----------------

     MESA_DO_BURACO                         → a tabela (as palavras e os limites)
     oQueAMesaFecha(frase, ctx)             → { pergunta, em, fechou }

   `ctx`: { cidade (a cidade do mapa), mapa, semente, lex, genero, molde,
   aqui (o ponto do herói), gente ([{ nome, local }]: o registo), bancas (as
   da cena), moeda, fator (o do pouso), ja ([{ pergunta }]: as fichas que já
   responderam), luta }. Puro e determinista: não há sorte nesta decisão.
   Lixo (`null`, `{}`, listas tortas) dá o vazio, nunca lança.
   ============================================================ */

import { fichaDaCidade, linhaDoPouso, lugaresComDistancia, distanciaAte } from "./cidade-por-dentro.js";
import { precoComumParaPauta, mercadoParaPauta, PERGUNTA_DE_PRECO } from "./mercado.js";
import { fraseDoJogador } from "./perguntas.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const semArtigo = (s) => String(s).replace(/^(o|a|os|as)\s+/, "").trim();

/* ---------------- A TABELA ----------------
   `pedePreco`: a frase pergunta um preço ou pede a coisa (o pouso e o
   serviço só sobem com ela). `perguntaCaminho`: a frase pergunta a
   distância ou o tempo até um sítio. `pouso`: as palavras do pouso que a
   ficha da cidade não ouve (a dela segue a valer: esta só fala quando ela
   calou). `servicos`: o verbo que é uma linha de PRECOS_COMUNS com outra
   palavra — `como` é o id da linha, `palavra` o que a tabela dela ouve.
   `cabecas`: a palavra genérica à frente de um nome ("Cerco de Pedra
   Rasa") que o jogador corta. `casaDe`: a palavra que faz de uma pessoa um
   sítio ("a forja do Tomas"). `porTurno`: linhas desta peça num turno.
   `minimo`: o pedaço de nome mais curto que conta (letras). */
export const MESA_DO_BURACO = Object.freeze({
  pedePreco: /\b(quanto|quantos|qual (e )?o preco|que preco|o preco|a quanto|por quanto|cobra|cobras|cobram|cobraria|custa|custam|custaria|sai por|pago|pagar|peco|pedimos|quero|queremos)\b/,
  /* «onde fica X?» não abre a porta sozinho (é o portão de `perguntaCaminho`),
     mas faz do X um sítio perguntado quando a frase pede o caminho — a 13.ª,
     T7: «Esse poço fundo, onde fica? E a Fenda… quanto tempo de marcha?» */
  ondeFica: /\b(onde (e que )?fica(m)?|onde (e|sao)( que)? (o|a|os|as))\b/,
  perguntaCaminho: /\b(quanto tempo|a que distancia|que distancia|distancia (ate|de|daqui|ao|a|para|pra)|como se chega|como (eu )?chego|como (a gente|nos) chega|que caminho|qual (o )?caminho|quanto falta|quao longe|(fica|e|esta) (longe|perto)|longe daqui|perto daqui|quantos dias|quantas horas|a quantos (passos|metros|km|quilometros|dias|horas|minutos|leguas))\b/,
  pouso: Object.freeze({
    rx: /\b(camas?|pouso|quartos?|dormir|pernoitar|pernoite|estalagem|hospedagem|pousada|diaria)\b/,
    porque: "a cama é o pouso: a 8.ª (M47), a 9.ª (M3, M35) e a 11.ª (M18, M63) perguntaram «uma cama» e o pouso ficou de fora",
  }),
  servicos: Object.freeze([
    Object.freeze({ id: "afiar", rx: /\b(afia(r|ria|s|ndo)?|amola(r|ria)?|afiacao|amolar)\b/, como: "reparo", palavra: "reparo",
      porque: "afiar uma lâmina é o reparo simples do ofício (a 9.ª, M7: «uma moeda»)" }),
    Object.freeze({ id: "portao", rx: /\b(taxa (para|pra|de) (entrar|passar)|pagar (para|pra) entrar|(taxa|imposto) (do|da|no|na) (portao|porta|muralha)|para entrar de noite)\b/, como: "pedagio", palavra: "pedagio",
      porque: "a taxa de entrar é o pedágio da porta (a 8.ª, M45: «dez escamas»)" }),
  ]),
  cabecas: Object.freeze(["cerco", "vila", "aldeia", "cidade", "forte", "fortaleza", "porto", "santuario", "templo", "torre", "mina", "minas", "ruinas", "ruina", "cripta", "caverna", "gruta", "bosque", "floresta", "vale", "ponte", "passo", "vau", "posto", "campo", "campos", "ferraria", "estalagem", "taverna", "mercado", "praca", "casa", "poco"]),
  casaDe: /\b(forja|ferraria|oficina|loja|banca|tenda|casa|taverna|estalagem|botica|barraca|cabana|quarto|morada)\s+d[oae]s?\s+$/,
  /* a oração de antes da pergunta só empresta a mercadoria quando a
     procura ("procuro uma espada longa"); "a anã da lança" não pede lança */
  procura: /\b(procur\w*|quero|queria|preciso|precisava|busco|buscando)\b/,
  porTurno: 2,
  minimo: 5,
});

/* a primeira posição, em fronteira de palavra, de `alvo` em `t` (ambos sem acento) */
function citado(t, alvo) {
  const a = String(alvo || "").trim();
  if (a.length < 3) return -1;
  let i = t.indexOf(a);
  while (i >= 0) {
    const antes = i > 0 ? t[i - 1] : " ", depois = t[i + a.length] || " ";
    if (!/[a-z0-9]/.test(antes) && !/[a-z0-9]/.test(depois)) return i;
    i = t.indexOf(a, i + 1);
  }
  return -1;
}

/* os pedaços pelos quais o jogador chama um nome: inteiro, sem o artigo,
   e sem a cabeça genérica ("Cerco de Pedra Rasa" → "pedra rasa") */
function pedacosDoNome(nome) {
  const n = semArtigo(norm(nome).replace(/\s+/g, " ").trim());
  const out = [n];
  const m = n.match(/^(\S+)\s+d[oae]s?\s+(.+)$/);
  if (m && MESA_DO_BURACO.cabecas.includes(m[1]) && m[2].length >= MESA_DO_BURACO.minimo) out.push(semArtigo(m[2]));
  return out;
}

/* OS SÍTIOS de que a frase pergunta o caminho — TODOS, pela ordem da frase.
   Até à 13.ª sessão era UM: «Esse poço fundo, onde fica? E a Fenda de
   Silêncio… qual é o caminho e quanto tempo de marcha?» (T7) levou a
   distância do poço e deixou a Fenda à imaginação do Mestre, que disse
   «quatro horas» de cabeça. Cada sítio sai por uma de três vias:
     1. o nome (ou o pedaço dele, sem a cabeça genérica);
     2. a cabeça sozinha, quando um só nome a tem («o santuário»);
     3. a casa de uma pessoa do registo («a forja do Tomas» → o local dele).
   Um trecho da frase só serve a um sítio: o que um nome já cobriu não volta
   pela cabeça nem pela casa, e o NOME DA CIDADE ONDE SE ESTÁ não é destino
   — «saindo de Porto das Pedras» não pergunta por Porto dos Barões, mesmo
   que «porto» seja a cabeça só dele. A cabeça seguida de «de/do/da» é
   OUTRO nome («o santuário do vau» que o mapa não tem): não se troca pelo
   único santuário que ele tem. */
function osDestinos(t, nomes, gente, aqui) {
  const achados = [];
  const tapados = [];
  const tapa = (i, tam) => tapados.push([i, i + tam]);
  const tapado = (i, tam) => tapados.some(([a, b]) => i < b && i + tam > a);
  /* onde se está não é para onde se vai */
  const casa = semArtigo(norm(aqui || "").replace(/\s+/g, " ").trim());
  if (casa.length >= 3) {
    for (let i = t.indexOf(casa); i >= 0; i = t.indexOf(casa, i + 1)) {
      const antes = i > 0 ? t[i - 1] : " ", depois = t[i + casa.length] || " ";
      if (!/[a-z0-9]/.test(antes) && !/[a-z0-9]/.test(depois)) tapa(i, casa.length);
    }
  }
  const ver = (nome, i, tam) => {
    if (i < 0 || tapado(i, tam) || achados.some((a) => norm(a.nome) === norm(nome))) return;
    achados.push({ nome, i, tam }); tapa(i, tam);
  };
  /* 1. pelo nome: em cada nome, o pedaço que aparece primeiro (o maior no empate);
     os nomes pelos maiores primeiro, para «Lobo Atroz» tapar «Lobo» */
  const porNome = [];
  for (const nome of nomes) {
    let m = null;
    for (const p of pedacosDoNome(nome)) { const i = citado(t, p); if (i >= 0 && (!m || i < m.i || (i === m.i && p.length > m.tam))) m = { nome, i, tam: p.length }; }
    if (m) porNome.push(m);
  }
  porNome.sort((a, b) => b.tam - a.tam || a.i - b.i).forEach((m) => ver(m.nome, m.i, m.tam));
  /* 2. pela cabeça única */
  const porCabeca = new Map();
  for (const nome of nomes) {
    const c = semArtigo(norm(nome)).split(/\s+/)[0];
    if (!MESA_DO_BURACO.cabecas.includes(c)) continue;
    /* o mesmo nome por duas fontes (a povoação e a masmorra) é um só */
    const ja = porCabeca.get(c);
    porCabeca.set(c, ja === undefined || (ja && norm(ja) === norm(nome)) ? nome : null);
  }
  for (const [c, nome] of porCabeca) {
    if (!nome) continue;
    const i = citado(t, c);
    if (i >= 0 && /^\s+d[oae]s?\s/.test(t.slice(i + c.length))) continue;
    ver(nome, i, c.length);
  }
  /* 3. pela casa de quem o registo conhece */
  for (const g of gente) {
    const primeiro = norm(g.nome).split(/\s+/)[0];
    if (primeiro.length < 3) continue;
    const i = citado(t, primeiro);
    if (i < 0) continue;
    if (MESA_DO_BURACO.casaDe.test(t.slice(Math.max(0, i - 30), i))) ver(g.local, i, primeiro.length);
  }
  return achados.sort((a, b) => a.i - b.i);
}

const jaDisse = (ja, rx) => ja.some((l) => rx.test(String(l)));

export function oQueAMesaFecha(frase, ctx) {
  const o = obj(ctx);
  const out = { pergunta: [], em: [], fechou: [] };
  if (o.luta) return out;
  const t = norm(fraseDoJogador(frase)).replace(/\s+/g, " ");
  if (!t.trim()) return out;
  const ja = arr(o.ja).flatMap((f) => arr(obj(f).pergunta)).map(String);
  const cidade = o.cidade && typeof o.cidade === "object" && typeof o.cidade.nome === "string" && o.cidade.nome ? o.cidade : null;
  const opc = { semente: o.semente, mapa: o.mapa, lex: o.lex, genero: o.genero, molde: o.molde, aqui: o.aqui };
  const poe = (id, linha, pos) => {
    if (!linha || out.pergunta.length >= MESA_DO_BURACO.porTurno || out.pergunta.includes(linha) || ja.includes(linha)) return;
    out.pergunta.push(linha); out.em.push(pos); out.fechou.push(id);
  };
  const preco = t.match(MESA_DO_BURACO.pedePreco);
  /* 1. o pouso que a ficha não ouviu */
  if (cidade && preco && !jaDisse(ja, /^pouso:/)) {
    const m = t.match(MESA_DO_BURACO.pouso.rx);
    if (m) {
      let f = null;
      try { f = fichaDaCidade(cidade, opc); } catch { f = null; }
      poe("pouso", f ? linhaDoPouso(f, { curta: true }) : "", m.index);
    }
  }
  /* 2. o caminho até cada sítio que o sistema conhece, pelo nome ou pelo
     pedaço — todos os que a frase pergunta, menos os que uma ficha já disse
     (a 13.ª, T7: o poço E a Fenda). O teto é o da peça (`porTurno`). */
  const caminho = t.match(MESA_DO_BURACO.perguntaCaminho);
  if (cidade && caminho) {
    let nomes = [];
    try { nomes = lugaresComDistancia(cidade, opc); } catch { nomes = []; }
    const gente = arr(o.gente).filter((g) => g && typeof g.nome === "string" && typeof g.local === "string" && g.local.trim());
    const disse = ja.filter((l) => /^distância:/.test(l)).map((l) => norm(l));
    /* o sítio vale quando a oração dele pergunta o caminho — ou quando a
       pergunta vem logo a seguir sem sítio próprio («Vou à Fenda. Quanto
       tempo leva?»). «Olho em volta na praça. … quanto tempo até a Cabra
       Trêmula?» não pergunta pela praça (o corpus, s10#1). */
    const oracoes = [];
    for (const m of t.matchAll(/[^.!?;]+[.!?;]*/g)) oracoes.push({ a: m.index, b: m.index + m[0].length, pede: MESA_DO_BURACO.perguntaCaminho.test(m[0]) || MESA_DO_BURACO.ondeFica.test(m[0]) });
    const destinos = osDestinos(t, nomes, gente, cidade.nome);
    const kDe = (i) => oracoes.findIndex((x) => i >= x.a && i < x.b);
    const pedido = (d) => {
      const k = kDe(d.i);
      if (k < 0) return false;
      if (oracoes[k].pede) return true;
      const prox = oracoes[k + 1];
      return !!prox && prox.pede && !destinos.some((e) => kDe(e.i) === k + 1);
    };
    for (const d of destinos) {
      if (!pedido(d)) continue;
      const quem = semArtigo(norm(d.nome).replace(/\s+/g, " ").trim());
      if (disse.some((l) => l.includes(quem))) continue;
      let l = "";
      try { l = distanciaAte(cidade, d.nome, opc); } catch { l = ""; }
      poe("distancia", l, d.i);
    }
  }
  /* 3. o serviço com outro verbo: a linha de PRECOS_COMUNS que ele é */
  if (cidade && preco) {
    for (const s of MESA_DO_BURACO.servicos) {
      const m = t.match(s.rx);
      if (!m) continue;
      const r = precoComumParaPauta(`quanto custa ${s.palavra}?`, { fator: o.fator, moeda: o.moeda });
      const l = arr(r.pergunta)[0];
      if (l && !ja.some((x) => x.includes(l.replace(/^o preço daqui: /, "")))) poe(s.id, l, m.index);
    }
  }
  /* 4. a mercadoria dita na oração de antes da pergunta de preço */
  const bancas = arr(o.bancas);
  if (bancas.length && !jaDisse(ja, /^(à venda|não há)/)) {
    /* as duas orações juntas, e só quando a de antes PROCURA a coisa */
    const oracoes = String(fraseDoJogador(frase)).match(/[^.!?;\n]+[.!?;\n]*/g) || [];
    const k = oracoes.findIndex((x) => PERGUNTA_DE_PRECO.test(norm(x)));
    if (k > 0 && MESA_DO_BURACO.procura.test(norm(oracoes[k - 1]))) {
      const par = oracoes[k - 1].replace(/[.!?;\n]+\s*$/, ", ") + oracoes[k];
      const r = mercadoParaPauta(bancas, par, { onde: typeof o.onde === "string" ? o.onde : "", moeda: o.moeda });
      const l = arr(r.pergunta)[0];
      if (l) poe("banca", l, Math.max(0, t.indexOf(norm(oracoes[k - 1]).replace(/\s+/g, " ").trim().slice(0, 12))));
    }
  }
  return out;
}
