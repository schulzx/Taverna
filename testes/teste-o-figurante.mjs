/* O FIGURANTE QUE FALA (03/11, o Narrador ator, decisão 6) — src/motor/o-figurante.js

   A 14.ª sessão (mente/sessao-14.md, defeito 9 e §7) achou o mundo sem nome
   mudo: numa capital de 35 800 almas, «Falam só: Leonor» — os devotos do
   claustro, os mascates do mercado e a rua de Serra dos Frades sem uma voz,
   e o ator a encher o silêncio de ausências inventadas. A 15.ª (defeito 3)
   viu o outro lado: sem ninguém em cena, o ator pôs um vulto no Barril, e
   deu-lhe o nome do Godofredo. A pessoa aprovou em 03/11 o figurante: por
   cena, o sistema elege uma pessoa sem nome do sítio, com uma voz da tabela,
   sem Sabe nem Quer, que responde ao herói e não deixa rasto.

   O que esta suíte prova:
   §1 as tabelas: a regra (quanta gente com nome basta), as vozes que ele não
      pode ter (cada uma existe em COMO_FALA, e sobra voz), a gente de cada
      sítio (tipos que existem, registos que existem), e toda palavra passa
      no verificador da ficha;
   §2 o lixo não estoura, o estado não muda, e a mesma entrada dá o mesmo;
   §3 a regra: no mesmo sítio e no mesmo dia é o mesmo figurante de um
      turno para o outro, e outro noutro sítio; com gente com nome em cena
      não há (o companheiro não conta); a luta, a masmorra, a estrada, o
      acampamento e o sítio sem gente (o forte abandonado) não têm;
   §4 os cenários das sessões em que o mundo ficou mudo, com as peças reais
      (o léxico e o mapa da 14.ª): a capital da 14.ª — T2, T6, T7, T12, T16 —
      e o Barril da 15.ª sem o Godofredo. O banco da 14.ª é a medida de
      antes (mente/sessao-14-dados/pedidos-ator-s14.json);
   §5 não deixa rasto: fora de `pessoas`, `falam` e `conversa`, e o registo
      da cena (registo-da-cena.js) não o vê — nem com a frase dirigida a ele;
   §6 A PROVA sobre os 434 casos (os de teste-pedido-do-ator): quantas fichas
      ganham figurante, 0 rótulos, 0 fatos perdidos (o rastro igual, e toda
      linha de antes está depois), o pior pedido do ator abaixo dos 6 mil sem
      as trocas, e quanto cresce. O modo `mestre` não lê a ficha (as
      fotos do dourado provam-se em teste-ficha-de-ator §6). */
import fs from "node:fs";
import { oFigurante, O_FIGURANTE, FIGURANTE_DO_SITIO } from "../src/motor/o-figurante.js";
import { aFichaDeAtor, verificarAFicha, REGISTOS_DE_FALA } from "../src/motor/ficha-de-ator.js";
import { oQueACenaRegista } from "../src/motor/registo-da-cena.js";
import { oPedidoDoAtor } from "../src/motor/pedido-do-ator.js";
import { COMO_FALA } from "../src/nucleo.js";
import { PALAVRAS_DO_TIPO } from "../src/lugar.js";
import { garantirAbertura, O_QUE_SE_SABE } from "../src/abertura.js";
import { criarMissao } from "../src/missoes.js";
import { oPedidoDoTurno } from "../src/motor/pedido-do-turno.js";
import { oPedidoNoServidor } from "../src/turno-no-servidor.js";
import { estadoNoTurno } from "../src/sessao.js";
import { lerODourado, casosDoPedido, correrAPeca, osModulos, osPadroes } from "./pedido-bloco.mjs";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };
const bloco = (f, n) => (f.texto.split("\n").reduce((o, l) => { if (/^\S/.test(l)) o.cur = l.startsWith(n + " — ") ? n : null; if (o.cur) o.out.push(l); return o; }, { cur: null, out: [] })).out.join("\n");
const maiuscula = (x) => x[0].toUpperCase() + x.slice(1);
const doFig = (f) => (f.figurante ? bloco(f, maiuscula(f.figurante.papel)) : "");

