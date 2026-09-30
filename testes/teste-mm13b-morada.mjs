/* teste-mm13b-morada.mjs (Fase MM · MM13b) — a pista tem morada

   A prova jogada de MM13 (30/09) achou a pista e o sino a apontar para
   lugares que a planta da cidade não mostrava: "o Círculo Rachado" da
   pista era, na planta de Monte do Norte, o "Picadeiro Central"; "a Corda
   Velha" do segundo passo não estava na planta nem na fala de quem a deu;
   e no turno 2 apareceu "🔎 Encontrar Orin — O Armazém Velho", a
   contradizer a pista e o diário.

   A varredura (576 aberturas: 6 géneros × 4 moldes × 3 cidades × 8
   estruturas) achou TRÊS causas com a mesma cara, e é o que esta suíte
   tranca:

     1. O LÉXICO QUE CHEGA TARDE. A leitura do mundo corre enquanto o
        jogador monta a ficha; o jogo não espera por ela. Chegando depois
        de o mundo nascer, a planta (recalculada a cada turno com o léxico
        de agora) renomeava os lugares, e a pista, a espinha e as missões
        (gravadas com os nomes de nascença) não. `soOVocabulario` é o
        léxico que se aplica nesse caso: com ele, todo gerador do mundo dá
        os mesmos nomes que sem léxico nenhum. Antes: 144 pistas, 225
        passos e 34 sinos órfãos no molde sobremundo, o único cujos tipos
        de lugar o léxico renomeia.
     2. O LUGAR DE OUTRA CIDADE, SEM A CIDADE. O primeiro marco da espinha
        quase nunca é da cidade de partida; a linha dizia "procurar Petra
        na Corda Velha" a quem estava noutra. Antes: 330 dos 576 passos
        (57%) e 172 sinos. Agora o onde leva a cidade ("A Corda Velha, em
        Vila Clara"), e o sino, sem masmorra perto, vem da cidade.
     3. O HOMÓNIMO. A espinha confere todos os marcos a cada turno e
        `falar_com` casa pelo primeiro nome: uma pista chamada Orin fechava
        "Encontrar Orin" de outro Orin, marcos adiante. Antes: 65 (11%);
        agora só onde TODA a gente da cidade tem homónimo na espinha (11,
        todos em géneros de banco de nomes curto).

   E os dois consertos de voz: o primeiro passo passou de CHEGAR a
   ENCONTRAR a pista, e a linha do ✓ diz também o passo seguinte.

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import {
  abrirAbertura, proximoPasso, fioParaAPrincipal, aindaSoUmNome, PALAVRAS_DE_BASTIDOR,
} from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import {
  locaisDaCidade, genteDoLocal, criaturasDaRegiao, chefesDoMundo, masmorrasDoMundo,
} from "../src/mundo-base.js";
import { soOVocabulario, garantirLexico, TIPOS_DE_LUGAR, AMEACAS, chamadoDoLugar } from "../src/lexico.js";
import { conferir, linhaDoAvanco, envelopeDeAvanco, rumoDaEtapa, mesmaPessoa, criarMissao, textoDaEtapa } from "../src/missoes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- um léxico cheio, que nomeia tudo ---------------- */
const dez = (p) => Array.from({ length: 10 }, (_, i) => `${p}${i}`);
const LEX = garantirLexico({
  gerado: true,
  chamado: {}, aLei: "aqui ninguém corre depois do sino", passado: ["a guerra das lonas", "o incêndio do picadeiro"],
  povos: ["Lonados", "Saltimbancos"], oficios: ["domador", "malabarista", "palhaço", "trapezista"],
  criaturas: AMEACAS.map((a) => ({ ameaca: a, nomes: [`Fera ${a} A`, `Fera ${a} B`, `Fera ${a} C`] })),
  cidades: ["Lona Alta", "Lona Baixa", "Lona Nova"], tavernas: ["O Trapézio", "A Rede"],
  lugares: TIPOS_DE_LUGAR.map((tp, i) => ({ tipo: tp, chamado: `tenda ${i}`, nomes: [`Picadeiro ${i}A`, `Picadeiro ${i}B`, `Picadeiro ${i}C`] })),
  nomes: { masc: dez("Beppo"), fem: dez("Zaza"), sobrenome: dez("Lona"), cidadeA: dez("Circo"), cidadeB: dez("Arena"), continente: "Grande Lona" },
  titulos: ["o Domador", "a Voz", "o Sem-Rede", "a Última Volta"],
});

