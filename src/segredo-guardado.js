/* ============================================================
   O SEGREDO GUARDADO (Fase MM, MM15 · 30/09) — o que a espinha cala

   A segunda sessão de prova (MM11, `mente/mm11-sessao-2.md`, T10) viu um
   segredo da história escrever-se sozinho. A jogadora, ao balcão, pôs a
   Lina contra a parede: "Sou soldada, sei calar o que ouço — e se essa
   caravana não chegar, vais querer alguém de escudo à porta. Diz-me o que
   se passa no Fundo do Poço." Nenhum dado rolou. O Mestre respondeu que
   "a água lá embaixo não reflete rosto" e que "ninguém entra", e o
   Cronista gravou isso no cânone como verdade. Só que o Fundo do Poço é,
   na base do mundo, a CASA DE BANHOS da cidade — e é o marco 2 da
   espinha, "O que O Fundo do Poço esconde". Foi o Narrador a decidir o
   que a espinha guarda; a lei da casa diz o contrário: o Narrador nunca
   vê a verdade antes do turno da revelação, e ele aqui a escreveu.

   As causas são duas, e cada metade deste arquivo fecha uma.

   ---------------- (a) O CÂNONE NÃO É A BOCA DO NARRADOR ----------------

   As duas portas do cânone (`mudancas.canone` do Narrador e a secção
   `canone` do Cronista, no App) gravavam tudo o que chegasse: o que a
   narração disse virava fato durável, com o peso de verdade que o
   `formatarCanone` lhe dá a cada turno seguinte. `peneirarCanone` é a
   peneira que faltava, com duas regras:

     1. O SEGREDO DE UM MARCO NÃO ENTRA antes de o marco cair. Uma entrada
        cujo nome é o lugar de um marco "descobrir" ainda de pé (ou um
        segredo/coisa que diga estar LÁ) não é registo — é o Narrador a
        eleger o que a história esconde. O marco cai pelo `revelar`
        (missoes.js): estar lá quando o lugar entra em cena. É esse o
        turno da revelação, e é o sistema que o decide; depois dele, a
        entrada passa.
     2. A BASE NÃO SE REESCREVE. Uma entrada cujo nome é um local da base
        e cuja descrição diz que ele é OUTRA ESPÉCIE de lugar ("poço
        temido" para uma casa de banhos) não muda o que a base diz.

   A FORMA É RECUSAR, e não guardar como boato. Li o cânone à procura de
   uma figura de rumor — algo que o `formatarCanone` mandasse ao Narrador
   SEM peso de verdade — e ela não existe: toda entrada vai como fato.
   Criar essa figura seria mexer no formato do que o save guarda e no que
   o prompt recebe, e nada disto pede tanto: a frase do Mestre continua no
   histórico da conversa (a jogadora leu-a, e é isso que ela é — uma coisa
   que a Lina disse); o que não acontece é ela virar a verdade da espinha.
   Recusa-se em silêncio — o sistema não fala de si mesmo.

   ---------------- (b) PERGUNTAR É DE GRAÇA; ARRANCAR NÃO ----------------

   Porque é que o J10 não rolou: não foi a v9.336 a passar a pergunta à
   frente do argumento. A frase não tem "?" (não é pergunta para
   `soPergunta`) e não tem nenhum verbo do catálogo social — `convencer`
   só conhece "convenço/argumento/insisto", e "Diz-me o que se passa"
   não é nenhum deles. `lerAcao` caiu em `naoPedeDado` e devolveu
   `livre` (o "não saio do balcão" casou "deslocar-se e olhar"). A
   pauta foi sem TESTE, e o Narrador ficou sozinho com o segredo.

   A FRONTEIRA É O SEGREDO GUARDADO, e não a forma da frase:
     · PERGUNTAR por um lugar continua de graça ("onde fica o Fundo do
       Poço?", "o que se passa no Fundo do Poço?"). A ficha responde o
       que sabe, e vai ao Narrador, na secção de vetos, que o que o lugar
       esconde não é dele (`vetoDoSegredo`);
     · ARRANCAR o que ele esconde a alguém — o pedido imperativo ("diz-me",
       "conta-me", "desembucha") ou o esforço declarado ("convenço",
       "insisto") sobre o que lá se passa — é um teste social, e o preço
       é o degrau `PEDIDO_DO_SEGREDO`. O desafio é `fazer_falar`
       (desafios.js), que só existe quando há segredo guardado na frase.

   E O QUE O SUCESSO COMPRA É O QUE O SISTEMA SABE. A espinha não elege o
   CONTEÚDO de "o que X esconde" — elege o lugar e o momento. Logo ninguém
   ao balcão o sabe, e o sucesso não pode comprar o que não existe. O que
   ele compra é a verdade da base sobre o lugar: o que ele é, onde fica,
   quem lá trabalha (a gente da base, com nome), e que há ali coisa de que
   a cidade não fala. É uma pista que aponta para o marco — que é o que a
   espinha pede ao Narrador ("puxe a cena para esse rumo") — e nunca o
   marco.

   ---------------- SEPARADO DO DESENHO ----------------

   Puro, provado em Node (`testes/teste-mm15-segredo.mjs`). Sem sorte: tudo
   sai da espinha e da base, que já são da semente. Nada novo no save: a
   espinha e a base são lidas, nunca escritas.
   ============================================================ */

