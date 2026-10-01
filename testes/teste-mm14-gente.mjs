/* teste-mm14-gente.mjs (Fase MM · MM14, itens 9 e 10) — a gente no lugar certo, com o nome certo

   Três defeitos da sessão de prova (mente/mm11-sessao.md), vistos a jogar e
   provados aqui com os dados dela:

     9a. AS PESSOAS DA CIDADE SEGUEM A HEROÍNA ATÉ À MASMORRA (T21-T26:
         Teodoro, Isolina e Branca dentro do galpão, sem estarem no grupo).
         A causa: `elencoDaCena` (cena.js) decidia quem está AQUI só pela
         cidade, e quem não tinha paradeiro era presente em todo o lado.
         Conserto: com uma masmorra aberta, AQUI é o grupo e quem a ficha põe
         na masmorra; o resto fica LÁ FORA (`laFora`), no balde do LONGE.
     9b. "VOCÊ MUDOU DESDE A ÚLTIMA VEZ" NO PRIMEIRO ENCONTRO (T3, T12, T18,
         T20). A causa: o movimento `repara_em_mim` do Intérprete valia
         SEMPRE (`quando: () => true`). Conserto: só com `viuAntes` —
         conhecida antes de hoje E vista num dia antes de hoje
         (`jaMeViuAntes`, com o `elenco.vistos` da MM8e).
     10. NOMES QUE COLIDEM. (a) "Delfina da Névoa" (T19) entrou no registo
         ao lado da Delfina da principal, que estava a 146 km e nunca fora
         vista — `nomeComDono` (npcs.js) decide pelo contexto: é ela, ou é
         recusado e dito ao Narrador. (b) "Floripes do Sino" e "Lino do Sino"
         (T3, T7, T16): gente que o jogo conhece, com alcunha de lugar, que a
         procura (`nomeProcurado`, procura.js) casava pelo pedaço "sino" de
         "o Sino Calado". O pedaço depois de partícula já não procura
         ninguém.

   A fiação no App.jsx (três chamadas de `elencoDaCena`/`resumoCenaPrompt`
   com a masmorra, o `viuAntes` em `pessoasDaCena`, e as três portas do
   registo por `nomeComDono`) é do `frontend`; esta suíte prova o motor. */
import fs from "node:fs";
import {
  QUEM_DESCE, masmorraAberta, elencoDaCena, resumoCenaPrompt, TETO_DO_QUEM,
} from "../src/cena.js";
import {
  JA_ME_VIU, jaMeViuAntes, garantirPessoa, consultarInterprete, paraPauta, movimentoPorId,
} from "../src/interprete.js";
import {
  HOMONIMO, MOTIVO_DO_HOMONIMO, primeiroNome, nomeComDono, notaDoHomonimo, criarNPC,
} from "../src/npcs.js";
import { ALCUNHA_DE_LUGAR, nomeProcurado } from "../src/procura.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const nomesDe = (l) => (l || []).map((n) => n.nome);

/* um gerador semeado (mulberry32): nenhuma asserção depende da sorte */
const semeado = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t2 = Math.imul(a ^ (a >>> 15), 1 | a);
  t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
  return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
};

/* ---------------- O MUNDO DA SESSÃO ----------------
   Foz do Meio (a cidade), Alto do Sal (onde vive a Delfina da principal, a
   146 km) e o galpão que virou "Santuário dos Sussurros" (T21). */