/* ---------------- os mundos ---------------- */
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const M of MOLDES) {
  const semente = `Sonda MM13b|${g}|${M.id}`;
  MUNDOS.push({ semente, genero: g, molde: M, mapa: gerarGeografia(semente, M) });
}
/* a mesma abertura é pedida por várias secções: guardada pela chave, para
   a suíte não pagar duas vezes a mesma espinha (nada aqui muta o que lê) */
const JA = new Map();
const abrir = (w, cidade, estrutura, lex = null) => {
  const k = `${w.semente}|${cidade}|${estrutura}|${lex ? "lex" : "-"}`;
  if (!JA.has(k)) JA.set(k, abrirDeVez(w, cidade, estrutura, lex));
  return JA.get(k);
};
function abrirDeVez(w, cidade, estrutura, lex) {
  const espinha = estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, lex, estrutura, cidadeInicial: cidade });
  const r = abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade, espinha, estrutura, genero: w.genero, molde: w.molde, lex, nivel: 1, dia: 1 });
  return r ? { ...r, espinha } : null;
}
/* duas cidades de partida por mundo: a primeira do mapa e uma do meio
   (a varredura de trabalho usou três; a terceira não achou nada que as
   duas não achassem, e custava um terço da suíte) */
const CIDADES = [0, 7];
const nomes = (xs, k = "nome") => (xs || []).map((x) => x && x[k]).join("|");

/* ============================================================ */
sec("1. o léxico que chega tarde: só o vocabulário");
{
  const v = soOVocabulario(LEX);
  t("fica a lei, o passado e como os lugares se chamam", v.aLei === LEX.aLei && v.passado.length === 2 && chamadoDoLugar(v, "arena") === chamadoDoLugar(LEX, "arena") && !!chamadoDoLugar(v, "arena"));
  t("saem os nomes de lugar, de gente, de cidade e de bicho",
    v.lugares.every((p) => p.nomes.length === 0) && v.nomes.masc.length === 0 && v.cidades.length === 0 && v.criaturas.length === 0 && v.titulos.length === 0 && !v.nomes.continente);
  t("é idempotente e sobrevive à garantia", JSON.stringify(soOVocabulario(v)) === JSON.stringify(v) && JSON.stringify(garantirLexico(v)) === JSON.stringify(v));
  t("não muta o léxico que recebe", LEX.lugares[0].nomes.length === 3 && LEX.nomes.masc.length === 10);
  t("lixo: null, {} e texto dão um léxico vazio e válido", ["x", null, {}, undefined].every((x) => Array.isArray(soOVocabulario(x).lugares) && soOVocabulario(x).nomes.masc.length === 0));

  /* O INVARIANTE: com o léxico tardio, todo gerador do mundo devolve os
     mesmos nomes que sem léxico nenhum — é isto que impede a planta de
     renomear o que a espinha e a abertura já gravaram. E a prova de que o
     defeito existia: com o léxico inteiro, os nomes mudam. */
  let iguais = 0, casos = 0, mudavaSem = 0;
  const difs = [];
  for (const w of MUNDOS) {
    const geoV = gerarGeografia(w.semente, w.molde, v), geo0 = gerarGeografia(w.semente, w.molde, null);
    const par = [
      ["cidades", nomes(geoV.cidades), nomes(geo0.cidades)],
      ["continente", String(geoV.continente && geoV.continente.nome || geoV.continente), String(geo0.continente && geo0.continente.nome || geo0.continente)],
      ["chefes", nomes(chefesDoMundo(w.semente, w.mapa, w.genero, v)) + nomes(chefesDoMundo(w.semente, w.mapa, w.genero, v), "covil"),
        nomes(chefesDoMundo(w.semente, w.mapa, w.genero, null)) + nomes(chefesDoMundo(w.semente, w.mapa, w.genero, null), "covil")],
    ];
    for (const r of (w.mapa.regioes || []).slice(0, 3)) par.push([`bichos ${r.nome}`, nomes(criaturasDaRegiao(w.semente, r, w.genero, v)), nomes(criaturasDaRegiao(w.semente, r, w.genero, null))]);
    for (const c of w.mapa.cidades.slice(0, 4)) {
      const lv = locaisDaCidade(w.semente, c, w.genero, w.molde, v), l0 = locaisDaCidade(w.semente, c, w.genero, w.molde, null);
      par.push([`locais ${c.nome}`, nomes(lv) + nomes(lv, "id"), nomes(l0) + nomes(l0, "id")]);
      const gv = lv.flatMap((l) => genteDoLocal(w.semente, l, w.genero, w.molde, v)), g0 = l0.flatMap((l) => genteDoLocal(w.semente, l, w.genero, w.molde, null));
      par.push([`gente ${c.nome}`, gv.map((p) => `${p.nome}/${p.raca}/${p.papel}/${p.local}`).join("|"), g0.map((p) => `${p.nome}/${p.raca}/${p.papel}/${p.local}`).join("|")]);
      if (nomes(locaisDaCidade(w.semente, c, w.genero, w.molde, LEX)) !== nomes(l0)) mudavaSem++;
    }
    const ev = JSON.stringify(estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, lex: v, estrutura: "misterio", cidadeInicial: w.mapa.cidades[0].nome }));
    const e0 = JSON.stringify(estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, lex: null, estrutura: "misterio", cidadeInicial: w.mapa.cidades[0].nome }));
    par.push(["espinha", ev, e0]);
    for (const [k, a, b] of par) { casos++; if (a === b) iguais++; else if (difs.length < 4) difs.push(`${w.genero}/${w.molde.id}/${k}`); }
  }
  t(`com o léxico tardio, ${casos} gerações dão os nomes de nascença (${iguais} iguais)`, iguais === casos, difs.join(" | "));
  t(`e o defeito existia: com o léxico inteiro, ${mudavaSem} plantas mudavam de nomes`, mudavaSem > 0);
}

