/* A 17.ª SESSÃO, NO MOTOR (04/11/2026) — mente/sessao-17.md

   Em 20 turnos do ator a principal de dois passos parou no segundo, e os
   travões foram de lugar e de presença, nenhum de voz. Esta suíte monta os
   cenários da sessão com as peças que os produzem — o mundo «O Sino de
   Cinza» pela semente (a rotina do Godfrey Pescador sai dela: atrás do
   balcão das onze às duas, de folga no dia 1, «no templo»), o léxico com
   os nomes do mundo (o Descanso do Carroceiro, a Catedral da Cinza e o
   Bazar das Especiarias, em Torre Alto e em Vale Verde), a abertura e a
   principal como a abertura as cria, as bancas do dia e as linhas que a
   pauta escreve (mercadoParaPauta, balcaoParaPauta), o envelope do compasso
   — e prova, defeito a defeito:

   §1  as tabelas novas passam no verificador da ficha;
   §2  (1) «Vou ao Descanso do Carroceiro…» não é descansar — o leitor da
       frase serve aos dois modos —, e o passo a pé acha o sítio;
   §3  (2) a Catedral da Cinza de Torre Alto não é a de Vale Verde;
   §4  (3) o Godfrey de folga «no templo» está na Catedral da Cinza, e a
       ficha diz-lhe o nome do sítio; numa cidade sem templo, não o diz;
   §5  (4) o Theron não chega a meio da estrada; à chegada a Vale Verde
       fica em cena no turno seguinte, e a conversa cumpre o passo;
   §6  (5) a mascate tem o preço: o T8 pela banca do dia, o T9 pelas
       linhas da pauta, que já não vão ao Gareth;
   §7  (6) voltar também é ir;
   §8  (7) esperar por frase fica intenção;
   §9  (8) a estrada diz quanto falta;
   §10 (9) a regra do envelope do compasso cai;
   §11 (10, 11) o «às vezes» é a semente que o decide — e a frequência
       medida —, e os traços que se somam numa fórmula;
   §12 (12) o figurante sabe o caminho de um sítio público;
   §13 (13) a heroína dita no feminino. */
/* o que a peça ainda não exporta (na árvore de antes) não derruba a suíte:
   a asserção que dependia dele falha sozinha, e as outras correm */