const MAPA = {
  cidades: [{ nome: "Foz do Meio", x: 10, y: 10 }, { nome: "Alto do Sal", x: 40, y: 10 }],
  rotas: [{ de: "Foz do Meio", para: "Alto do Sal", dias: 5 }],
};
const CIDADE = "Foz do Meio";
const SANTUARIO = { nome: "Santuário dos Sussurros", salas: [], tochas: 5 };
const REG = {
  "Teodoro das Tábuas": criarNPC("Teodoro das Tábuas", { papel: "bardo", relacao: "amigo", genero: "homem", local: "Foz do Meio", conhecidoEm: 0 }),
  "Isolina do Lamento": criarNPC("Isolina do Lamento", { papel: "carpideira", relacao: "neutro", genero: "mulher", local: "O Campo das Mães", conhecidoEm: 1 }),
  "Branca da Troca": criarNPC("Branca da Troca", { papel: "estudante", relacao: "desconhecido", genero: "mulher", local: "a torre caída", segredo: "não voltou da torre", conhecidoEm: 1 }),
  "Rosalina": criarNPC("Rosalina", { papel: "taverneira", relacao: "neutro", genero: "mulher", local: "Sino Calado, Foz do Meio", conhecidoEm: 1 }),
  "Lino": criarNPC("Lino", { papel: "vendedor de raiz e folha", relacao: "amigo", genero: "homem", local: "Foz do Meio", conhecidoEm: 1 }),
  "Aurélio": criarNPC("Aurélio", { papel: "mercador", relacao: "aliado", local: "Alto do Sal", conhecidoEm: 1 }),
  "Ulf, o cativo": criarNPC("Ulf, o cativo", { papel: "prisioneiro", relacao: "neutro", local: "Santuário dos Sussurros (cela)", conhecidoEm: 1 }),
};
const GRUPO = [{ nome: "Brasa", classe: "guerreira" }];
const REG_COM_GRUPO = { ...REG, Brasa: criarNPC("Brasa", { papel: "guerreira", relacao: "aliado", local: "Foz do Meio", conhecidoEm: 1 }) };

/* ============================================================ */
sec("1. as tabelas");
{
  const inteiro = (x) => Number.isInteger(x) && x > 0;
  t("QUEM_DESCE.nomeMinimo é um inteiro positivo", inteiro(QUEM_DESCE.nomeMinimo));
  t("JA_ME_VIU.diasAntes é um inteiro positivo", inteiro(JA_ME_VIU.diasAntes));
  t("HOMONIMO.primeiroMinimo é um inteiro positivo e há artigos", inteiro(HOMONIMO.primeiroMinimo) && HOMONIMO.artigos.includes("a") && HOMONIMO.artigos.includes("dona"));
  t("MOTIVO_DO_HOMONIMO diz os três motivos", ["sexo", "lugar", "soNome"].every((k) => typeof MOTIVO_DO_HOMONIMO[k] === "string" && MOTIVO_DO_HOMONIMO[k].length > 10));
  t("ALCUNHA_DE_LUGAR: as partículas e os mínimos", ["do", "da", "dos", "das", "de"].every((p) => ALCUNHA_DE_LUGAR.particulas.includes(p)) && inteiro(ALCUNHA_DE_LUGAR.pedacoMinimo) && inteiro(ALCUNHA_DE_LUGAR.nomeMinimo));
}