/* ============================================================ */
/* A VARREDURA: toda pista, todo lugar de passo e todo lugar do sino
   existem com o mesmo nome — na planta desta cidade, ou, se o passo é
   noutra, na planta DELA e com a cidade dita. Três cenários de léxico:
   nenhum; o mesmo à nascença e na planta; e o tardio, já só vocabulário. */
const varrer = (lexNasc, lexPlanta, soMolde = "") => {
  let n = 0;
  const orfaos = [];
  const plantaDe = new Map();
  const planta = (w, c) => {
    const k = `${w.semente}|${c.nome}`;
    if (!plantaDe.has(k)) plantaDe.set(k, locaisDaCidade(w.semente, c, w.genero, w.molde, lexPlanta).map((l) => norm(l.nome)));
    return plantaDe.get(k);
  };
  for (const w of MUNDOS.filter((x) => !soMolde || x.molde.id === soMolde)) {
    const mm = masmorrasDoMundo(w.semente, w.mapa).map((m) => norm(m.nome));
    const covis = chefesDoMundo(w.semente, w.mapa, w.genero, lexPlanta).map((c) => norm(c.covil));
    const cidades = w.mapa.cidades.map((c) => norm(c.nome));
    for (const ci of CIDADES) {
      const cid = w.mapa.cidades[ci % w.mapa.cidades.length];
      for (const E of ESTRUTURAS) {
        const r = abrir(w, cid.nome, E.id, lexNasc);
        if (!r) continue;
        n++;
        const a = r.abertura;
        const tag = `${w.genero}/${w.molde.id}/${cid.nome}/${E.id}`;
        /* onde "A Corda Velha, em Vila Clara" mora: a cidade dita, ou esta */
        const existe = (onde) => {
          const [lugar, ...resto] = String(onde).split(", em ");
          const nomeada = resto.join(", em ");
          const c = nomeada ? w.mapa.cidades.find((x) => x.nome === nomeada) : cid;
          return !!c && planta(w, c).includes(norm(lugar));
        };
        if (!existe(a.pista.local)) orfaos.push(`${tag}: a pista em ${a.pista.local}`);
        for (const e of r.missao.etapas) {
          const onde = e.tipo === "falar_com" ? e.onde : e.tipo === "revelar" ? (e.onde || e.alvo) : "";
          if (onde && !existe(onde)) orfaos.push(`${tag}: passo ${e.tipo} em ${onde}`);
        }
        const org = a.alvo.origem;
        if (org && !existe(org) && !mm.includes(norm(org)) && !covis.includes(norm(org)) && !cidades.includes(norm(org))) orfaos.push(`${tag}: o sino vem de ${org}`);
      }
    }
  }
  return { n, orfaos };
};

