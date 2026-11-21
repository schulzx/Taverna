/* ============================================================
   A PODA DO AUSENTE (S7b, 17/11/2026) — src/motor/poda-do-ausente.js

   A prova jogada de 16/11 (IA real, 14 turnos) viu a tela e a prosa
   concordarem em 5 de 7 lugares; o que sobrava era o Narrador a trazer
   gente por conta própria. «Morgane Mão-Torta» — a taverneira da noite,
   que o sistema põe NOUTRO sítio — entrou e falou na Casa do Calafate em 2
   de 14 turnos, inclusive na resposta a «Quem está aqui comigo?». O veto
   da pauta (quem-esta-aqui.js#linhaDeQuemNaoEsta) só lembra quem as falas
   anteriores citaram: a primeira entrada passa sempre.

   A REGRA DE MESA, do sistema e sem IA (nenhuma segunda chamada): depois da
   resposta do Narrador e antes de a mostrar, a FRASE em que alguém que o
   sistema sabe estar noutro lugar (o longe, a gente da base posta noutro
   sítio) ou morto AGE como presente é podada:
     · sujeito de verbo de ação ou de fala — «Morgane entra pela porta e…»;
     · a etiqueta da fala — «— Não quero conversa — diz Morgane»;
   e o nome vai ao livro de vetos (o do Juiz, andarOsVetos) para o turno
   seguinte, podado ou não.

   MENÇÃO NÃO É PRESENÇA (o portão morde só o necessário): «a taverna de
   Morgane» (depois de preposição), «dizem que Morgane…» (relato),
   «Morgane não aparece hoje» (negado), «— Morgane? Saiu cedo.» (dentro da
   fala de outro) ficam. Quem está em cena, o grupo, o herói e os nomes
   protegidos (deuses, lugares, o vilão — quem chama os dá) nunca são
   candidatos.

   AS TRAVAS: se a poda tiraria mais de `limiar` do texto, ou levaria a
   única fala de uma resposta a uma pergunta do jogador, NÃO poda — só
   regista o veto. Quem chama embrulha tudo em `calou`: se estourar, a
   prosa passa como veio.

   Puro, sem React, determinístico. Provado em testes/teste-poda-do-ausente.mjs.
   ============================================================ */

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nomeDe = (x) => str(ehObj(x) ? x.nome : x).trim();
const palavrasDoNome = (nome) => sem(str(nome).split(",")[0]).replace(/[^a-z0-9-]+/g, " ").trim();

/* ---------------- A TABELA ----------------
   `limiar`: a fração do texto acima da qual a poda não poda (só veta).
   `vida`: quantos turnos o veto vive no livro. `porTurno`: quantos nomes
   uma resposta veta. `primeiroMinimo`: o primeiro nome sozinho só vale com
   estas letras e se ninguém mais o partilha. `ate`: quantas palavras depois
   do nome se procura o verbo. `age`/`fala`: os verbos (presente, 3.ª pessoa,
   singular e plural; sem acento). `pula`: o que pode estar entre o nome e o
   verbo. `fecha`: o que fecha a oração antes do verbo. `prep`: a palavra
   antes do nome que o faz complemento («de Morgane»). `relato`: a palavra
   antes do nome, na mesma frase, que a faz relato ou hipótese. `nega`. */