const FALTA = new Proxy(function () {}, { get: (_, k) => (k === Symbol.iterator ? function* () {} : k === "length" ? 0 : k === Symbol.toPrimitive ? () => "" : typeof k === "symbol" ? undefined : FALTA), apply: () => FALTA });
import * as M1 from "../src/descanso.js";
const { descansoDaFrase = (() => FALTA), semOsSitios = (() => FALTA), O_SITIO_NA_FRASE = FALTA } = M1;
import * as M2 from "../src/lugar.js";
const { lugarPedido = (() => FALTA), VOLTAR_A = FALTA } = M2;
import * as M3 from "../src/abertura.js";
const { garantirAbertura = (() => FALTA), proximoPasso = (() => FALTA), O_SITIO_E_A_CIDADE = FALTA } = M3;
import * as M4 from "../src/missoes.js";
const { criarMissao = (() => FALTA), etapaDef = (() => FALTA) } = M4;
import * as M5 from "../src/motor/a-pessoa-do-passo.js";
const { aPessoaDoPasso = (() => FALTA), osDoPasso = (() => FALTA), ondeOHeroiEsta = (() => FALTA), O_FORA_COM_SITIO = FALTA, O_QUE_VEIO_TER = FALTA, A_PESSOA_DO_PASSO = FALTA } = M5;
import * as M6 from "../src/motor/a-pista-como-cartao.js";
const { asPistasDoPasso = (() => FALTA) } = M6;
import * as M7 from "../src/motor/ficha-de-ator.js";
const { aFichaDeAtor = (() => FALTA), verificarAFicha = (() => FALTA), A_VEZ_DA_MARCA = FALTA, aMarcaEntra = (() => FALTA), OS_TRACOS_QUE_SE_SOMAM = FALTA, A_REGRA_DO_ENVELOPE = FALTA, A_HEROINA_DITA = FALTA, A_VOZ_QUE_MARCA = FALTA, A_ESTRADA_DITA = FALTA, A_INTENCAO_DITA = FALTA, MOTIVOS_DO_CORTE = FALTA } = M7;
import * as M8 from "../src/motor/o-figurante.js";
const { O_FIGURANTE_VENDE = FALTA, O_FIGURANTE_SABE_O_CAMINHO = FALTA, oQueALinhaVende = (() => FALTA), aBancaDoDia = (() => FALTA), oCaminhoQueSabe = (() => FALTA) } = M8;
import * as M9 from "../src/motor/registo-da-cena.js";
const { oQueACenaRegista = (() => FALTA) } = M9;
import * as M10 from "../src/mundo-base.js";
const { oQueExisteAqui = (() => FALTA) } = M10;
import * as M11 from "../src/moldes.js";
const { moldePorId = (() => FALTA) } = M11;
import * as M12 from "../src/gente-por-dentro.js";
const { fichaDaPessoa = (() => FALTA) } = M12;
import * as M13 from "../src/mercado.js";
const { mercadoresDaCidade = (() => FALTA), mercadoParaPauta = (() => FALTA) } = M13;
import * as M14 from "../src/bolsa-da-frase.js";
const { balcaoParaPauta = (() => FALTA) } = M14;
import * as M15 from "../src/ermos.js";
const { SUPRIMENTOS = FALTA } = M15;
import * as M16 from "../src/nucleo.js";
const { COMO_FALA = FALTA } = M16;

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const tpl = (x, v) => String(x).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));
const bloco = (f, n) => (f.texto.split("\n").reduce((o, l) => { if (/^\S/.test(l)) o.cur = l.startsWith(n + " — ") ? n : null; if (o.cur) o.out.push(l); return o; }, { cur: null, out: [] })).out.join("\n");
const maiuscula = (x) => x[0].toUpperCase() + x.slice(1);
const doFig = (f) => (f.figurante ? bloco(f, maiuscula(f.figurante.papel)) : "");

/* ---------------- o mundo da 17.ª ---------------- */
const SEMENTE = "O Sino de Cinza|Fantasia medieval";
/* o léxico do mundo: os nomes que a sessão viu (o segundo de cada lista é o
   que a semente escolhe para Torre Alto) */
const LEX = { tavernas: ["A Caneca Torta", "O Descanso do Carroceiro"], lugares: [
  { tipo: "taverna", chamado: "Estalagem", nomes: ["A Caneca Torta", "O Descanso do Carroceiro"] },
  { tipo: "templo", chamado: "Catedral", nomes: ["Ermida do Sino", "Catedral da Cinza"] },
  { tipo: "mercado", chamado: "Bazar", nomes: ["Feira do Sal", "Bazar das Especiarias"] },
] };
const TA = { nome: "Torre Alto", tipo: "capital", porte: "capital", populacao: 60000, regiao: "Planalto" };
const VV = { nome: "Vale Verde", tipo: "capital", porte: "capital", populacao: 9000, regiao: "Planalto" };
const MAPA = { cidades: [TA, VV] };
const MUNDO = { genero: "Fantasia medieval", molde: "sobremundo", lexico: LEX };
const locais = (c) => oQueExisteAqui(SEMENTE, MAPA, c, null, "Fantasia medieval", moldePorId("sobremundo"), LEX).locais;
const ab = garantirAbertura({ principalId: "mis_principal", cidade: "Torre Alto", chegada: "à porta de Torre Alto", razao: "uma carta sem assinatura chamou-o a Torre Alto", sabe: "Godfrey Pescador, estalajadeiro, sabe", titulo: "O Sino de Cinza",
  pista: { nome: "Godfrey Pescador", papel: "estalajadeiro", local: "O Descanso do Carroceiro" }, alvo: { feitio: "encontrar", quem: "Theron do Brejo", onde: "Catedral da Cinza, em Vale Verde", objeto: "Theron do Brejo" } });
const PR = criarMissao({ id: "mis_principal", titulo: "O Sino de Cinza", tipo: "principal", status: "ativa", descricao: "uma carta", etapas: [
  { tipo: "falar_com", alvo: "Godfrey Pescador", onde: "O Descanso do Carroceiro" },
  { tipo: "falar_com", alvo: "Theron do Brejo", onde: "Catedral da Cinza, em Vale Verde" }] });