sec("2. a varredura: nenhum órfão");
{
  const s0 = varrer(null, null);
  t(`sem léxico: ${s0.n} aberturas, 0 órfãos`, s0.n >= 350 && s0.orfaos.length === 0, s0.orfaos.slice(0, 4).join(" | "));
  const sL = varrer(LEX, LEX);
  t(`com o léxico à nascença: ${sL.n} aberturas, 0 órfãos`, sL.n >= 350 && sL.orfaos.length === 0, sL.orfaos.slice(0, 4).join(" | "));
  const sV = varrer(null, soOVocabulario(LEX));
  t(`com o léxico tardio, só vocabulário: ${sV.n} aberturas, 0 órfãos`, sV.n >= 350 && sV.orfaos.length === 0, sV.orfaos.slice(0, 4).join(" | "));
  /* a prova de que o defeito do léxico tardio existia (e existe, se o App
     aplicar o léxico inteiro depois de o mundo nascer). Só no sobremundo:
     é o único molde cujos tipos de lugar o léxico renomeia, e a varredura
     inteira custaria o dobro do tempo para provar a mesma coisa. */
  const sT = varrer(null, LEX, "sobremundo");
  t(`e o léxico tardio inteiro ainda faz órfãos (${sT.orfaos.length}) — é o que o App deixa de aplicar`, sT.orfaos.length > 0);
}

/* ============================================================ */
sec("3. o lugar de outra cidade diz a cidade");
{
  let fora = 0, dito = 0, cabe = true;
  for (const w of MUNDOS) for (const E of ESTRUTURAS) {
    const r = abrir(w, w.mapa.cidades[0].nome, E.id);
    if (!r) continue;
    for (const e of r.missao.etapas) {
      if (!e.onde) continue;
      if (e.onde.length > 60) cabe = false;
      if (e.onde.includes(", em ")) {
        fora++;
        const l = proximoPasso({ abertura: r.abertura, missoes: [{ ...r.missao, etapas: r.missao.etapas.map((x) => ({ ...x, feito: x !== e && r.missao.etapas.indexOf(x) < r.missao.etapas.indexOf(e) })) }] });
        if (l.includes(e.onde.split(", em ")[1])) dito++;
      }
    }
  }
  t(`os passos noutra cidade (${fora}) dizem a cidade na linha do próximo passo (${dito})`, fora > 0 && dito === fora);
  t("e o onde cabe no teto da etapa (60)", cabe);
}

/* ============================================================ */
sec("4. a pista não tem o nome de outro marco");
{
  let n = 0, evitaveis = 0, homonimos = 0;
  for (const w of MUNDOS) for (const ci of CIDADES) for (const E of ESTRUTURAS) {
    const cid = w.mapa.cidades[ci % w.mapa.cidades.length];
    const r = abrir(w, cid.nome, E.id);
    if (!r) continue;
    n++;
    const a = r.abertura;
    if (norm(a.pista.nome) === norm(a.alvo.quem)) continue;
    const quens = r.espinha.atos.flatMap((x) => x.marcos).map((m) => m.quem).filter(Boolean);
    const homo = (nome) => quens.some((k) => norm(k) === norm(nome) || mesmaPessoa(k, nome));
    if (!homo(a.pista.nome)) continue;
    homonimos++;
    /* só vale se não havia alternativa: toda a gente que podia ser pista
       (a casa do marco, ou a cidade inteira) também tem homónimo */
    const gente = locaisDaCidade(w.semente, cid, w.genero, w.molde, null).flatMap((l) => genteDoLocal(w.semente, l, w.genero, w.molde, null));
    const daCasa = gente.filter((p) => norm(p.local) === norm(a.pista.local));
    if (daCasa.some((p) => !homo(p.nome)) && gente.filter((p) => !homo(p.nome)).length) evitaveis++;
  }
  t(`${n} aberturas: nenhuma pista com homónimo evitável (${homonimos} sem alternativa nenhuma)`, evitaveis === 0);
}