export const PODA_DO_AUSENTE = Object.freeze({
  limiar: 0.4,
  vida: 3,
  porTurno: 3,
  primeiroMinimo: 4,
  ate: 6,
  especie: "ausente-em-cena",
  letras: 160,
  linha: (nome, onde, morto) => `pôr a agir ou a falar quem não está nesta cena: ${nome}${morto ? "; morreu" : onde ? ` (ficou em ${onde})` : ""}`,
  age: Object.freeze([
    "entra", "entram", "chega", "chegam", "aparece", "aparecem", "surge", "surgem", "senta", "sentam", "levanta", "levantam",
    "aproxima", "aproximam", "acena", "acenam", "olha", "olham", "encara", "encaram", "observa", "observam", "sorri", "sorriem",
    "estende", "estendem", "ergue", "erguem", "pega", "pegam", "pousa", "pousam", "serve", "servem", "empurra", "empurram",
    "inclina", "inclinam", "oferece", "oferecem", "entrega", "entregam", "ajeita", "ajeitam", "aponta", "apontam", "avanca", "avancam",
    "recua", "recuam", "cruza", "cruzam", "bate", "batem", "abre", "abrem", "fecha", "fecham", "segura", "seguram", "agarra", "agarram",
    "toca", "tocam", "vira", "viram", "atravessa", "atravessam", "caminha", "caminham", "anda", "andam",
    "espera", "esperam", "aguarda", "aguardam", "bebe", "bebem", "come", "comem", "limpa", "limpam", "enche", "enchem",
    "assente", "assentem", "franze", "franzem", "pisca", "piscam", "estala", "estalam", "debruca", "debrucam", "ri", "riem",
    "traz", "trazem", "mostra", "mostram", "guarda", "guardam", "atende", "atendem", "examina", "examinam", "cutuca", "cutucam",
  ]),
  fala: Object.freeze([
    "diz", "fala", "falam", "responde", "respondem", "pergunta", "perguntam", "murmura", "murmuram", "resmunga", "resmungam",
    "grita", "gritam", "sussurra", "sussurram", "retruca", "retrucam", "rosna", "rosnam", "completa", "completam", "acrescenta",
    "acrescentam", "continua", "continuam", "insiste", "insistem", "explica", "explicam", "declara", "declaram", "exclama", "exclamam",
    "brada", "bradam", "sibila", "sibilam", "repete", "repetem", "corta", "cortam", "interrompe", "interrompem", "suspira", "suspiram",
    "chama", "chamam", "avisa", "avisam", "emenda", "emendam", "concorda", "concordam", "provoca", "provocam", "ri", "riem",
  ]),
  pula: Object.freeze(["se", "lhe", "lhes", "me", "te", "o", "a", "os", "as", "ja", "logo", "entao", "tambem", "ainda", "devagar", "enfim", "de", "novo", "so", "apenas", "afinal"]),
  fecha: Object.freeze(["que", "quem", "cujo", "cuja", "mas", "porque", "quando", "enquanto", "voce", "ele", "ela", "eles", "elas", "eu", "nos", "ninguem", "alguem"]),
  prep: Object.freeze(["de", "da", "do", "das", "dos", "para", "pra", "com", "por", "pela", "pelo", "sobre", "sem", "contra", "entre", "ate", "ao", "aos", "em", "na", "no", "nas", "nos", "num", "numa", "sob", "perante", "conforme"]),
  relato: Object.freeze(["dizem", "diziam", "contam", "contavam", "comentam", "falam", "falavam", "ouvi", "ouviu", "ouviram", "soube", "segundo", "talvez", "caso", "lembra", "lembram", "lembrava", "recorda", "imagina", "imagine", "sonha", "sonhou", "pensa", "pensou", "parece", "se", "onde", "procura", "procuram", "pergunte", "chamada", "chamado"]),
  nega: Object.freeze(["nao", "nunca", "jamais", "nem", "sem"]),
  porque: "quem o sistema sabe noutro lugar, ou morto, não age nem fala nesta cena — a frase em que age sai antes da tela, e o nome vai ao livro de vetos",
});
const T = PODA_DO_AUSENTE;
const S = (xs) => new Set(xs);
const AGE = S(T.age), FALA = S(T.fala), PULA = S(T.pula), FECHA = S(T.fecha), PREP = S(T.prep), RELATO = S(T.relato), NEGA = S(T.nega);

/* ============================================================
   osAusentes(q, ctx) → [{ nome, onde, morto }]
   `q`: o retorno de quemEstaAqui (quem-esta-aqui.js). ctx: { gente (a gente
   da base da cidade de onde o herói é), npcs (o registo: os mortos),
   heroi, protegidos: [nome] (deuses, o vilão, lugares — nunca podados) }.
   Candidato é quem o sistema SABE noutro lugar: o longe; com o herói num
   sítio ou fora dos muros, a gente da base posta noutro local; e o morto
   do registo. Nunca quem está (aqui, posto, passo), nem o grupo.
   ============================================================ */