import { locaisDaCidade, genteDoLocal, estaMorto } from "./mundo-base.js";
import { emProclise, soODeclarado } from "./peneira.js";
import { fraseDoJogador, semNomesProprios } from "./perguntas.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const semArtigo = (s) => norm(s).trim().replace(/^(o|a|os|as)\s+/, "").trim();
const obj = (o) => (o && typeof o === "object" ? o : {});
/* " palavra palavra " — para casar um nome como palavras inteiras */
const palavras = (s) => ` ${norm(s).replace(/[^a-z0-9]+/g, " ").trim()} `;
const contemNome = (texto, nome) => {
  const n = palavras(semArtigo(nome)).trim();
  return n.length >= 4 && palavras(texto).includes(` ${n} `);
};

/* ============================================================
   1. QUE MARCOS GUARDAM SEGREDO
   ============================================================ */

/* Um feitio de marco guarda segredo quando o que ele promete é DESCOBRIR
   alguma coisa — e o campo diz onde ela está. Encontrar alguém não guarda
   segredo (a pessoa tem nome, e dizê-lo não a encontra), e acabar com um
   chefe também não (o nome dele é o medo da cidade). Só o "descobrir"
   tem um "o que X esconde", e é esse que o Narrador não pode eleger. */
export const SEGREDOS_DA_ESPINHA = {
  descobrir: { campo: "onde", porque: "o que um lugar esconde só a espinha o põe lá, e só o marco o revela" },
};

/* Quantas pessoas da casa a pista nomeia. Duas é o que um balcão sabe de
   uma casa alheia: o dono e mais um; a casa inteira seria uma ficha. */
export const GENTE_DA_PISTA = 2;

/* O lugar de um marco na base: pela chave (`Cidade|tipo`, que a espinha
   nova grava na condição), senão pelo nome em todo o mapa. */
function localDoMarco(m, mundo) {
  const w = obj(mundo);
  const cidades = (w.mapa && Array.isArray(w.mapa.cidades) ? w.mapa.cidades : []).filter((c) => c && c.nome);
  if (!cidades.length || !w.semente) return null;
  const chave = String(m.chave || (m.condicao && m.condicao.chave) || "");
  const loc = (c) => { try { return locaisDaCidade(w.semente, c, w.genero, w.molde, w.lex); } catch { return []; } };
  if (chave.includes("|")) {
    const c = cidades.find((x) => x.nome === chave.split("|")[0]);
    const l = c ? loc(c).find((x) => x.id === chave) : null;
    if (l) return l;
  }
  const alvo = semArtigo(m.onde);
  for (const c of cidades) {
    const l = loc(c).find((x) => semArtigo(x.nome) === alvo);
    if (l) return l;
  }
  return null;
}

/* Os segredos que a espinha ainda guarda: os marcos de um feitio de
   `SEGREDOS_DA_ESPINHA` que ainda não caíram. `mundo` ({ semente, mapa,
   genero, molde, lex, base }) é opcional: com ele, cada segredo sabe o que
   o lugar É na base e quem lá trabalha; sem ele, só o nome — e o nome
   basta para vetar. Lixo devolve []. */
