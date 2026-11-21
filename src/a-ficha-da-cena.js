/* a-ficha-da-cena.js (o Mestre que conhece a cena, etapa 2 · 21/11/2026) —
   o Narrador preso à ficha da cena, e a consequência escrita pelo sistema.

   O desenho é mente/lancamento/o-mestre-vivo.md §22. As sessões jogadas 3 e
   4 (com o Mestre vivo ligado) viram a prosa inventar o que a ficha não
   tinha: o vendedor de água que ninguém registrou vendia e falava; a corda
   «comprada» por 15 não entrou na mochila e as moedas ficaram; a arca virou
   porta e o cantil virou corda; quem a frase chamava não estava ali, e
   outra pessoa respondia. A cena (a-cena-do-jogo.js) já sabe quem está e que
   coisas há; esta peça é o que dela chega ao Narrador, e o que o sistema
   aplica antes de ele narrar.

   - A FICHA NA PAUTA (`fichaDaCenaNaPauta`): pelo canal de UM turno
     (`{ acabou, naoPode }`, motor/pauta-do-turno.js), nunca bloco estático —
     o teto do prompt é sagrado e o TETO_DA_PAUTA corta pela prioridade.
     Quem está aqui vai DENTRO do veto («pôr para falar, vender ou entregar
     quem não está nesta cena — aqui estão só: …»), e a coisa em que a frase
     mexe vai em ACABOU DE.
   - QUEM NÃO ESTÁ (`quemNaoEstaNaCena`): a frase fala com alguém que o
     sistema sabe noutro lugar (ou morto, ou registrado e fora da cena). Só
     quem o sistema conhece: um nome com maiúscula que ninguém registrou não
     é afirmado ausente (o portão morde só o necessário).
   - O REGATEIO NA BANCA (`oRegateioNaBanca`): o regateio que rolou aplica a
     tabela da pechincha de sempre (comercio.js, `pechinchar`) com o dado que
     já caiu, sobre a banca (ou o balcão de mantimentos) da coisa nomeada; o
     preço novo é o que o sistema diz, e o Narrador só o conta.
   - A PROCURA NA COISA DE ALGUÉM (`procuraNaCoisaDeAlguem`): «procuro nos
     cestos da banca de Isolde» é procurar nos cestos, não procurar Isolde —
     o «🔎 Isolde está aqui» da quarta sessão (T22) era a procura de uma
     pessoa que ninguém procurou.

   Tudo isto só corre com a chave do Mestre vivo (o App decide); a peça é
   pura: sem React, sem relógio, sem sorte própria (o d20 do regateio é o que
   o jogador já rolou). Lixo devolve null e nunca lança. Provado em
   `testes/teste-a-ficha-da-cena.mjs`. */
import { lerCena, coisasQueAFraseNomeia } from "./cena-do-momento.js";
import { REGRAS_DA_CENA_DO_JOGO } from "./a-cena-do-jogo.js";
import { familiaDaAcao, nomeAusenteNaFrase, MOTIVO_PARA_NEGAR_DO_ALVO } from "./motor/a-regua-do-momento.js";
import { CHAVE_FINA_PELO_ALVO } from "./desafios.js";
import { pechinchar, PECHINCHA_GANHO } from "./comercio.js";
import { nomeiaACoisa } from "./economia.js";
import { MANTIMENTO_NA_FRASE } from "./bolsa-da-frase.js";

const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : null);
/* sem acento e em minúsculas, com o MESMO tamanho do texto (NFC) — o índice
   achado no texto limpo serve no original */
const limpo = (s) => String(s == null ? "" : s).normalize("NFC").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const doOriginal = (frase, ini, fim) => {
  const f = String(frase || "").normalize("NFC");
  return f.length === limpo(f).length ? f.slice(ini, fim).toLowerCase() : limpo(f).slice(ini, fim);
};

/* ---------------- A TABELA ----------------
   `naLista`: quantos nomes (gente e bancas) o veto de quem está leva — o
   resto vira «…»; `familiasDaCoisa`: as famílias da régua cuja ação cai
   sobre UMA coisa (a arca que se força, o muro que se escala, o cantil que
   se afana) — é nelas que a prosa trocava a coisa. As frases vão no
   infinitivo (NÃO PODE) ou na primeira pessoa (ACABOU DE), como as outras
   do canal de um turno; nenhuma fala de dado, teste, regra ou sistema de
   jogo — o Narrador repete o que lê. */