sec("§1 as tabelas");
t("a regra: com uma pessoa com nome em cena (fora do grupo), já não há figurante", Number.isInteger(O_FIGURANTE.basta) && O_FIGURANTE.basta >= 1);
t("as vozes que ele não pode ter existem todas em COMO_FALA, e cada uma diz porquê", Object.entries(O_FIGURANTE.vozFora).every(([id, porque]) => COMO_FALA.some((f) => f.id === id) && porque.length > 10));
const vozesDele = COMO_FALA.filter((f) => !O_FIGURANTE.vozFora[f.id]);
t(`sobra voz para sortear (${vozesDele.length} de ${COMO_FALA.length})`, vozesDele.length >= 10);
const tipos = Object.keys(FIGURANTE_DO_SITIO);
t("cada sítio é um tipo que o mundo conhece (os de lugar.js, e a rua)", tipos.every((k) => k === "rua" || k in PALAVRAS_DO_TIPO));
t("cada sítio tem os dois géneros, o que está a fazer, e um registo de fala que existe (ou nenhum)", Object.values(FIGURANTE_DO_SITIO).every((s) => /^um /.test(s.ele) && /^uma /.test(s.ela) && s.agora && (s.registo === null || REGISTOS_DE_FALA.some((r) => r.id === s.registo))));
t("onde ninguém está não há gente: a ruína, a mina, o forte, a torre", ["ruína", "mina", "forte", "torre"].every((k) => !FIGURANTE_DO_SITIO[k]));
const palavras = [O_FIGURANTE.semNome, O_FIGURANTE.limite, ...Object.values(O_FIGURANTE.pronomes).map((p) => O_FIGURANTE.responde.replace("{H}", "Bram").replace("{D}", p.D)), ...Object.values(FIGURANTE_DO_SITIO).flatMap((s) => [s.ele, s.ela, s.agora])];
t("toda palavra da tabela passa no verificador da ficha (nem rótulo, nem ordem, nem número)", verificarAFicha(palavras.join("\n")).length === 0 && !/figurante/i.test(palavras.join(" ")));
t("o limite diz as quatro coisas, na língua do ator: não promete, não cobra, não revela, não diz nome — nem o seu", /^Não promete/.test(O_FIGURANTE.limite) && /não cobra/.test(O_FIGURANTE.limite) && /segredo/.test(O_FIGURANTE.limite) && /nomes, nem o seu/.test(O_FIGURANTE.limite));

/* as peças reais da 14.ª: o léxico dos lugares e as duas cidades do mapa
   (do save da sessão, «As Minas de Vel Dorran») */