const DADO = [{ ...PR, etapas: [{ ...PR.etapas[0], feito: true }, PR.etapas[1]] }];
const GARETH = { nome: "Gareth", vinculo: 20, classe: "Caçador", raca: "Humano", conceito: "caçador, ex-coveiro" };
const INES = { nome: "Inês", genero: "mulher", nivel: 1, grupo: [GARETH] };
const BASE = { personagem: INES, nomeCampanha: "O Sino de Cinza", mundo: MUNDO, abertura: ab, mapa: MAPA, cidadeAtual: "Torre Alto", dia: 1, minuto: 560, npcs: {}, missoes: [PR] };
const CATEDRAL = { nome: "Catedral da Cinza", cidade: "Torre Alto", distancia: "dentro" };
const DESCANSO = { nome: "O Descanso do Carroceiro", cidade: "Torre Alto", distancia: "dentro" };
const BAZAR = { nome: "Bazar das Especiarias", cidade: "Torre Alto", distancia: "dentro" };
const RUMO = "O RUMO    responda primeiro ao que perguntei; o que ninguém aqui sabe, quem responde diz que não sabe";
const nota = (onde, extra = "") => `ONDE      ${onde}\nEM CENA   Gareth (com você)${extra ? "\n" + extra : ""}\n${RUMO}`;
const rotG = (dia, min) => fichaDaPessoa(SEMENTE, { nome: "Godfrey Pescador", papel: "estalajadeiro", local: "O Descanso do Carroceiro" }, { dia, minuto: min, cidade: "Torre Alto" }).rotina;

sec("§0 o mundo montado com as peças");
const LTA = locais("Torre Alto"), LVV = locais("Vale Verde");
t(`Torre Alto tem o Descanso, a Catedral e o Bazar (${LTA.map((l) => l.nome).join(", ")})`, ["O Descanso do Carroceiro", "Catedral da Cinza", "Bazar das Especiarias"].every((n) => LTA.some((l) => l.nome === n)));
t("a rotina do Godfrey pela semente: atrás do balcão das onze às duas, de folga no dia 1, «no templo» — a da sessão", rotG(1, 560).deFolga && rotG(1, 560).fora === "no templo" && rotG(1, 560).agora === "de folga hoje, no templo" && rotG(2, 740).noTurno);

sec("§1 as tabelas");
const amostra = [O_QUE_VEIO_TER.agora, ...Object.values(O_FORA_COM_SITIO.agoraAqui), O_FORA_COM_SITIO.semSitio, ...Object.values(A_VEZ_DA_MARCA.fora), ...OS_TRACOS_QUE_SE_SOMAM.map((x) => x.registo), A_ESTRADA_DITA.falta, A_ESTRADA_DITA.menos, O_FIGURANTE_SABE_O_CAMINHO.dentro, O_FIGURANTE_SABE_O_CAMINHO.diz]
  .map((x) => tpl(x, { H: "Inês", P: "Vale Verde", F: "quatro horas", L: "o Descanso do Carroceiro", C: "Torre Alto", X: "o Descanso fica cá dentro" }));
t("cada frase das tabelas novas passa no verificador da ficha", verificarAFicha(amostra.join("\n")).length === 0, J(verificarAFicha(amostra.join("\n"))));
t("cada traço que marca tem a outra marca, para os turnos em que não entra", A_VOZ_QUE_MARCA.every((v) => !!A_VEZ_DA_MARCA.fora[v.id]) && A_VEZ_DA_MARCA.vez < A_VEZ_DA_MARCA.em);
t("o corte da estrada é um motivo da lista fechada", typeof MOTIVOS_DO_CORTE.estrada === "string");

