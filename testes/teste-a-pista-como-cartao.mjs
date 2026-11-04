/* A PISTA COMO CARTÃO (04/11, a 16.ª sessão, caso 1) — src/motor/a-pista-como-cartao.js

   Na 16.ª (mente/sessao-16.md) a Astrid estava em QUEM ESTÁ, com o passo
   seguinte no «Sabe», e o jogador teve de adivinhar a pergunta: «O que
   sabe?» deu «Não sabe responder a: «O que sabe?»», e ela pediu moeda em vez
   de dar a pista. A pessoa aprovou em 03/11 (mente/plano-narrador-ator.md,
   decisão 6) o cartão «Perguntar a X por Y».

   O que esta suíte prova:
   §1 as tabelas: cada frase passa no verificador da ficha; quem guarda o
      sítio não tem cartão; o envelope está na tabela do acampamento, ao
      lado da resposta ao pedido (uma ação, uma forma);
   §2 o lixo não estoura, a entrada não muda, a mesma entrada dá o mesmo;
   §3 O CENÁRIO DA 16.ª, montado com as peças que o produzem (a abertura, a
      principal como `abrirAbertura` a cria, o marco com a batida e o segredo
      como batidas.js os escreve): a Astrid em cena à hora dela tem o cartão
      «Perguntar a Astrid pelo Largo do Cardo», com o veredito; fora da hora
      não; o Joric, de guarda no Largo, não; tocado, o envelope leva o que
      ela sabe, a ficha diz a pergunta e põe-na a responder com o «Sabe», a
      conversa cumpre o `falar_com`, e o cartão some e não volta para o
      mesmo passo — o passo seguinte traz o seu;
   §4 O MUNDO GRAVADO (sessao-navegador.json): a pista Doran o Manco, com o
      passo dado, tem o cartão do sítio que a principal manda descobrir;
   §5 O MASCATE (a 14.ª, defeito 9): no mercado da 14.ª, com as bancas do
      dia (mercadoresDaCidade, as do painel Mercado) e a linha que a pauta
      escreve (mercadoParaPauta), o preço é do mascate — já não da Leonor. */
import fs from "node:fs";
import { asPistasDoPasso, perguntarPelaPista, A_PISTA_COMO_CARTAO } from "../src/motor/a-pista-como-cartao.js";
import { aPessoaDoPasso, A_PESSOA_DO_PASSO } from "../src/motor/a-pessoa-do-passo.js";
import { aFichaDeAtor, verificarAFicha } from "../src/motor/ficha-de-ator.js";
import { O_FIGURANTE_VENDE } from "../src/motor/o-figurante.js";
import { oQueACenaRegista } from "../src/motor/registo-da-cena.js";
import { ENVELOPES_DO_ACAMPAMENTO, oEnvelopeDoAcampamento, SO_ISSO } from "../src/motor/envelopes-do-turno.js";
import { GUARDA_NA_CENA, SEGREDO_DIZ } from "../src/batidas.js";
import { garantirAbertura, O_QUE_SE_SABE, OBJETO_DO_FEITIO } from "../src/abertura.js";
import { criarMissao, garantirMissoes, etapaDef } from "../src/missoes.js";
import { fichaDaPessoa } from "../src/gente-por-dentro.js";
import { mercadoresDaCidade, mercadoParaPauta } from "../src/mercado.js";
import { estadoNoTurno } from "../src/sessao.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };
const bloco = (f, n) => (f.texto.split("\n").reduce((o, l) => { if (/^\S/.test(l)) o.cur = l.startsWith(n + " — ") ? n : null; if (o.cur) o.out.push(l); return o; }, { cur: null, out: [] })).out.join("\n");
const tpl = (x, v) => String(x).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));
const maiuscula = (x) => x[0].toUpperCase() + x.slice(1);
const doFig = (f) => (f.figurante ? bloco(f, maiuscula(f.figurante.papel)) : "");