const LEX14 = { lugares: [
  { tipo: "taverna", chamado: "Estalagem da Estrada", nomes: ["O Javali Empalhado", "Tacho Furado", "Repouso do Peregrino", "A Gralha Ruiva"] },
  { tipo: "mercado", chamado: "Feira Franca", nomes: ["Largo da Farinha", "Praça das Sementes", "Mercado da Corda Podre", "Feira dos Ferros"] },
  { tipo: "templo", chamado: "Capela das Chagas", nomes: ["Santuário da Virgem Pálida", "Claustro do Primeiro Prego", "Igreja do Suor Bento", "Cripta dos Ossos Mártires"] },
  { tipo: "forja", chamado: "Malho Feudal", nomes: ["Bigorna de Santo Elói", "Brasa do Fole Velho", "Forja do Rio Frio", "Malho dos Três Cravos"] },
  { tipo: "quartel", chamado: "Casa de Guarda", nomes: ["Paliçada do Leste", "Torre dos Meirinhos", "Quartel da Couraça Preta", "Guarnição da Ponte"] },
  { tipo: "cadeia", chamado: "Fosso dos Ferros", nomes: ["Masmorra da Torre Baixa", "Gaiola do Poço Seco", "Porão dos Calafrios", "Calabouço da Lama"] },
  { tipo: "biblioteca", chamado: "Scriptorium da Ordem", nomes: ["Arquivo do Pergaminho Roxo", "Câmara dos Rolos Velhos", "Abóbada do Cartório", "Livraria dos Doutores"] },
  { tipo: "cemitério", chamado: "Campo Santo", nomes: ["Chão das Cruzes Podres", "Cova dos Estranhos", "Jardim das Lajes Frias", "Descanso dos Romeiros"] },
] };
const MAPA14 = { cidades: [
  { nome: "Monte da Forca", tipo: "capital", porte: "capital", populacao: 35800, regiao: "Colinas das Brumas", bioma: "costa" },
  { nome: "Serra dos Frades", tipo: "vila", porte: "vila", populacao: 1050, regiao: "Planaltos Escarlates", bioma: "costa" },
] };
const BRAM = { nome: "Bram Pedra-Alta", grupo: [{ nome: "Leonor", vinculo: 31, classe: "Engenheiro", raca: "Homens de Ferro", conceito: "mestra de ofício" }] };
const S14 = { personagem: BRAM, npcs: {}, nomeCampanha: "As Minas de Vel Dorran", mundo: { genero: "Fantasia medieval", molde: "sobremundo", lexico: LEX14 }, mapa: MAPA14, cidadeAtual: "Monte da Forca", dia: 1, minuto: 600 };
const sitio = (nome, cidade = "Monte da Forca") => ({ nome, cidade, dentroDe: "", distancia: "dentro" });
const CLAUSTRO = sitio("Claustro do Primeiro Prego"), MERCADO = sitio("Mercado da Corda Podre"), POCA = sitio("A Poça da Foz");

sec("§2 o lixo, a imutabilidade, o determinismo");
for (const [n, e, o] of [["null", null, null], ["undefined", undefined, undefined], ["{}", {}, {}], ["tipos errados", { lugar: 5, cidadeAtual: [], mapa: "x", dia: "?", mundo: 3 }, { comNome: "x" }], ["lugar sem nome", { lugar: { nome: "" } }, null]]) {
  let r, erro = null;
  try { r = oFigurante(e, o); } catch (x) { erro = x; }
  t(`${n}: não estoura, e sem sítio nem cidade não há ninguém`, !erro && r === null);
}
const e6 = congelar(JSON.parse(JSON.stringify({ ...S14, lugar: CLAUSTRO })));
const antes6 = JSON.stringify(e6);
const f6 = oFigurante(e6, { comNome: 0 });
t("o estado que entra não muda (congelado, e igual byte a byte)", JSON.stringify(e6) === antes6 && !!f6);
t("a mesma entrada dá o mesmo figurante", JSON.stringify(oFigurante(e6, { comNome: 0 })) === JSON.stringify(f6));

sec("§3 a regra");
t("no claustro (um templo, pela base do mundo) é gente de templo", f6.tipo === "templo" && [FIGURANTE_DO_SITIO.templo.ele, FIGURANTE_DO_SITIO.templo.ela].includes(f6.papel));
t("a voz é uma das de COMO_FALA que ele pode ter", vozesDele.some((v) => v.o === f6.tique));
t("no mesmo sítio e no mesmo dia, de um turno para o outro, é o mesmo (outra hora, outra frase)", JSON.stringify(oFigurante({ ...S14, lugar: CLAUSTRO, minuto: 700 }, { comNome: 0 })) === JSON.stringify(f6));
const noMercado = oFigurante({ ...S14, lugar: MERCADO }, { comNome: 0 });
t("e muda quando muda o sítio: no mercado é gente de mercado", noMercado.tipo === "mercado" && noMercado.papel !== f6.papel);
/* muitos sítios: a sorte é do sítio, não uma só para a cidade */
const vozesVistas = new Set(Array.from({ length: 12 }, (_, d) => { const f = oFigurante({ ...S14, lugar: CLAUSTRO, dia: d }, { comNome: 0 }); return `${f.genero}|${f.tique}`; }));
t(`e o dia é outra cena: em doze dias, o claustro tem ${vozesVistas.size} vozes diferentes`, vozesVistas.size >= 4);
t("com gente com nome bastante em cena não há figurante", oFigurante({ ...S14, lugar: CLAUSTRO }, { comNome: O_FIGURANTE.basta }) === null);
t("a luta, a masmorra, o acampamento e a estrada não têm gente do lugar", [{ combate: { inimigos: [] } }, { masmorra: { nome: "x" } }, { acampado: true }, { jornada: { estado: "viajando" }, lugar: null }].every((x) => oFigurante({ ...S14, lugar: CLAUSTRO, ...x }, { comNome: 0 }) === null));
t("o forte abandonado (sítio sem gente) não tem; a cidade sem sítio é a rua", oFigurante({ ...S14, cidadeAtual: "Serra dos Frades", lugar: { nome: "Forte Abandonado de Raízes", cidade: "Serra dos Frades", distancia: "perto" } }, { comNome: 0 }) === null && oFigurante({ ...S14, cidadeAtual: "Serra dos Frades", lugar: null }, { comNome: 0 }).tipo === "rua");
t("o cômodo de um prédio só pelo nome dele (o quarto não é o salão)", oFigurante({ ...S14, lugar: { nome: "o quarto de cima", cidade: "Monte da Forca", dentroDe: "Tacho Furado", distancia: "dentro" } }, { comNome: 0 }) === null);