sec("§2 (defeito 1) o nome do sítio ganha da palavra comum — nos dois modos");
const T2 = "Vou ao Descanso do Carroceiro procurar Godfrey Pescador";
t("«Vou ao Descanso do Carroceiro procurar Godfrey Pescador» não é descanso (era o curto de uma hora)", descansoDaFrase(T2) === null);
t("…com a lista dos sítios do App também (`sitios`), mesmo sem maiúscula", descansoDaFrase("vou ao descanso do carroceiro", { sitios: ["O Descanso do Carroceiro"] }) === null && (descansoDaFrase("vou ao descanso") || {}).tipo === "curto");
t("e o sono de verdade continua a dormir: «Durmo no Descanso do Carroceiro até de manhã» é longo; «Descanso um pouco.» é curto", (descansoDaFrase("Durmo no Descanso do Carroceiro até de manhã") || {}).tipo === "longo" && (descansoDaFrase("Descanso um pouco.") || {}).tipo === "curto");
t("o nome composto sai pela régua (`liga`), a palavra solta no começo da frase fica", semOsSitios("Descanso um pouco.") === "Descanso um pouco." && !/Descanso/.test(semOsSitios(T2)) && O_SITIO_NA_FRASE.liga.includes("do"));
const lugaresTA = LTA.map((l) => ({ ...l, onde: "dentro" }));
t("o passo a pé acha o sítio pela mesma frase", (lugarPedido(T2, lugaresTA) || {}).nome === "O Descanso do Carroceiro");
const F2 = aFichaDeAtor({ frase: T2, nota: nota("em Torre Alto"), estado: { ...BASE, lugar: null } });
t("na ficha, a frase não promete descanso («ainda não descansou»): só a ida", !/descansou/.test(F2.texto) && /saiu daqui/.test(F2.texto));

sec("§3 (defeito 2) a Catedral da Cinza de Torre Alto não é a de Vale Verde");
const aquiTA = "na Catedral da Cinza, dentro de Torre Alto";
t("dentro da de Torre Alto, o passo não é «falar com Theron do Brejo, que está aqui»", !/Theron/.test(proximoPasso({ abertura: ab, missoes: [PR], aqui: aquiTA })));
t("…e com o primeiro passo dado, o rumo diz a cidade: «Procurar Theron do Brejo… Catedral da Cinza, em Vale Verde»", /^Procurar Theron do Brejo .*Catedral da Cinza, em Vale Verde$/.test(proximoPasso({ abertura: ab, missoes: DADO, aqui: aquiTA })), proximoPasso({ abertura: ab, missoes: DADO, aqui: aquiTA }));
t("na de Vale Verde, sim: está aqui", proximoPasso({ abertura: ab, missoes: DADO, aqui: "na Catedral da Cinza, dentro de Vale Verde" }) === "falar com Theron do Brejo, que está aqui");
t("o ONDE sem cidade continua como era (o de sempre)", proximoPasso({ abertura: ab, missoes: DADO, aqui: "na Catedral da Cinza" }) === "falar com Theron do Brejo, que está aqui");
t("a cidade é a última marca do ONDE (o «dentro do» do prédio não conta)", O_SITIO_E_A_CIDADE.marca instanceof RegExp && [..."no Quarto, dentro do Descanso, dentro de Torre Alto".matchAll(O_SITIO_E_A_CIDADE.marca)].pop()[1] === "Torre Alto");
const nTheron = aPessoaDoPasso({ ...BASE, missoes: DADO, lugar: CATEDRAL });
t("e a pessoa do passo não põe o Theron na catedral de Torre Alto", !nTheron.some((x) => x.nome === "Theron do Brejo"));

