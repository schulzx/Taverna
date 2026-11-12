/* ============================================================
   O SUCESSO DÁ SEMPRE UM FACTO (11/11/2026, Fase MC · MC4)

   A 18.ª sessão contou-o, e o estudo do Matt pô-lo em número
   (mente/estudo-do-mestre.md, L2): na mesa dele o resultado alto que não dá
   nada é 1%; na nossa, 25% dos sucessos chegavam vazios. Duas causas
   (mente/plano-o-mestre-chama-o-dado.md, §1.3 e §2.4):

     · o envelope do teste mandava o Narrador «revelar UMA coisa concreta e
       útil» (testes.js) — o facto do sucesso era DELEGADO, e saía
       plausível, não verdade: o oposto da régua Matt Mercer;
     · a busca que passava sem achado dizia «AQUI NÃO HÁ NADA ESCONDIDO» e
       fechava o lugar — mesmo onde o passo da quest mandava descobrir, mesmo
       num sítio cheio de gente com vontades que a base conhece.

   Passar compra uma verdade do SISTEMA. `oFactoDoSucesso` procura-a, pela
   ordem de FACTO_DO_SUCESSO, nas fontes que o jogo já tem:

     1. passo     — o passo ativo da quest, quando este é o lugar dele (o
                    segredo que ele planta: a-quest-manda.js);
     2. achado    — o segredo do prédio ou o baú do ermo (`achavelAqui`, com
                    a régua de onde se procura);
     3. livro     — o que o livro de factos guarda do assunto (o lugar onde
                    esteve, o favor devido, as linhas do QUEM É de alguém);
     4. bestiario — a criatura: o sinal que deixa (SINAIS_DO_BESTIARIO), o
                    que faz e o que é;
     5. lugar     — o registo do lugar: quem trabalha no prédio onde o herói
                    está e o que essa pessoa quer; na rua, o rumor que corre;
                    a cidade, se o assunto é ela.

   E nunca de outro prédio: a gente é a do sítio onde o herói está (ou do
   prédio de que o cómodo faz parte), a mesma régua que o achado já tem
   (`procuravelAqui`, mundo-base.js). Na rua não há gente de ninguém; fora
   dos muros, o ermo e os bichos dele.

   A busca vazia («aqui não há nada») fica só para quando nenhuma fonte tem
   nada — e aí `oFactoDoSucesso` dá `null`, e o envelope de sempre diz-o.

   O facto vai ao envelope do teste (`envelopeDoTeste`, campo `facto`) NO
   LUGAR da frase genérica, com um teto (o teto de prompt é sagrado: a
   suíte prova que o pior caso não cresce).

   PURO E DETERMINÍSTICO: a escolha de quem (entre a gente do prédio, entre
   os bichos da região) sai de um gerador semeado pela semente do mundo e
   pelo sítio — a mesma busca no mesmo sítio dá o mesmo facto em qualquer
   máquina. `null` e lixo: `null`, nunca lança.
   ============================================================ */
import { oQueExisteAqui, criaturaPorNome } from "./mundo-base.js";
import { rngDe } from "./geografia.js";
import { oficioNoGenero } from "./nomes.js";
import { SINAIS_DO_BESTIARIO } from "./encontro-na-estrada.js";
import { achadoDoPasso, pistaDoPassoAqui } from "./a-quest-manda.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const semAc = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (s) => semAc(s).replace(/^(o|a|os|as)\s+/, "").trim();
const encher = (molde, v) => String(molde).replace(/\{(\w+)\}/g, (m, k) => (v[k] == null ? "" : String(v[k])));

/* ---------------- A TABELA ----------------
   `familias`: que desafios (o `id` do catálogo, desafios.js) dão facto, e
   de que família. `ordem`: as fontes de cada família, pela ordem em que se
   pergunta — a primeira que tem resposta é a resposta.
   `frases`: como o facto se diz, por fonte (e, no registo do lugar, por
   família); `{x}` são campos do facto. Texto de MUNDO: nunca o nome de um
   mecanismo. `teto`: o comprimento máximo do texto do facto (o envelope
   leva-o inteiro; a planta, §4, dá-lhe ≤ 200). `quemDoLivro`: quantas
   linhas do QUEM É de uma pessoa entram. */