sec("§4 os cenários em que o mundo ficou mudo");
const BANCO = JSON.parse(fs.readFileSync(new URL("../mente/sessao-14-dados/pedidos-ator-s14.json", import.meta.url), "utf8")).map((x) => { const c = JSON.parse(x.body).messages.map((m) => m.content).join("\n"); return c.slice(c.lastIndexOf("\nCENA\n") + 1); });
const falamDe = (txt) => (txt.match(/^Falam só: (.*)\.$/m) || [])[1] || "";
/* os turnos da sessão no banco (o banco guarda os pedidos ao ator, e a
   sessão contou também os turnos sem IA): T2 #1, T6 #5, T7 #6, T12 #10, T16 #13 */
const NO_BANCO = { T2: 1, T6: 5, T7: 6, T12: 10, T16: 13 };
t("antes (o banco da 14.ª): na Poça, no claustro, no mercado e na rua de Serra dos Frades só a Leonor falava; no T12 havia a Beatriz", ["T2", "T6", "T7", "T16"].every((k) => falamDe(BANCO[NO_BANCO[k]]) === "Leonor") && falamDe(BANCO[NO_BANCO.T12]) === "Leonor, Beatriz Sem-Pão");
const EMC = "EM CENA   Leonor (com você); a quem não tem nome: Bernardo (ele) · Teresa do Castanhal (ela)";
const RUMO = "O RUMO    responda primeiro ao que perguntei; o que ninguém aqui sabe, quem responde diz que não sabe";
const onde = (l, c = "Monte da Forca") => `ONDE      ${l ? maiuscula(`${l.nome.startsWith("A ") ? "na " + l.nome.slice(2) : "em " + l.nome}, dentro de ${c}`) : `em ${c}`}`;
const turno = (frase, lugar, extra = {}, emCena = EMC, cidade = "Monte da Forca") => aFichaDeAtor({ frase, nota: `${onde(lugar, cidade)}\n${emCena}\n${RUMO}`, estado: { ...S14, cidadeAtual: cidade, lugar, ...extra } });
const T = {
  T2: turno("— Quem é ele, Inez? E onde foi que caiu? Fica longe daqui?", POCA),
  T6: turno("Ajoelho-me ao lado de um dos devotos e pergunto em voz baixa se a Inez do Prado Baixo passou por aqui hoje, e quem é o sacerdote que cuida deste claustro.", CLAUSTRO, { minuto: 640 }),
  T7: turno("Saio do claustro e procuro no mercado quem venda uma maça de ferro e um punhado de ervas de cura. Pergunto quanto custa cada coisa.", MERCADO, { minuto: 700 }),
  T12: turno("Beatriz?! Olho-a de alto a baixo. Depois viro-me para a Inez: — Prometi rezar por ele. Diga-me quem era.", POCA, { dia: 1, minuto: 1100 }, "EM CENA   Beatriz Sem-Pão (vendedora de ervas) · Leonor (com você)"),
  T16: turno("Pergunto na rua por Estêvão da Cruz Quebrada, o que assinou o aviso da caçada, e vou ter com ele.", null, { dia: 2, minuto: 900 }, "EM CENA   Leonor (com você)", "Serra dos Frades"),
};
for (const k of ["T2", "T6", "T7", "T16"]) {
  const f = T[k], b = doFig(f);
  t(`${k}: agora alguém responde — ${f.figurante ? f.figurante.papel : "ninguém"} em QUEM ESTÁ e em «Falam só», com voz`, !!f.figurante && b.includes("— gente do lugar, sem nome.") && falamDe(f.texto) === `Leonor, ${f.figurante.papel} sem nome` && /\n  Fala: /.test(b));
  t(`${k}: sem Sabe e sem Quer, com o limite e a resposta ao herói`, !/\n  (Sabe|Quer):/.test(b) && b.includes(O_FIGURANTE.limite) && b.includes("Responde quando Bram Pedra-Alta fala ao lugar"));
  t(`${k}: a ficha passa no verificador`, verificarAFicha(f.texto).length === 0);
}
t("T6 no claustro é gente de templo, T7 no mercado gente de mercado, T2 na Poça gente da casa de banhos, T16 a rua", T.T6.figurante.tipo === "templo" && T.T7.figurante.tipo === "mercado" && T.T2.figurante.tipo === "casa de banhos" && T.T16.figurante.tipo === "rua");
t("T7: a pergunta ao mercado («quanto custa cada coisa») é dele, nem que seja para não saber — já não da Leonor", doFig(T.T7).includes("Não sabe responder a: «quanto custa cada coisa»") && !/Não sabe/.test(bloco(T.T7, "Leonor")));
t("T12: com a Beatriz em cena (gente com nome), não há figurante", T.T12.figurante === null && falamDe(T.T12.texto) === "Leonor, Beatriz Sem-Pão");
const T6b = turno("E o senhor, reza por quem?", CLAUSTRO, { minuto: 700 });
t("T6 → o turno seguinte no claustro: o mesmo devoto, com a mesma voz", JSON.stringify(T6b.figurante && { p: T6b.figurante.papel, v: T6b.figurante.tique }) === JSON.stringify({ p: T.T6.figurante.papel, v: T.T6.figurante.tique }));
const chamaLeonor = turno("Leonor, quanto custa uma maça de ferro?", MERCADO);
t("quem chama a companheira pelo nome fala com ela: o «não sabe» fica com a Leonor", /Não sabe responder a/.test(bloco(chamaLeonor, "Leonor")) && !/Não sabe/.test(doFig(chamaLeonor)));