sec("§4 (defeito 3) de folga «no templo», e o templo tem-no");
const noDescanso = aPessoaDoPasso({ ...BASE, lugar: DESCANSO }).find((x) => x.nome === "Godfrey Pescador");
t("no Descanso, às 9h20 do dia 1: não está, e a ficha diz onde anda pelo nome do sítio", !!noDescanso && !noDescanso.aqui && noDescanso.ausente.includes("de folga hoje, em Catedral da Cinza") && !noDescanso.ausente.includes("no templo"), noDescanso && noDescanso.ausente);
for (const [h, min] of [["9h20", 560], ["12h05", 725]]) {
  const g = aPessoaDoPasso({ ...BASE, lugar: CATEDRAL, minuto: min }).find((x) => x.nome === "Godfrey Pescador");
  t(`na Catedral da Cinza às ${h} (T5, T13): o Godfrey está em cena, de folga`, !!g && g.aqui && g.agora.includes(O_FORA_COM_SITIO.agoraAqui.folga));
}
const c5 = asPistasDoPasso({ ...BASE, lugar: CATEDRAL });
t("…e o cartão da pista aparece lá: «Perguntar a Godfrey Pescador por Theron do Brejo» — o primeiro passo no dia 1, sem esperar 24 h", c5.length === 1 && c5[0].oferta === "Perguntar a Godfrey Pescador por Theron do Brejo");
const F5 = aFichaDeAtor({ frase: "Olho à volta da nave.", nota: nota(aquiTA), estado: { ...BASE, lugar: CATEDRAL } });
t("a ficha da catedral: o Godfrey em QUEM ESTÁ, de folga, e o Gareth não aponta para um Theron que lá não está", /Godfrey Pescador — /.test(F5.texto) && !/Theron do Brejo, que está aqui/.test(F5.texto) && verificarAFicha(F5.texto).length === 0);
t("à noite, em casa a dormir, não está no templo", !aPessoaDoPasso({ ...BASE, lugar: CATEDRAL, minuto: 1380 }).some((x) => x.nome === "Godfrey Pescador" && x.aqui));
t("noutro dia, fora do turno, também anda no templo (é o sítio dele)", !!aPessoaDoPasso({ ...BASE, dia: 2, lugar: CATEDRAL, minuto: 560 }).find((x) => x.nome === "Godfrey Pescador" && x.aqui && x.agora.includes(O_FORA_COM_SITIO.agoraAqui.fora)));
/* uma cidade sem templo: o «no templo» perde o sítio na frase */
const LEX2 = { ...LEX, lugares: LEX.lugares.filter((l) => l.tipo !== "templo") };
const semTemplo = aPessoaDoPasso({ ...BASE, mundo: { ...MUNDO, lexico: LEX2 }, mapa: { cidades: [{ ...TA, porte: "aldeia", tipo: "aldeia" }, VV] }, lugar: DESCANSO });
const g2 = semTemplo.find((x) => x.nome === "Godfrey Pescador");
t("numa cidade sem templo na base, a ficha não diz «no templo»: diz que anda «pela cidade»", !!g2 && !g2.aqui && !g2.ausente.includes("no templo") && g2.ausente.includes(`de folga hoje, ${O_FORA_COM_SITIO.semSitio}`), g2 && g2.ausente);