export const FACTO_DO_SUCESSO = Object.freeze({
  familias: Object.freeze({
    buscar: "busca", investigar: "busca",
    rastrear: "rasto",
    lembrar: "saber", fraqueza: "bicho",
  }),
  ordem: Object.freeze({
    busca: Object.freeze(["passo", "achado", "lugar"]),
    rasto: Object.freeze(["passo", "bestiario", "lugar"]),
    saber: Object.freeze(["passo", "livro", "bestiario", "lugar"]),
    bicho: Object.freeze(["bestiario", "livro"]),
  }),
  frases: Object.freeze({
    passo: "{o}",
    achado: "escondido aqui: {o}, {onde}",
    livro: "o que já sabes de {nome}: {linhas}",
    bestiario: Object.freeze({
      rasto: "sinais de {nome} por aqui: {sinal}",
      saber: "{nome}: {desc}; {comportamento}",
    }),
    lugar: Object.freeze({
      /* S19 (defeito 2): dizia «não há esconderijo» — e o RUMO tinha dito
         quatro vezes que ali se escondia alguma coisa. O facto diz o que o
         sítio mostra, e não nega o que outro órgão afirma. */
      busca: "o que o sítio mostra é o rasto de quem o usa: {nome}, {oficio} {daqui}, {vontade}",
      rasto: "o chão daqui é o de quem o pisa todos os dias: {nome}, {oficio} {daqui}, que {modo}",
      saber: "{aqui}: {chamado}, onde está {gente}",
      rua: "o que corre na rua: {masmorra}, {rumor}",
      /* S19: «Ribeira das Areias: capital de Taverna do Sino Rachado» lia-se
         como se a cidade fosse a capital da taverna */
      cidade: "{cidade} ({porte}): {locais}",
      /* S19 (defeito 4): o sujeito da pergunta manda no facto — a masmorra, a
         outra cidade e a pessoa que ela nomeia, antes do sítio onde se está */
      masmorra: "{nome}: {tipo}{perto}; o que se diz de lá: {rumor}",
      outraCidade: "{cidade}: {porte}{regiao}",
      pessoa: "{nome}: {oficio} {daqui}",
      bichos: "o que anda por estas terras: {lista}",
    }),
  }),
  /* o livro: as partes de uma entrada de lugar e de pessoa, em frase */
  doLivro: Object.freeze({
    esteve: "estiveste lá {vezes}",
    descobriu: "o segredo de lá caiu contigo",
    favor: "deve-te um favor",
    falou: "falaste com {quem} {vezes}",
    derrotado: "caiu às tuas mãos ({como})",
  }),
  vezes: Object.freeze({ uma: "uma vez", muitas: "{n} vezes" }),
  /* S19 (defeito 4): a pergunta que é sobre o sítio onde se está («o que sei
     desta cidade?») — só ela, a vazia e a que nomeia a cidade caem no
     registo do sítio; a que nomeia outra coisa que o registo não conhece
     não tem facto daqui (e o envelope diz o de sempre, com o veto) */
  sobreAqui: /^(?:(?:a|o|esta|este|essa|esse|aqui|daqui)\s+)?(cidade|vila|aldeia|lugar|sitio|terra|regiao|bairro|povoado|porto|vale|sitio onde estou)$/,
  perto: " perto de {cidade}",
  /* a pergunta pelos bichos sem nome («bichos assim», «as feras daqui»):
     os da região, e não a cidade; `quantos` cabe no teto */
  bichosSemNome: /\b(bichos?|feras?|criaturas?|monstros?|bestas?|animais|coisas que andam)\b/,
  quantosBichos: 3,
  naRegiao: ", em {regiao}",
  quemDoLivro: 2,
  teto: 200,
});

/* ---------------- O EFEITO DO SUCESSO (12/11, a 19.ª sessão, defeito 1) ----------------
   O facto só cobria vasculhar, investigar, rastrear e lembrar: Intuição,
   Prestidigitação, Medicina e Furtividade caíam no «revele UMA coisa», e o
   Narrador enchia o sucesso com o que a cena dele pedia (o fólio do
   mistério num baú de gazua, a chave mestra, a pista do fiador). Num teste
   de AÇÃO o sucesso não compra uma coisa do mundo: compra o EFEITO que o
   gesto declarou, e só ele. Esta tabela é esse efeito, por desafio do
   catálogo (desafios.js), na voz do herói como o resto do envelope;
   `{quem}` é a pessoa do veredito (`v.quem`), e `quemSemNome` quando não
   há. Texto de MUNDO: nunca o nome de um mecanismo. Os testes de saber que
   não têm fonte própria (a escuta, o arcano, a heráldica, o diagnóstico)
   têm aqui a sua régua: dizem só o que a cena já tem. */