sec("§1 as tabelas");
const P = A_PISTA_COMO_CARTAO;
const amostra = [P.oferta, P.por, P.preco, P.dito, P.semObjeto, P.responde, O_FIGURANTE_VENDE.diz].map((x) => tpl(x, { N: "Astrid", Y: "pelo Largo do Cardo", X: "o Largo do Cardo", H: "Bento", S: "o Largo fica em Rio Profundo", V: "Mangual 88" }));
t("cada frase da tabela passa no verificador da ficha (nem rótulo, nem ordem, nem número de jogo)", verificarAFicha(amostra.join("\n")).length === 0);
t("o cartão tem a forma do «Perguntar a {nome} porquê»: verbo com objeto, e o veredito em mundo, sem custo", /^Perguntar a \{N\} /.test(P.oferta) && /sem custo$/.test(P.preco));
t("quem guarda o sítio de um «revelar» não tem cartão: guarda, não conta (o segredo acha-se pelo teste)", !P.de.includes("guarda") && ["pista", "alvo", "dador", "etapa"].every((x) => P.de.includes(x)));
t("o envelope da pergunta mora na tabela do acampamento, ao lado da resposta ao pedido", typeof ENVELOPES_DO_ACAMPAMENTO.perguntaPelaPista === "function" && typeof ENVELOPES_DO_ACAMPAMENTO.respostaAoCoracao === "function");

sec("§2 o lixo, a imutabilidade, o determinismo");
for (const [n, e] of [["null", null], ["undefined", undefined], ["{}", {}], ["tipos errados", { lugar: 5, missoes: "x", abertura: [], npcs: 3 }], ["missões com lixo", { lugar: { nome: "A Lanterna da Bruma" }, missoes: [null, 3, { status: "ativa", etapas: [null, { tipo: "falar_com" }] }] }]]) {
  let r = null, erro = null;
  try { r = asPistasDoPasso(e); } catch (x) { erro = x; }
  t(`${n}: não estoura, e não há cartão`, !erro && Array.isArray(r) && r.length === 0);
}
const lixoM = [null, 3, { id: "x" }];
t("perguntar com lixo devolve o que veio, a mesma referência", perguntarPelaPista(null, "pista|x|1") === null && perguntarPelaPista(lixoM, "pista|x|1") === lixoM && perguntarPelaPista(lixoM, null) === lixoM && perguntarPelaPista(lixoM, "pista|nada|0") === lixoM && perguntarPelaPista(lixoM, "outra|x|1") === lixoM);
let erroE = null; try { oEnvelopeDoAcampamento("perguntaPelaPista", null); } catch (x) { erroE = x; }
t("o envelope sem dados não estoura", !erroE);