sec("§5 (defeito 4) quem chega com um pedido é a pessoa do passo, e fica");
const QC = 'QUEM CARREGA Theron do Brejo (é fato: entra nesta resposta, dito por ele): PEDE ao herói: "Nesta cidade não diga o meu nome."';
const ESTRADA = { ...BASE, missoes: DADO, lugar: null, jornada: { de: "Torre Alto", para: "Vale Verde", estado: "", andadoMin: 240, totalMin: 480 } };
t("osDoPasso: o Theron é o passo de agora, esteja o herói onde estiver", J(osDoPasso(ESTRADA).map((x) => x.nome)) === J(["Theron do Brejo"]));
const F18 = aFichaDeAtor({ frase: "Sigo pela estrada para Vale Verde.", nota: `ONDE      na estrada de Torre Alto para Vale Verde\nEM CENA   Gareth (com você)\n${QC}`, estado: ESTRADA });
t("T18, a 50% da estrada: o Theron não «chega agora» — nem em QUEM ESTÁ, nem com o pedido no que se diz", !/Theron/.test(F18.texto) && F18.rastro.some((r) => r.cai === "estrada"));
const CHEGADA = { ...BASE, missoes: DADO, lugar: null, cidadeAtual: "Vale Verde", dia: 2, minuto: 1220 };
t("à chegada, sem sítio, o herói está «em Vale Verde»; na estrada, em lado nenhum", ondeOHeroiEsta(CHEGADA) === "Vale Verde" && ondeOHeroiEsta(ESTRADA) === "" && ondeOHeroiEsta({ ...BASE, lugar: CATEDRAL }) === "Catedral da Cinza, em Torre Alto");
const F19 = aFichaDeAtor({ frase: "", nota: `ONDE      em Vale Verde\nEM CENA   Gareth (com você)\n${QC}`, estado: CHEGADA });
t("T19, à chegada: o Theron chega, com o pedido", /Theron do Brejo — [^\n]*chega agora/.test(F19.texto) && /Theron do Brejo: pede:/.test(F19.texto));
const reg19 = oQueACenaRegista({ ficha: F19, estado: CHEGADA });
t("…e o registo guarda-o onde o herói o viu, sem conversa nenhuma (veio ter com ele)", J(reg19.pessoas) === J([{ nome: "Theron do Brejo", papel: "", local: "Vale Verde" }]) && reg19.falou_com.length === 0);
const NPCS20 = { "Theron do Brejo": { nome: "Theron do Brejo", local: "Vale Verde", conhecidoEm: 2 } };
const E20 = { ...CHEGADA, npcs: NPCS20, minuto: 1230 };
const p20 = aPessoaDoPasso(E20).find((x) => x.nome === "Theron do Brejo");
t("T20: o Theron continua em cena, «ficou com Inês desde que lhe veio falar»", !!p20 && p20.aqui && p20.agora.includes(tpl(O_QUE_VEIO_TER.agora, { H: "Inês" })));
const F20 = aFichaDeAtor({ frase: "Falo com Theron do Brejo: o que sabe do sino?", nota: "ONDE      em Vale Verde\nEM CENA   Gareth (com você)", estado: E20 });
const r20 = oQueACenaRegista({ ficha: F20, estado: E20 });
t("…«Falo com Theron do Brejo…» é com ele, e não com uma passante", /Theron do Brejo — /.test(F20.texto) && F20.conversa.includes("Theron do Brejo") && !F20.figurante);
t("…e a conversa cumpre o segundo passo (o falar_com na cidade dele)", etapaDef("falar_com").ver(DADO[0].etapas[1], { cidadeAtual: "Vale Verde", lugarAtual: null, npcs: NPCS20, falouCom: r20.falou_com }) === true);
t("noutro dia, na rua, já não está à espera dele", !aPessoaDoPasso({ ...E20, dia: 3 }).some((x) => x.nome === "Theron do Brejo"));
t("e num sítio de Vale Verde que não é o dele, também não", !aPessoaDoPasso({ ...E20, lugar: { nome: "O Descanso do Carroceiro", cidade: "Vale Verde", distancia: "dentro" } }).some((x) => x.nome === "Theron do Brejo"));

sec("§6 (defeito 5) a mascate tem o preço");
const BANCAS = mercadoresDaCidade(TA, 1, 1, LEX);
const it0 = BANCAS[0].estoque[0];
const T8 = "Pergunto à mascate o que vende e quanto custa.";
t("o T8 não nomeia mercadoria: a pauta não traz linha nenhuma", mercadoParaPauta(BANCAS, T8, { onde: "Torre Alto" }).pergunta.length === 0);
const F8 = aFichaDeAtor({ frase: T8, nota: nota("no Bazar das Especiarias, dentro de Torre Alto"), estado: { ...BASE, lugar: BAZAR } });
t(`T8: a mascate tem a banca do dia, com o preço (${it0.nome} ${it0.preco})`, !!F8.figurante && F8.figurante.tipo === "mercado" && doFig(F8).includes(`${it0.nome} ${it0.preco}`) && !/Não sabe/.test(F8.texto), doFig(F8));
t("…as mesmas bancas do painel (aBancaDoDia), e a mesma entrada dá o mesmo", aBancaDoDia({ ...BASE, lugar: BAZAR }, T8)[0] === `${it0.nome} ${it0.preco} (${BANCAS[0].nome})` && J(aBancaDoDia({ ...BASE, lugar: BAZAR }, T8)) === J(aBancaDoDia({ ...BASE, lugar: BAZAR }, T8)));
t("a frase que nomeia a mercadoria fica com a pauta (a banca do dia não fala por cima)", aBancaDoDia({ ...BASE, lugar: BAZAR }, "quanto custa uma adaga?").length === 0);
const T9 = "Qual é o preço de uma ração aqui na banca? E de uma poção?";
const balcao = Object.entries(SUPRIMENTOS).map(([id, s]) => ({ id, ...s, preco: 7 }));
const linhas9 = [...mercadoParaPauta(BANCAS, "Qual é o preço de uma poção aqui?", { onde: "Torre Alto" }).pergunta, ...balcaoParaPauta(T9, { balcao }).pergunta];
t(`as linhas do T9 têm as duas formas que a 17.ª viu («não há … à venda…», «no balcão de mantimentos: …»)`, linhas9.some((l) => /^não há /.test(l)) && linhas9.some((l) => /^no balcão de mantimentos: /.test(l)), J(linhas9));
const F9 = aFichaDeAtor({ frase: T9, nota: nota("no Bazar das Especiarias, dentro de Torre Alto", linhas9.map((l) => `PERGUNTOU ${l}`).join("\n")), estado: { ...BASE, lugar: BAZAR } });
t("T9: os preços são da mascate, já não do Gareth", /tem à venda, e diz o preço/.test(doFig(F9)) && /Rações de viagem 7/.test(doFig(F9)) && !/Sabe:/.test(bloco(F9, "Gareth")) && verificarAFicha(F9.texto).length === 0);
t("…sem a palavra do jogador sem acento («pocao») nem a conta do balcão", !/pocao|dá 7/.test(doFig(F9)) && oQueALinhaVende("não há pocao à venda em Torre Alto; poções e frascos à venda: Elixir 145") === "poções e frascos à venda: Elixir 145");