export const EFEITO_DO_SUCESSO = Object.freeze({
  efeitos: Object.freeze({
    mentira: "leio {quem} pelo rosto e pela voz: fica à vista o que sente agora; o que guarda e para onde me quer levar continua guardado",
    escutar: "ouço o que daqui se ouve: os sons de quem e do que a cena já tem, nítidos — nenhuma voz nova",
    tranca: "a tranca cede e abre; do outro lado está só o que lá já estava",
    escalar: "chego lá acima, firme, sem escorregar",
    furtar_se: "passo despercebido: ninguém me vê nem me ouve enquanto me movo assim",
    bater_carteira: "a mão leve passa: o que eu quis tirar ou pôr muda de sítio sem que ninguém sinta — e é só isso, o que eu vi",
    estancar: "o curativo segura: o sangue para e a ferida fica fechada",
    arcano: "sinto o que há de arcano aqui: só o que a cena já tem de magia, e se não tem nenhuma, não há",
    desarmar: "a armadilha fica desarmada, inofensiva",
    nadar: "atravesso a água e chego aonde queria",
    saltar: "chego ao outro lado, de pé",
    forcar: "o peso cede e mexe-se",
    equilibrio: "atravesso firme, sem cair",
    arrebentar: "a amarra cede e solta-se",
    escapar: "solto-me do que me prendia",
    aguentar: "aguento: o corpo segura sem perder nada",
    cavalgar: "a montaria obedece e faz o que eu pedi",
    acalmar_bicho: "o bicho acalma e deixa-se chegar",
    atuar: "a atuação pega: quem vê fica preso a mim enquanto dura",
    orientar: "acho o rumo: sei para que lado fica o que procuro",
    diagnosticar: "reconheço o mal pelo que o corpo mostra: os sinais que estão à vista, e nada além deles",
    heraldica: "reconheço o símbolo pelo que ele é: de que espécie de casa, ofício ou fé, sem dono que o mundo não tenha",
    falsificar: "o documento sai convincente a olho",
    seguir_alguem: "sigo {quem} sem que dê por mim, até onde for",
  }),
  quemSemNome: "quem está à minha frente",
});

const cortar = (s) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  const n = FACTO_DO_SUCESSO.teto;
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};
const vezes = (n) => (Number(n) > 1 ? encher(FACTO_DO_SUCESSO.vezes.muitas, { n: Number(n) }) : FACTO_DO_SUCESSO.vezes.uma);
const comDe = (nome) => {
  const m = String(nome || "").match(/^(O|A|Os|As)\s+(.+)$/);
  return m ? `${{ o: "do", a: "da", os: "dos", as: "das" }[m[1].toLowerCase()]} ${m[2]}` : `de ${nome}`;
};

/* S19: o teste de ação do catálogo que passou → o efeito dele, como facto
   de fonte «efeito» (o envelope do teste leva-o no lugar do «revele»). O
   improviso (`gesto`) tem o seu envelope; o social, o dele. */
function oEfeitoDoSucesso(v) {
  const x = obj(v);
  if (!x || x.tipo !== "teste" || x.gesto || x.social) return null;
  const molde = EFEITO_DO_SUCESSO.efeitos[x.id];
  if (!molde) return null;
  const quem = typeof x.quem === "string" && x.quem.trim() ? x.quem.trim() : EFEITO_DO_SUCESSO.quemSemNome;
  return Object.freeze({ fonte: "efeito", familia: "efeito", texto: cortar(encher(molde, { quem })), de: Object.freeze({ desafio: x.id }) });
}

/* a família do veredito, ou null (o teste que não compra saber: o salto, o
   convencer — esses têm o seu envelope) */