sec("§3 a 16.ª: a Astrid, o Largo do Cardo e o Joric");
/* as peças da 16.ª como em teste-a-pessoa-do-passo §6 */
const S16 = "A Lanterna do Brejo|Fantasia medieval";
const objeto16 = OBJETO_DO_FEITIO.descobrir.replace("{onde}", "O Largo do Cardo");
const ab16 = garantirAbertura({ principalId: "mis_principal", cidade: "Ponto da Fonte", chegada: "à porta de Ponto da Fonte", razao: "o pai de Bento morreu com uma dívida", sabe: `Astrid, taverneira, ${O_QUE_SE_SABE.informante.replace("{objeto}", objeto16).replace("{local}", "na Lanterna da Bruma")}`, titulo: "O que o Largo guarda", pista: { nome: "Astrid", papel: "taverneira", local: "A Lanterna da Bruma" }, alvo: { feitio: "descobrir", quem: "", onde: "O Largo do Cardo", objeto: objeto16 } });
const pr16 = criarMissao({ id: "mis_principal", titulo: "O que o Largo guarda", tipo: "principal", status: "ativa", descricao: ab16.razao, etapas: [{ tipo: "falar_com", alvo: "Astrid", onde: "A Lanterna da Bruma" }, { tipo: "revelar", alvo: "O Largo do Cardo", onde: "O Largo do Cardo, em Rio Profundo", chave: "Rio Profundo|praca" }] });
const esp16 = { atos: [{ ato: 0, marcos: [{ id: "a0|1", feitio: "descobrir", titulo: "O que O Largo do Cardo esconde", onde: "O Largo do Cardo", cidade: "Rio Profundo", segredo: { coisa: "um alçapão sob a fonte seca", diz: SEGREDO_DIZ.alcapao, acha: "Percepção", dc: 13, escondido: false }, batida: { cena: `O Largo do Cardo, em Rio Profundo, ${GUARDA_NA_CENA} Joric Filho da Névoa`, emJogo: "o que aqui se esconde", pergunta: "o que o herói arrisca?" } }] }] };
const BENTO = { nome: "Bento", grupo: [{ nome: "Alaric Barba-Ruiva", vinculo: 25, classe: "Ladino", raca: "Humano" }] };
const rotA = (min) => fichaDaPessoa(S16, { nome: "Astrid", papel: "taverneira", local: "A Lanterna da Bruma" }, { dia: 1, minuto: min, cidade: "Ponto da Fonte" }).rotina;
const horaA = [730, 760, 800, 900, 1000].find((m) => rotA(m).noTurno);
const foraA = [300, 400, 500].find((m) => !rotA(m).noTurno);
const LANTERNA = { nome: "A Lanterna da Bruma", cidade: "Ponto da Fonte" };
const base16 = { personagem: BENTO, nomeCampanha: "A Lanterna do Brejo", mundo: { genero: "Fantasia medieval" }, abertura: ab16, espinha: esp16, cidadeAtual: "Ponto da Fonte", dia: 1, minuto: horaA, lugar: LANTERNA, npcs: {} };
const NOTA16 = "ONDE      n'A Lanterna da Bruma, dentro de Ponto da Fonte\nEM CENA   Alaric Barba-Ruiva (com você)";
const SABE16 = tpl(A_PESSOA_DO_PASSO.sabeDaEtapa.revelar, { A: "O Largo do Cardo", C: tpl(A_PESSOA_DO_PASSO.cidadeDoSitio.outra, { X: "Rio Profundo" }), G: tpl(A_PESSOA_DO_PASSO.guardaDito, { X: "Joric Filho da Névoa" }) });
t(`a hora da Astrid pela semente do mundo: ao balcão às ${horaA} min, fora às ${foraA}`, rotA(horaA).noTurno && !rotA(foraA).noTurno);

/* T3: a Astrid em cena, à hora dela, antes de lhe falar */
const e3 = { ...base16, missoes: [pr16] };
const c3 = asPistasDoPasso(e3);
t("T3: a Astrid em cena tem um cartão, e um só", c3.length === 1 && c3[0].nome === "Astrid");
t("…«Perguntar a Astrid pelo Largo do Cardo» (o sítio do passo seguinte, com a preposição contraída)", c3[0].oferta === "Perguntar a Astrid pelo Largo do Cardo" && c3[0].sobre === "O Largo do Cardo");
t("…o veredito antes do clique: a resposta não custa moeda (o tempo junta-o o App)", c3[0].preco === "Astrid lhe diz o que sabe, sem custo");
t("…e o que ela responde é o «Sabe» que já tem: o onde (Rio Profundo), o quem (o Joric) e o quê", c3[0].sabe === SABE16 && aPessoaDoPasso(e3).find((x) => x.nome === "Astrid").sabe.join("; ") === SABE16);
t("…o id é o do passo perguntado (a etapa 1 da principal)", c3[0].id === "pista|mis_principal|1" && c3[0].missao === "mis_principal" && c3[0].etapa === 1);
t("fora da hora dela, a Astrid não está, e não há cartão", asPistasDoPasso({ ...e3, minuto: foraA }).length === 0);
t("fora da Lanterna, também não", asPistasDoPasso({ ...e3, lugar: { nome: "As Termas da Fivela", cidade: "Ponto da Fonte" } }).length === 0);
const ent = congelar(JSON.parse(JSON.stringify(e3)));
const antes = JSON.stringify(ent);
let erroC = null; try { asPistasDoPasso(ent); } catch (x) { erroC = x; }
t("a entrada não muda (congelada, corre, igual byte a byte), e a mesma entrada dá o mesmo", !erroC && JSON.stringify(ent) === antes && JSON.stringify(asPistasDoPasso(ent)) === JSON.stringify(c3));