/* ============================================================ */
sec("5. o primeiro passo é encontrar, e o ✓ diz o que abriu");
{
  const bastidor = new RegExp(`\\b(${PALAVRAS_DE_BASTIDOR.map(norm).join("|")})\\b`);
  const falhas = [];
  let comDois = 0;
  for (const w of MUNDOS) for (const E of ESTRUTURAS) {
    const r = abrir(w, w.mapa.cidades[0].nome, E.id);
    if (!r) continue;
    const a = r.abertura, m = r.missao;
    const tag = `${w.genero}/${w.molde.id}/${E.id}`;
    const e0 = m.etapas[0];
    if (!(e0.tipo === "falar_com" && e0.alvo === a.pista.nome && e0.onde === a.pista.local)) falhas.push(`${tag}: o primeiro passo não é encontrar a pista`);
    /* chegar sem a encontrar não fecha; encontrá-la, sim */
    if (conferir([m], { lugarAtual: { nome: a.pista.local }, npcs: {} }).avancos.length) falhas.push(`${tag}: chegar fechou o passo`);
    const c = conferir([m], { lugarAtual: { nome: a.pista.local }, npcs: { x: { nome: a.pista.nome, conhecidoEm: 1 } } });
    if (!c.avancos.length) { falhas.push(`${tag}: encontrar não fechou`); continue; }
    const linha = linhaDoAvanco(c.avancos[0]);
    if (!linha.includes(`Encontrar ${a.pista.nome} ✓`)) falhas.push(`${tag}: o ✓ não diz encontrar — "${linha}"`);
    if (/Chegar a/.test(linha.split("→")[0])) falhas.push(`${tag}: o ✓ ainda diz chegar`);
    if (m.etapas.length > 1) {
      comDois++;
      const agora = proximoPasso({ abertura: a, missoes: c.missoes });
      if (!linha.endsWith(`→ agora: ${agora}`) || !agora) falhas.push(`${tag}: o ✓ não traz o passo seguinte — "${linha}"`);
      if (bastidor.test(norm(linha))) falhas.push(`${tag}: bastidor em "${linha}"`);
    } else if (linha.includes("→")) falhas.push(`${tag}: passo único com um "agora" a mais`);
  }
  t("em todos os mundos: chegar não fecha, encontrar fecha, e o ✓ diz o passo seguinte", falhas.length === 0, falhas.slice(0, 4).join(" | "));
  t(`(${comDois} principais com passo seguinte)`, comDois > 0);

  /* e a menção continua a não ser presença: o passo novo fecha pelo
     registo, e o registo só aceita a pista depois de o herói lá estar */
  const r = abrir(MUNDOS[0], MUNDOS[0].mapa.cidades[0].nome, "misterio");
  t("o nome da pista, longe dela, ainda é só um nome", aindaSoUmNome(r.abertura, r.abertura.pista.nome, { missoes: [r.missao], lugar: null }) === true);
  t("no lugar dela, é presença", aindaSoUmNome(r.abertura, r.abertura.pista.nome, { missoes: [r.missao], lugar: { nome: r.abertura.pista.local } }) === false);

  /* a linha do ✓ é de todas as missões, não só da principal */
  const mural = criarMissao({ id: "c1", titulo: "O gado de Jessa", tipo: "favor", status: "ativa", dia: 1,
    etapas: [{ tipo: "ir_a", alvo: "Vila Clara" }, { tipo: "falar_com", alvo: "Jessa", onde: "A Corda Velha" }] });
  const cm = conferir([mural], { cidadeAtual: "Vila Clara", npcs: {} });
  t("um contrato do mural também diz o que abriu", linhaDoAvanco(cm.avancos[0]).endsWith("→ agora: Procurar Jessa na Corda Velha"));
  t("e o Narrador recebe a mesma morada no aviso do passo cumprido", envelopeDeAvanco(cm.avancos[0]).includes("A próxima etapa é: Procurar Jessa na Corda Velha."));
  const fim = conferir(cm.missoes, { cidadeAtual: "Vila Clara", npcs: { j: { nome: "Jessa", conhecidoEm: 1 } } });
  t("e o último passo não promete um seguinte", !linhaDoAvanco(fim.avancos[0]).includes("→"));
}