export const A_FICHA_DA_CENA = Object.freeze({
  naLista: 4,
  /* o papel na lista: as primeiras palavras dele («mercador de tecidos finos» → «mercador de tecidos») */
  palavrasDoPapel: 3,
  familiasDaCoisa: Object.freeze(["forcar", "travessia", "furtar"]),
  quem: "pôr para falar, vender ou entregar quem não está aqui; aqui estão só: {lista}",
  ninguem: "pôr alguém novo para falar, vender ou entregar: aqui não há ninguém além de mim",
  quemAtende: "quem atende {banca}",
  doGrupo: "comigo",
  mao: "dar-me coisa, tirar-me moedas ou dizer preço além do que já foi registrado",
  /* 21/11 (§24): A COISA VIROU VETO. Ia em ACABOU DE («Eu mexo em «…», e
     em nenhuma outra coisa.»), prio 3 — e, medida contra as 158 pautas
     gravadas fora da luta (registo-s5 e s6-s7), o teto a cortava em 69
     (44%): o ONDE e a economia (2,49 e 2,5) passavam à frente. No NÃO PODE
     (2 + 0,05 por linha) ela chega, e diz o mesmo em menos letras. */
  coisa: "mexer em outra coisa que não «{coisa}»",
  /* 21/11 (§24): QUEM RESPONDE. A frase falou com alguém (o alvo da régua,
     `momento.alvo`): a resposta é dele. Na quinta sessão a mesma pessoa da
     cena respondia pelo velho e recebia o furto feito a outro. */
  alvo: "pôr outra pessoa para responder no lugar de {alvo}",
  /* 21/11 (§24): QUEM FALOU HÁ POUCO. A pessoa da cena que tomou a palavra
     nos últimos turnos (o conferente da prosa guarda quando), e a quem a
     frase não se dirige, fica quieta neste. */
  calados: "pôr {lista} para falar de novo, salvo se eu me dirigir a quem for",
  porque: "a prosa inventava quem vende, o que muda de mão e o preço; a ficha da cena é a lista do que existe, e o resto é veto",
});

/* a pessoa como vai na lista: o nome, e o papel (ou «comigo», do grupo) */
function quemNaLista(p) {
  const nome = txt(p.nome);
  if (!nome) return "";
  if (arr(p.estados).includes("do_grupo")) return `${nome} (${A_FICHA_DA_CENA.doGrupo})`;
  const papel = txt(p.papel).split(/\s+/).slice(0, A_FICHA_DA_CENA.palavrasDoPapel).join(" ");
  return papel ? `${nome} (${papel})` : nome;
}

/* a coisa em que a frase mexe: a da cena que ela nomeia (fora «o lugar»,
   que está sempre em cena); sem nenhuma, o primeiro sintagma com artigo da
   frase (o mesmo recorte da chave fina do livro de tentativas). "" sem. */
export function aCoisaDaFrase(frase, cena) {
  try {
    if (typeof frase !== "string" || !frase.trim()) return "";
    const daCena = arr(coisasQueAFraseNomeia(frase, cena)).filter((n) => limpo(n) !== limpo(REGRAS_DA_CENA_DO_JOGO.coisaDaAcao));
    if (daCena.length) return daCena[0];
    const t = limpo(frase);
    const m = t.match(CHAVE_FINA_PELO_ALVO.objeto);
    if (!m) return "";
    const ini = m.index + m[0].length - m[1].length;
    return doOriginal(frase, ini, ini + m[1].length).trim();
  } catch {
    return "";
  }
}

/* ---------------- A FICHA NA PAUTA ----------------
   `frase`: o que o jogador escreveu; `momento`: o de chamadoDoMomento (a
   cena e o veredito); `bancas`: as bancas da cena ({ nome }); `ausente`: o
   de quemNaoEstaNaCena; `calados` (§24): quem falou há pouco e fica
   quieto (o-conferente-da-prosa.js#quemFicaCalado). Devolve { acabou,
   naoPode } ou null (sem cena). */