/* o toque */
const env = oEnvelopeDoAcampamento("perguntaPelaPista", { nome: c3[0].nome, sobre: c3[0].sobre, sabe: c3[0].sabe });
t("o toque é um envelope do sistema: «[PERGUNTA A Astrid — FEITA POR MIM] Pergunto a Astrid pelo Largo do Cardo.»", env.startsWith("[PERGUNTA A Astrid — FEITA POR MIM] Pergunto a Astrid pelo Largo do Cardo. "));
t("…que leva o que ela sabe, à letra (é assim que serve também ao `mestre`), e fica na cena (SO_ISSO)", env.includes(`"${SABE16}"`) && env.endsWith(SO_ISSO));
const marcadas = perguntarPelaPista([pr16], c3[0].id);
t("o toque marca a etapa perguntada, sem mudar a lista que veio", marcadas[0].etapas[1].perguntada === true && pr16.etapas[1].perguntada === undefined && marcadas[0].etapas[0] === pr16.etapas[0]);
t("…e marcar de novo não muda nada (a mesma referência)", perguntarPelaPista(marcadas, c3[0].id) === marcadas);
t("o campo viaja no save (garantirMissoes guarda-o) e só existe quando existe: a missão antiga sai igual", garantirMissoes(marcadas)[0].etapas[1].perguntada === true && JSON.stringify(garantirMissoes([pr16])) === JSON.stringify([pr16]) && !("perguntada" in garantirMissoes([pr16])[0].etapas[1]));