sec("§7 (defeito 6) voltar também é ir");
for (const [f, n] of [["Volto ao templo à procura do Godfrey", "Catedral da Cinza"], ["Volto à estalagem onde trabalha o Godfrey", "O Descanso do Carroceiro"]]) t(`«${f}» → ${n}`, (lugarPedido(f, lugaresTA) || {}).nome === n);
t("«volto a perguntar», «volto à mesa» não são idas", ["Volto a perguntar ao Gareth", "Volto à mesa"].every((f) => lugarPedido(f, lugaresTA) === null) && VOLTAR_A.rx.test("volto ao templo"));

sec("§8 (defeito 7) esperar por frase fica intenção");
const F10 = aFichaDeAtor({ frase: "Fico à espera dele até às onze.", nota: nota("n'O Descanso do Carroceiro, dentro de Torre Alto"), estado: { ...BASE, lugar: DESCANSO } });
t("«fico à espera dele até às onze»: só a intenção, e as horas não passaram", F10.texto.includes(tpl(A_INTENCAO_DITA.porFazer, { L: "" }).split("{L}")[0].slice(0, 10)) && /ainda não deixou passar as horas/.test(F10.texto));
t("«espero que…» não é esperar", !/deixou passar/.test(aFichaDeAtor({ frase: "Espero que ele venha.", nota: nota("em Torre Alto"), estado: BASE }).texto));

sec("§9 (defeito 8) a estrada diz quanto falta");
t("a 240 de 480 minutos: «Vale Verde ainda fica a quatro horas de caminho»", F18.texto.includes(tpl(A_ESTRADA_DITA.falta, { P: "Vale Verde", F: "quatro horas" })));

sec("§10 (defeito 9) a regra do envelope do compasso cai");
const ENV = "[AGORA — DECISÃO DO SISTEMA] O treino vira briga: o Gareth atira o bastão.\nREGRA DESTE ENVELOPE (obrigatória): aconteça com o que JÁ está na mesa. Se virar luta, quem abre o combate é o sistema.";
const F15 = aFichaDeAtor({ frase: "Treino com o Gareth.", nota: `${nota("em Torre Alto")}\n${ENV}`, estado: BASE });
t("o fato fica no ACONTECEU, e a regra não chega à ficha", /O treino vira briga/.test(F15.texto) && !/REGRA DESTE ENVELOPE|regra deste envelope|quem abre o combate/i.test(F15.texto) && A_REGRA_DO_ENVELOPE.test(ENV));

