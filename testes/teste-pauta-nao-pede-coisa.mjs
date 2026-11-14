/* teste-pauta-nao-pede-coisa.mjs (13/11/2026, a 20.ª sessão de prova, defeito 1)
   — a pauta diz QUAL coisa, ou não pede coisa nenhuma

   A 20.ª sessão (mente/sessao-20.md §5, grave 1) correu em modo «boca»:
   nenhuma IA escreve estado, e o save saiu limpo — 0 objetos inventados no
   estado. Mas a prosa deu ao herói uma cera vermelha com sinete, o «Diário
   do Templo», um frasco, uma lasca de cedro e um bilhete selado, e a maior
   fonte dessa invenção era a PRÓPRIA PAUTA: três linhas do sistema pediam
   uma coisa com nome sem dizer qual —
     · «uma coisa fora do sítio chama o olho do herói… — é fato: entra nesta
       resposta, com o nome dito» (escuta.js, o degrau do sinal num lugar);
     · «tem um recado que não confia a mais ninguém» (escuta.js, os motivos
       de quem vem buscar o herói);
     · «um sinal que toca {tema}: um rasto, um objeto, uma marca»
       (fios-da-estrada.js, o encontro de cena na estrada).
   O Narrador obedece à letra: obrigado a nomear o que o sistema não tem,
   dá-lhe um nome.

   ESTA SUÍTE É A CATRACA: as tabelas que vão à pauta como ordem ao Narrador
   (o rumo, o degrau que vira cena, o encontro da estrada, a conversa da
   noite, as intervenções do encalhe, as respostas da ameaça, o que está em
   jogo numa batida) não pedem «uma coisa», «algo», «um objeto», «um recado»
   — a coisa genérica que o Narrador tem de inventar para obedecer. Quem
   precisar de uma coisa na pauta tira-a de uma tabela ou do estado, e
   di-la pelo nome.
     §1 a régua morde o que a 20.ª achou (prova de que mede alguma frase);
     §2 nenhuma tabela registada pede coisa sem nome;
     §3 o comportamento: o degrau do sinal num lugar sai sem «com o nome
        dito», e com a ordem de não dar nome ao que se esconde; quem vem
        buscar o herói não traz recado; o encontro da estrada não traz
        objeto;
     §4 (a 21.ª sessão, defeito 4) O MUNDO SE MEXE diz QUAL fio, ou não
        pede: o envelope jurava «este fio JÁ EXISTE no jogo» com o fio
        «o que já se comenta por aqui» — nenhum —, e o Narrador encheu-o com
        um capitão, uma caixa e uma tira de couro. Cada movimento do mundo
        tira o fio do material que o sistema lhe dá (um tracker), e sem ele
        não abre; o envelope sem fio dito não sai. */
import { DEGRAU_EM_CENA, RUMOS, ESCADA_DA_ESCUTA, linhaDoRumo } from "../src/escuta.js";
import { COMO_O_FIO_ENTRA, NOITE_DO_ACAMPAMENTO, encontroComFio } from "../src/fios-da-estrada.js";
import { INTERVENCOES } from "../src/encalhe.js";
import { RESPOSTAS } from "../src/antagonista.js";
import { EM_JOGO } from "../src/batidas.js";
import { MOVIMENTOS_DO_MUNDO, iniciativaDoMundo, envelopeDaIniciativa } from "../src/oraculo.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* A RÉGUA: a coisa genérica — o que o Narrador tem de nomear sozinho para
   cumprir a linha. */
const COISA_SEM_NOME = /\b(uma coisa|alguma coisa|qualquer coisa|algo|um objeto|uns objetos|um recado|um item)\b/iu;
/* AS QUE DIZEM QUAL, escritas: a frase em que a «coisa» vem logo dita pelo
   sistema. A ponte do rumo — «uma coisa só aponta para: {passo}» — é «um só
   gesto», e o alvo é o passo que o sistema calcula, com nome e lugar
   (abertura.js#proximoPasso); mexer-lhe obrigava a regravar três dourados e
   a tradução da ficha (ficha-de-ator.js, TRADUCAO_DOS_ENVELOPES), por uma
   linha que já diz para onde. Quem acrescentar aqui escreve o porquê. */
const DIZEM_QUAL = [/uma coisa só aponta para: \{passo\}$/u];