/* a ficha do turno do toque */
const T3 = aFichaDeAtor({ frase: env, nota: `${NOTA16}\nO FECHO   termine em alguém em cena faz-me uma pergunta direta`, estado: { ...e3, missoes: marcadas } });
t("a ficha do toque: a pergunta é fato no ACONTECEU", T3.partes.ACONTECEU === "Bento pergunta a Astrid pelo Largo do Cardo.");
t("…e a Astrid responde com o que sabe, em O QUE SE DIZ — o passo inteiro", T3.partes["O QUE SE DIZ"] === `Astrid: responde a Bento com o que sabe: ${SABE16}.`);
t("…sem o repetir no «Sabe», sem «não sabe responder», e a última palavra é dela", !bloco(T3, "Astrid").includes("Sabe:") && !/Não sabe/.test(T3.texto) && T3.partes["A ÚLTIMA PALAVRA"] === "É de Astrid, e é o que tem a dizer a Bento.");
t("…o envelope traduz-se (nada sem tradução) e a ficha passa no verificador", T3.rastro.every((r) => r.cai !== "semTraducao") && verificarAFicha(T3.texto).length === 0);
const reg3 = oQueACenaRegista({ ficha: T3, estado: { personagem: BENTO } });
const mundoDaEtapa = { cidadeAtual: "Ponto da Fonte", lugarAtual: LANTERNA, npcs: { Astrid: { nome: "Astrid", local: "A Lanterna da Bruma", conhecidoEm: 1 } } };
t("…a pergunta é conversa: o registo vê-a, e o «Encontrar Astrid» cumpre-se pela porta de sempre", T3.conversa.includes("Astrid") && reg3.falou_com.includes("Astrid") && etapaDef("falar_com").ver(pr16.etapas[0], { ...mundoDaEtapa, falouCom: reg3.falou_com }) === true);
t("depois do toque, o cartão some", asPistasDoPasso({ ...e3, missoes: marcadas }).length === 0);
/* T4/T5: o passo dado — a Astrid continua em cena, e o cartão não volta */
const npcs16 = { Astrid: { nome: "Astrid", papel: "taverneira", local: "A Lanterna da Bruma, Ponto da Fonte", conhecidoEm: 1 } };
const dado = (ms) => ms.map((m) => ({ ...m, etapas: [{ ...m.etapas[0], feito: true }, ...m.etapas.slice(1)] }));
const e5 = { ...base16, npcs: npcs16, minuto: horaA + 10 };
const c5 = asPistasDoPasso({ ...e5, missoes: dado([pr16]) });
t("T5, com o passo dado e sem ter perguntado: a Astrid continua em cena com o mesmo cartão (o mesmo passo)", c5.length === 1 && c5[0].id === c3[0].id && c5[0].oferta === c3[0].oferta);
t("…e, perguntado, não reaparece para o mesmo passo", asPistasDoPasso({ ...e5, missoes: dado(marcadas) }).length === 0);
/* tocado, e ela saiu antes de responder: a cena diz porquê, e ninguém responde por ela */
const T3f = aFichaDeAtor({ frase: env, nota: NOTA16, estado: { ...e3, missoes: marcadas, minuto: foraA } });
t("se ela já não está (fora da hora), a pergunta fica no ACONTECEU, a cena diz onde anda, e ninguém responde por ela", T3f.partes.ACONTECEU === "Bento pergunta a Astrid pelo Largo do Cardo." && T3f.partes.CENA.includes("Astrid, taverneira, não está aqui agora:") && !/Astrid: /.test(T3f.partes["O QUE SE DIZ"]) && verificarAFicha(T3f.texto).length === 0);
/* no Largo do Cardo: o Joric guarda, e não conta */
const e13 = { ...base16, missoes: dado([pr16]), npcs: npcs16, lugar: { nome: "O Largo do Cardo", cidade: "Rio Profundo" }, cidadeAtual: "Rio Profundo" };
const joric = aPessoaDoPasso(e13).find((x) => x.nome === "Joric Filho da Névoa");
t("no Largo do Cardo, o Joric é a pessoa do passo, de guarda — e não tem cartão", !!joric && joric.de === "guarda" && asPistasDoPasso(e13).length === 0);
/* o passo seguinte traz o seu: a mesma principal, com o Joric a falar antes do revelar */
const pr3 = criarMissao({ id: "mis_tres", titulo: "O que o Largo guarda", tipo: "principal", status: "ativa", descricao: ab16.razao, etapas: [{ tipo: "falar_com", alvo: "Astrid", onde: "A Lanterna da Bruma" }, { tipo: "falar_com", alvo: "Joric Filho da Névoa", onde: "O Largo do Cardo, em Rio Profundo" }, { tipo: "revelar", alvo: "O Largo do Cardo", onde: "O Largo do Cardo, em Rio Profundo" }] });
const cA = asPistasDoPasso({ ...base16, missoes: [pr3] });
t("com três passos, a Astrid pergunta-se pelo segundo: «Perguntar a Astrid por Joric Filho da Névoa»", cA.length === 1 && cA[0].oferta === "Perguntar a Astrid por Joric Filho da Névoa" && cA[0].etapa === 1);
const pr3p = dado(perguntarPelaPista([pr3], cA[0].id));
const noLargo = { ...base16, missoes: pr3p, npcs: npcs16, lugar: { nome: "O Largo do Cardo", cidade: "Rio Profundo" }, cidadeAtual: "Rio Profundo" };
/* a hora do Joric pela rotina dele (a semente): um instante em que está, e um em que não */
const instantes = [1, 2, 3, 4, 5, 6, 7].flatMap((dia) => [300, 600, 800, 1000, 1200, 1400].map((minuto) => ({ dia, minuto })));
const joricEm = (x) => aPessoaDoPasso({ ...noLargo, ...x }).find((p) => p.nome === "Joric Filho da Névoa");
const jAqui = instantes.find((x) => { const j = joricEm(x); return j && j.aqui; });
const jFora = instantes.find((x) => { const j = joricEm(x); return j && !j.aqui; });
const cJ = jAqui ? asPistasDoPasso({ ...noLargo, ...jAqui }) : [];
t("…e no Largo, à hora dele, o Joric tem o cartão do passo a seguir ao dele: «Perguntar a Joric Filho da Névoa pelo Largo do Cardo»", !!jAqui && cJ.length === 1 && cJ[0].nome === "Joric Filho da Névoa" && cJ[0].etapa === 2 && cJ[0].oferta === "Perguntar a Joric Filho da Névoa pelo Largo do Cardo");
t("…e fora da hora dele, não", !!jFora && asPistasDoPasso({ ...noLargo, ...jFora }).length === 0);