sec("§11 (defeitos 10 e 11) o «às vezes» é a semente; os traços que se somam");
const PROV = COMO_FALA.find((f) => f.id === "f_proverbio");
const comGareth = { ...BASE, nucleoCache: { nucleo: { pessoas: [{ nome: "Gareth", papel: "companheiro", ficha: { fala: PROV } }] } } };
const falaG = (e) => (aFichaDeAtor({ frase: "Olho à volta.", nota: nota("em Torre Alto"), estado: e }).texto.match(/^Gareth — [^\n]*\n  Fala: ([^\n]*)/m) || [])[1] || "";
const vozP = A_VOZ_QUE_MARCA.find((v) => v.id === "proverbio").o;
let comP = 0, semP = 0;
for (let k = 0; k < 60; k++) {
  const f = falaG({ ...comGareth, minuto: 480 + k * 10, mensagens: Array.from({ length: k }, () => ({ autor: "mestre", texto: "…" })) });
  if (f.includes(vozP)) comP++; else if (f.includes(A_VEZ_DA_MARCA.fora.proverbio)) semP++;
}
console.log(`  ..  o provérbio do Gareth em 60 turnos: ${comP} com a marca, ${semP} sem (a tabela: ${A_VEZ_DA_MARCA.vez} em ${A_VEZ_DA_MARCA.em}); a 17.ª teve 17 em 19`);
t(`o provérbio entra em cerca de um turno em três (${comP} de 60), e nos outros a voz cai para a outra marca`, comP + semP === 60 && comP >= 12 && comP <= 30);
t("a mesma pessoa no mesmo turno dá a mesma voz (determinismo), em qualquer máquina", falaG({ ...comGareth, minuto: 600 }) === falaG({ ...comGareth, minuto: 600 }) && aMarcaEntra("x|1") === aMarcaEntra("x|1"));
const CURTO = COMO_FALA.find((f) => f.id === "f_curto");
const comMoca = { ...BASE, lugar: DESCANSO, minuto: 700, nucleoCache: { nucleo: { pessoas: [{ nome: "Marta", papel: "voz", ficha: { fala: CURTO } }] } } };
const FM = aFichaDeAtor({ frase: "Olho para o balcão.", nota: `ONDE      n'O Descanso do Carroceiro, dentro de Torre Alto\nEM CENA   Gareth (com você); Marta (taverneira)\n${RUMO}`, estado: comMoca });
const falaM = (FM.texto.match(/^Marta — [^\n]*\n  Fala: ([^\n]*)/m) || [])[1] || "";
t("«três palavras» com o registo de negociante sem número já não é «tudo é troca» (a fórmula «X ou Y»)", falaM.includes("três palavras, nunca quatro") && falaM.includes(OS_TRACOS_QUE_SE_SOMAM[0].registo) && !falaM.includes("tudo é troca"), falaM);

sec("§12 (defeito 12) o figurante sabe o caminho");
const T1 = "Pergunto a quem passa onde fica o Descanso do Carroceiro.";
const F1 = aFichaDeAtor({ frase: T1, nota: nota("em Torre Alto"), estado: { ...BASE, lugar: null } });
t("T1 na rua: a passante sabe onde fica o Descanso, e não diz que não sabe", !!F1.figurante && doFig(F1).includes(O_FIGURANTE_SABE_O_CAMINHO.dentro.replace("{L}", "O Descanso do Carroceiro").replace("{C}", "Torre Alto")) && !/Não sabe/.test(F1.texto) && verificarAFicha(F1.texto).length === 0, doFig(F1));
t("…e só a direção: sem Sabe, sem nome; o que não é sítio da cidade, não sabe", !/\n  Sabe:/.test(doFig(F1)) && oCaminhoQueSabe({ ...BASE, lugar: null }, "onde fica o Covil do Dragão?") === "");

sec("§13 (defeito 13) a heroína no feminino");
t("«trata Inês como a forasteira»", /trata Inês como a forasteira/.test(F20.texto) && !/como a forasteiro/.test(F20.texto));
t("a abertura dita na ficha troca «chamou-o», «vem com ele», «que o trouxe»", A_HEROINA_DITA.trocas.reduce((s, [de, para]) => s.replace(de, para), "uma carta chamou-o; Gareth vem com ele; a razão que o trouxe") === "uma carta chamou-a; Gareth vem com ela; a razão que a trouxe" && A_HEROINA_DITA.dela.test("mulher"));

console.log(`\na 17.ª sessão: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