/* ============================================================ */
sec("2. 9a — quem está aqui é quem está no lugar onde a heroína está");
{
  /* antes de descer: a cidade é a cena, e a gente dela está aqui (a regra
     antiga, intocada — é o que os outros chamadores continuam a ver) */
  const naCidade = elencoDaCena(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO });
  const aquiCidade = nomesDe(naCidade.aqui);
  t("na cidade, Teodoro, Isolina, Branca e Rosalina estão aqui (como sempre)", ["Teodoro das Tábuas", "Isolina do Lamento", "Branca da Troca", "Rosalina", "Brasa"].every((n) => aquiCidade.includes(n)), aquiCidade.join(", "));
  t("e Aurélio, de Alto do Sal, está longe", nomesDe(naCidade.longe).includes("Aurélio"));

  /* no galpão (T26: "Teodoro me acompanha com os olhos") */
  const naMasmorra = elencoDaCena(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO, masmorra: SANTUARIO });
  const aqui = nomesDe(naMasmorra.aqui);
  const longe = nomesDe(naMasmorra.longe);
  t("NA MASMORRA, Teodoro não está aqui", !aqui.includes("Teodoro das Tábuas"), aqui.join(", "));
  t("nem Isolina (vive no Campo das Mães)", !aqui.includes("Isolina do Lamento"));
  t("nem Branca (sem paradeiro de cidade: era 'presente' em todo o lado)", !aqui.includes("Branca da Troca"));
  t("nem Rosalina, que é da taverna", !aqui.includes("Rosalina"));
  t("o grupo desce com a heroína", aqui.includes("Brasa"));
  t("e quem a ficha põe na masmorra está aqui (o que a masmorra tem)", aqui.includes("Ulf, o cativo"));
  t("são exatamente estes dois", aqui.length === 2, aqui.join(", "));
  t("a gente da cidade fica LÁ FORA, no balde do longe", ["Teodoro das Tábuas", "Isolina do Lamento", "Branca da Troca", "Rosalina", "Lino"].every((n) => longe.includes(n)), longe.join(", "));
  const teo = naMasmorra.longe.find((n) => n.nome === "Teodoro das Tábuas") || {};
  t("com `laFora` (o nome da masmorra) e zero dias — não é uma viagem", teo.laFora === SANTUARIO.nome && teo.dias === 0, JSON.stringify({ laFora: teo.laFora, dias: teo.dias }));
  const aur = naMasmorra.longe.find((n) => n.nome === "Aurélio") || {};
  t("quem é de outra cidade continua longe, com os dias da estrada", aur.onde === "Alto do Sal" && aur.dias === 5 && !aur.laFora);

  /* a masmorra encerrada é a cidade de novo */
  const saiu = elencoDaCena(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO, masmorra: { ...SANTUARIO, encerrada: true } });
  t("masmorra encerrada: a regra de sempre, igual à da cidade", JSON.stringify(saiu) === JSON.stringify(naCidade));
  t("sem masmorra: byte a byte a regra antiga", JSON.stringify(elencoDaCena(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO, masmorra: null })) === JSON.stringify(naCidade));

  /* o rodapé: PRESENTES é a masmorra, e uma citação do Mestre não traz ninguém */
  const rod = resumoCenaPrompt(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO, masmorra: SANTUARIO, emCena: ["Teodoro das Tábuas", "Isolina do Lamento"] });
  const linhaP = (rod.split("\n").find((l) => l.startsWith("- PRESENTES")) || "");
  const linhaL = (rod.split("\n").find((l) => l.startsWith("- LONGE")) || "");
  t("o rodapé diz PRESENTES em Santuário dos Sussurros", linhaP.startsWith("- PRESENTES em Santuário dos Sussurros:"), linhaP);
  t("citado pelo Mestre nas duas últimas falas, Teodoro NÃO entra nos PRESENTES", !linhaP.includes("Teodoro"), linhaP);
  t("e aparece no LONGE como quem ficou fora da masmorra", linhaL.includes("Teodoro das Tábuas ficou fora de Santuário dos Sussurros"), linhaL);
  t("Isolina também (citada, fica fora)", linhaL.includes("Isolina do Lamento ficou fora"));
  t("nenhum 'a 0 dia daqui' no texto", !/a 0 dia/.test(rod));
  t("o rodapé sem masmorra é o de sempre", resumoCenaPrompt(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO }) === resumoCenaPrompt(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO, masmorra: { ...SANTUARIO, encerrada: true } }));

  /* A GENTE: o Intérprete lê de `aqui`; sem a cidade no `aqui`, ninguém da
     cidade faz nada dentro da masmorra */
  const linhas = paraPauta(naMasmorra.aqui.map((n) => ({ nome: n.nome, papel: n.papel, relacao: n.relacao, ehCompanheiro: n.nome === "Brasa" })), { sorte: semeado(7) }).linhas;
  t("as linhas A GENTE na masmorra não têm ninguém da cidade", !linhas.some((l) => /Teodoro|Isolina|Branca|Rosalina|Lino/.test(l)), linhas.join(" | "));

  /* o teto não sobe: com 200 pessoas da cidade no registo, o rodapé da
     masmorra não passa do da cidade (o LONGE tem o teto de sempre) */
  const muitos = {};
  for (let i = 0; i < 200; i++) muitos[`Gente ${i}`] = { ...criarNPC(`Gente ${i}`, { papel: "ferreiro", relacao: "amigo", local: i % 4 ? "Foz do Meio" : "Alto do Sal" }), ultimaVez: i };
  const rodCidade = resumoCenaPrompt(muitos, CIDADE, MAPA, {});
  const rodMasmorra = resumoCenaPrompt(muitos, CIDADE, MAPA, { masmorra: SANTUARIO });
  t(`o rodapé da masmorra não é maior que o da cidade (${rodMasmorra.length} ≤ ${rodCidade.length})`, rodMasmorra.length <= rodCidade.length);
  const lL = (rodMasmorra.split("\n").find((l) => l.startsWith("- LONGE")) || "");
  t(`e o LONGE da masmorra cabe no teto (${lL.length} ≤ ${TETO_DO_QUEM.longe.chars + 200})`, lL.length <= TETO_DO_QUEM.longe.chars + 200);

  /* lixo */
  let estourou = false;
  try {
    elencoDaCena(REG, CIDADE, MAPA, null);
    elencoDaCena(null, null, null, { masmorra: {} });
    elencoDaCena(REG, CIDADE, MAPA, { masmorra: "texto", comGrupo: null });
    resumoCenaPrompt(REG, CIDADE, MAPA, { masmorra: null });
  } catch (e) { estourou = e; }
  t("null, {} e lixo nas opções não quebram", !estourou, String(estourou));
  t("masmorraAberta: nome, e vazio para lixo, encerrada e sem nome", masmorraAberta(SANTUARIO) === SANTUARIO.nome && masmorraAberta(null) === "" && masmorraAberta({ ...SANTUARIO, encerrada: true }) === "" && masmorraAberta({}) === "" && masmorraAberta("x") === "");
  const antes = JSON.stringify(REG_COM_GRUPO);
  elencoDaCena(REG_COM_GRUPO, CIDADE, MAPA, { comGrupo: GRUPO, masmorra: SANTUARIO });
  t("o registo recebido não é mexido", JSON.stringify(REG_COM_GRUPO) === antes);
  const curto = elencoDaCena({ Ana: criarNPC("Ana", { relacao: "amigo", local: "Rua do Ur" }) }, CIDADE, MAPA, { masmorra: { nome: "Ur" } });
  t("um nome de masmorra abaixo do mínimo não puxa ninguém para dentro", curto.aqui.length === 0 && curto.longe.length === 1);
}