export function osAusentes(q, ctx) {
  const x = ehObj(q) ? q : {};
  const c = ehObj(ctx) ? ctx : {};
  const presentes = [...arr(x.doSitio), ...arr(x.doPasso), ...arr(x.grupo)].map(nomeDe)
    .concat(x.noSitio ? arr(x.aqui).filter((n) => arr(x.grupo).some((g) => palavrasDoNome(g) === palavrasDoNome(nomeDe(n)))).map(nomeDe) : arr(x.aqui).map(nomeDe))
    .concat([nomeDe(c.heroi)], arr(c.protegidos).map(nomeDe))
    /* quem anda comigo (o companheiro do registo) anda com o herói */
    .concat(Object.values(ehObj(c.npcs) ? c.npcs : {}).filter((n) => ehObj(n) && /companheir/i.test(str(n.relacao)) && !/morto/i.test(str(n.status))).map(nomeDe))
    .filter(Boolean);
  const pres = new Set(presentes.map(palavrasDoNome));
  /* o primeiro nome de quem está não é de ninguém de fora: «Saoirse» do grupo
     é a «Saoirse Passo-de-Gato» da base, e «Godfrey» à mesa leva o nome de
     qualquer outro Godfrey (o portão morde só o necessário) */
  const primeirosAqui = new Set(presentes.map((n) => palavrasDoNome(n).split(" ")[0]).filter(Boolean));
  const out = [];
  const por = (nome, onde, morto) => {
    const k = palavrasDoNome(nome);
    if (!k || pres.has(k) || primeirosAqui.has(k.split(" ")[0]) || out.some((y) => palavrasDoNome(y.nome) === k)) return;
    out.push({ nome: str(nome).trim(), onde: str(onde).trim(), morto: !!morto });
  };
  for (const n of arr(x.longe)) if (ehObj(n) && !/morto/i.test(str(n.status))) por(nomeDe(n), n.laFora || n.onde || n.local, false);
  if (x.noSitio || x.fora) {
    const sitio = sem(nomeDe(c.lugar));
    for (const p of arr(c.gente)) {
      if (!ehObj(p) || /morto/i.test(str(p.status))) continue;
      const local = str(p.local);
      if (sitio && sem(local).includes(sitio)) continue;
      por(nomeDe(p), local, false);
    }
  }
  for (const n of Object.values(ehObj(c.npcs) ? c.npcs : {})) if (ehObj(n) && /morto/i.test(str(n.status))) por(nomeDe(n), "", true);
  return out;
}

/* ---------------- a leitura de uma frase ---------------- */
const PALAVRA = /[a-z0-9]+(?:-[a-z0-9]+)*/g;
const palavrasCom = (s) => [...sem(s).matchAll(PALAVRA)].map((m) => ({ w: m[0], i: m.index }));

/* as formas por que cada ausente se diz: o nome inteiro, e o primeiro sozinho
   se tem letras bastantes e ninguém mais (ausente ou presente) o partilha */
function formasDos(ausentes, outros) {
  const primeiros = new Map();
  for (const n of [...ausentes.map((a) => a.nome), ...arr(outros)]) {
    const p = palavrasDoNome(n).split(" ")[0];
    if (p) primeiros.set(p, (primeiros.get(p) || 0) + 1);
  }
  return ausentes.map((a) => {
    const todo = palavrasDoNome(a.nome).split(" ").filter(Boolean);
    const formas = [todo];
    if (todo.length > 1 && todo[0].length >= T.primeiroMinimo && primeiros.get(todo[0]) === 1) formas.push([todo[0]]);
    return { ...a, formas };
  }).filter((a) => a.formas[0].length);
}

/* o ausente AGE nesta frase? `linha` é a linha inteira (para contar os
   travessões antes do nome), `ini` onde a frase começa nela. → nome | null */