/* as tabelas que vão à pauta como ordem ao Narrador, com onde moram */
const TABELAS = {
  "escuta.js#DEGRAU_EM_CENA": DEGRAU_EM_CENA,
  "escuta.js#RUMOS": RUMOS,
  "fios-da-estrada.js#COMO_O_FIO_ENTRA": COMO_O_FIO_ENTRA,
  "fios-da-estrada.js#NOITE_DO_ACAMPAMENTO": NOITE_DO_ACAMPAMENTO,
  "encalhe.js#INTERVENCOES": INTERVENCOES.map((i) => i.diz),
  "antagonista.js#RESPOSTAS": RESPOSTAS.map((r) => r.faz),
  "batidas.js#EM_JOGO": EM_JOGO,
};
/* todas as frases de uma tabela, pelos objetos e listas adentro */
function frases(x, onde, out = []) {
  if (typeof x === "string") out.push({ onde, s: x });
  else if (Array.isArray(x)) x.forEach((y, i) => frases(y, `${onde}[${i}]`, out));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) frases(v, `${onde}.${k}`, out);
  return out;
}

sec("§1 a régua morde o que a 20.ª achou");
{
  const da20 = [
    "uma coisa fora do sítio chama o olho do herói: é aqui mesmo que se esconde o que a história procura",
    "tem um recado que não confia a mais ninguém",
    "Na estrada, um sinal que toca Varek Sem-Medo: um rasto, um objeto, uma marca",
    "ouviu, viu ou carrega alguma coisa disso, e quer algo em troca",
  ];
  t("as quatro linhas da 20.ª mordem", da20.every((s) => COISA_SEM_NOME.test(s)), da20.filter((s) => !COISA_SEM_NOME.test(s)).join(" | "));
  t("a exceção escrita é estreita: nenhuma linha da 20.ª passa por ela", DIZEM_QUAL.every((r) => !da20.some((s) => r.test(s))));
  t("e a coisa dita pelo nome não morde («a cera do sinete», «o Diário do Templo»)", !COISA_SEM_NOME.test("o herói encontra o Diário do Templo, a cera do sinete e a lasca de cedro"));
}

sec("§2 nenhuma tabela da pauta pede coisa sem nome");
{
  for (const [nome, tabela] of Object.entries(TABELAS)) {
    const fs = frases(tabela, nome);
    const mordem = fs.filter((f) => COISA_SEM_NOME.test(f.s) && !DIZEM_QUAL.some((r) => r.test(f.s)));
    t(`${nome}: ${fs.length} frases, nenhuma pede coisa sem nome`, fs.length > 0 && mordem.length === 0, mordem.map((f) => `${f.onde}: «${f.s.slice(0, 90)}»`).join(" | "));
  }
}

sec("§3 o comportamento: a linha que vai à pauta");
{
  const sinal = ESCADA_DA_ESCUTA.find((d) => d.id === "sinal");
  const vem = ESCADA_DA_ESCUTA.find((d) => d.id === "vem_buscar");
  /* o passo da quest manda descobrir a Capela da Pedra, e o herói está lá */
  const mundo = { aqui: "na Capela da Pedra, em Monte do Martelo", passos: [{ descobrir: [{ nome: "Capela da Pedra" }] }] };
  const aqui = linhaDoRumo({ pedido: { doJogador: true }, degrau: sinal, passo: "x", semente: 3, mundo });
  t("o sinal num lugar (o herói lá): a ordem de não dar nome ao que se esconde, e nenhum «com o nome dito»", aqui.endsWith(DEGRAU_EM_CENA.rumo.fatoDoLugar) && !aqui.endsWith(DEGRAU_EM_CENA.rumo.fato) && !COISA_SEM_NOME.test(aqui), aqui);
  const longe = linhaDoRumo({ pedido: { doJogador: true }, degrau: sinal, passo: "x", semente: 3, mundo: { ...mundo, aqui: "na Praça, em Monte do Martelo" } });
  t("…e longe dele, o mesmo (o lugar diz-se pelo nome; o que esconde, não)", longe.endsWith(DEGRAU_EM_CENA.rumo.fatoDoLugar) && longe.includes("Capela da Pedra") && !COISA_SEM_NOME.test(longe), longe);
  /* a pessoa da abertura vem ter com o herói, com cada motivo da tabela */
  const ab = { abertura: { pista: { nome: "Varek Sem-Medo", local: "Arquivo Dourado" }, alvo: { quem: "", objeto: "" }, cidade: "Monte do Martelo" } };
  const vindas = DEGRAU_EM_CENA.motivos.map((_, i) => linhaDoRumo({ pedido: { doJogador: true }, degrau: vem, passo: "x", semente: i, mundo: { aqui: "na Praça, em Monte do Martelo", ...ab } }));
  t("quem vem buscar o herói vem por vontade, sem recado nem coisa para dar (todos os motivos)", vindas.every((l) => l.includes("Varek Sem-Medo") && !COISA_SEM_NOME.test(l)), vindas.join(" | "));
  /* o encontro de cena na estrada, com o fio */
  const enc = encontroComFio({ tipo: "cena", detalhe: "x" }, { fio: [{ nome: "Varek Sem-Medo", tipo: "pessoa" }] });
  t("o encontro da estrada traz o sinal pelo nome do fio, sem objeto", enc.detalhe.includes("Varek Sem-Medo") && !COISA_SEM_NOME.test(enc.detalhe), enc.detalhe);
  const via = encontroComFio({ tipo: "viajante", detalhe: "x" }, { fio: [{ nome: "Varek Sem-Medo", tipo: "pessoa" }] });
  t("…e o viajante traz notícia, sem coisa nenhuma na mão nem preço", via.detalhe.includes("Varek Sem-Medo") && !COISA_SEM_NOME.test(via.detalhe), via.detalhe);
}

