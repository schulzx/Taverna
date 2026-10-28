/* teste-cenario.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª a 4.ª fatias, 28/10/2026)

   "Um cenário novo entra sem editar módulo" (mente/plano-motor.md, Fase 4).
   A 1.ª fatia tirou de dentro do motor os preços (economia.js) e as
   ocupações (classes.js PROFISSOES) e pô-los num arquivo de dados
   (`cenario-padrao.js`), que `cenario.js` valida, congela e entrega aos
   catálogos. A 2.ª fatia tirou os gêneros do léxico (lexico.js: o corte do
   futuro, as marcas do gênero próprio, o gênero padrão do pedido; e
   classes.js racasDoGenero, que espelhava o corte) e fez os ofícios do
   léxico (PROFISSOES_DO_SISTEMA) derivarem das ocupações do cenário. A 3.ª
   tirou o bestiário (bestiario.js: as criaturas, os arquétipos e o corte
   por gênero), que o motor lê por mundo-base.js sem que este mude. A 4.ª
   tirou a gente (nomes.js: os bancos de nome, os povos, os ofícios e os
   traços do elenco) e o céu (divindades.js: as metades do nome de um
   deus, os domínios, os cultos) — e a regra dos deuses ficou no código.
   Esta suíte prova:

   1. o dourado — o código de ANTES (1cfc08a, lido por `git archive` em
      `gerar-cenario-dourado.mjs`; os 578 casos da 1.ª fatia vinham do
      f0a9fae, os 143 da 2.ª do 3e7493a, os 102 da 3.ª do 9068a93, e são
      iguais byte a byte) e o de agora dão a mesma resposta às 871 perguntas de `cenario-casos.mjs` (500 bancas semeadas, os preços
      comuns por fator, a pauta do preço perguntado, as doze ocupações em
      todas as funções que as leem; os gêneros por racasDoMundo,
      racasDoGenero, generoProprio, o pedido do léxico, os ofícios
      renomeados e a ficha da cidade; o bestiário por completarInimigo,
      a criatura na frase, a ficha da masmorra, 40 masmorras semeadas, os
      bichos e os chefes do mundo; os nomes por gênero, o sexo de um nome,
      os nomes à mão, a gente dos locais, e 60 deuses, 20 panteões e 40
      eventos semeados);
   2. e a prova morde: um número mexido no cenário muda os casos que o leem;
   3. outro mundo, mínimo, muda o resultado sem tocar em módulo;
   4. o cenário inválido é recusado, com o caminho do campo na mensagem;
   5. imutabilidade e determinismo;
   6. o esquema lê de volta o que o motor consome. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fotografarOsCatalogos } from "./cenario-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const S = "../src/";
const CN = await import(S + "cenario.js");
const { DADOS_DO_CENARIO_PADRAO } = await import(S + "cenario-padrao.js");
const E = await import(S + "economia.js");
const C = await import(S + "classes.js");
const P = await import(S + "profissoes.js");
const M = await import(S + "mercado.js");
const R = await import(S + "prontos.js");
const L = await import(S + "loot.js");
const LX = await import(S + "lexico.js");
const { GENEROS } = await import(S + "constantes.js");
const B = await import(S + "bestiario.js");
const EM = await import(S + "emboscada.js");
const MA = await import(S + "masmorras.js");
const DG = await import(S + "degraus.js");
const DN = await import(S + "danos.js");
const NM = await import(S + "nomes.js");
const DV = await import(S + "divindades.js");
const G = await import(S + "geografia.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const copia = (o) => JSON.parse(JSON.stringify(o));
const recusa = (dados) => { try { CN.carregarCenario(dados); return null; } catch (e) { return String(e.message); } };
const DOURADO = JSON.parse(fs.readFileSync(path.join(AQUI, "cenario-dourado.json"), "utf8"));
const diferentes = (casos) => casos.filter((c, i) => JSON.stringify(c) !== JSON.stringify(DOURADO.casos[i])).map((c) => c.id);

sec("1. o dourado — o código de antes e o cenário de agora, byte a byte");
{
  const agora = await fotografarOsCatalogos(SRC);
  t(`os casos são os do dourado (${agora.length})`, agora.length === DOURADO.casos.length && agora.every((c, i) => c.id === DOURADO.casos[i].id));
  t("o dourado tem as 500 bancas semeadas", DOURADO.casos.filter((c) => c.id.startsWith("mercado.banca.")).length === 500);
  const dif = diferentes(agora);
  t("nenhum caso diferente", dif.length === 0, dif.slice(0, 5).join(", "));
  t("o mundo em uso é o padrão", CN.cenarioAtivo() === CN.CENARIO_PADRAO && CN.CENARIO_PADRAO.id === "taverna");
}

sec("2. e a prova morde — um número mexido no cenário aparece nos casos");
{
  const d = copia(DADOS_DO_CENARIO_PADRAO);
  d.precos.comuns.find((x) => x.id === "caneca").base = 2;
  CN.usarCenario(d);
  const dif = diferentes(await fotografarOsCatalogos(SRC));
  t("a caneca a ◉ 2 muda o preço comum dela", dif.includes("economia.precoComum.caneca"), dif.slice(0, 4).join(", "));
  t("…e a pauta da cerveja, e a linha da rua", dif.includes("mercado.pauta.1.quanto custa uma cerveja?") && dif.includes("mercado.rua.1"));
  t("…e nada que não a lê (as bancas, as ocupações)", !dif.some((id) => id.startsWith("mercado.banca.") || id.startsWith("profissoes.")));

  const d2 = copia(DADOS_DO_CENARIO_PADRAO);
  d2.precos.raridade.incomum = 61;
  d2.ocupacoes.find((x) => x.nome === "Ferreiro").efeito.venda = 0.3;
  CN.usarCenario(d2);
  const dif2 = diferentes(await fotografarOsCatalogos(SRC));
  t("o incomum a ◉ 61 muda bancas semeadas", dif2.filter((id) => id.startsWith("mercado.banca.")).length > 50, String(dif2.length));
  t("o Ferreiro a +30% muda o Ferreiro (e só ele entre os ofícios)", dif2.includes("profissoes.de.Ferreiro") && dif2.includes("profissoes.de.ferreiro") && !dif2.includes("profissoes.de.Mercador"));

  /* 2.ª fatia: os gêneros — cada mexida conta os casos que mudam, e só os que a leem */
  const so = (dif, ...prefixos) => dif.every((id) => prefixos.some((p) => id.startsWith(p)));
  const d3 = copia(DADOS_DO_CENARIO_PADRAO);
  d3.generos.futuristas = d3.generos.futuristas.filter((g) => g !== "Cyberpunk");
  CN.usarCenario(d3);
  const dif3 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Cyberpunk fora do futuro muda as raças dele, nos dois catálogos", dif3.includes("lexico.genero.Cyberpunk") && dif3.includes("lexico.tabelas"), String(dif3.length));
  t("…e o gênero próprio de quem o escolheu, e a ficha das cidades dele", dif3.filter((id) => id.startsWith("lexico.proprio.")).length >= 5 && dif3.filter((id) => id.startsWith("cidade.ficha.Cyberpunk.")).length === 12);
  t("…e nada que não o lê (preços, ofícios, as cidades de outro gênero)", so(dif3, "lexico.", "cidade.ficha.Cyberpunk."), dif3.filter((id) => !so([id], "lexico.", "cidade.ficha.Cyberpunk.")).slice(0, 3).join());

  const d4 = copia(DADOS_DO_CENARIO_PADRAO);
  d4.generos.marcasProprias = d4.generos.marcasProprias.filter((x) => !x.includes("zumbi"));
  CN.usarCenario(d4);
  const dif4 = diferentes(await fotografarOsCatalogos(SRC));
  t("sem a marca dos zumbis, só a descrição dos zumbis muda", dif4.length === 1 && dif4[0] === "lexico.proprio.Zumbis no interior.", dif4.join());

  const d5 = copia(DADOS_DO_CENARIO_PADRAO);
  d5.generos.padrao = "Fantasia sombria";
  /* 4.ª fatia: o gênero padrão é também o banco de nomes de quem não tem o
     seu, e o cenário recusa o padrão sem banco. O mundo de prova dá-lhe o
     banco da fantasia (os mesmos nomes): o que muda é o pedido, como antes,
     e a lista dos gêneros com banco, que ganhou um. */
  d5.gente.bancos["Fantasia sombria"] = d5.gente.bancos["Fantasia medieval"];
  CN.usarCenario(d5);
  const dif5 = diferentes(await fotografarOsCatalogos(SRC));
  t("o gênero padrão muda só o pedido de quem não disse o seu", dif5.length > 0 && so(dif5, "lexico.pedido.", "nomes.generos") && dif5.includes("nomes.generos") && !dif5.some((id) => id.startsWith("lexico.pedido.Cyberpunk") || id.startsWith("lexico.pedido.Fantasia medieval")), dif5.join());

  const d6 = copia(DADOS_DO_CENARIO_PADRAO);
  d6.ocupacoes[0].nome = "Ferreira";
  CN.usarCenario(d6);
  const dif6 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Ferreiro renomeado no cenário muda os ofícios do léxico (sem tocar em lexico.js)", dif6.includes("lexico.tabelas") && dif6.includes("lexico.oficios.completo") && dif6.includes("lexico.pedido.inteiro"), String(dif6.length));

  /* 3.ª fatia: o bestiário */
  const ficha = (d, n) => [...d.bestiario.criaturas, ...d.bestiario.arquetipos].find((c) => c.nome === n);
  const d7 = copia(DADOS_DO_CENARIO_PADRAO);
  ficha(d7, "Troll").perfil.fraqueza = [];
  CN.usarCenario(d7);
  const dif7 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Troll sem fraqueza a fogo muda o Troll que o Narrador abre (e o das pontes)", dif7.includes("bestiario.completar.Troll") && dif7.includes("bestiario.completar.TROLL DAS PONTES") && so(dif7, "bestiario."), dif7.join());

  const d8 = copia(DADOS_DO_CENARIO_PADRAO);
  ficha(d8, "Lobo").nivelRef = 2;
  CN.usarCenario(d8);
  const dif8 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Lobo no nível 2 muda o Lobo, e os bichos das regiões que o sorteiam", dif8.includes("bestiario.completar.Lobo") && !dif8.includes("bestiario.completar.Lobo Atroz") && dif8.some((id) => id.startsWith("mundo.bichos.")), dif8.join());

  const d9 = copia(DADOS_DO_CENARIO_PADRAO);
  d9.bestiario.emprestados = 3;
  CN.usarCenario(d9);
  const dif9 = diferentes(await fotografarOsCatalogos(SRC));
  t("três emprestados em vez de quatro mudam a lista de todo gênero, e as masmorras semeadas", dif9.filter((id) => id.startsWith("bestiario.genero.")).length === 13 && dif9.filter((id) => id.startsWith("masmorra.gerada.")).length > 20 && !dif9.some((id) => id.startsWith("bestiario.completar.")), String(dif9.length));

  const d10 = copia(DADOS_DO_CENARIO_PADRAO);
  delete ficha(d10, "Comandante").importante;
  CN.usarCenario(d10);
  const dif10 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Comandante sem \"importante\" volta a morrer direto — e só ele muda", dif10.length === 2 && dif10.includes("bestiario.completar.Comandante"), dif10.join());

  /* 4.ª fatia: a gente e o céu */
  const banco = (d, g) => d.gente.bancos[g];
  const d11 = copia(DADOS_DO_CENARIO_PADRAO);
  { const m = banco(d11, "Fantasia medieval").masc; m[m.indexOf("Aldric")] = "Aldrich"; }
  CN.usarCenario(d11);
  const dif11 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Aldric renomeado muda o sexo dos nomes e os gêneros que caem no banco do padrão", dif11.includes("nomes.sexo") && dif11.includes("nomes.genero.Universo próprio") && dif11.includes("nomes.genero.null") && so(dif11, "nomes."), dif11.join());
  const d12 = copia(DADOS_DO_CENARIO_PADRAO);
  banco(d12, "Steampunk").cidadeUnica = [];
  CN.usarCenario(d12);
  const dif12 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Steampunk sem cidades prontas muda só as cidades dele", dif12.join() === "nomes.genero.Steampunk", dif12.join());
  const d13 = copia(DADOS_DO_CENARIO_PADRAO);
  { const t2 = d13.gente.tracos; t2[t2.indexOf("rabugento")] = "ranzinza"; }
  CN.usarCenario(d13);
  const dif13 = diferentes(await fotografarOsCatalogos(SRC));
  t("um traço renomeado muda os traços, o elenco e a gente dos locais", dif13.includes("nomes.tracos") && dif13.some((id) => id.startsWith("mundo.gente.")) && so(dif13, "nomes.", "mundo.gente."), String(dif13.length));
  const d14 = copia(DADOS_DO_CENARIO_PADRAO);
  banco(d14, "Cyberpunk").povos[0] = "clone";
  CN.usarCenario(d14);
  const dif14 = diferentes(await fotografarOsCatalogos(SRC));
  t("um povo do Cyberpunk muda o elenco dele e a gente das cidades dele (e só)", dif14.includes("nomes.genero.Cyberpunk") && dif14.filter((id) => id.startsWith("mundo.gente.Cyberpunk.")).length === 3 && so(dif14, "nomes.genero.Cyberpunk", "mundo.gente.Cyberpunk."), dif14.join());
  const d15 = copia(DADOS_DO_CENARIO_PADRAO);
  d15.panteao.dominios[0].icone = "🌽";
  CN.usarCenario(d15);
  const dif15 = diferentes(await fotografarOsCatalogos(SRC));
  t("o ícone da Colheita muda os deuses, os panteões e os eventos — e nada mais", dif15.join() === "divindades.geradas,divindades.panteoes,divindades.eventos", dif15.join());
  const d16 = copia(DADOS_DO_CENARIO_PADRAO);
  d16.panteao.cultos.pop();
  d16.panteao.nomes.fim[0] = "orn";
  CN.usarCenario(d16);
  const dif16 = diferentes(await fotografarOsCatalogos(SRC));
  t("um culto a menos e uma sílaba trocada mudam o céu, e só o céu", dif16.length === 3 && so(dif16, "divindades."), dif16.join());

  CN.usarCenario(CN.CENARIO_PADRAO);
  t("de volta ao padrão, o dourado fecha outra vez", diferentes(await fotografarOsCatalogos(SRC)).length === 0);
}