sec("§4 o mundo gravado: a pista Doran, com o passo dado");
const A = JSON.parse(fs.readFileSync(new URL("./sessao-navegador.json", import.meta.url), "utf8"));
const e0 = estadoNoTurno(A, 1);
const SEM = `${e0.nomeCampanha}|${e0.mundo.genero}`;
const DORAN = e0.abertura.pista.nome;
const GUARNICAO = { nome: e0.abertura.pista.local, cidade: e0.cidadeAtual, dentroDe: "", distancia: "dentro" };
const rotD = (min) => fichaDaPessoa(SEM, { nome: DORAN, papel: e0.abertura.pista.papel, local: GUARNICAO.nome }, { dia: e0.dia, minuto: min, cidade: e0.cidadeAtual }).rotina;
const deDia = [300, 480, 700, 1200].find((m) => rotD(m).noTurno);
const pr = e0.missoes.find((m) => m.tipo === "principal");
const ms16 = e0.missoes.map((m) => (m.id === pr.id ? { ...pr, etapas: [{ ...pr.etapas[0], feito: true }, ...pr.etapas.slice(1)] } : m));
const reg16 = { ...e0.npcs, [DORAN]: { nome: DORAN, papel: e0.abertura.pista.papel, local: `${GUARNICAO.nome}, ${e0.cidadeAtual}`, conhecidoEm: e0.dia } };
const eG = { ...e0, missoes: ms16, npcs: reg16, minuto: deDia, lugar: GUARNICAO };
const t0 = Date.now(); let cG = []; for (let i = 0; i < 20; i++) cG = asPistasDoPasso(eG);
console.log(`  ..  ${((Date.now() - t0) / 20).toFixed(2)} ms por chamada, no mundo gravado`);
const cDoran = cG.find((c) => c.nome === DORAN);
t(`${DORAN} em ${GUARNICAO.nome}, com o passo dado: o cartão do sítio que a principal manda descobrir (${pr.etapas[1].alvo})`, !!cDoran && cDoran.oferta.startsWith(`Perguntar a ${DORAN} `) && cDoran.sobre === pr.etapas[1].alvo && cDoran.id === `pista|${pr.id}|1`);
const envG = oEnvelopeDoAcampamento("perguntaPelaPista", { nome: cDoran.nome, sobre: cDoran.sobre, sabe: cDoran.sabe });
const fG = aFichaDeAtor({ frase: envG, nota: `ONDE      n'${GUARNICAO.nome}, dentro de ${e0.cidadeAtual}`, estado: { ...eG, missoes: perguntarPelaPista(ms16, cDoran.id) } });
t("…tocado, a ficha diz a pergunta e põe-no a responder com o passo, e passa no verificador", fG.partes.ACONTECEU.startsWith(`${e0.personagem.nome} pergunta a ${DORAN} `) && fG.partes["O QUE SE DIZ"].startsWith(`${DORAN}: responde a ${e0.personagem.nome} com o que sabe: ${cDoran.sabe}`) && verificarAFicha(fG.texto).length === 0);
t("…e o cartão some", asPistasDoPasso({ ...eG, missoes: perguntarPelaPista(ms16, cDoran.id) }).every((c) => c.id !== cDoran.id));

sec("§5 o mascate e os preços do mercado (a 14.ª, defeito 9)");
/* as peças reais da 14.ª (como em teste-o-figurante): o léxico dos lugares,
   a capital do mapa, e as bancas do dia */