function familiaDe(v) {
  const x = obj(v);
  if (!x || x.tipo !== "teste" || x.gesto || x.social) return null;
  return FACTO_DO_SUCESSO.familias[x.id] || null;
}

/* o mundo de oQueExisteAqui, uma vez por pergunta */
function mundoDe(c) {
  if (!c.semente || !c.cidade) return null;
  try { return oQueExisteAqui(c.semente, c.mapa, c.cidade, c.base, c.genero || undefined, c.molde || null, c.lex || null); } catch { return null; }
}
const sorteDe = (c, ...partes) => rngDe([c.semente || "", "facto", ...partes].join("|"));
const escolher = (rnd, lista) => lista[Math.floor(rnd() * lista.length) % lista.length];

/* o local onde o herói está (pelo nome do sítio ou do prédio), ou null */
function localAqui(q, onde) {
  const o = obj(onde);
  if (!q || !o || o.foraDosMuros) return null;
  const aqui = [o.lugar, o.dentroDe].map(semArtigo).filter(Boolean);
  return arr(q.locais).find((l) => aqui.includes(semArtigo(l.nome))) || null;
}

/* ---------------- AS FONTES ----------------
   Cada uma: (v, c, família, q) → null | { texto, de, ... }. Em flecha, e não
   em método: o check-imports lê `passo(v) {` como chamada a uma função que
   ninguém define. */