/* ---------------- um mundo que não é a Taverna ---------------- */
const ORBITA = {
  formato: 1,
  id: "orbita",
  nome: "Estação Órbita Sete",
  precos: {
    escala: ["ESCALA DA ESTAÇÃO: ◉ 30 é uma semana de ração · ◉ 900 é um traje de vácuo novo."],
    raridade: { comum: 40, incomum: 150, raro: 600, epico: 2400, lendario: 9000 },
    semRaridade: 25,
    miudeza: 2,
    comuns: [
      { id: "racao", nome: "ração prensada", curto: "ração", base: 3, faixa: [2, 4], rua: true, rx: "\\b(racao|racoes|barras? de proteina)\\b" },
      { id: "dose", nome: "dose de destilado de algas", base: 6, faixa: null, rx: "\\b(doses?|destilados?)\\b" },
    ],
  },
  ocupacoes: [
    { nome: "Mecânico", desc: "Mantém o casco inteiro.", beneficio: "Mãos de oficina: a bancada de utilitários fica 4 mais fácil.", efeito: { bancada: { utilitario: 4 } } },
    { nome: "Piloto", desc: "Leva a nave entre os destroços.", beneficio: "Olho de rota: +6 na navegação.", efeito: { navegar: 6, compra: 0.1 } },
  ],
  bestiario: {
    generosDasCriaturas: ["Ópera de estação"],
    emprestados: 1,
    criaturas: [
      { nome: "Rato de Duto", ameaca: "fraco", nivelRef: 1, des: 3, desc: "rói cabos e foge pela grelha" },
      { nome: "Drone de Segurança", ameaca: "competente", nivelRef: 5, des: 1, desc: "segue o protocolo até ao fim", perfil: { ataque: "raio", resist: ["veneno"], fraqueza: ["raio"], imune: ["sombrio"] }, degrau: "bruto" },
      { nome: "Rainha da Colmeia", ameaca: "lendario", nivelRef: 12, des: 2, desc: "o casco é o corpo dela", degrau: "brilhante", importante: true },
    ],
    arquetipos: [
      { nome: "Capanga", ameaca: "fraco", nivelRef: 1, des: 0, desc: "músculo descartável" },
      { nome: "Contrabandista", ameaca: "comum", nivelRef: 3, des: 2, desc: "sabe onde o scanner não vê" },
    ],
  },
  generos: {
    padrao: "Ópera de estação",
    futuristas: ["Ópera de estação", "Ficção científica"],
    marcasProprias: ["\\bvacuo\\b", "\\bestac(ao|oes)\\b"],
  },
  gente: {
    tracos: ["metódico", "claustrofóbico", "leal ao turno"],
    bancos: {
      "Ópera de estação": {
        cidadePre: ["Anel", "Doca", "Módulo"], cidadeSuf: ["-7", " Norte", " de Carga"], cidadeUnica: [],
        masc: ["Tevo", "Ansel", "Brik"], fem: ["Ilsa", "Marn", "Oona"], sobrenome: ["da Doca 3", "Turno-Longo"],
        povos: ["nascido na estação", "terrano"], oficios: ["soldador(a)", "operador(a) de doca", "médico(a) de bordo"],
      },
    },
  },
  panteao: {
    nomes: { inicio: ["Ax", "Ve"], fim: ["iom", "ra"] },
    dominios: [{ dominio: "do Vácuo e do Silêncio", icone: "🌌", temper: ["fria", "paciente"] }],
    cultos: ["a Tripulação"],
  },
};