export function fichaDaCenaNaPauta(o) {
  try {
    const x = obj(o) ? o : {};
    const m = obj(x.momento) ? x.momento : null;
    const cena = m ? lerCena(m.cena) || (m.cena && Array.isArray(m.cena.pessoas) ? m.cena : null) : null;
    if (!cena) return null;
    const F = A_FICHA_DA_CENA;
    const acabou = [], naoPode = [];
    const lista = [
      ...arr(cena.pessoas).map(quemNaLista),
      ...arr(x.bancas).filter(obj).map((b) => (txt(b.nome) ? F.quemAtende.replace("{banca}", txt(b.nome)) : "")),
    ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    const corte = lista.length > F.naLista ? [...lista.slice(0, F.naLista), "…"] : lista;
    naoPode.push(corte.length ? F.quem.replace("{lista}", corte.join(", ")) : F.ninguem);
    naoPode.push(F.mao);
    /* a coisa: só quando a ação cai sobre uma coisa (no NÃO PODE, §24) */
    const fam = familiaDaAcao(m.veredito);
    if (F.familiasDaCoisa.includes(fam)) {
      const c = aCoisaDaFrase(txt(x.frase), cena);
      if (c) naoPode.push(F.coisa.replace("{coisa}", c));
    }
    /* quem responde e quem fica quieto (§24): só quando quem chama os passa */
    const alvo = txt(m.alvo);
    if (alvo) naoPode.push(F.alvo.replace("{alvo}", alvo));
    const calados = arr(x.calados).map(txt).filter(Boolean).filter((n) => !alvo || primeiro(n) !== primeiro(alvo));
    if (calados.length) naoPode.push(F.calados.replace("{lista}", calados.slice(0, 2).join(" e ")));
    const a = obj(x.ausente) ? pautaDeQuemNaoEsta(x.ausente) : null;
    if (a) { acabou.push(...a.acabou); naoPode.push(...a.naoPode); }
    return Object.freeze({ acabou, naoPode });
  } catch {
    return null;
  }
}

/* ---------------- QUEM NÃO ESTÁ ----------------
   A frase fala com alguém pelo nome («pergunto a Bryna», «minto ao Doran»,
   o mesmo recorte da régua: `nomeAusenteNaFrase`) e esse alguém não está
   na cena. O sistema só o afirma ausente quando o CONHECE: `ausentes`
   (osAusentes: o longe, a gente noutro local, o morto — com onde) ou
   `conhecidos` (o registro: sabe-se que existe, não onde está agora). O
   nome que ninguém registrou (o deus a quem se pede, o conselho, a gente
   que só a prosa pôs) não é afirmado: `protegidos` e o desconhecido
   passam. → { nome, onde, morto } ou null. */
export const QUEM_NAO_ESTA = Object.freeze({
  /* uma linha só, em ACABOU DE: o «ninguém responde no lugar» já é o veto (um
     NÃO PODE ao lado repetia-o e custava ~90 caracteres do teto) */
  acabou: "Chamei {nome}, que não está aqui{onde}: nem {nome} nem outra pessoa responde no lugar.",
  /* 21/11 (§23): «{emOnde}» é o lugar com a preposição contraída
     (emOLugar: «na Forja Velha», «no Malho», «em Vau») — era «está em a
     Forja Velha» */
  onde: " (está {emOnde})",
  morto: " (morreu)",
  tela: "🧭 {nome} não está aqui{onde}.",
  telaOnde: " — está {emOnde}",
  telaMorto: " — morreu",
});
const primeiro = (n) => limpo(n).split(/[\s,()]+/).filter(Boolean)[0] || "";
/* ---------------- A PREPOSIÇÃO DO LUGAR (21/11/2026, §23) ----------------
   «em» + o artigo do nome contrai: «a Forja Velha» → «na Forja Velha», «O
   Malho» → «no Malho», «os Arcos» → «nos Arcos»; sem artigo, «em Vau». O
   artigo é o do começo do nome, maiúsculo ou não; o resto fica como veio. */
export const CONTRACAO_DO_EM = Object.freeze({ o: "no", a: "na", os: "nos", as: "nas" });
export function emOLugar(nome) {
  const n = txt(nome);
  if (!n) return "";
  const m = n.match(/^(o|a|os|as)\s+(\S.*)$/i);
  return m ? `${CONTRACAO_DO_EM[m[1].toLowerCase()]} ${m[2]}` : `em ${n}`;
}
export function quemNaoEstaNaCena(frase, cena, ctx) {
  try {
    const c = obj(ctx) ? ctx : {};
    const nome = nomeAusenteNaFrase(frase, cena);
    if (!nome) return null;
    const p = primeiro(nome);
    if (arr(c.protegidos).some((x) => primeiro(x) === p)) return null;
    const aus = arr(c.ausentes).filter(obj).find((a) => primeiro(a.nome) === p);
    if (aus) return Object.freeze({ nome: txt(aus.nome) || nome, onde: aus.morto ? "" : txt(aus.onde), morto: !!aus.morto });
    const conh = arr(c.conhecidos).map((x) => (obj(x) ? txt(x.nome) : txt(x))).find((n) => primeiro(n) === p);
    return conh ? Object.freeze({ nome: conh, onde: "", morto: false }) : null;
  } catch {
    return null;
  }
}
export function pautaDeQuemNaoEsta(a) {
  if (!obj(a) || !txt(a.nome)) return null;
  const Q = QUEM_NAO_ESTA;
  const onde = a.morto ? Q.morto : txt(a.onde) ? Q.onde.replace("{emOnde}", emOLugar(a.onde)) : "";
  return Object.freeze({
    acabou: [Q.acabou.replaceAll("{nome}", txt(a.nome)).replace("{onde}", onde)],
    naoPode: [],
  });
}
export function falaDeQuemNaoEsta(a) {
  if (!obj(a) || !txt(a.nome)) return "";
  const Q = QUEM_NAO_ESTA;
  const onde = a.morto ? Q.telaMorto : txt(a.onde) ? Q.telaOnde.replace("{emOnde}", emOLugar(a.onde)) : "";
  return Q.tela.replace("{nome}", txt(a.nome)).replace("{onde}", onde);
}

/* ---------------- O REGATEIO NA BANCA ----------------
   O regateio que rolou («regateio o cantil», «faz por 15») é a pechincha de
   sempre, com o dado que já caiu: `pechinchar` (comercio.js) com o d20 do
   jogador, o bônus e a dificuldade da régua — as mesmas quatro faixas
   (cedeu mais, aceitou baixar, não se mexeu, se ofendeu) e os mesmos
   PECHINCHA_GANHO/PECHINCHA_PERDA. Uma por banca por dia, como no botão.
   De quem: a banca cuja coisa a frase nomeia; senão o balcão de
   mantimentos, se a frase nomeia um mantimento que ele tem; senão a frase
   anterior (o preço perguntado antes). Sem coisa, nada (sem preço que
   dizer). `precoDepois(banca, item, ajuste)`: o preço com o ajuste, pela
   mesma conta do mercado do App; sem ela, o preço de agora × ajuste.
   → { id, registro: { dia, ajuste, texto, ok }, coisa, antes, preco, tela,
       pauta: { acabou, naoPode } } ou null. */
export const O_REGATEIO_NA_BANCA = Object.freeze({
  idDoBalcao: "balcao",
  mudou: "Regateei o preço: quem vende {texto}, e {coisa} sai agora a ◉ {preco} (era ◉ {antes}). Nada muda de mão até eu dizer que pago.",
  igual: "Regateei o preço: quem vende {texto}, e {coisa} continua a ◉ {preco}. Nada muda de mão até eu dizer que pago.",
  naoPode: "dar a {coisa} outro preço que não ◉ {preco}",
  telaMudou: "🤝 {coisa}: ◉ {antes} → ◉ {preco}.",
  telaIgual: "🤝 {coisa} continua a ◉ {preco}.",
  /* 21/11 (§23): O REGATEIO SEM DADO. Com quem deve ao herói (o favor, o
     companheiro, o sim já dado), a régua não rola (dispostoCede) — e o
     desconto não saía. Sai o degrau fixo que a tabela da pechincha já tem:
     «aceitou baixar», PECHINCHA_GANHO (comercio.js). Nunca o «cedeu mais»,
     que é do dado alto; nunca a ofensa, que é do dado baixo. */
  semDado: Object.freeze({ ok: true, ajuste: 1 - PECHINCHA_GANHO, texto: "aceitou baixar" }),
});
function coisaDoRegateio(frase, bancas, balcao) {
  const t = limpo(frase);
  if (!t.trim()) return null;
  for (const b of bancas) {
    for (const it of arr(b.estoque)) {
      if (obj(it) && txt(it.nome) && nomeiaACoisa(t, it.nome)) return { id: txt(b.id), banca: b, item: it, nome: it.nome, preco: num(Number(it.preco)) };
    }
  }
  for (const mt of MANTIMENTO_NA_FRASE) {
    if (!new RegExp(mt.rx.source).test(t)) continue;
    const p = balcao.find((x) => obj(x) && x.id === mt.id);
    if (p) return { id: O_REGATEIO_NA_BANCA.idDoBalcao, banca: null, item: p, nome: txt(p.nome), preco: num(Number(p.preco)) };
  }
  return null;
}
export function oRegateioNaBanca(frase, opcoes) {
  try {
    const o = obj(opcoes) ? opcoes : {};
    if (typeof frase !== "string" || !MOTIVO_PARA_NEGAR_DO_ALVO.preco.test(limpo(frase))) return null;
    const d20 = num(o.d20), bonus = num(o.bonus) || 0, dc = num(o.dc);
    const semDado = o.semDado === true;
    if (!semDado && (d20 == null || d20 < 1 || d20 > 20 || dc == null)) return null;
    const bancas = arr(o.bancas).filter((b) => obj(b) && txt(b.id));
    const balcao = arr(o.balcao).filter(obj);
    const alvo = coisaDoRegateio(frase, bancas, balcao) || coisaDoRegateio(txt(o.anterior), bancas, balcao);
    if (!alvo || !alvo.id || alvo.preco == null) return null;
    const ja = obj(o.pechinchas) ? o.pechinchas[alvo.id] : null;
    if (obj(ja) && ja.dia === o.dia) return null;
    /* o d20 que já caiu: a sorte devolve a face dele */
    const r = semDado ? O_REGATEIO_NA_BANCA.semDado : pechinchar({ bonus, dificuldade: dc, sorte: () => (d20 - 0.5) / 20 });
    const antes = alvo.preco;
    let preco = Math.max(1, Math.round(antes * r.ajuste));
    if (typeof o.precoDepois === "function") { try { const p = num(o.precoDepois(alvo.banca, alvo.item, r.ajuste)); if (p != null) preco = p; } catch { /* a conta de sempre */ } }
    const R = O_REGATEIO_NA_BANCA;
    const coisa = alvo.nome;
    const enche = (s) => s.replace("{coisa}", coisa).replace("{texto}", r.texto).replace("{preco}", String(preco)).replace("{antes}", String(antes));
    const mudou = preco !== antes;
    return Object.freeze({
      id: alvo.id,
      registro: Object.freeze({ dia: o.dia, ajuste: r.ajuste, texto: r.texto, ok: r.ok }),
      coisa, antes, preco,
      tela: enche(mudou ? R.telaMudou : R.telaIgual),
      pauta: Object.freeze({ acabou: [enche(mudou ? R.mudou : R.igual)], naoPode: [enche(R.naoPode)] }),
    });
  } catch {
    return null;
  }
}

/* O balcão de mantimentos com a pechincha do dia (a mesma conta da linha
   acima: preço × ajuste, arredondado, nunca menos de 1). Sem registro de
   hoje, o MESMO balcão (a mesma lista). */
export function balcaoComPechincha(balcao, registro, dia) {
  const b = arr(balcao);
  if (!obj(registro) || registro.dia !== dia || !num(registro.ajuste) || registro.ajuste === 1) return balcao;
  return b.map((x) => (obj(x) && num(Number(x.preco)) != null ? { ...x, preco: Math.max(1, Math.round(Number(x.preco) * registro.ajuste)) } : x));
}

/* ---------------- A PROCURA NA COISA DE ALGUÉM ----------------
   O nome logo depois de «de/da/do», com uma coisa antes («os cestos da banca
   de Isolde», «a bolsa do Doran»), é o dono, não quem se procura. Ficam as
   palavras que fazem do «de» uma procura de gente («sinais de», «notícias
   de», «o paradeiro de»). */
export const A_PROCURA_NA_COISA = Object.freeze({
  deProcura: Object.freeze(["sinal", "sinais", "rastro", "rastros", "pista", "pistas", "noticia", "noticias", "paradeiro", "atras", "cheiro",
    "marca", "marcas", "pegada", "pegadas", "sombra", "vestigio", "vestigios", "procura", "busca"]),
});
export function procuraNaCoisaDeAlguem(frase, nome) {
  try {
    const t = limpo(frase), n = primeiro(nome);
    if (!t || !n) return false;
    const i = t.search(new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`));
    if (i < 0) return false;
    const m = t.slice(0, i).match(/\b([a-z]+)\s+d[aeo]s?\s+$/);
    return !!m && !A_PROCURA_NA_COISA.deProcura.includes(m[1]);
  } catch {
    return false;
  }
}