/* O Barril da 15.ª sem o Godofredo: a abertura, a principal e a rotina como
   em teste-a-pessoa-do-passo §3; o léxico com as duas casas de beber da
   sessão, e a semente do mundo põe o Barril como a taverna de Cimo Negro */
const abertura = garantirAbertura({ principalId: "mis_principal", cidade: "Cimo Negro", chegada: "à porta de Cimo Negro", razao: "alguém lhe pediu que fosse atrás de Isolda",
  sabe: `Godofredo, taverneiro, ${O_QUE_SE_SABE.informante.replace("{objeto}", "Isolda").replace("{local}", "n'O Barril Rachado")}`, titulo: "O rasto de Isolda",
  pista: { nome: "Godofredo", papel: "taverneiro", local: "O Barril Rachado" }, alvo: { feitio: "procurar", quem: "Isolda", onde: "A Casa da Ponte, em Cova Negro", objeto: "Isolda" } });
const principal = criarMissao({ id: "mis_principal", titulo: "O rasto de Isolda", tipo: "principal", status: "ativa", descricao: abertura.razao,
  etapas: [{ tipo: "falar_com", alvo: "Godofredo", onde: "O Barril Rachado" }, { tipo: "falar_com", alvo: "Isolda", onde: "A Casa da Ponte, em Cova Negro" }] });