export function segredosGuardados(espinha, mundo = null) {
  const atos = espinha && Array.isArray(espinha.atos) ? espinha.atos : [];
  const out = [];
  const vistos = new Set();
  for (const a of atos) {
    for (const m of (a && Array.isArray(a.marcos) ? a.marcos : [])) {
      if (!m || typeof m !== "object" || m.feito) continue;
      const regra = SEGREDOS_DA_ESPINHA[m.feitio];
      if (!regra) continue;
      const nome = String(m[regra.campo] || "").trim();
      if (semArtigo(nome).length < 4 || vistos.has(semArtigo(nome))) continue;
      vistos.add(semArtigo(nome));
      const s = { id: String(m.id || ""), nome, titulo: String(m.titulo || ""), cidade: "", tipo: "", chamado: "", gente: [] };
      const l = localDoMarco(m, mundo);
      if (l) {
        s.cidade = l.cidade || "";
        s.tipo = l.tipo || "";
        s.chamado = l.chamado || l.tipo || "";
        const w = obj(mundo);
        let gente = [];
        try { gente = genteDoLocal(w.semente, l, w.genero, w.molde, w.lex); } catch { gente = []; }
        s.gente = gente.filter((p) => !estaMorto(w.base, p.nome)).slice(0, GENTE_DA_PISTA).map((p) => ({ nome: p.nome, papel: p.papel || "" }));
      }
      out.push(s);
    }
  }
  return out;
}

/* ============================================================
   2. A FRASE QUE ARRANCA (e a que só pergunta)
   ============================================================ */

/* Lidas DEPOIS de `emProclise` ("diz-me" chega "me diz") e sem acento.
   São três perguntas à frase, e as três têm de dizer sim na MESMA oração
   (o ponto, a exclamação, a interrogação partem-na — o travessão e os
   dois-pontos não, que "Diz-me: o que se passa…?" é uma oração só):
     PEDE    — o imperativo de quem quer que lhe digam;
     OCULTO  — que se pede o que o lugar ESCONDE, e não onde fica ou
               quanto custa (isso é balcão, e a ficha responde). O verbo
               "esconder" vale solto: "o que A Feira Calada esconde" tem o
               nome entre o "o que" e o verbo;
     o nome do lugar de um marco de pé.
   ESFORCO é o outro caminho para o mesmo pedido: quem declara que
   convence, insiste ou ameaça não precisa do imperativo — basta a
   oração que pede o oculto. Sem esforço, a oração que termina em "?" é
   pergunta, e pergunta é de graça mesmo com "diz-me" à frente; e o pedido
   tem de ter sido DECLARADO (a peneira da casa, com a fala de volta). A
   régua do portão vale aqui: para morder, tudo na mesma oração; o falso
   negativo é o comportamento de antes. */
export const ARRANCAR = {
  PEDE: /\b(me (diz|diga|digas|dizes|conta|conte|contes|fala|fale|fales|explica|explique|revela|revele)|me (vais|vai) (dizer|contar)|desembuch\w*|abre o jogo|quero que me (digas|diga|contes|conte|fales|fale)|(tens|tem) de me (dizer|contar)|preciso que me (digas|diga|contes|conte)|(diz|conta|fala) (la|logo))\b/,
  OCULTO: /\b(o que (e que )?(se )?(passa|passou|ha|havia|tem|existe|acontece|aconteceu|esconde|escondem|escondia|guarda|guardam|houve|vive|mora|se diz|dizem|sabes|sabe|sabem)|(esconde|escondem|escondia|escondeu|esconder)|que (se )?passa|o segredo|que segredo|a verdade|que mal|porque (e que )?(todos|toda a gente|ninguem|a gente|voces|toda gente)|por que (todos|toda a gente|ninguem))\b/,
  ESFORCO: /\b(tento convencer|convenco|persuad\w*|argument\w*|insisto|pressiono|aperto com|imploro|suplico|intimid\w*|ameaco|minto|blefo|engano)\b/,
};

const lista = (segredos) => (typeof segredos === "function" ? (() => { try { return segredos(); } catch { return []; } })() : segredos);

/* O segredo guardado que o turno NOMEIA, ou null. Lê o texto INTEIRO, e
   não só o "Eu disse" de um envelope: a frase da jogadora traz aspas
   dentro ("Lina, ouve. …"), e o "Eu disse" corta na primeira — o T10,
   embrulhado no envelope do teste, perdia o nome. Um envelope do sistema
   que nomeie o lugar (o movimento, o próprio teste) fala da mesma cena,
   e o veto vale para ele igual. */