const LEX14 = { lugares: [
  { tipo: "taverna", chamado: "Estalagem da Estrada", nomes: ["O Javali Empalhado", "Tacho Furado", "Repouso do Peregrino", "A Gralha Ruiva"] },
  { tipo: "mercado", chamado: "Feira Franca", nomes: ["Largo da Farinha", "Praça das Sementes", "Mercado da Corda Podre", "Feira dos Ferros"] },
  { tipo: "templo", chamado: "Capela das Chagas", nomes: ["Santuário da Virgem Pálida", "Claustro do Primeiro Prego", "Igreja do Suor Bento", "Cripta dos Ossos Mártires"] },
] };
const CAPITAL = { nome: "Monte da Forca", tipo: "capital", porte: "capital", populacao: 35800, regiao: "Colinas das Brumas", bioma: "costa" };
const BRAM = { nome: "Bram Pedra-Alta", grupo: [{ nome: "Leonor", vinculo: 31, classe: "Engenheiro", raca: "Homens de Ferro", conceito: "mestra de ofício" }] };
const S14 = { personagem: BRAM, npcs: {}, nomeCampanha: "As Minas de Vel Dorran", mundo: { genero: "Fantasia medieval", molde: "sobremundo", lexico: LEX14 }, mapa: { cidades: [CAPITAL] }, cidadeAtual: "Monte da Forca", dia: 1, minuto: 700 };
const MERCADO = { nome: "Mercado da Corda Podre", cidade: "Monte da Forca", dentroDe: "", distancia: "dentro" };
const bancas = mercadoresDaCidade(CAPITAL, 1, 1, LEX14);
const it0 = bancas[0].estoque[0];
const FRASE7 = `Pergunto ao mercado: quanto custa o ${it0.nome}?`;
const mc = mercadoParaPauta(bancas, FRASE7, { onde: "Monte da Forca" });
t(`a banca do dia tem o preço (${it0.nome} ◉ ${it0.preco}), e a pauta escreve-o no PERGUNTOU`, mc.pergunta.length === 1 && mc.pergunta[0].includes(`${it0.nome} ◉ ${it0.preco}`));
const RUMO = "O RUMO    responda primeiro ao que perguntei; o que ninguém aqui sabe, quem responde diz que não sabe";
const nota7 = (frase) => `ONDE      no Mercado da Corda Podre, dentro de Monte da Forca\nEM CENA   Leonor (com você)\nPERGUNTOU ${mercadoParaPauta(bancas, frase, { onde: "Monte da Forca" }).pergunta[0]}\n${RUMO}`;
const T7 = aFichaDeAtor({ frase: FRASE7, nota: nota7(FRASE7), estado: { ...S14, lugar: MERCADO } });
t("T7 no mercado: o mascate tem o que vende, com o preço da banca", !!T7.figurante && T7.figurante.tipo === "mercado" && doFig(T7).includes(tpl(O_FIGURANTE_VENDE.diz, { V: `${it0.nome} ${it0.preco}` })));
t("…já não a Leonor (era ela que tinha o preço no «Sabe»), e ninguém diz que não sabe", !/Sabe:/.test(bloco(T7, "Leonor")) && !/Não sabe|não sabe mais/.test(T7.texto));
t("…e o mascate continua sem «Sabe» nem «Quer» (a decisão 6), com o limite, e a ficha passa no verificador", !/\n  (Sabe|Quer):/.test(doFig(T7)) && doFig(T7).includes("Não promete, não cobra") && verificarAFicha(T7.texto).length === 0);
const F7L = `Leonor, quanto custa o ${it0.nome}?`;
const T7L = aFichaDeAtor({ frase: F7L, nota: nota7(F7L), estado: { ...S14, lugar: MERCADO } });
t("quem chama a companheira pelo nome pergunta a ela: o preço fica com a Leonor, como sempre", bloco(T7L, "Leonor").includes(`Sabe: à venda em Monte da Forca: ${it0.nome} ${it0.preco}`) && !doFig(T7L).includes("tem à venda"));
const CLAUSTRO = { nome: "Claustro do Primeiro Prego", cidade: "Monte da Forca", dentroDe: "", distancia: "dentro" };
const T7C = aFichaDeAtor({ frase: FRASE7, nota: nota7(FRASE7).replace("no Mercado da Corda Podre", "no Claustro do Primeiro Prego"), estado: { ...S14, lugar: CLAUSTRO } });
t("no claustro, o devoto não vende: o preço fica onde ficava", !!T7C.figurante && T7C.figurante.tipo === "templo" && !doFig(T7C).includes("tem à venda") && /Sabe: à venda/.test(bloco(T7C, "Leonor")));

console.log(`\na pista como cartão: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