function quemAgeNaFrase(frase, linha, ini, alvos) {
  const ws = palavrasCom(frase);
  for (const a of alvos) {
    for (const f of a.formas) {
      for (let j = 0; j + f.length <= ws.length; j++) {
        if (!f.every((p, k) => ws[j + k].w === p)) continue;
        const pos = ws[j].i;
        /* o nome escreve-se com maiúscula: «o taverneiro» não é o Taverneiro da base */
        if (!/\p{Lu}/u.test(frase.charAt(pos))) continue;
        /* dentro da fala de outro (número ímpar de travessões antes, na linha) */
        if (((linha.slice(0, ini + pos).match(/[—–]/g) || []).length % 2) === 1) continue;
        const ant = ws[j - 1] ? ws[j - 1].w : "";
        const ant2 = ws[j - 2] ? ws[j - 2].w : "";
        /* complemento: «a taverna de Morgane», «falar com Morgane» */
        if (PREP.has(ant)) continue;
        /* relato ou hipótese: «dizem que Morgane…», «se Morgane entrar…» */
        if (ws.slice(0, j).some((x) => RELATO.has(x.w))) continue;
        /* B · a etiqueta da fala: «— … — diz Morgane», «responde Morgane, seca» */
        const tag = FALA.has(ant) ? ant : (PULA.has(ant) && FALA.has(ant2) ? ant2 : "");
        if (tag) return a;
        /* A · sujeito: o verbo até `ate` palavras depois, sem o que fecha a oração */
        const fim = j + f.length;
        let negado = false;
        for (let k = fim; k < Math.min(ws.length, fim + T.ate); k++) {
          const w = ws[k].w;
          if (NEGA.has(w)) { negado = true; continue; }
          if (AGE.has(w) || FALA.has(w)) { if (!negado) return a; break; }
          if (FECHA.has(w) || PREP.has(w) && k === fim) break;
          if (PULA.has(w)) continue;
        }
      }
    }
  }
  return null;
}