/* ============================================================ */
sec("3. 9b — 'você mudou desde a última vez' só para quem me viu antes");
{
  const repara = movimentoPorId("repara_em_mim");
  t("o movimento existe e ainda diz o mesmo", !!repara && /mudou desde a última vez/.test(repara.faz));
  t("garantirPessoa: sem o dado, viuAntes é false (o padrão seguro)", garantirPessoa({ nome: "x" }).viuAntes === false && garantirPessoa(null).viuAntes === false);
  t("e o campo passa quando vem", garantirPessoa({ nome: "x", viuAntes: 1 }).viuAntes === true);

  /* a sessão, T3: Teodoro, conhecido na abertura (dia 0), numa pessoa neutra
     como a que `pessoasDaCena` monta; 600 turnos semeados */
  const teodoroT3 = { nome: "Teodoro das Tábuas", papel: "bardo", temperamento: "", relacao: "amigo", ato: "pedi", quantosEscutam: 2, primeiraVez: false };
  let vezes = 0;
  const s1 = semeado(3);
  for (let i = 0; i < 600; i++) { const m = consultarInterprete(teodoroT3, { sorte: s1 }); if (m && m.id === "repara_em_mim") vezes++; }
  t(`no primeiro encontro, 'mudou desde a última vez' nunca sai (${vezes} em 600)`, vezes === 0);
  const branca = { nome: "Branca da Troca", papel: "estudante", ato: "nada", primeiraVez: true };
  let vezesB = 0;
  const s2 = semeado(11);
  for (let i = 0; i < 600; i++) { const m = consultarInterprete(branca, { sorte: s2 }); if (m && m.id === "repara_em_mim") vezesB++; }
  t(`nem para quem nunca vi (${vezesB} em 600)`, vezesB === 0);
  let vezesV = 0;
  const s3 = semeado(5);
  for (let i = 0; i < 600; i++) { const m = consultarInterprete({ ...teodoroT3, viuAntes: true }, { sorte: s3 }); if (m && m.id === "repara_em_mim") vezesV++; }
  t(`e continua possível para quem me viu num dia antes (${vezesV} em 600)`, vezesV > 0);
  let mudos = 0;
  const s4 = semeado(9);
  for (let i = 0; i < 300; i++) if (!consultarInterprete({ nome: "Zé", papel: "ferreiro", ato: "nada" }, { sorte: s4 })) mudos++;
  t("a rede continua a segurar a pessoa neutra (ninguém fica sem movimento)", mudos === 0);

  /* jaMeViuAntes, com os dias da sessão */
  const teo = REG["Teodoro das Tábuas"];
  t("T3: conhecido no dia 0, visto só hoje (dia 1) → não me viu antes", jaMeViuAntes(teo, { hoje: 1, vistos: { "Teodoro das Tábuas": [1] } }) === false);
  t("conhecido hoje → não", jaMeViuAntes({ nome: "Isolina do Lamento", conhecidoEm: 1 }, { hoje: 1, vistos: { "Isolina do Lamento": [1] } }) === false);
  t("conhecido antes, mas sem dia visto antes de hoje (só o nome na ficha) → não", jaMeViuAntes(teo, { hoje: 3, vistos: { "Teodoro das Tábuas": [3] } }) === false);
  t("sem o campo vistos → não", jaMeViuAntes(teo, { hoje: 3 }) === false && jaMeViuAntes(teo, { hoje: 3, vistos: null }) === false);
  t("conhecido no dia 0 e visto no dia 1, hoje é o dia 3 → sim", jaMeViuAntes(teo, { hoje: 3, vistos: { "Teodoro das Tábuas": [1, 3] } }) === true);
  t("o nome casa sem acento nem caixa", jaMeViuAntes(teo, { hoje: 3, vistos: { "teodoro das tabuas": [2] } }) === true);
  t("ficha sem dia de encontro → não", jaMeViuAntes({ nome: "X" }, { hoje: 9, vistos: { X: [1, 2] } }) === false);
  t("lixo → false, nunca erro", jaMeViuAntes(null) === false && jaMeViuAntes("x", null) === false && jaMeViuAntes(teo, null) === false && jaMeViuAntes(teo, { hoje: "abc", vistos: { "Teodoro das Tábuas": [0] } }) === false && jaMeViuAntes({ nome: "", conhecidoEm: 0 }, { hoje: 5 }) === false);
}

