/* ============================================================
   RESUMO DA RODADA (v9.32) — a tela para de gritar

   O relato: "a tela está se enchendo de coisas depois de um turno,
   as rolagens, as reações, os ataques, ficou gigante".

   E está certo. Uma rodada de combate hoje empurra, em sequência:
   uma rolagem por golpe, uma linha de resultado por golpe, os
   movimentos dos inimigos, as reações, os golpes dos companheiros,
   as aflições aplicadas, as curas. Num turno com três inimigos
   multiatacantes e três companheiros, são mais de vinte balões
   idênticos entre a ação do jogador e a narração do Mestre — e a
   narração, que é o que ele quer ler, some no meio.

   O erro seria simplesmente esconder. O jogador precisa DAQUILO:
   é como ele sabe que a magia pegou o aliado, que o companheiro
   caiu, que o crítico saiu. O que ele não precisa é de tudo isso
   com o mesmo peso, ao mesmo tempo, ocupando a tela inteira.

   Então este arquivo separa em três:

     · o que muda uma DECISÃO fica sempre na tela (alguém caiu,
       fogo amigo, condição nova, dádiva, ascensão, recusa);
     · o resto vira UMA linha de saldo — quanto saiu, quanto
       entrou, quantos tombaram;
     · e o detalhe continua a um toque, para quem quiser conferir
       a conta.

   É pura de propósito: entra uma lista de textos, sai a divisão.
   Nenhum React, nenhum estado — dá para testar a régua inteira
   sem abrir o jogo.
   ============================================================ */

/* ---------------- O QUE NUNCA SE DOBRA ----------------
   A régua é por PREFIXO, e é estreita de propósito: dobrar por
   engano uma linha que o jogador precisava ler é muito pior do que
   deixar uma linha a mais na tela. Na dúvida, fica visível. */
const SEMPRE = [
  "💢", // fogo amigo, concentração quebrada — o que dói e não era para doer
  "🌠", // dádiva épica
  "★", "🌟", "🌑", // ascensão, milagre de peso, presença divina
  "⛔", "📏", "⏳", // recusas: o sistema disse não e o jogador precisa saber por quê
  "✧", // heroísmo e efeitos que nascem ou morrem
  "🕯", "💀", "☠", // morte e volta
  "🎖", "🏆", "⬆", // nível, conquista
  "⚡", // modo criativo
  "🔎", "🧭", "🗝", // revelações do sistema
  "📖", // entrou para o cânone
];

/* Linhas de conta pura: existem para auditoria, não para leitura. */
const ROLAGEM = /^🎲/;
const GOLPE_MEU = /^⚔/;
const GOLPE_DELE = /^🛡/;
const HABILIDADE = /^✦/;
const CURA = /^🩶/;
const PASSO = /^👣/;
const TERRENO = /^🗺/;

export function ehSempreVisivel(txt) {
  const t = String(txt || "").trim();
  if (!t) return false;
  if (SEMPRE.some((p) => t.startsWith(p))) return true;
  /* um golpe que MATA é o desfecho, não a conta: fica. */
  if (t.includes("☠")) return true;
  return false;
}

function ehDobravel(txt) {
  const t = String(txt || "").trim();
  return ROLAGEM.test(t) || GOLPE_MEU.test(t) || GOLPE_DELE.test(t)
    || HABILIDADE.test(t) || CURA.test(t) || PASSO.test(t) || TERRENO.test(t);
}

/* ---------------- A CONTA ----------------
   Lê os números das linhas que o próprio App escreve. O formato é
   estável porque nasce de um punhado de templates; quando um deles
   mudar, o pior que acontece é o saldo ficar menor do que foi — e
   nunca uma linha some por causa disso. */
const NUM_DANO = /(\d+)\s+de\s+dano/i;
const NUM_CURA = /\+(\d+)\s*PV/i;