const FONTES = {
  passo: (v, c, fam) => {
    const passos = arr(c.passos);
    let a = null;
    if (fam === "busca") a = achadoDoPasso(passos, c.onde) || (obj(v.achado) && v.achado.especie === "passo" ? v.achado : null);
    else if (fam === "rasto") a = pistaDoPassoAqui(passos, c.onde);
    else if (fam === "saber") {
      /* lembrar o lugar do passo é lembrar a pista dele (sem a descobrir) */
      const sobre = semArtigo(v.sobre || c.alvo);
      if (!sobre) return null;
      for (const p of passos) {
        const l = arr(obj(p) && p.lugares).find((x) => { const n = semArtigo(x.nome); return n && (sobre.includes(n) || n.includes(sobre)); });
        if (l) { a = achadoDoPasso([p], { lugar: l.nome, cidade: l.cidade }) || pistaDoPassoAqui([p], { lugar: l.nome, cidade: l.cidade }); if (a) a = { ...a, semDescobrir: true }; }
        if (a) break;
      }
    }
    if (!a) return null;
    return { texto: encher(FACTO_DO_SUCESSO.frases.passo, a), de: { local: a.local, quest: a.quest, etapa: a.etapa }, achado: a };
  },
  achado: (v) => {
    const a = obj(v.achado);
    if (!a || a.especie === "passo") return null;
    return { texto: encher(FACTO_DO_SUCESSO.frases.achado, { o: a.o || a.conteudo || "", onde: a.onde || "" }), de: { local: a.especie === "segredo" ? a.local : "", id: a.id || "" }, achado: a };
  },
  livro: (v, c) => {
    const L = obj(c.livro);
    const sobre = semArtigo(v.sobre || c.alvo);
    if (!L || !sobre) return null;
    const casa = (nome) => { const n = semArtigo(nome); return !!n && (sobre.includes(n) || n.includes(sobre)); };
    const D = FACTO_DO_SUCESSO.doLivro;
    for (const [id, p] of Object.entries(obj(L.pessoas) || {})) {
      if (!obj(p) || !casa(p.nome)) continue;
      const linhas = [
        ...arr(p.quemE).slice(-FACTO_DO_SUCESSO.quemDoLivro).map((x) => x && x.o).filter(Boolean),
        obj(p.falou) ? encher(D.falou, { quem: p.nome, vezes: vezes(p.falou.vezes) }) : "",
        obj(p.derrotado) ? encher(D.derrotado, { como: p.derrotado.como }) : "",
      ].filter(Boolean);
      if (linhas.length) return { texto: encher(FACTO_DO_SUCESSO.frases.livro, { nome: p.nome, linhas: linhas.join("; ") }), de: { livro: id } };
    }
    for (const [id, l] of Object.entries(obj(L.lugares) || {})) {
      if (!obj(l) || !casa(l.nome || id.split("|").pop())) continue;
      const linhas = [
        obj(l.esteve) ? encher(D.esteve, { vezes: vezes(l.esteve.vezes) }) : "",
        obj(l.descobriu) ? D.descobriu : "",
        obj(l.favor) ? D.favor : "",
      ].filter(Boolean);
      if (linhas.length) return { texto: encher(FACTO_DO_SUCESSO.frases.livro, { nome: l.nome || id.split("|").pop(), linhas: linhas.join("; ") }), de: { livro: id } };
    }
    return null;
  },
  bestiario: (v, c, fam, q) => {
    const F = FACTO_DO_SUCESSO.frases.bestiario;
    if (fam === "rasto") {
      /* o rasto de bicho é do ermo: dentro dos muros, o chão é de gente */
      const o = obj(c.onde) || {};
      if (c.cidade && !o.foraDosMuros) return null;
      const bichos = arr(q && q.criaturas);
      if (!bichos.length) return null;
      const b = escolher(sorteDe(c, "rasto", o.lugar || c.cidade || "ermo"), bichos);
      const base = String(b.id || "").split("|").pop();
      const sinal = (SINAIS_DO_BESTIARIO[base] || {}).frase || b.comportamento;
      return { texto: encher(F.rasto, { nome: b.nome, sinal }), de: { bicho: b.id || b.nome, regiao: b.regiao || "" } };
    }
    /* o assunto: o da memória (`sobre`) manda; sem ele, a criatura da luta
       ou a que a frase nomeia */
    const nomeAlvo = obj(c.alvo) ? c.alvo.nome : c.alvo;
    const pista = v.sobre || nomeAlvo || c.frase || "";
    let b = null;
    if (!v.sobre && obj(c.alvo) && c.alvo.desc) b = c.alvo;
    if (!b && pista && c.semente) { try { b = criaturaPorNome(c.semente, c.mapa, c.genero || undefined, pista, c.lex || null); } catch { b = null; } }
    if (!b) return null;
    return { texto: encher(F.saber, { nome: b.nome, desc: b.desc || "", comportamento: b.comportamento || "" }).replace(/;\s*$/, ""), de: { bicho: b.id || b.nome } };
  },
  lugar: (v, c, fam, q) => {
    if (!q) return null;
    const F = FACTO_DO_SUCESSO.frases.lugar;
    const o = obj(c.onde) || {};
    if (fam === "saber") {
      /* o assunto é um prédio daqui, ou a cidade, ou (sem assunto que o
         registo conheça) o sítio onde se está */
      const sobre = semArtigo(v.sobre || (obj(c.alvo) ? c.alvo.nome : c.alvo));
      const casa = (nome) => { const n = semArtigo(nome); return !!n && !!sobre && (sobre.includes(n) || n.includes(sobre)); };
      const nomeado = sobre ? arr(q.locais).find((l) => casa(l.nome)) : null;
      if (!nomeado && sobre) {
        /* S19 (defeito 4): «o que sei do Forte Abandonado de Gelo Fundo?» deu
           um facto sobre a cidade onde a heroína estava. O assunto manda: a
           masmorra de perto, outra cidade do mapa, a pessoa daqui. */
        const mm = arr(q.masmorras).find((m) => m && m.nome && casa(m.nome));
        if (mm) return { texto: encher(F.masmorra, { nome: mm.nome, tipo: mm.tipo || "lugar", perto: mm.cidadeProxima ? encher(FACTO_DO_SUCESSO.perto, { cidade: mm.cidadeProxima }) : "", rumor: mm.rumor || "pouco" }).replace(/; o que se diz de lá: pouco$/, ""), de: { masmorra: mm.nome } };
        const cid = arr(obj(c.mapa) && c.mapa.cidades).find((x) => x && x.nome && x.descoberta !== false && semArtigo(x.nome) !== semArtigo(q.cidade.nome) && casa(x.nome));
        if (cid) return { texto: encher(F.outraCidade, { cidade: cid.nome, porte: cid.porte || cid.tipo || "terra", regiao: cid.regiao ? encher(FACTO_DO_SUCESSO.naRegiao, { regiao: cid.regiao }) : "" }), de: { cidade: cid.nome } };
        if (FACTO_DO_SUCESSO.bichosSemNome.test(sobre) && arr(q.criaturas).length)
          return { texto: encher(F.bichos, { lista: arr(q.criaturas).slice(0, FACTO_DO_SUCESSO.quantosBichos).map((b) => b.nome).join(", ") }), de: { regiao: (q.regiao && q.regiao.nome) || q.cidade.regiao || "" } };
        const p = arr(q.gente).find((x) => x && x.nome && casa(x.nome));
        if (p) return { texto: encher(F.pessoa, { nome: p.nome, oficio: oficioNoGenero(p.papel, p.genero_pessoa), daqui: comDe(p.local || q.cidade.nome) }), de: { pessoa: p.nome, local: p.local || "" } };
        if (!casa(q.cidade.nome) && !FACTO_DO_SUCESSO.sobreAqui.test(sobre)) return null;
      }
      const local = nomeado || localAqui(q, o);
      if (local) {
        const gente = arr(q.gente).filter((p) => semArtigo(p.local) === semArtigo(local.nome)).map((p) => `${p.nome} (${oficioNoGenero(p.papel, p.genero_pessoa)})`);
        return { texto: encher(F.saber, { aqui: local.nome, chamado: local.chamado || local.tipo, gente: gente.join(", ") || "ninguém de nome" }), de: { local: local.nome } };
      }
      return { texto: encher(F.cidade, { cidade: q.cidade.nome, porte: q.cidade.porte || q.cidade.tipo || "terra", locais: arr(q.locais).slice(0, 4).map((l) => l.nome).join(", ") }), de: { cidade: q.cidade.nome } };
    }
    const local = localAqui(q, o);
    if (local) {
      const gente = arr(q.gente).filter((p) => semArtigo(p.local) === semArtigo(local.nome));
      if (!gente.length) return null;
      const p = escolher(sorteDe(c, fam, local.id || local.nome, v.id), gente);
      return { texto: encher(F[fam] || F.busca, { nome: p.nome, oficio: oficioNoGenero(p.papel, p.genero_pessoa), daqui: comDe(local.nome), vontade: p.vontade, modo: p.modo }), de: { local: local.nome, pessoa: p.nome } };
    }
    /* na rua (sem prédio) ou fora dos muros: nenhuma gente de prédio; o
       rumor das masmorras de perto, que corre de boca em boca */
    const mms = arr(q.masmorras).filter((m) => m && m.nome && m.rumor);
    if (!mms.length) return null;
    const m = escolher(sorteDe(c, "rua", o.lugar || q.cidade.nome), mms);
    return { texto: encher(F.rua, { masmorra: m.nome, rumor: m.rumor }), de: { masmorra: m.nome } };
  },
};