/* ============================================================ */
sec("4. 10a — um nome novo com o primeiro nome de quem importa");
{
  /* a pista e o alvo da principal da sessão, como a abertura os guarda */
  const IMPORTANTES = [{ nome: "Teodoro das Tábuas", onde: "Foz do Meio" }, { nome: "Delfina", onde: "A Porta Aberta, Alto do Sal" }];
  const aquiNoCais = ["Foz do Meio", "o Cais do Sal"];

  t("primeiroNome: sem artigo, sem tratamento, sem acento", primeiroNome("a Delfina da Névoa") === "delfina" && primeiroNome("Dona Rosalina") === "rosalina" && primeiroNome("Ulf, o cativo") === "ulf" && primeiroNome(null) === "");

  /* T19: o Cronista devolve "Delfina da Névoa — recrutador", em Foz do Meio */
  const r19 = nomeComDono("Delfina da Névoa", REG, { importantes: IMPORTANTES, genero: "homem", aqui: aquiNoCais });
  t("T19: 'Delfina da Névoa' em Foz do Meio é RECUSADA", r19.decisao === "recusada", JSON.stringify(r19));
  t("porque a Delfina da principal está noutro lugar", r19.dono === "Delfina" && r19.motivo === "lugar");
  const velho = Object.keys(REG).find((k) => k.toLowerCase() === "delfina da névoa");
  t("(a régua antiga, só pelo nome inteiro, deixava-a entrar como gente nova)", velho === undefined);

  /* a mesma frase, mas em Alto do Sal, à porta dela, antes de a conhecer */
  const rAlto = nomeComDono("Delfina da Névoa", REG, { importantes: IMPORTANTES, aqui: ["Alto do Sal", "A Porta Aberta"] });
  t("em Alto do Sal, na Porta Aberta: é ELA, e entra com o nome dela", rAlto.decisao === "mesma" && rAlto.nome === "Delfina" && rAlto.chave === "", JSON.stringify(rAlto));
  /* já conhecida e no registo */
  const regComDelfina = { ...REG, Delfina: criarNPC("Delfina", { papel: "contrabandista", relacao: "neutro", genero: "mulher", local: "A Porta Aberta, Alto do Sal", conhecidoEm: 4 }) };
  const rReg = nomeComDono("Delfina da Névoa", regComDelfina, { importantes: IMPORTANTES, aqui: ["Alto do Sal"] });
  t("já no registo e no mesmo lugar: mescla-se na ficha dela", rReg.decisao === "mesma" && rReg.chave === "Delfina");
  const rSexo = nomeComDono("Delfina da Névoa", regComDelfina, { importantes: IMPORTANTES, genero: "homem", aqui: ["Alto do Sal"] });
  t("um homem com o nome dela, mesmo no lugar dela: outra pessoa, recusada", rSexo.decisao === "recusada" && rSexo.motivo === "sexo");
  const rSemLugar = nomeComDono("Delfina Ruiva", REG, { importantes: IMPORTANTES });
  t("ainda só um nome, e sem prova de lugar: recusada (não se distingue 'não a vi' de 'vi com outro nome')", rSemLugar.decisao === "recusada" && rSemLugar.motivo === "soNome");
  const rLocalFicha = nomeComDono("Delfina da Névoa", REG, { importantes: IMPORTANTES, local: "Alto do Sal", aqui: ["Foz do Meio"] });
  t("o local da ficha nova conta como prova de lugar", rLocalFicha.decisao === "mesma" && rLocalFicha.nome === "Delfina");

  /* quem importa no próprio registo, sem vir na lista: laço, relação, segredo */
  const rTeo = nomeComDono("Teodoro Ruivo", REG, { aqui: aquiNoCais });
  t("'Teodoro Ruivo' no Cais, com o Teodoro das Tábuas (amigo) na cidade: é ele", rTeo.decisao === "mesma" && rTeo.chave === "Teodoro das Tábuas", JSON.stringify(rTeo));
  const rBranca = nomeComDono("Branca Lima", REG, { aqui: aquiNoCais });
  t("Branca (com segredo) está na torre caída: 'Branca Lima' no Cais é recusada", rBranca.decisao === "recusada" && rBranca.dono === "Branca da Troca" && rBranca.motivo === "lugar", JSON.stringify(rBranca));

  /* o que NÃO é colisão */
  t("o mesmo nome, caixa e acento à parte, é a mesma ficha", (() => { const r = nomeComDono("teodoro das tabuas", REG, {}); return r.decisao === "mesma" && r.chave === "Teodoro das Tábuas"; })());
  t("primeiro nome igual ao de um figurante (sem investimento) não é colisão", nomeComDono("Rosalina Mendes", REG, { aqui: aquiNoCais }).decisao === "nova");
  t("primeiro nome diferente: gente nova", nomeComDono("Floriano Ribeira", REG, { importantes: IMPORTANTES, aqui: aquiNoCais }).decisao === "nova");
  t("primeiro nome curto demais não identifica ninguém", nomeComDono("Al do Sal", { "Al Brito": criarNPC("Al Brito", { relacao: "amigo" }) }, {}).decisao === "nova");

  /* o recado ao Narrador */
  const nota = notaDoHomonimo([r19]);
  t("a nota ao Narrador nomeia o nome recusado e o dono", nota.startsWith("[CORREÇÃO DO SISTEMA — NOMES]") && nota.includes("\"Delfina da Névoa\"") && nota.includes("Delfina já é outra pessoa"), nota);
  t("e diz a saída (outro nome, ou ela não está aqui)", /outro|não comece/.test(nota) && /não está nesta cena/.test(nota));
  t(`a nota é curta (${nota.length} chars ≤ 400)`, nota.length <= 400);
  t("sem recusas, nota vazia (e lixo também)", notaDoHomonimo([]) === "" && notaDoHomonimo(null) === "" && notaDoHomonimo([rAlto]) === "" && notaDoHomonimo(["x", null]) === "");

  /* lixo e imutabilidade */
  let estourou = false;
  try {
    t("nome nulo: 'nova' com nome vazio", nomeComDono(null, REG, IMPORTANTES).nome === "");
    t("registo e contexto nulos não quebram", nomeComDono("Delfina", null, null).decisao === "nova");
    nomeComDono("Delfina", { lixo: null, outro: "texto" }, { importantes: [null, 3, { nome: 5 }, "Delfina Cruz"], aqui: null });
  } catch (e) { estourou = e; }
  t("lixo nunca estoura", !estourou, String(estourou));
  const antes = JSON.stringify(REG);
  nomeComDono("Delfina da Névoa", REG, { importantes: IMPORTANTES, aqui: aquiNoCais });
  t("o registo recebido não é mexido", JSON.stringify(REG) === antes);
}