export function contarBloco(textos) {
  let dado = 0, sofrido = 0, curado = 0, caidos = 0, rolagens = 0, golpes = 0, erros = 0;
  for (const bruto of textos || []) {
    const t = String(bruto || "").trim();
    if (ROLAGEM.test(t)) { rolagens += 1; continue; }
    const m = t.match(NUM_DANO);
    const n = m ? Number(m[1]) : 0;
    if (GOLPE_MEU.test(t) || HABILIDADE.test(t)) {
      golpes += 1;
      if (n) dado += n; else if (/errou|erro desastroso/i.test(t)) erros += 1;
      if (t.includes("☠")) caidos += 1;
    } else if (GOLPE_DELE.test(t)) {
      golpes += 1;
      if (n) sofrido += n; else if (/errou/i.test(t)) erros += 1;
    } else if (CURA.test(t)) {
      const c = t.match(NUM_CURA);
      if (c) curado += Number(c[1]);
    }
  }
  return { dado, sofrido, curado, caidos, rolagens, golpes, erros };
}

/* A linha de saldo. Só entra o que aconteceu — um turno sem cura não
   ganha "0 curados", porque zero é ruído. */
export function linhaDeSaldo(c) {
  const p = [];
  if (c.golpes) p.push(`${c.golpes} ${c.golpes === 1 ? "golpe" : "golpes"}`);
  if (c.dado) p.push(`${c.dado} de dano causado`);
  if (c.sofrido) p.push(`${c.sofrido} sofrido`);
  if (c.curado) p.push(`+${c.curado} PV curados`);
  if (c.erros) p.push(`${c.erros} ${c.erros === 1 ? "erro" : "erros"}`);
  if (c.rolagens) p.push(`${c.rolagens} ${c.rolagens === 1 ? "rolagem" : "rolagens"}`);
  return p.length ? `⚔ ${p.join(" · ")}` : "";
}

/* ---------------- A DIVISÃO ----------------
   `minimo` é quantas linhas dobráveis precisam existir para valer a
   pena dobrar. Abaixo disso a dobra atrapalha: esconder duas linhas
   atrás de um toque custa mais atenção do que as duas linhas. */
export const MINIMO_PARA_DOBRAR = 4;

export function dividirBloco(textos, { minimo = MINIMO_PARA_DOBRAR } = {}) {
  const lista = (textos || []).map((t) => String(t == null ? "" : t));
  const dobraveis = lista.filter((t) => ehDobravel(t) && !ehSempreVisivel(t));
  if (dobraveis.length < minimo) {
    return { visiveis: lista, dobradas: [], saldo: "", conta: contarBloco(lista) };
  }
  const visiveis = [];
  const dobradas = [];
  for (const t of lista) {
    if (ehDobravel(t) && !ehSempreVisivel(t)) dobradas.push(t);
    else visiveis.push(t);
  }
  const conta = contarBloco(dobradas);
  return { visiveis, dobradas, saldo: linhaDeSaldo(conta) || `⚔ ${dobradas.length} linhas de combate`, conta };
}

/* ---------------- AGRUPAR A CONVERSA ----------------
   O renderizador recebe a lista inteira de mensagens e precisa saber
   onde começa e onde acaba cada corrida de linhas do sistema. Devolve
   os itens já prontos para desenhar, na ordem, sem que a tela precise
   saber de nada disto. */
export function agruparMensagens(mensagens) {
  const out = [];
  let corrida = null;
  (mensagens || []).forEach((m, i) => {
    if (m && m.autor === "sistema") {
      if (!corrida) { corrida = { tipo: "bloco", inicio: i, textos: [] }; out.push(corrida); }
      corrida.textos.push(String(m.texto == null ? "" : m.texto));
      return;
    }
    corrida = null;
    out.push({ tipo: "msg", i, m });
  });
  return out.map((x) => x.tipo !== "bloco" ? x : { ...x, ...dividirBloco(x.textos) });
}