function segredoNaFrase(frase, segredos) {
  const ss = (Array.isArray(lista(segredos)) ? lista(segredos) : []).filter((s) => s && s.nome);
  if (!ss.length) return null;
  const t = String(frase == null ? "" : frase);
  return ss.find((s) => contemNome(t, s.nome)) || null;
}

/* O que a heroína DECLAROU, do mesmo tamanho da frase: a peneira da casa
   (`soODeclarado`) apaga a negação, a hipótese, a pergunta e a fala — e a
   fala volta, porque o que ela diz em voz alta à Lina é o que ela faz.
   Uma fala é dita; "não lhe peço que me diga" não pede nada. */
const RX_FALA = /["“”«»][^"“”«»]*["“”«»]/g;
function declarado(t) {
  let d = t;
  try { d = soODeclarado(t); } catch { d = t; }
  if (d.length !== t.length) return t;
  for (const m of t.matchAll(RX_FALA)) d = d.slice(0, m.index) + m[0] + d.slice(m.index + m[0].length);
  return d;
}
/* "não me digas o que…" dentro da fala: a negação colada ao pedido */
const NEGADO_ANTES = /\bnao\s+$/;

/* A frase ARRANCA um segredo guardado? Devolve o segredo, ou null. Aceita
   o envelope do sistema (lê o "Eu disse"), a lista ou uma função que a
   devolva (o App passa a função, para só a calcular quando é preciso).
   As três perguntas de `ARRANCAR`, oração a oração; e a PERGUNTA é de
   graça mesmo no imperativo ("Diz-me: o que se passa lá?" leva o veto,
   não o dado) — só o esforço declarado ("insisto", "convenço") a faz
   pressão. */
export function pressionaSegredo(frase, segredos) {
  const ss = (Array.isArray(lista(segredos)) ? lista(segredos) : []).filter((s) => s && s.nome);
  if (!ss.length) return null;
  const t = emProclise(norm(fraseDoJogador(frase)));
  if (!t.trim()) return null;
  const d = declarado(t);
  const esforco = ARRANCAR.ESFORCO.test(d);
  const rx = /[^.!?;\n]+[.!?;\n]*/g;
  let m;
  while ((m = rx.exec(t))) {
    const o = m[0];
    if (!ARRANCAR.OCULTO.test(o)) continue;
    const s = ss.find((x) => contemNome(o, x.nome));
    if (!s) continue;
    if (esforco) return s;
    if (/\?/.test(o)) continue;
    /* o pedido tem de estar no que foi DECLARADO, e não negado na fala */
    const pede = new RegExp(ARRANCAR.PEDE.source, "g");
    let p;
    while ((p = pede.exec(o))) {
      const em = m.index + p.index;
      const vivo = d.slice(em, em + p[0].length) === p[0];
      if (vivo && !NEGADO_ANTES.test(o.slice(0, p.index))) return s;
    }
  }
  return null;
}

/* ============================================================
   3. O PREÇO E O QUE ELE COMPRA
   ============================================================ */

/* O degrau do pedido, no formato de `TAMANHOS_DO_PEDIDO` (social.js), que
   `dificuldadeSocial` aceita em `pedido`. NÃO é uma linha daquela escada,
   de propósito: lá cada degrau se lê na frase, e este só se lê com a
   espinha na mão — uma linha sem `rx` numa tabela de `rx` seria uma
   exceção escondida.

   16: acima do favor (14), que não custa nada a quem o faz, e abaixo de
   quebrar uma regra (18), que custa o emprego. Falar do que a cidade cala
   custa a quem fala o olhar da cidade, e não o posto. Com a relação e o
   papel por cima, a Lina do T10 (taverneira, −1; estranha, +2) dá 17 —
   "incomum" a "difícil", o que um soldado com lábia passa uma vez em
   duas. E o ouro na mesa custa o que custaria um pedido deste tamanho. */
export const PEDIDO_DO_SEGREDO = {
  id: "segredo", dc: 16, rotulo: "o que a cidade cala", moedas: 60,
};

const nomeDaPessoa = (p) => `${p.nome}${p.papel ? ` (${p.papel})` : ""}`;
const juntar = (xs) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);