/* ============================================================ */
sec("6. o rumo de cada etapa");
{
  t("procurar leva a morada", rumoDaEtapa({ tipo: "falar_com", alvo: "Petra", onde: "A Corda Velha, em Vila Clara" }) === "Procurar Petra na Corda Velha, em Vila Clara");
  t("procurar sem morada não inventa uma", rumoDaEtapa({ tipo: "falar_com", alvo: "Petra" }) === "Procurar Petra");
  t("descobrir aqui", rumoDaEtapa({ tipo: "revelar", alvo: "O Fosso", onde: "O Fosso" }) === "Descobrir o que o Fosso esconde");
  t("descobrir noutra cidade", rumoDaEtapa({ tipo: "revelar", alvo: "O Fosso", onde: "O Fosso, em Vila Clara" }) === "Descobrir o que o Fosso esconde, em Vila Clara");
  t("acabar com, e onde", rumoDaEtapa({ tipo: "derrotar", alvo: "Lobo Cinzento", onde: "o bosque" }) === "Acabar com Lobo Cinzento — o bosque");
  t("ir a uma cidade, ir até um lugar", rumoDaEtapa({ tipo: "ir_a", alvo: "Vila Clara" }) === "Ir a Vila Clara" && rumoDaEtapa({ tipo: "ir_a", alvo: "A Torre", lugar: true }) === "Ir até A Torre");
  t("o resto cai no texto do diário", rumoDaEtapa({ tipo: "aguentar", dia: 9 }) === textoDaEtapa({ tipo: "aguentar", dia: 9 }));
  t("lixo: null, {} e texto dão vazio ou o texto de sempre, sem estourar", rumoDaEtapa(null) === "" && rumoDaEtapa("x") === "" && typeof rumoDaEtapa({}) === "string");
}

/* ============================================================ */
sec("7. a pista sabe onde");
{
  let n = 0, comMorada = 0;
  for (const w of MUNDOS) {
    const r = abrir(w, w.mapa.cidades[0].nome, "jornada");
    if (!r || r.missao.etapas.length < 2) continue;
    const seguinte = r.missao.etapas.find((e, i) => i > 0 && e.onde && norm(e.onde) !== norm(r.abertura.pista.local));
    if (!seguinte) continue;
    n++;
    const fio = fioParaAPrincipal({ abertura: r.abertura, missoes: [r.missao], semente: w.semente, pessoa: { nome: r.abertura.pista.nome } });
    if (fio.includes(seguinte.onde.split(", em ")[0].replace(/^(O|A|Os|As) /, "")) ) comMorada++;
  }
  t(`o fio da pista leva a morada do passo seguinte (${comMorada}/${n})`, n > 0 && comMorada === n);
}

/* ============================================================ */
sec("8. determinismo e imutabilidade");
{
  const w = MUNDOS[7];
  const a = abrir(w, w.mapa.cidades[3].nome, "divida");
  const b = abrir(w, w.mapa.cidades[3].nome, "divida");
  t("a mesma semente dá a mesma abertura, com a mesma morada", JSON.stringify(a) === JSON.stringify(b));
  const congelar = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congelar(v); return o; };
  const esp = congelar(JSON.parse(JSON.stringify(a.espinha)));
  let erro = null;
  try { abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade: w.mapa.cidades[3].nome, espinha: esp, estrutura: "divida", genero: w.genero, molde: w.molde, nivel: 1, dia: 1 }); } catch (e) { erro = e; }
  t("abrirAbertura não muta a espinha que recebe", erro === null);
  const lx = congelar(JSON.parse(JSON.stringify(LEX)));
  erro = null;
  try { soOVocabulario(lx); } catch (e) { erro = e; }
  t("soOVocabulario não muta o léxico que recebe", erro === null);
}

/* A FIAÇÃO — o léxico que chega depois de o mundo nascer só traz o
   vocabulário. Corpo de lerOMundo por âncora, nunca por linha; o fim de
   linha normalizado (uma cópia fresca vem em CRLF). */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const i = app.indexOf("const lerOMundo = async (");
  const corpo = i >= 0 ? app.slice(i, i + 6000) : "";
  t("lerOMundo guarda a marca do mapa de quando começou a ler", corpo.includes("mapaAntes = mapaRef.current"));
  t("se o mundo nasceu entretanto, aplica só o vocabulário", corpo.includes("mapaRef.current !== mapaAntes ? soOVocabulario(lex) : lex"));
  t("e é esse o léxico que o mundo grava", corpo.includes("lexico: lexAplicado") && !/lexico: lex[ ,}]/.test(corpo));
  t("a segunda tentativa não perde a marca", corpo.includes("tentativa: tentativa + 1, mapaAntes"));
}

console.log(`\nmm13b-morada: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