sec("3. outro mundo — a Estação Órbita Sete, sem tocar em módulo");
{
  const o = CN.usarCenario(ORBITA);
  t("o mundo em uso é o novo", CN.cenarioAtivo() === o && o.nome === "Estação Órbita Sete");
  t("o Narrador lê a escala da estação, com a abertura e o fim do motor", E.ECONOMIA_PROMPT.includes("ESCALA DA ESTAÇÃO") && !E.ECONOMIA_PROMPT.includes("cavaleiro") && E.ECONOMIA_PROMPT.startsWith("ECONOMIA DO MUNDO") && E.ECONOMIA_PROMPT.endsWith("o número que entra/sai do bolso é o do sistema."));
  t("os preços comuns são os dela", E.PRECOS_COMUNS.map((x) => x.id).join() === "racao,dose" && E.PRECOS_DA_RUA.join() === "racao");
  t("a ração custa ◉ 3, e no porto rico ◉ 5", E.precoComum("racao") === 3 && E.precoComum("racao", 1.5) === 5 && E.precoComum("caneca") === null);
  const pr = M.precoComumParaPauta("quanto custa uma ração?", { fator: 1 });
  t("a pauta do preço perguntado fala da ração", JSON.stringify(pr).includes("ração prensada ◉ 3"), JSON.stringify(pr));
  t("e a cerveja já não é coisa deste mundo", !JSON.stringify(M.precoComumParaPauta("quanto custa uma cerveja?", { fator: 1 })).includes("◉"));
  t("o valor pela raridade é o dela", E.valorDeItem({ raridade: "raro" }) === 600 && E.valorDeItem("chave") === 2 && E.valorDeItem({}) === 25);
  t("as ocupações da criação são as dela", C.PROFISSOES.map((x) => x.nome).join() === "Mecânico,Piloto");
  t("o Mecânico vale na bancada, o Ferreiro já não existe", P.bonusDeBancada({ profissao: "mecanico" }, "utilitario") === 4 && P.bonusDeBancada({ profissao: "Ferreiro" }, "utilitario") === 0);
  t("o Piloto navega e compra melhor", P.bonusDeNavegacao({ profissao: "Piloto" }) === 6 && P.precoDeCompraPara({ profissao: "Piloto" }, 100) === 90);
  t("o montador de prontos conhece o mundo novo", R.profissaoValida("Piloto") && !R.profissaoValida("Mercador"));

  /* 2.ª fatia: os gêneros e os ofícios do léxico são os dela */
  t("o corte do futuro é o dela", LX.GENEROS_FUTURISTAS.join() === "Ópera de estação,Ficção científica");
  t("a ópera de estação mostra as origens do futuro, nos dois catálogos", LX.racasDoMundo("Ópera de estação") === LX.GRUPOS_DE_RACA.futuro && C.racasDoGenero("Ópera de estação").map((r) => r.nome).join() === LX.GRUPOS_DE_RACA.futuro.join());
  t("e o Cyberpunk, que ela não pôs no futuro, volta às raças de fantasia", LX.racasDoMundo("Cyberpunk") === LX.GRUPOS_DE_RACA.fantasia && C.racasDoGenero("Cyberpunk").map((r) => r.nome).join() === LX.GRUPOS_DE_RACA.fantasia.join());
  t("as marcas do gênero próprio são as dela (sem acento nem caixa)", LX.generoProprio({ genero: "Fantasia medieval", descricao: "O VÁCUO lá fora." }) && LX.generoProprio({ genero: "", descricao: "Três estações mineiras." }) && !LX.generoProprio({ genero: "Fantasia medieval", descricao: "Um anime de naves." }));
  t("os ofícios do léxico são os dela", LX.PROFISSOES_DO_SISTEMA.join() === "Mecânico,Piloto" && Object.isFrozen(LX.PROFISSOES_DO_SISTEMA));
  const ped = LX.pedidoDoLexico({});
  t("o pedido do léxico assume o gênero dela e pede nome para os ofícios dela", ped.includes("· Gênero: Ópera de estação") && ped.includes("<UM de: Mecânico, Piloto>") && !ped.includes("Ferreiro"));
  const lexO = { profissoes: [{ profissao: "mecânico", chamado: "Chave-Inglesa" }, { profissao: "Piloto", chamado: "Ás do Cinturão" }] };
  t("o léxico gerado para os dois ofícios dela não se perde (o tudo-ou-nada conta os dela)", LX.garantirLexico(lexO).profissoes.length === 2 && LX.profissaoNaFicha(lexO, "Mecânico", true) === "Chave-Inglesa (Mecânico)");
  /* 3.ª fatia: o bestiário é o dela */
  t("as criaturas e os arquétipos são os dela", B.CRIATURAS_FANTASIA.map((c) => c.nome).join() === "Rato de Duto,Drone de Segurança,Rainha da Colmeia" && B.ARQUETIPOS.map((c) => c.nome).join() === "Capanga,Contrabandista");
  t("a ópera de estação vê as criaturas dela e um arquétipo emprestado", B.criaturasDoGenero("Ópera de estação").map((c) => c.nome).join() === "Rato de Duto,Drone de Segurança,Rainha da Colmeia,Capanga");
  t("o Cyberpunk, os arquétipos e uma criatura emprestada", B.criaturasDoGenero("Cyberpunk").map((c) => c.nome).join() === "Capanga,Contrabandista,Rato de Duto");
  const drone = B.completarInimigo({ nome: "Drone de Segurança Mk2" }, 5);
  t("o drone que o Narrador abre sai da ficha dela (ameaça, degrau, perfil com imunidade)", drone.ameaca === "competente" && drone.degrau === "bruto" && drone.perfil.ataque === "raio" && DN.multiplicadorDano("sombrio", drone.perfil).mult === 0, JSON.stringify(drone.perfil));
  t("a Rainha cai e rola contra a morte; o rato é ágil", B.completarInimigo({ nome: "Rainha da Colmeia" }, 12).importante === true && B.completarInimigo({ nome: "Rato de Duto" }, 1).agil === true);
  t("o Lobo já não é criatura deste mundo (o desconhecido não é rápido nem lento)", B.completarInimigo({ nome: "Lobo" }, 3).des === 0 && B.completarInimigo({ nome: "Lobo" }, 3).ameaca === "comum");
  t("a emboscada acha o rato na frase, e o goblin já não", (EM.criaturaNaFrase("há um rato de duto no teto") || {}).nome === "Rato de Duto" && EM.criaturaNaFrase("um goblin na estrada") === null);
  t("a ficha da masmorra lê a ameaça dela", MA.bichosDaFicha([{ nome: "Rainha da Colmeia" }])[0].ameaca === "lendario");
  /* 4.ª fatia: a gente e o céu são os dela */
  const ob = ORBITA.gente.bancos["Ópera de estação"];
  const r1 = G.rngDe("orbita|nomes");
  t("os gêneros com nomes são os dela", NM.generosDisponiveis().join() === "Ópera de estação");
  const gente = Array.from({ length: 30 }, () => NM.nomePessoa("Ópera de estação", "fem", r1));
  t("a gente dela tem os nomes dela", gente.every((n) => ob.fem.includes(n.split(" ")[0])) && gente.some((n) => n.includes("Turno-Longo")), gente.slice(0, 4).join());
  t("o Cyberpunk, que não tem banco nela, cai no do padrão dela", Array.from({ length: 20 }, () => NM.nomePessoa("Cyberpunk", "masc", r1)).every((n) => ob.masc.includes(n.split(" ")[0])));
  const cids = Array.from({ length: 30 }, () => NM.nomeCidade("Ópera de estação", r1));
  t("sem cidades prontas, toda cidade é prefixo + sufixo", cids.every((n) => ob.cidadePre.some((p) => n.startsWith(p)) && ob.cidadeSuf.some((x) => n.endsWith(x))), cids.slice(0, 4).join());
  t("o sexo de um nome lê os bancos dela (e o Aldric já não é de ninguém)", NM.sexoDoNome("Tevo Turno-Longo") === "masc" && NM.sexoDoNome("Oona") === "fem" && NM.sexoDoNome("Aldric") === "");
  const pd = Array.from({ length: 30 }, () => NM.pessoaDiversa("", r1));
  t("o elenco nasce com os povos, os ofícios e os traços dela", pd.every((p) => ob.povos.includes(p.raca) && ob.oficios.includes(p.ocupacao) && ORBITA.gente.tracos.includes(p.traco)) && NM.TRACOS_PESSOA.join() === ORBITA.gente.tracos.join());
  t("e a regra do ofício no gênero vale para o ofício dela", NM.oficioNoGenero("operador(a) de doca", "mulher") === "operadora de doca" && NM.oficioNoGenero("soldador(a)", "homem") === "soldador");
  const am = NM.nomesAMao({ semente: "orbita", dia: 2, cidade: "Anel-7" });
  t("os nomes à mão do Narrador são da estação", am.length === 2 && ob.masc.includes(am[0].nome.split(" ")[0]) && ob.fem.includes(am[1].nome.split(" ")[0]), JSON.stringify(am));
  t("e o motor reconhece-os na prosa (nomesAMaoNaProsa, a regra que fim-do-turno chama)", NM.nomesAMaoNaProsa(`${am[0].nome.split(" ")[0]} morreu na doca.`, am)[0].morto === true);
  const deus = DV.gerarDivindade({ lugar: "Anel-7" }, 3, { sorte: G.rngDe("orbita|deus") });
  t("o deus que nasce é do céu dela", ["Axiom", "Axra", "Veiom", "Vera"].includes(deus.nome) && deus.dominio === "do Vácuo e do Silêncio" && deus.icone === "🌌" && ["fria", "paciente"].includes(deus.temperamento) && deus.culto === `a Tripulação de ${deus.nome}`, JSON.stringify(deus));
  const pan = DV.gerarPanteaoInicial({}, 3, G.rngDe("orbita|panteao"));
  t("…e a física é a do motor: o panteão inicial é GD 2, 3 e 4, com os fiéis da escala", pan.map((d) => d.gd).join() === "2,3,4" && pan.every((d) => d.fieis >= DV.GRAUS[d.gd].fieis / 2 && d.pf === Math.floor(d.fieis / 1000)) && DV.grauDe({ ehJogador: true, despertar: true, fieis: 12000 }) === 2);
  const ev = DV.gerarEventoDivino({ lugar: "Anel-7" }, 3, pan, G.rngDe("orbita|evento"));
  t("o evento divino fala de um deus dela", ev && pan.some((d) => ev.texto.includes(d.nome)), ev && ev.texto);
  const nomeDe = (sem) => NM.nomePessoa("Ópera de estação", "", G.rngDe(sem));
  t("mesma semente, mesmo mundo: o mesmo nome e o mesmo deus", nomeDe("o7|a") === nomeDe("o7|a") && JSON.stringify(DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") })) === JSON.stringify(DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") })));
  const naOrbita = [nomeDe("o7|a"), DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") }).nome];
  t("e o banco dos doze da Taverna não vale aqui", LX.garantirLexico({ profissoes: CN.CENARIO_PADRAO.ocupacoes.map((o) => ({ profissao: o.nome, chamado: "x " + o.nome })) }).profissoes.length === 0);

  /* determinismo: a mesma semente e o mesmo mundo, duas vezes */
  const banca = (s) => M.gerarMercador({ cidade: { nome: "Doca", porte: "cidade" }, semente: s, nivel: 4 });
  const a = banca("orbita|1"), b = banca("orbita|1");
  t("mesma semente, mesmo mundo: a mesma banca", JSON.stringify(a) === JSON.stringify(b));
  CN.usarCenario(CN.CENARIO_PADRAO);
  const p = banca("orbita|1");
  t("a mesma semente noutro mundo: as mesmas coisas, outros preços", a.estoque.map((x) => x.nome).join() === p.estoque.map((x) => x.nome).join() && a.estoque.map((x) => x.preco).join() !== p.estoque.map((x) => x.preco).join());
  t("e de volta ao padrão, tudo como era", C.PROFISSOES.length === 12 && E.precoComum("caneca") === 1 && E.valorDeItem({ raridade: "raro" }) === 220);
  t("…o bestiário também", B.CRIATURAS_FANTASIA.length === 18 && B.ARQUETIPOS.length === 9 && B.completarInimigo({ nome: "Troll" }, 5).perfil.fraqueza.join() === "fogo");
  t("…a gente e o céu também (e a mesma semente dá outro nome noutro mundo)", NM.generosDisponiveis().length === 6 && NM.sexoDoNome("Aldric") === "masc" && NM.TRACOS_PESSOA.length === 26 && [NM.nomePessoa("Ópera de estação", "", G.rngDe("o7|a")), DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") }).nome].every((n, i) => n !== naOrbita[i]));
  t("…o léxico também (os doze, o corte do futuro, o gênero padrão)", LX.PROFISSOES_DO_SISTEMA.length === 12 && LX.GENEROS_FUTURISTAS.includes("Cyberpunk") && LX.generoProprio({ descricao: "um anime" }) && LX.pedidoDoLexico({}).includes("· Gênero: Fantasia medieval"));
}

sec("4. o cenário inválido é recusado, e diz onde");
{
  const caso = (nome, mexer, espera) => {
    const d = copia(ORBITA);
    const x = mexer(d);
    const msg = recusa(x === undefined ? d : x);
    t(nome, msg !== null && msg.includes(espera), msg ? msg.split("\n").slice(0, 3).join(" | ") : "aceitou");
  };
  caso("null", () => null, "devia ser um objeto");
  caso("uma lista", () => [], "devia ser um objeto");
  caso("vazio: cada secção que falta", () => ({}), "precos: falta");
  caso("falta a raridade lendária", (d) => { delete d.precos.raridade.lendario; }, "precos.raridade.lendario: falta");
  caso("falta a base de um preço comum", (d) => { delete d.precos.comuns[1].base; }, "precos.comuns[1].base: falta");
  caso("preço negativo", (d) => { d.precos.miudeza = -1; }, "precos.miudeza: devia ser número ≥ 0");
  caso("faixa ao contrário", (d) => { d.precos.comuns[0].faixa = [4, 2]; }, "precos.comuns[0].faixa");
  caso("campo com erro de grafia", (d) => { d.precos.comuns[0].porPalavras = true; }, "precos.comuns[0].porPalavras: campo desconhecido");
  /* 4.ª fatia: era `d.deuses` — os deuses passaram a ser secção (`panteao`), e o
     que esta linha prova é a secção que o motor não lê; a magia não é uma */
  caso("secção que o motor ainda não lê", (d) => { d.magias = []; }, "magias: campo desconhecido");
  caso("regex literal (código, não dado)", (d) => { d.precos.comuns[0].rx = /racao/; }, "regex literal");
  caso("regex que não compila", (d) => { d.precos.comuns[0].rx = "(racao"; }, "precos.comuns[0].rx: devia ser texto de uma regex válida");
  caso("uma função no meio do mundo", (d) => { d.precos.semRaridade = () => 5; }, "não é dado de JSON");
  caso("número que não é número", (d) => { d.precos.raridade.raro = NaN; }, "precos.raridade.raro: número inválido");
  caso("id repetido", (d) => { d.precos.comuns[1].id = "racao"; }, '"racao" repetido');
  caso("ocupação repetida (sem olhar a caixa)", (d) => { d.ocupacoes[1].nome = "MECÂNICO"; }, "repetido");
  caso("efeito fora do vocabulário", (d) => { d.ocupacoes[0].efeito.desconto = 0.2; }, "ocupacoes[0].efeito.desconto: campo desconhecido");
  caso("fração que não é fração", (d) => { d.ocupacoes[1].efeito.compra = 1.5; }, "ocupacoes[1].efeito.compra: devia ser fração");
  caso("mundo sem ocupação", (d) => { d.ocupacoes = []; }, "ao menos 1 ocupação");
  caso("formato de outro motor", (d) => { d.formato = 2; }, "lê o formato 1");
  /* 2.ª fatia: os gêneros */
  caso("faltam os gêneros", (d) => { delete d.generos; }, "generos: falta (objeto)");
  caso("falta o gênero padrão", (d) => { delete d.generos.padrao; }, "generos.padrao: falta");
  caso("gênero padrão vazio", (d) => { d.generos.padrao = "  "; }, "generos.padrao: devia ser texto");
  caso("o futuro que não é lista", (d) => { d.generos.futuristas = "Cyberpunk"; }, "generos.futuristas: devia ser lista de textos");
  caso("um gênero do futuro que não é texto", (d) => { d.generos.futuristas = ["Ficção científica", 7]; }, "generos.futuristas[1]: devia ser texto");
  caso("uma marca que não compila diz qual", (d) => { d.generos.marcasProprias = ["\\bvacuo\\b", "(estacao"]; }, "generos.marcasProprias[1]: devia ser texto de uma regex válida");
  caso("uma marca como regex literal", (d) => { d.generos.marcasProprias = [/vacuo/]; }, "generos.marcasProprias[0]: não é dado de JSON (regex literal");
  caso("um campo dos gêneros que o motor não lê", (d) => { d.generos.racas = []; }, "generos.racas: campo desconhecido");
  /* 3.ª fatia: o bestiário */
  caso("falta o bestiário", (d) => { delete d.bestiario; }, "bestiario: falta (objeto)");
  caso("mundo sem criatura", (d) => { d.bestiario.criaturas = []; }, "bestiario.criaturas: precisa de ao menos 1 criatura");
  caso("uma ameaça que o motor não conhece", (d) => { d.bestiario.criaturas[0].ameaca = "medio"; }, "bestiario.criaturas[0].ameaca: devia ser uma ameaça do motor");
  caso("um degrau que o motor não conhece", (d) => { d.bestiario.criaturas[1].degrau = "genio"; }, "bestiario.criaturas[1].degrau: devia ser um degrau do motor");
  caso("um tipo de dano que não existe", (d) => { d.bestiario.criaturas[1].perfil.resist = ["acido"]; }, "bestiario.criaturas[1].perfil.resist: devia ser lista de tipos de dano");
  caso("um campo do perfil que o motor não lê", (d) => { d.bestiario.criaturas[1].perfil.cura = 3; }, "bestiario.criaturas[1].perfil.cura: campo desconhecido");
  caso("nível zero", (d) => { d.bestiario.arquetipos[0].nivelRef = 0; }, "bestiario.arquetipos[0].nivelRef: devia ser número inteiro ≥ 1");
  caso("falta a destreza", (d) => { delete d.bestiario.arquetipos[1].des; }, "bestiario.arquetipos[1].des: falta");
  caso("emprestados negativo", (d) => { d.bestiario.emprestados = -1; }, "bestiario.emprestados: devia ser número inteiro ≥ 0");
  caso("o mesmo nome nas duas listas (sem olhar a caixa)", (d) => { d.bestiario.arquetipos[1].nome = "RATO DE DUTO"; }, 'bestiario.arquetipos[1].nome: "RATO DE DUTO" repetido');
  caso("o agil escrito à mão (é regra, sai de des)", (d) => { d.bestiario.criaturas[0].agil = true; }, "bestiario.criaturas[0].agil: campo desconhecido");
  /* 4.ª fatia: a gente e o céu */
  const B0 = 'gente.bancos["Ópera de estação"]';
  caso("falta a gente", (d) => { delete d.gente; }, "gente: falta (objeto)");
  caso("falta o panteão", (d) => { delete d.panteao; }, "panteao: falta (objeto)");
  caso("mundo sem banco de nomes", (d) => { d.gente.bancos = {}; }, "gente.bancos: precisa de ao menos 1 banco");
  caso("o gênero padrão sem banco", (d) => { d.gente.bancos = { "Ficção científica": d.gente.bancos["Ópera de estação"] }; }, 'gente.bancos: falta o banco do gênero padrão (generos.padrao, "Ópera de estação")');
  caso("uma lista de nomes vazia", (d) => { d.gente.bancos["Ópera de estação"].fem = []; }, B0 + ".fem: devia ser lista de textos, com ao menos um");
  caso("falta o sobrenome", (d) => { delete d.gente.bancos["Ópera de estação"].sobrenome; }, B0 + ".sobrenome: falta");
  caso("um povo que não é texto", (d) => { d.gente.bancos["Ópera de estação"].povos = ["terrano", 3]; }, B0 + ".povos: devia ser lista de textos");
  caso("as tavernas no banco (é a toponímia que as nomeia)", (d) => { d.gente.bancos["Ópera de estação"].taverna = ["O Vácuo"]; }, B0 + ".taverna: campo desconhecido");
  caso("um banco que não é objeto", (d) => { d.gente.bancos.Cyberpunk = ["Rez"]; }, 'gente.bancos["Cyberpunk"]: devia ser objeto');
  caso("um banco sem gênero", (d) => { d.gente.bancos[" "] = d.gente.bancos["Ópera de estação"]; }, 'gente.bancos[" "]: o gênero do banco devia ser texto');
  caso("sem traços", (d) => { d.gente.tracos = []; }, "gente.tracos: devia ser lista de textos, com ao menos um");
  caso("um céu sem domínio", (d) => { d.panteao.dominios = []; }, "panteao.dominios: precisa de ao menos 1 domínio");
  caso("um domínio sem ícone", (d) => { delete d.panteao.dominios[0].icone; }, "panteao.dominios[0].icone: falta");
  caso("um domínio sem temperamento", (d) => { d.panteao.dominios[0].temper = []; }, "panteao.dominios[0].temper: devia ser lista de textos, com ao menos um");
  caso("falta a segunda metade do nome divino", (d) => { delete d.panteao.nomes.fim; }, "panteao.nomes.fim: falta");
  caso("os cultos como texto", (d) => { d.panteao.cultos = "a Tripulação"; }, "panteao.cultos: devia ser lista de textos");
  caso("a escala de graus no cenário (é regra, fica no motor)", (d) => { d.panteao.graus = [{ gd: 0, titulo: "Tripulante" }]; }, "panteao.graus: campo desconhecido");
  const v = CN.validarCenario({ formato: 1, id: "x" });
  t("a validação devolve todos os erros de uma vez", !v.ok && v.erros.length >= 3 && v.erros.some((e) => e.startsWith("nome")) && v.erros.some((e) => e.startsWith("precos")) && v.erros.some((e) => e.startsWith("ocupacoes")));
  t("o padrão e o mundo de teste passam", CN.validarCenario(DADOS_DO_CENARIO_PADRAO).ok && CN.validarCenario(ORBITA).ok);

  const antes = CN.cenarioAtivo();
  let caiu = false;
  try { CN.usarCenario({ ...copia(ORBITA), ocupacoes: [] }); } catch { caiu = true; }
  t("trocar por um mundo inválido não troca nada", caiu && CN.cenarioAtivo() === antes && C.PROFISSOES.length === 12 && LX.PROFISSOES_DO_SISTEMA.length === 12 && B.CRIATURAS_FANTASIA.length === 18 && NM.generosDisponiveis().length === 6 && NM.TRACOS_PESSOA.length === 26);
}

sec("5. imutabilidade e determinismo");
{
  const P0 = CN.CENARIO_PADRAO;
  t("o cenário carregado é congelado a fundo", Object.isFrozen(P0) && Object.isFrozen(P0.precos) && Object.isFrozen(P0.precos.comuns[0]) && Object.isFrozen(P0.precos.comuns[0].faixa) && Object.isFrozen(P0.ocupacoes[0].efeito.bancada));
  const bruto = copia(ORBITA);
  const o = CN.carregarCenario(bruto);
  t("o dado do autor não é tocado nem congelado", !Object.isFrozen(bruto) && JSON.stringify(bruto) === JSON.stringify(ORBITA) && o !== bruto);
  t("carregar o carregado devolve o mesmo", CN.carregarCenario(o) === o && CN.carregarCenario(P0) === P0);
  t("as tabelas dos catálogos saem congeladas", Object.isFrozen(E.PRECOS_COMUNS) && Object.isFrozen(E.PRECOS_COMUNS[0]) && Object.isFrozen(E.PRECOS_DA_RUA) && Object.isFrozen(C.PROFISSOES) && Object.isFrozen(B.CRIATURAS_FANTASIA) && Object.isFrozen(B.ARQUETIPOS[0]) && Object.isFrozen(B.CRIATURAS_FANTASIA.find((c) => c.perfil).perfil.resist) && Object.isFrozen(NM.TRACOS_PESSOA));
  const deusA = DV.gerarDivindade({}, 1, { sorte: G.rngDe("imutavel") });
  deusA.nome = "Outro";
  t("o deus gerado é do chamador: mexer nele não mexe no céu", DV.gerarDivindade({}, 1, { sorte: G.rngDe("imutavel") }).nome !== "Outro" && CN.CENARIO_PADRAO.panteao.nomes.inicio.length === 16);
  const tr = B.completarInimigo({ nome: "Troll" }, 5);
  let tocou = false;
  try { tr.perfil.fraqueza.push("gelo"); tocou = true; } catch { /* congelado */ }
  t("o inimigo completado não muda a ficha do bestiário por baixo", !tocou && B.completarInimigo({ nome: "Troll" }, 5).perfil.fraqueza.join() === "fogo");
  let mutou = false;
  try { C.PROFISSOES.push({ nome: "Intruso" }); mutou = true; } catch { /* congelado */ }
  t("e ninguém lhes acrescenta um ofício por fora", !mutou && C.PROFISSOES.length === 12);
  const j = CN.carregarCenario(JSON.parse(JSON.stringify(DADOS_DO_CENARIO_PADRAO)));
  CN.usarCenario(j);
  t("o mundo de hoje, como JSON de verdade (texto → parse → carregar), fecha o dourado", diferentes(await fotografarOsCatalogos(SRC)).length === 0);
  CN.usarCenario(P0);
  t("duas fotografias seguidas, a mesma", JSON.stringify(await fotografarOsCatalogos(SRC)) === JSON.stringify(await fotografarOsCatalogos(SRC)));
}

sec("6. o esquema lê de volta o que o motor consome");
{
  const EQ = CN.ESQUEMA_DO_CENARIO;
  t("as raridades do esquema são as do loot", Object.keys(EQ.raridade).sort().join() === [...L.RARIDADES].sort().join());
  const fonteProf = fs.readFileSync(path.join(SRC, "profissoes.js"), "utf8");
  const lidos = new Set([...fonteProf.matchAll(/efeitoDe\(pers\)\.(\w+)/g)].map((m) => m[1]));
  t("o vocabulário do efeito é o que profissoes.js lê, nem mais nem menos", [...lidos].sort().join() === Object.keys(EQ.efeito).sort().join(), [...lidos].sort().join());
  t("toda ocupação do padrão usa só o vocabulário", CN.CENARIO_PADRAO.ocupacoes.every((o) => Object.keys(o.efeito).every((k) => k in EQ.efeito)));
  /* 2.ª fatia: os gêneros do padrão são os da criação, e a tabela é uma só */
  const rotulos = GENEROS.map((g) => g.label);
  t("o gênero padrão e os do futuro são gêneros da criação (constantes.js GENEROS)", rotulos.includes(CN.CENARIO_PADRAO.generos.padrao) && CN.CENARIO_PADRAO.generos.futuristas.every((g) => rotulos.includes(g)));
  t("o léxico e a criação nunca discordam do corte (todos os gêneros, dois mundos)", [CN.CENARIO_PADRAO, CN.carregarCenario(ORBITA)].every((m) => { CN.usarCenario(m); return [...rotulos, "Ópera de estação", "", "x"].every((g) => LX.racasDoMundo(g).join() === C.racasDoGenero(g).map((r) => r.nome).join()); }));
  CN.usarCenario(CN.CENARIO_PADRAO);
  t("as marcas do padrão estão escritas sem acento (a descrição é comparada assim)", CN.CENARIO_PADRAO.generos.marcasProprias.every((rx) => rx === rx.normalize("NFD").replace(/[\u0300-\u036f]/g, "") && rx === rx.toLowerCase()));
  const fonteLex = fs.readFileSync(path.join(SRC, "lexico.js"), "utf8"), fonteCla = fs.readFileSync(path.join(SRC, "classes.js"), "utf8");
  t("nenhuma lista literal ficou para trás (os doze, o corte do futuro, as marcas)", !fonteLex.includes('"Caçador de Recompensas"') && !fonteLex.includes('"Pós-apocalíptico"') && !fonteCla.includes('"Pós-apocalíptico"') && !fonteLex.includes("solo leveling"));
  t("os ofícios do léxico são os nomes das ocupações, na ordem delas", LX.PROFISSOES_DO_SISTEMA.join() === CN.CENARIO_PADRAO.ocupacoes.map((o) => o.nome).join());
  /* 3.ª fatia: o vocabulário que uma ficha pode usar é o do motor */
  t("as ameaças do esquema são as do motor", EQ.ameacas.join() === LX.AMEACAS.join() && Object.keys(DG.DEGRAU_POR_AMEACA).sort().join() === [...EQ.ameacas].sort().join());
  t("os degraus do esquema são os de degraus.js", EQ.degraus.join() === DG.DEGRAUS.map((d) => d.id).join());
  t("os tipos de dano do esquema são os de danos.js", EQ.elementos.join() === Object.keys(DN.TIPOS_DANO).join());
  t("os campos do perfil são os que danos.js perfilDe lê", Object.keys(DN.perfilDe({ perfil: {} })).sort().join() === Object.keys(EQ.perfil).sort().join());
  const fonteBe = fs.readFileSync(path.join(SRC, "bestiario.js"), "utf8");
  const campos = (fonteBe.match(/const daFicha = \(\{([^}]*)\}\)/) || [, ""])[1].split(",").map((x) => x.split("=")[0].trim()).filter(Boolean);
  t("os campos da ficha são os que bestiario.js daFicha copia, nem mais nem menos", campos.sort().join() === Object.keys(EQ.criatura).sort().join(), campos.join());
  t("nenhuma ficha ficou literal em bestiario.js", !/\bC\("/.test(fonteBe) && !fonteBe.includes('"Dragão Ancião"') && !fonteBe.includes('"Fantasia medieval"'));
  t("as 27 do padrão, na ordem de sempre (o manifesto dos retratos segue-a)", B.CRIATURAS_FANTASIA.length + B.ARQUETIPOS.length === 27 && B.CRIATURAS_FANTASIA[0].nome === "Slime" && B.ARQUETIPOS[B.ARQUETIPOS.length - 1].nome === "Horror");
  /* 4.ª fatia: nenhuma lista de nomes nem de deuses ficou no código, e o motor só lê funções */
  const fonteNm = fs.readFileSync(path.join(SRC, "nomes.js"), "utf8"), fonteDv = fs.readFileSync(path.join(SRC, "divindades.js"), "utf8");
  t("nenhum banco ficou literal em nomes.js (nomes, povos, ofícios, traços, o padrão)", !["\"Brannoc\"", "\"Valdoravem\"", "\"halfling\"", "\"netrunner\"", "\"desconfiado\"", "\"aprendiz de mago\""].some((x) => fonteNm.includes(x)) && !/\|\| "Fantasia medieval"/.test(fonteNm));
  t("nenhum deus ficou literal em divindades.js (sílabas, domínios, cultos)", !["\"Vhar\"", "\"essa\"", "da Colheita e da Fome", "\"a Ordem\""].some((x) => fonteDv.includes(x)));
  const doMotor = fs.readdirSync(path.join(SRC, "motor")).filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync(path.join(SRC, "motor", f), "utf8"));
  const importados = (mod) => doMotor.flatMap((src) => [...src.matchAll(new RegExp("import \\{([^}]*)\\} from \"\\.\\./" + mod + "\\.js\"", "g"))].flatMap((m) => m[1].split(",").map((x) => x.trim()).filter(Boolean)));
  const doNm = importados("nomes"), doDv = importados("divindades");
  t("o motor lê nomes.js só por funções", doNm.length > 0 && doNm.every((n) => typeof NM[n] === "function"), doNm.join());
  t("…e de divindades.js só funções e as tabelas da regra (nenhum dado do céu)", doDv.length > 0 && doDv.every((n) => typeof DV[n] === "function" || ["GRAUS", "MAGNITUDE_FE", "MILAGRES", "CAMINHOS_ASCENSAO"].includes(n)), doDv.join());
  t("o padrão: seis bancos, na ordem da criação (o Universo próprio cai no do padrão), e o do gênero padrão entre eles", NM.generosDisponiveis().length === 6 && NM.generosDisponiveis().every((g, i) => g === rotulos[i]) && !NM.generosDisponiveis().includes("Universo próprio") && rotulos.includes(CN.CENARIO_PADRAO.generos.padrao));
  t("o céu do padrão: 16 × 14 nomes, 12 domínios, 7 cultos", CN.CENARIO_PADRAO.panteao.nomes.inicio.length === 16 && CN.CENARIO_PADRAO.panteao.nomes.fim.length === 14 && CN.CENARIO_PADRAO.panteao.dominios.length === 12 && CN.CENARIO_PADRAO.panteao.cultos.length === 7);
  t("os campos de um banco são os que nomes.js lê (b.campo), nem mais nem menos", [...new Set([...fonteNm.matchAll(/\b(?:b|bancoDe\(g\))\.(\w+)/g)].map((m) => m[1]))].sort().join() === Object.keys(CN.ESQUEMA_DO_CENARIO.banco).sort().join(), [...new Set([...fonteNm.matchAll(/\b(?:b|bancoDe\(g\))\.(\w+)/g)].map((m) => m[1]))].sort().join());
  t("as faixas do padrão estão escritas na escala que o Narrador lê", CN.CENARIO_PADRAO.precos.comuns.filter((c) => c.faixa && c.faixa[0] !== c.faixa[1]).every((c) => E.ECONOMIA_PROMPT.includes(`◉ ${c.faixa[0]}–${c.faixa[1]}`)));

  /* um catálogo que estoura a meio da troca não deixa meio mundo de cada lado */
  CN.aoTrocarDeCenario((c) => { if (c.id === "explode") throw new Error("catálogo de teste"); });
  let caiu = false;
  try { CN.usarCenario({ ...copia(ORBITA), id: "explode" }); } catch { caiu = true; }
  t("se um catálogo estoura, todos voltam ao mundo de antes", caiu && CN.cenarioAtivo() === CN.CENARIO_PADRAO && C.PROFISSOES.length === 12 && E.precoComum("caneca") === 1);
}

console.log(`\ncenário (T4-B): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