/* O pedido inteiro para `dificuldadeSocial`: o degrau, e o que o sucesso
   compra DITO COM A BASE — o que o lugar é, onde, e quem lá trabalha. */
export function pedidoDoSegredo(segredo) {
  const s = obj(segredo);
  const nome = String(s.nome || "esse lugar");
  const oQueE = s.chamado ? `é ${s.chamado}${s.cidade ? `, em ${s.cidade}` : ""}` : "onde fica e quem lá vai";
  const gente = Array.isArray(s.gente) && s.gente.length ? `; quem lá trabalha: ${juntar(s.gente.map(nomeDaPessoa))}` : "";
  return {
    ...PEDIDO_DO_SEGREDO,
    cede: `o que essa pessoa sabe DE VERDADE sobre ${nome}, e só isto: ${oQueE}${gente}; e que há ali coisa de que a cidade não fala — o quê, ela não sabe, e só se descobre lá dentro`,
    nunca: `o que ${nome} esconde: ninguém aqui o sabe, e um sucesso não o inventa — nem lenda, nem maldição, nem "ninguém entra"`,
  };
}

/* O veto da pauta (secção `naoPode`): em todo turno em que a frase da
   jogadora NOMEIA um segredo guardado — pergunte, arranque ou só o
   mencione. Não há veto quando a heroína ESTÁ no lugar: é lá que o marco
   cai, e o veto contradiria a revelação. `onde`: { lugar } — o lugar onde
   ela está. Devolve uma lista (o molde de `porNaPauta`). */
export function vetoDoSegredo(frase, segredos, onde = null) {
  const s = segredoNaFrase(frase, segredos);
  if (!s) return [];
  const aqui = obj(onde).lugar;
  if (aqui && semArtigo(aqui) === semArtigo(s.nome)) return [];
  const oQueE = s.chamado ? `, ou mudar o que o lugar é (${s.chamado}${s.cidade ? `, em ${s.cidade}` : ""})` : "";
  return [`revelar o que ${s.nome} esconde${oQueE}: quem fala não sabe, e o que lá há só se descobre lá dentro, quando o sistema o disser`];
}

/* ============================================================
   4. A PENEIRA DO CÂNONE
   ============================================================ */

/* A ESPÉCIE DE UM LUGAR, dita por palavras. Cada linha diz que espécies
   da base (`tipo` de mundo-base.js) uma palavra pode descrever. A última
   não descreve nenhuma: são as espécies que a base nunca põe DENTRO de
   uma cidade como um dos seus locais — dizer que a casa de banhos é um
   poço ou uma cripta é reescrevê-la.
   Uma descrição contradiz a base quando nomeia espécies e NENHUMA delas
   serve ao tipo do local; não nomear espécie nenhuma não contradiz nada
   (o falso negativo é o comportamento de antes). Um tipo que esta tabela
   não conhece (os moldes exóticos: a Torre, o concourse) nunca é julgado. */
export const ESPECIES_DE_LUGAR = [
  { rx: /\b(tavernas?|estalagens?|hospedarias?|albergues?|bodegas?|pousadas?|botequins?)\b/, de: ["taverna"] },
  { rx: /\b(mercados?|feiras?|bazar(es)?)\b/, de: ["mercado"] },
  { rx: /\b(templos?|capelas?|santuarios?|igrejas?|ermidas?)\b/, de: ["templo"] },
  { rx: /\b(forjas?|ferrarias?|oficinas?)\b/, de: ["forja"] },
  { rx: /\b(quarteis|quartel|casernas?|guarnic(ao|oes))\b/, de: ["quartel"] },
  { rx: /\b(cadeias?|prisao|prisoes|carceres?|calabouc?os?|celas?)\b/, de: ["cadeia"] },
  { rx: /\b(bibliotecas?|arquivos?)\b/, de: ["biblioteca"] },
  { rx: /\b(docas?|cais|portos?|ancoradouros?|pier|molhes?)\b/, de: ["docas"] },
  { rx: /\b(arenas?|anfiteatros?|rinhas?)\b/, de: ["arena"] },
  { rx: /\b(cemiterios?|jazigos?|necropoles?|ossarios?)\b/, de: ["cemitério"] },
  { rx: /\b(guildas?|confrarias?|corporac(ao|oes))\b/, de: ["guilda"] },
  { rx: /\b(banhos?|termas|balnearios?|vapor)\b/, de: ["casa de banhos"] },
  { rx: /\b(pocos?|cisternas?|abismos?|criptas?|catacumbas?|cavernas?|grutas?|covis|covil|tocas?|minas?|ruinas?|tumbas?|masmorras?)\b/, de: [] },
];
const TIPOS_JULGADOS = new Set(ESPECIES_DE_LUGAR.flatMap((e) => e.de));