const IRENE = { nome: "Irene", grupo: [{ nome: "Yvete Perna-Seca", vinculo: 10, classe: "Monge", raca: "Humana" }] };
const S15 = { personagem: IRENE, npcs: {}, nomeCampanha: "O Vau das Cinzas", mundo: { genero: "Fantasia medieval", lexico: { lugares: [{ tipo: "taverna", nomes: ["A Bica das Cinzas", "O Barril Rachado"] }] } }, abertura, missoes: [principal], cidadeAtual: "Cimo Negro", dia: 2,
  nucleoCache: { nucleo: { pessoas: [{ nome: "Yvete Perna-Seca", papel: "companheiro", ficha: { fala: { o: "responde com outra pergunta" } } }] } }, lugar: { nome: "O Barril Rachado", cidade: "Cimo Negro", dentroDe: "", distancia: "dentro" } };
const F2 = "Chamo o Godofredo: — Godofredo! Preciso de falar contigo.";
const N2 = "ONDE      n'O Barril Rachado, dentro de Cimo Negro\nEM CENA   Yvete Perna-Seca (com você)";
const cedo = aFichaDeAtor({ frase: F2, nota: N2, estado: { ...S15, minuto: 510 } });
const naHora = aFichaDeAtor({ frase: F2, nota: N2, estado: { ...S15, minuto: 700 } });
t("o Barril da 15.ª sem o Godofredo (antes da hora dele): a cena diz onde ele anda, e há quem responda — gente de taverna, sem nome", /Godofredo, taverneiro, não está aqui agora/.test(cedo.partes.CENA) && !!cedo.figurante && cedo.figurante.tipo === "taverna" && falamDe(cedo.texto) === `Yvete Perna-Seca, ${cedo.figurante.papel} sem nome` && verificarAFicha(cedo.texto).length === 0);
t("…e o vulto deixa de ter de ser inventado: quem está ao balcão não diz nome nenhum, nem o do Godofredo", doFig(cedo).includes(O_FIGURANTE.limite) && !doFig(cedo).includes("Godofredo"));
t("à hora do balcão, com o Godofredo em cena, não há figurante", naHora.falam.includes("Godofredo") && naHora.figurante === null);

sec("§5 não deixa rasto");
const aoDevoto = turno("Pergunto ao devoto ao meu lado se viu a Inez.", CLAUSTRO);
t("fora de `pessoas`, de `falam` e de `conversa`", !!aoDevoto.figurante && !aoDevoto.pessoas.some((p) => p.nome === aoDevoto.figurante.papel) && !aoDevoto.falam.some((n) => /devot/.test(n)) && aoDevoto.conversa.length === 0);
const reg = oQueACenaRegista({ ficha: aoDevoto, estado: { personagem: BRAM } });
t("o registo da cena não o vê, nem com a frase dirigida a ele: nenhuma pessoa nova, nenhuma conversa", reg.pessoas.length === 0 && reg.falou_com.length === 0 && reg.itens.length === 0);
const falaAoLugar = turno("Digo em voz alta: alguém aqui viu a Inez?", CLAUSTRO);
t("a fala dirigida «ao único que está» também não o põe na conversa", falaAoLugar.conversa.length === 0 && oQueACenaRegista({ ficha: falaAoLugar, estado: { personagem: BRAM } }).pessoas.length === 0);

sec("§6 A PROVA: os 434 casos");
const tamanho = (p) => p.system.length + p.messages.reduce((s, m) => s + String(m.content).length, 0);
const casos = [];
for (const s of ["s8", "s9", "s10", "navegador", "s13"]) {
  const A = JSON.parse(fs.readFileSync(new URL(`./sessao-${s}.json`, import.meta.url), "utf8"));
  for (let i = 0; i < A.turnos.length; i++) {
    const ent = A.turnos[i].entrada || {};
    const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
    if (!frase.trim()) continue;
    const m = await oPedidoNoServidor({ estado: estadoNoTurno(A, i), frase }, { agora: () => 0 });
    casos.push({ de: `${s}#${i}`, frase, nota: m.pedido.messages[m.pedido.messages.length - 1].content.split("\n═══")[0], estado: m.estadoDoFim });
  }
}
{
  const D = lerODourado();
  const mods = await osModulos(D.imports), pad = osPadroes(D, mods);
  for (const k of casosDoPedido()) {
    const f = correrAPeca(oPedidoDoTurno, k, D, pad);
    casos.push({ de: `bloco#${k.i}`, frase: k.entrada.conteudo, nota: (f.out && f.out.nota) || "", estado: { ...k.estado, ...f.valores, personagem: f.valores.personagem || k.render.personagem || k.estado.personagem, mundo: k.render.mundo || k.estado.mundo } });
  }
}
t(`os casos: ${casos.length}`, casos.length === 434);
/* o «sem figurante» é o mesmo turno com uma luta aberta — a única porta que
   o desliga e que a ficha não lê para mais nada */