/* ============================================================ */
sec("5. 10b — um apelido feito de um lugar não é gente procurada");
{
  const NOMES = ["Floripes do Sino", "Lino do Sino", "Teodoro das Tábuas", "Isolina do Lamento", "Rosalina", "Ione Vantel", "Kael Duarte", "Delfina"];
  /* J3 e J7 da sessão, palavra por palavra */
  const j3 = "Sigo pela rua principal e pergunto ao menino do peixe seco onde fica o Sino Calado. Dou-lhe uma moeda se ele me levar lá.";
  const j7 = "Vou ao balcão, peço uma caneca de cerveja e pago. Pergunto à Rosalina: \"Há quanto tempo a senhora tem o Sino Calado?\"";
  t("J3: 'onde fica o Sino Calado' não procura ninguém", nomeProcurado(j3, NOMES) === "", nomeProcurado(j3, NOMES));
  t("J7: a pergunta à Rosalina procura a Rosalina, não a Floripes do Sino", nomeProcurado(j7, NOMES) === "Rosalina", nomeProcurado(j7, NOMES));
  t("'pergunto pelas tábuas do cais' não procura o Teodoro", nomeProcurado("pergunto pelas tábuas do cais", NOMES) === "");
  t("'ouço um lamento' não procura a Isolina", nomeProcurado("procuro de onde vem o lamento", NOMES) === "");
  /* o que continua a casar */
  t("o nome inteiro continua a casar", nomeProcurado("onde anda a Floripes do Sino?", NOMES) === "Floripes do Sino");
  t("o primeiro nome continua a casar", nomeProcurado("procuro a Floripes", NOMES) === "Floripes do Sino");
  t("o sobrenome sem partícula continua a casar", nomeProcurado("alguém viu Duarte?", NOMES) === "Kael Duarte");
  t("e o nome mais longo continua a ganhar", nomeProcurado("Procuro por sinais de Ione Vantel", ["Ione", "Ione Vantel"]) === "Ione Vantel");
  /* os lugares que o App passar saem da frase antes */
  t("com `lugares`, o nome do lugar sai da frase antes de procurar", nomeProcurado("onde fica o Sino Calado?", ["Calado Mendes"], { lugares: ["O Sino Calado"] }) === "" && nomeProcurado("onde fica o Sino Calado?", ["Calado Mendes"]) === "Calado Mendes");
  t("e quem é nomeado na mesma frase continua a ser achado", nomeProcurado("pergunto à Rosalina pelo Sino Calado", NOMES, { lugares: ["Sino Calado"] }) === "Rosalina");
  let estourou = false;
  try { nomeProcurado("procuro alguém", null, null); nomeProcurado(null, NOMES); nomeProcurado("x", [null, 3], { lugares: [null, 7] }); } catch (e) { estourou = e; }
  t("lixo nunca estoura", !estourou, String(estourou));
}