/* Todos os locais da base no mapa, por nome sem artigo. */
function locaisDaBase(mundo) {
  const w = obj(mundo);
  const cidades = (w.mapa && Array.isArray(w.mapa.cidades) ? w.mapa.cidades : []).filter((c) => c && c.nome);
  if (!w.semente) return { porNome: new Map(), cidades: [] };
  const porNome = new Map();
  for (const c of cidades) {
    let ls = [];
    try { ls = locaisDaCidade(w.semente, c, w.genero, w.molde, w.lex); } catch { ls = []; }
    for (const l of ls) if (!porNome.has(semArtigo(l.nome))) porNome.set(semArtigo(l.nome), l);
  }
  return { porNome, cidades: cidades.map((c) => c.nome) };
}

const ehPessoa = (f) => /pessoa|npc|personagem/.test(norm(f && f.tipo));
const ehSegredo = (f) => /segredo|misterio|maldic|lenda|enigma/.test(norm(f && f.tipo));
const textoDa = (f) => ["descricao", "detalhes", "notas"].map((k) => String((f && f[k]) || "")).filter(Boolean).join(". ");

/* A entrada toca um segredo guardado? */
function tocaSegredo(nome, f, ss) {
  for (const s of ss) {
    if (contemNome(nome, s.nome)) return s;
    if (ehPessoa(f)) continue;
    /* uma coisa (que não é gente) que diz estar LÁ, ou um segredo que fala
       do lugar: é o conteúdo do marco, dito pela boca errada */
    if (semArtigo(f.local) && semArtigo(f.local) === semArtigo(s.nome)) return s;
    if (ehSegredo(f) && contemNome(textoDa(f), s.nome)) return s;
  }
  return null;
}

/* A entrada reescreve o que a base diz de um local? */
function contradizBase(nome, f, base) {
  const l = base.porNome.get(semArtigo(nome));
  if (!l || !TIPOS_JULGADOS.has(l.tipo)) return null;
  /* os nomes próprios saem antes: "Runa do Poço" não diz que nada é um poço */
  const t = semNomesProprios(`${textoDa(f)}`, [l.nome, nome, l.cidade, ...base.cidades]);
  const ditas = ESPECIES_DE_LUGAR.filter((e) => e.rx.test(t));
  if (!ditas.length) return null;
  if (ditas.some((e) => e.de.includes(l.tipo))) return null;
  return l;
}

/* O cânone proposto, peneirado. `ctx`: { espinha, mundo } (o mesmo
   `mundo` de `segredosGuardados`). Devolve `{ canone, recusadas }`:
   `canone` é um objeto NOVO só com as entradas que passam (o recebido
   não é tocado); `recusadas` diz qual e porquê — "segredo" (o lugar de
   um marco de pé) ou "base" (outra espécie de lugar) —, para a prova e
   para o diário, nunca para a tela. */
export function peneirarCanone(novo, ctx = null) {
  const o = obj(ctx);
  const canone = {};
  const recusadas = [];
  if (!novo || typeof novo !== "object") return { canone, recusadas };
  const ss = segredosGuardados(o.espinha, o.mundo);
  let base = null;
  for (const [nome, f] of Object.entries(novo)) {
    if (!nome || !f || typeof f !== "object") { canone[nome] = f; continue; }
    const s = tocaSegredo(nome, f, ss);
    if (s) { recusadas.push({ nome, porque: "segredo", de: s.nome }); continue; }
    if (!base) base = locaisDaBase(o.mundo);
    const l = contradizBase(nome, f, base);
    if (l) { recusadas.push({ nome, porque: "base", de: `${l.nome} (${l.tipo})` }); continue; }
    canone[nome] = f;
  }
  return { canone, recusadas };
}