let com = 0, rot = 0, perdas = [], cresce = [], piorCom = 0, piorSem = 0, comNomeEFig = 0;
for (const k of casos) {
  const d = oPedidoDoAtor({ nota: k.nota, frase: k.frase, estado: k.estado });
  const a = oPedidoDoAtor({ nota: k.nota, frase: k.frase, estado: { ...k.estado, combate: k.estado.combate || { desligado: true } } });
  piorCom = Math.max(piorCom, tamanho(d.pedido)); piorSem = Math.max(piorSem, tamanho(a.pedido));
  rot += verificarAFicha(d.ficha.texto).length;
  if (!d.ficha.figurante) { if (d.ficha.texto !== a.ficha.texto) perdas.push(`${k.de}: mudou sem figurante`); continue; }
  com++;
  cresce.push(tamanho(d.pedido) - tamanho(a.pedido));
  if (d.ficha.pessoas.some((p) => !p.comVoce && !p.fera && !/no chão/.test(String(p.estado || "")))) comNomeEFig++;
  /* os fatos: o rastro igual, e toda linha de antes está depois — menos a
     das falas (ganha o figurante), o «Só …» (já não está só) e o não-sabe
     que passa da companheira para quem o lugar pôs a responder */
  const depois = new Set(d.ficha.texto.split("\n").map((l) => l.trim()));
  const faltou = a.ficha.texto.split("\n").filter((l) => !depois.has(l.trim()) && !/^(Falam só:|Só |Ninguém fala além|Não sabe responder|Do que .* perguntou)/.test(l.trim()));
  if (JSON.stringify(a.ficha.rastro) !== JSON.stringify(d.ficha.rastro) || faltou.length) perdas.push(`${k.de}: ${faltou.slice(0, 2).join(" | ")}`);
}
const media = (x) => Math.round(x.reduce((s, v) => s + v, 0) / Math.max(1, x.length));
console.log(`  ..  ${com} de ${casos.length} fichas ganham figurante; o pedido cresce ${media(cresce)} em média nelas (no máximo ${Math.max(...cresce)}); o pior pedido: ${piorSem} sem → ${piorCom} com`);
/* medido em 03/11: 77 de 434 (38 na rua, 21 na taverna, 18 no moinho dos
   arredores); +475 em média, +539 no máximo; o pior 4 739 → 4 913 */
t(`as fichas sem ninguém com nome ganham figurante (${com}), e nenhuma com gente com nome em cena`, com >= 60 && comNomeEFig === 0);
t(`0 rótulos nas ${casos.length} fichas`, rot === 0);
t(`0 fatos perdidos: o rastro igual e toda linha de antes está depois${perdas.length ? " — " + perdas.slice(0, 3).join("; ") : ""}`, perdas.length === 0);
t(`o figurante cabe: cresce no máximo 600 caracteres, e o pior pedido do ator fica nos ~6 mil sem as trocas (${piorCom})`, Math.max(...cresce) <= 600 && piorCom <= 6000);
t("a mesma corrida dá os mesmos figurantes (determinismo sobre o corpus)", casos.slice(0, 80).every((k) => JSON.stringify(aFichaDeAtor({ nota: k.nota, frase: k.frase, estado: k.estado }).figurante) === JSON.stringify(oPedidoDoAtor({ nota: k.nota, frase: k.frase, estado: k.estado }).ficha.figurante)));

console.log(`\no figurante: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