/* ============================================================
   6. a fiação — App.jsx: as três chamadas de `elencoDaCena`/
   `resumoCenaPrompt` que levam a masmorra (9a), o `viuAntes` de
   `pessoasDaCena` (9b), e as três portas do registo + o mural que passam
   por `nomeComDono` (10a). Esta suíte prova o motor; isto prova que o
   frontend de fato o ligou.
   ============================================================ */
sec("6. a fiação — App.jsx");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  /* MM15 (5): o import ganhou primeiroNome, para a guarda do "Lina," em
     pessoaNaFrente — movido com o motivo, não apagado. */
  t("App.jsx importa nomeComDono, notaDoHomonimo e primeiroNome de npcs.js",
    app.includes("nomeComDono, notaDoHomonimo, primeiroNome } from \"./npcs.js\";"));
  t("e jaMeViuAntes de interprete.js",
    app.includes('paraPauta as interpreteParaPauta, jaMeViuAntes } from "./interprete.js";'));

  /* ---- 9a: as três chamadas que levam a masmorra ---- */
  t("pautaDoTurno lê o elenco com a masmorra aberta",
    app.includes("const { longe, aqui } = elencoDaCena(npcsRef.current, cidadeAtualRef.current, mapaRef.current, { comGrupo: (personagemRef.current || personagem || {}).grupo || [], masmorra: masmorraRef.current });"));
  t("pessoasDaCena (A GENTE do Intérprete) idem",
    app.includes("const { aqui } = elencoDaCena(npcsRef.current, cidadeAtualRef.current, mapaRef.current, { comGrupo: p0.grupo || [], masmorra: masmorraRef.current });"));
  t("o rodapé (resumoCenaPrompt) idem",
    app.includes("emCena: emCenaAgora, masmorra: masmorraRef.current, elenco: nomesDoElenco(),"));

  /* ---- 9b: viuAntes em pessoasDaCena ---- */
  t("pessoasDaCena manda viuAntes a jaMeViuAntes, com o dia e os vistos do elenco — e nunca custa o turno",
    app.includes('viuAntes: (() => { try { return jaMeViuAntes(n, { hoje: diaRef.current, vistos: (elencoSaveRef.current || {}).vistos }); } catch (e) { calou("viuAntes", e); return false; } })(),'));

  /* ---- 10a: o helper, e as três portas + o mural ---- */
  t("contextoDoNome existe, antes de aplicarResposta",
    app.includes("const contextoDoNome = (n) => {") && app.indexOf("const contextoDoNome = (n) => {") < app.indexOf("const aplicarResposta = useCallback("));
  t("lê a pista e o alvo da abertura",
    app.includes('if (a.pista && a.pista.nome) importantes.push({ nome: a.pista.nome, onde: a.pista.local || "" });')
    && app.includes('if (a.alvo && a.alvo.quem) importantes.push({ nome: a.alvo.quem, onde: a.alvo.onde || "" });'));
  t("lê os marcos da espinha e o grupo",
    app.includes('for (const at of ((espinhaRef.current || {}).atos || [])) for (const m of (at.marcos || [])) if (m && m.quem) importantes.push({ nome: m.quem, onde: m.onde || "" });')
    && app.includes('for (const g of ((personagemRef.current || personagem || {}).grupo || [])) if (g && g.nome) importantes.push({ nome: g.nome });'));
  /* MM15 (5): o elenco passou a levar papel, sexo e de onde a pessoa vem
     (o "de: mundo" que separa quem o mundo repete de quem a história
     persegue, em npcs.js/DISTINTO_DE) — o texto antigo media só o nome e
     a cidade; movido com o motivo, não apagado. */
  t("lê o elenco do mundo COM a cidade, o papel, o sexo e a origem — senão um homônimo de quem ainda não foi encontrado seria recusado sem razão, ou um nome do mundo seria tratado como se a história o perseguisse",
    app.includes('for (const p of elencoDoMundo(sementeMundo(), mapaRef.current, contextoDoElenco()).pessoas) if (p && p.nome) importantes.push({ nome: p.nome, onde: p.cidade || "", papel: p.papel || "", genero: p.genero_pessoa || "", ...(p.fonte === "espinha" || p.fonte === "chefe" ? {} : { de: "mundo" }) });'));
  t("lê quem uma missão ativa pede",
    app.includes('for (const q of (missoesRef.current || [])) if (q && q.status === "ativa") for (const x of [q.dador, ...(q.etapas || []).map((e) => e && e.alvo)]) if (x) importantes.push({ nome: x });'));

  const chamadas = app.split('id = nomeComDono(').length - 1;
  t(`nomeComDono é chamado nas três portas (${chamadas} chamadas, cada uma em try)`, chamadas === 3);
  t("a porta mudancas.npcs recusa e acumula em homonimos, sem entrar no registo",
    app.includes('if (id && id.decisao === "recusada") { homonimos.push(id); return; }') && app.includes("const nomeCerto = (id && id.nome) || n.nome;"));
  t("e usa nomeCerto na chave e no criarNPC/mesclarNPC",
    app.includes('const chave = (id && id.chave) || Object.keys(reg).find((k) => k.toLowerCase() === String(nomeCerto).toLowerCase());')
    && app.includes(": criarNPC(nomeCerto, { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: n.conhecidoEm != null ? n.conhecidoEm : diaRef.current });"));
  t("a porta do cânone (com `continue`) mescla quando a chave já existe — nunca criarNPC por cima (apagaria laço e consultas)",
    app.includes('reg[chave || nomeCerto] = chave ? mesclarNPC(reg[chave], dadosCanone) : criarNPC(nomeCerto, dadosCanone);'));
  t("a porta do Cronista (`pessoas`, com slice(0, 40)) idem, com nomeCerto",
    app.includes('else reg[String(nomeCerto).slice(0, 40)] = criarNPC(String(nomeCerto).slice(0, 40), { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: diaRef.current });'));
  t("as duas portas do registo somam a nota do Narrador quando há recusa",
    app.split('if (homonimos.length) notaRef.current = `${notaRef.current ? notaRef.current + "\\n" : ""}${notaDoHomonimo(homonimos)}`;').length - 1 === 2);
  t("o mural só prega se o dador não for recusado por homônimo",
    app.includes('semHomonimo = nomeComDono(cartaz.dador, npcsRef.current, contextoDoNome({})).decisao !== "recusada";')
    && app.includes("if (semHomonimo && pregarNoMural(cartaz)) {"));
}

console.log(`\nmm14 · a gente: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