/* as frases de uma linha de narração, com onde começam */
function frasesDaLinha(linha) {
  const out = [];
  const rx = /[^.!?…]+(?:[.!?…]+["»”']?|$)\s*/g;
  for (const m of linha.matchAll(rx)) if (m[0]) out.push({ texto: m[0], ini: m.index });
  return out;
}

const ehPergunta = (frase) => {
  const f = sem(frase).trim();
  return /\?\s*$/.test(f) || /^(quem|que|qual|quais|onde|como|quando|por que|porque|ha|tem)\b/.test(f);
};
const temFala = (t) => /(^|\n)\s*[—–]/.test(t) || /[—–]\s*\S/.test(t);

/* o veto de um ausente, no formato do livro do Juiz */
export function vetoDoAusente(a, turno) {
  const linha = T.linha(a.nome, a.onde, a.morto);
  const corta = linha.length > T.letras ? linha.slice(0, T.letras - 1) + "…" : linha;
  const toques = [...new Set(palavrasDoNome(a.nome).split(" ").filter((p) => p.length >= T.primeiroMinimo))];
  const t = Number.isFinite(Number(turno)) && turno !== null && turno !== "" ? Number(turno) : null;
  return { especie: T.especie, alvo: `ausente:${palavrasDoNome(a.nome)}`, nome: a.nome, linha: corta, toques, turno: t, ate: t == null ? null : t + T.vida, cidade: "" };
}

/* ============================================================
   podarOAusente(narrativa, ausentes, opcoes) →
     { narrativa, podadas: [{ nome, frase, onde, morto }], vetos, recusou }
   opcoes: { frase (a do jogador), outros (nomes presentes, para o primeiro
   nome não casar com quem está), turno }. `recusou`: "" | "limiar" |
   "unica-fala" — a poda achou e não podou; os vetos vão na mesma.
   21/11 (o-mestre-vivo.md §24): duas opções só do conferente da prosa
   (motor/o-conferente-da-prosa.js), que decide sozinho o que pôr no lugar
   quando a poda leva demais: `limiar` (a fração acima da qual não poda;
   sem ela, a da tabela) e `semTravaDaFala` (não guarda a única fala de uma
   pergunta). Quem não as passa tem a poda de sempre, byte a byte.
   ============================================================ */
export function podarOAusente(narrativa, ausentes, opcoes) {
  const o = ehObj(opcoes) ? opcoes : {};
  const texto = str(narrativa);
  const nada = { narrativa: texto, podadas: [], vetos: [], recusou: "" };
  if (!texto.trim()) return nada;
  /* quem o jogador nomeou na frase ele foi procurar: a resposta é da recusa
     do ausente (antes do Narrador), e a prosa sobre essa pessoa não se poda */
  const naFrase = " " + sem(o.frase).replace(/[^a-z0-9-]+/g, " ") + " ";
  const alvos = formasDos(arr(ausentes).filter((a) => ehObj(a) && nomeDe(a)), o.outros)
    .filter((a) => !a.formas.some((f) => naFrase.includes(" " + f.join(" ") + " ")));
  if (!alvos.length) return nada;
  /* atalho: nenhum nome na prosa, nada a ler */
  const base = " " + sem(texto).replace(/[^a-z0-9-]+/g, " ") + " ";
  const vivos = alvos.filter((a) => a.formas.some((f) => base.includes(" " + f.join(" ") + " ")));
  if (!vivos.length) return nada;
  const podadas = [];
  const linhas = texto.split("\n");
  const novas = [];
  let arrastaFala = false;
  for (const linha of linhas) {
    const eFala = /^\s*[—–]/.test(linha);
    if (eFala && arrastaFala) { podadas.push({ ...podadas[podadas.length - 1], frase: linha.trim() }); continue; }
    arrastaFala = false;
    if (!linha.trim()) { novas.push(linha); continue; }
    if (eFala) {
      const a = quemAgeNaFrase(linha, linha, 0, vivos);
      if (a) { podadas.push({ nome: a.nome, frase: linha.trim(), onde: a.onde, morto: a.morto }); continue; }
      novas.push(linha);
      continue;
    }
    let fica = "";
    let dela = null, ultimaPodada = false;
    for (const f of frasesDaLinha(linha)) {
      /* a fala colada à frase podada é de quem a frase pôs a agir («Helga
         pousa a mão no seu ombro. — Então fica assim.»): vai junto, até a
         narração voltar */
      const naFala = /^\s*[—–]/.test(f.texto) || ((linha.slice(0, f.ini).match(/[—–]/g) || []).length % 2) === 1;
      if (dela && naFala) { podadas.push({ ...dela, frase: f.texto.trim() }); ultimaPodada = true; continue; }
      dela = null;
      const a = quemAgeNaFrase(f.texto, linha, f.ini, vivos);
      if (a) {
        dela = { nome: a.nome, onde: a.onde, morto: a.morto };
        podadas.push({ ...dela, frase: f.texto.trim() });
        ultimaPodada = true;
        continue;
      }
      ultimaPodada = false;
      fica += f.texto;
    }
    /* «Morgane entra e diz:» — a linha de fala seguinte é dela, e vai junto */
    if (ultimaPodada && dela) arrastaFala = true;
    if (fica.trim()) novas.push(fica.replace(/\s+$/, ""));
  }
  if (!podadas.length) return nada;
  const nomes = [];
  for (const p of podadas) if (!nomes.some((n) => n.nome === p.nome)) nomes.push(p);
  const vetos = nomes.slice(0, T.porTurno).map((a) => vetoDoAusente(a, o.turno));
  const podado = novas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const tirou = 1 - podado.length / texto.trim().length;
  const limiar = typeof o.limiar === "number" && o.limiar > 0 && o.limiar <= 1 ? o.limiar : T.limiar;
  if (tirou > limiar || (!podado && limiar < 1)) return { narrativa: texto, podadas, vetos, recusou: "limiar" };
  if (o.semTravaDaFala !== true && ehPergunta(o.frase) && temFala(texto) && !temFala(podado)) return { narrativa: texto, podadas, vetos, recusou: "unica-fala" };
  return { narrativa: podado, podadas, vetos, recusou: "" };
}