sec("§4 O MUNDO SE MEXE diz qual fio, ou não pede (a 21.ª, defeito 4)");
{
  /* o material de cada tracker, com uma marca que só o sistema podia dar:
     o fio que o movimento escolhe tem de ser uma delas — nunca uma frase
     da própria tabela */
  const M = "Marca-do-Sistema";
  const cheio = {
    desdeUltima: 99, emCidade: true,
    relogioQuaseCheio: { nome: `${M} relógio` }, nemesis: `${M} nêmese`, missaoComPrazo: { titulo: `${M} prazo` },
    faccaoHostil: `${M} facção`, npcComVontade: { nome: `${M} gente`, vontade: "quer ir embora" },
    minhaGuilda: `${M} guilda`, chefeDaRegiao: `${M} chefe`, masmorraProxima: `${M} covil`, faccaoAliada: `${M} tratado`, cidadeSua: `${M} domínio`,
  };
  const fioDe = (m, c) => { try { return String(m.fio(c)); } catch { return "?"; } };
  const semMaterial = MOVIMENTOS_DO_MUNDO.filter((m) => { try { return m.quando(cheio) && !fioDe(m, cheio).includes(M); } catch { return true; } }).map((m) => `${m.id}: «${fioDe(m, cheio)}»`);
  t(`os ${MOVIMENTOS_DO_MUNDO.length} movimentos tiram o fio do material do sistema, nenhum de uma frase da tabela`, MOVIMENTOS_DO_MUNDO.length > 0 && semMaterial.length === 0, semMaterial.join(" | "));
  /* a 21.ª: na cidade, sem nenhum material com nome, o mundo não se mexe */
  const soCidade = [0.01, 0.2, 0.5, 0.8, 0.99].map((x) => iniciativaDoMundo({ desdeUltima: 99, emCidade: true }, { sorte: () => x }));
  t("na cidade sem fio com nome, nenhum movimento (o boato de «o que já se comenta por aqui» calou)", soCidade.every((m) => m === null), soCidade.map((m) => m && `${m.id}: ${m.fio}`).join(" | "));
  /* o material que chega vazio também cala o movimento */
  const vazio = iniciativaDoMundo({ desdeUltima: 99, emCidade: true, relogioQuaseCheio: { nome: "" }, minhaGuilda: "  " }, { sorte: () => 0.01 });
  t("o material vazio não abre o movimento", vazio === null, vazio ? `${vazio.id}: «${vazio.fio}»` : "");
  /* e com material com nome, o fio é o nome dele */
  const comFio = iniciativaDoMundo({ desdeUltima: 99, emCidade: true, minhaGuilda: "a Casa do Carvalho" }, { sorte: () => 0.01 });
  t("com o material de um tracker, o fio é o nome dele", !!comFio && comFio.fio === "a Casa do Carvalho", JSON.stringify(comFio));
  t("o envelope sem fio dito não sai", envelopeDaIniciativa({ id: "boato", diz: "x", fio: "" }) === "" && envelopeDaIniciativa({ id: "boato", diz: "x" }) === "");
  t("…e com o fio, sai e di-lo", envelopeDaIniciativa(comFio).includes("a Casa do Carvalho"));
}

console.log(`\na pauta não pede coisa sem nome (a 20.ª, defeito 1): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