/* ---------------- A PERGUNTA ----------------
   oFactoDoSucesso(v, contexto) → null | { fonte, familia, texto, de,
     achado? }
   `v`: o veredito do catálogo (`lerAcao`, tipo «teste») que PASSOU.
   `contexto` (tudo opcional):
     semente, mapa, cidade, base, genero, molde, lex — o mundo (os mesmos
       argumentos de `achavelAqui`);
     onde   — { lugar, dentroDe, cidade, foraDosMuros } (`ondeSeProcura`);
     passos — os passos ativos (`osPassosDasQuests`, a-quest-manda.js);
     livro  — o livro de factos (estado.factos);
     alvo   — o assunto quando o veredito não o traz: o nome (ou a ficha
              { nome, desc, comportamento }) da criatura na luta;
     frase  — a frase do jogador (para achar a criatura que ela nomeia).
   `achado`: quando a fonte é o passo ou o achado — o App distingue o do
   passo (`especie: "passo"`), que não paga moedas e escreve `descobriu`
   (oLivroDoAchado, a-quest-manda.js). `null`: nenhuma fonte tem nada, ou
   o teste não compra saber. */
export function oFactoDoSucesso(v, contexto) {
  try {
    const fam = familiaDe(v);
    if (!fam) return oEfeitoDoSucesso(v);
    const c = obj(contexto) || {};
    const q = mundoDe(c);
    for (const fonte of FACTO_DO_SUCESSO.ordem[fam]) {
      const r = FONTES[fonte](v, c, fam, q);
      if (r && r.texto && r.texto.trim()) return Object.freeze({ fonte, familia: fam, ...r, texto: cortar(r.texto) });
    }
    return null;
  } catch { return null; }
}
