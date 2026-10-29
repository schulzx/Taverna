/* teste-cenario.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª a 6.ª fatias, 28/10/2026)

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
   deus, os domínios, os cultos) — e a regra dos deuses ficou no código. A
   5.ª tirou os lugares (toponimia.js: as palavras da taverna e de cada tipo
   de local, por gênero), as raças da criação (classes.js RACAS e ORIGENS,
   lexico.js GRUPOS_DE_RACA) e, do céu, os títulos dos graus (que o
   DIVINDADE_PROMPT repetia à mão) e o sinal de cada temperamento. A 6.ª
   tirou o que um autor ainda não trocava sem código: os oito prontos
   (prontos.js), o povo do companheiro (companheiros.js), os três estágios
   da ascensão e as palavras divinas (divindades.js, prompt.js) e os gêneros
   da criação (constantes.js GENEROS, e o recuo do códex e do prompt).
   Esta suíte prova:

   1. o dourado — o código de ANTES (605901b, lido por `git archive` em
      `gerar-cenario-dourado.mjs`; os 578 casos da 1.ª fatia vinham do
      f0a9fae, os 143 da 2.ª do 3e7493a, os 102 da 3.ª do 9068a93, os 48 da
      4.ª do 1cfc08a, os 69 da 5.ª do aea9587, e são iguais byte a byte) e
      o de agora dão a mesma resposta às 948 perguntas de `cenario-casos.mjs` (500 bancas semeadas, os preços
      comuns por fator, a pauta do preço perguntado, as doze ocupações em
      todas as funções que as leem; os gêneros por racasDoMundo,
      racasDoGenero, generoProprio, o pedido do léxico, os ofícios
      renomeados e a ficha da cidade; o bestiário por completarInimigo,
      a criatura na frase, a ficha da masmorra, 40 masmorras semeadas, os
      bichos e os chefes do mundo; os nomes por gênero, o sexo de um nome,
      os nomes à mão, a gente dos locais, e 60 deuses, 20 panteões e 40
      eventos semeados; os nomes de taverna e de local por 13 gêneros e os
      locais de 16 cidades; as 16 raças pelo catálogo, pelos traços, pela
      ficha de criação, pelo companheiro, pelos prontos e pelo léxico; a
      escala divina, o prompt dela, os títulos e 144 eventos de deuses de
      temperamento marcado);
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
/* 6.ª fatia: GENEROS é do cenário (`export let`) — lê-se pelo módulo (K.GENEROS),
   porque a cópia do import ficaria com os cartões do mundo de antes */
const K = await import(S + "constantes.js");
const { ATRIBUTOS } = K;
const B = await import(S + "bestiario.js");
const EM = await import(S + "emboscada.js");
const MA = await import(S + "masmorras.js");
const DG = await import(S + "degraus.js");
const DN = await import(S + "danos.js");
const NM = await import(S + "nomes.js");
const DV = await import(S + "divindades.js");
const G = await import(S + "geografia.js");
const TP = await import(S + "toponimia.js");
const TR = await import(S + "tracos.js");
const AT = await import(S + "atributos.js");
const CP = await import(S + "companheiros.js");
const MB = await import(S + "mundo-base.js");
const CD = await import(S + "condicoes.js");
const PR = await import(S + "prompt.js");
/* 28/10 (trilha B): o despertar divino do motor diz os estágios do céu do mundo */
const EV = await import(S + "motor/envelopes-do-turno.js");
const DESPERTAR = { nivel: 15, fieis: 120, pan: "Vela (do Vácuo e do Silêncio)" };

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
  /* 5.ª fatia: e o mesmo vale para os lugares — o padrão sem banco de lugares
     é recusado; com as mesmas palavras da fantasia, muda só a lista dos
     gêneros com banco (`topo.generos`), que ganhou um, como a dos nomes */
  d5.lugares.bancos["Fantasia sombria"] = d5.lugares.bancos["Fantasia medieval"];
  /* 6.ª fatia: e o padrão é um gênero da criação — o mundo de prova põe-lhe o
     cartão, e a lista dos cartões (`criacao.generos`) é a terceira que ganha um */
  d5.generos.criacao.push({ id: "sombria", label: "Fantasia sombria", dica: "A mesma terra, sem a luz" });
  CN.usarCenario(d5);
  const dif5 = diferentes(await fotografarOsCatalogos(SRC));
  t("o gênero padrão muda só o pedido de quem não disse o seu", dif5.length > 0 && so(dif5, "lexico.pedido.", "nomes.generos", "topo.generos", "criacao.generos") && dif5.includes("criacao.generos") && dif5.includes("nomes.generos") && dif5.includes("topo.generos") && !dif5.some((id) => id.startsWith("lexico.pedido.Cyberpunk") || id.startsWith("lexico.pedido.Fantasia medieval")), dif5.join());

  const d6 = copia(DADOS_DO_CENARIO_PADRAO);
  d6.ocupacoes[0].nome = "Ferreira";
  /* 6.ª fatia: o pronto diz o ofício pelo nome, e o validador recusa o nome que
     o mundo não tem — quem renomeia o ofício renomeia-o no roster também (a
     asserção abaixo não mudou: o que ela prova continua a ser o léxico) */
  d6.prontos.filter((p) => p.profissao === "Ferreiro").forEach((p) => { p.profissao = "Ferreira"; });
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

  /* 5.ª fatia: os lugares, as raças e as palavras do céu */
  const d17 = copia(DADOS_DO_CENARIO_PADRAO);
  { const sb = d17.lugares.bancos["Fantasia medieval"].subst; sb[sb.indexOf("Javali|m")] = "Javalina|f"; }
  CN.usarCenario(d17);
  const dif17 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Javali que vira Javalina muda as tavernas da fantasia e de quem cai no banco do padrão — e só os lugares", dif17.includes("topo.genero.null") && dif17.filter((id) => id.startsWith("topo.genero.")).length >= 3 && !dif17.includes("topo.genero.Cyberpunk") && !dif17.includes("topo.genero.Ficção científica") && so(dif17, "topo.genero.", "mundo.locais.", "cidade.ficha."), dif17.join());
  t("…e a ficha da cidade, que diz o nome da taverna", dif17.some((id) => id.startsWith("cidade.ficha.")));
  const d18 = copia(DADOS_DO_CENARIO_PADRAO);
  d18.lugares.tipos.mercado = d18.lugares.tipos.mercado.slice(1);
  CN.usarCenario(d18);
  const dif18 = diferentes(await fotografarOsCatalogos(SRC));
  t("um sinônimo de mercado a menos muda os nomes de local de todo gênero e os mercados das cidades", dif18.filter((id) => id.startsWith("topo.genero.")).length === 13 && dif18.some((id) => id.startsWith("mundo.locais.")) && so(dif18, "topo.", "mundo.locais.", "mundo.gente.", "cidade.ficha."), String(dif18.length));
  const raca = (d, n) => [...d.racas.fantasia, ...d.racas.futuro].find((r) => r.nome === n);
  const d19 = copia(DADOS_DO_CENARIO_PADRAO);
  raca(d19, "Anão").bonus.vigor = 3;
  CN.usarCenario(d19);
  const dif19 = diferentes(await fotografarOsCatalogos(SRC));
  /* "anao" sem acento acha o traço (tracos.js compara sem acento) mas não o
     bônus (a ficha de criação procura o nome exato): por isso só o Anão muda,
     e o pronto que nasce anão */
  /* 6.ª fatia: o pronto anão também nasce batizado (`prontos.batizados`, a pergunta
     nova do montador) — a mesma ficha com outro nome, e por isso muda junto */
  t("o Anão com +3 de vigor muda o Anão, o pronto anão, e mais nenhuma raça", dif19.join() === "racas.tabelas,racas.de.Anão,racas.prontos,prontos.batizados", dif19.join());
  const d20 = copia(DADOS_DO_CENARIO_PADRAO);
  delete raca(d20, "Elfo").efeito.veNoEscuro;
  CN.usarCenario(d20);
  const dif20 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Elfo sem visão no escuro muda o traço do Elfo, e só", dif20.join() === "racas.tabelas,racas.de.Elfo", dif20.join());
  const d21 = copia(DADOS_DO_CENARIO_PADRAO);
  raca(d21, "Goliath").nome = "Golias";
  /* 6.ª fatia: a Muralha diz a raça pelo nome, e o validador recusa a que o
     mundo não tem — quem renomeia a raça renomeia-a no roster também */
  d21.prontos.filter((p) => p.raca === "Goliath").forEach((p) => { p.raca = "Golias"; });
  CN.usarCenario(d21);
  const dif21 = diferentes(await fotografarOsCatalogos(SRC));
  t("o Goliath renomeado no cenário muda as raças do léxico e o pedido (sem tocar em lexico.js nem em classes.js)", dif21.includes("lexico.tabelas") && dif21.includes("lexico.pedido.inteiro") && dif21.includes("lexico.racas.todas") && /* o id do caso sai do nome da raça: renomeada, a pergunta passa a ser pelo Golias */ dif21.includes("racas.de.Golias") &&!dif21.includes("lexico.pedido.Cyberpunk."), String(dif21.length));
  const d22 = copia(DADOS_DO_CENARIO_PADRAO);
  d22.panteao.titulos[2].titulo = "Centelha";
  CN.usarCenario(d22);
  const dif22 = diferentes(await fotografarOsCatalogos(SRC));
  t("o GD 2 chamado Centelha muda a escala, o prompt, os títulos e o rodapé — e não os deuses gerados", dif22.includes("divindades.graus") && dif22.includes("divindades.prompt") && dif22.includes("divindades.titulos") && dif22.includes("divindades.patamar") && so(dif22, "divindades.") && !dif22.includes("divindades.geradas"), dif22.join());
  t("…e o prompt diz Centelha onde dizia Semideus, nas duas linhas", DV.DIVINDADE_PROMPT.includes("Centelha (10k)") && DV.DIVINDADE_PROMPT.includes("Centelha/Receptáculo") && !DV.DIVINDADE_PROMPT.includes("Semideus"));
  const d23 = copia(DADOS_DO_CENARIO_PADRAO);
  delete d23.panteao.dominios.find((x) => x.dominio === "das Tempestades").sinais;
  CN.usarCenario(d23);
  const dif23 = diferentes(await fotografarOsCatalogos(SRC));
  t("sem o sinal da tempestade, o deus colérico manda o fenômeno sem nome — e só os sinais mudam", dif23.includes("divindades.sinais") && so(dif23, "divindades."), dif23.join());

  CN.usarCenario(CN.CENARIO_PADRAO);
  t("de volta ao padrão, o dourado fecha outra vez", diferentes(await fotografarOsCatalogos(SRC)).length === 0);
}

/* 6.ª fatia: a ficha mínima com que a suíte pede o prompt do Narrador inteiro */
const FICHA_DO_PROMPT = Object.freeze({
  nome: "Iara", raca: "Humano", classe: "Guerreiro", nivel: 3, vida: 20, vidaMax: 20, mana: 5, manaMax: 5,
  atributos: { forca: 2, vigor: 1 }, moedas: 10, inventario: [], habilidades: [], efeitos: [], condicoes: [], grupo: [], equipados: {},
});

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
    /* 6.ª fatia: os cartões da criação dela — o padrão e o futuro estão entre eles */
    criacao: [
      /* 29/10 (trilha A): o glifo de cada cartão, do vocabulário que a tela desenha */
      { id: "opera", label: "Ópera de estação", glifo: "foguete", dica: "Docas, turnos longos e o vácuo do lado de fora" },
      { id: "scifi", label: "Ficção científica", glifo: "foguete", dica: "A frota, o salto e o que espera entre as estrelas" },
      { id: "livre", label: "Universo próprio", glifo: "faiscas", dica: "Você descreve tudo do zero" },
    ],
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
    dominios: [{ dominio: "do Vácuo e do Silêncio", icone: "🌌", temper: ["fria", "paciente"], sinais: { fria: "a geada que escreve nomes no vidro da escotilha" } }],
    cultos: ["a Tripulação"],
    titulos: [
      { titulo: "Passageiro", desc: "Ninguém na doca sabe o seu nome." },
      { titulo: "Lenda da Doca", desc: "O turno da noite conta a sua história." },
      { titulo: "Eco do Casco", desc: "O metal responde quando você passa." },
      { titulo: "Voz do Vácuo", desc: "Um anel inteiro reza na sua frequência." },
      { titulo: "A Própria Estação", desc: "Você é o ar que eles respiram." },
    ],
    /* 6.ª fatia: a trilha da ascensão e as palavras que só a fé dá, na língua da estação */
    estagios: ["Escolhido do Turno", "Casco Vivo", "A Estação Desperta"],
    palavrasDivinas: ["Eco do Casco", "Voz do Vácuo"],
    /* 7.ª fatia: o que um deus faz na estação — sem paladino, sem relicário */
    eventos: [
      { icone: "📡", texto: "{icone} {nome} {dominio} fala pelo casco: um sinal impossível ({sinal}) aparece nos sensores {lugar:de @|do anel}. Os fiéis d{culto} leem nele {sorte:um aviso|uma promessa}.", gancho: "rastrear o sinal até à fonte, antes da manutenção" },
      { icone: "🛰", dois: true, texto: "Disputa de frequência: {nome} {icone} e {nome2} {icone2} brigam pelo mesmo canal de prece {lugar:em @|no anel}.", gancho: "sintonizar um lado silencia o outro" },
      { icone: "🔧", texto: "Os fiéis d{culto} selam as escotilhas {lugar:de @|da doca}: o ar reciclado já não responde a {nome}.", gancho: "alguém sabotou o altar do respirador" },
    ],
  },
  lugares: {
    bancos: {
      "Ópera de estação": { subst: ["Escotilha|f", "Reator|m", "Turbinas|fp"], adj: ["Frio|Fria", "Estelar", "Sem Ar"], compl: ["do Anel 7", "da Doca de Carga"] },
    },
    tipos: {
      mercado: ["Doca de Troca|f", "Bazar|m"], templo: ["Capela|f"], forja: ["Oficina|f"], quartel: ["Posto|m"], cadeia: ["Cela|f"], biblioteca: ["Arquivo|m"],
      docas: ["Hangar|m"], arena: ["Ringue|m"], "cemitério": ["Câmara Fria|f"], guilda: ["Sindicato|m"], "casa de banhos": ["Duchas|fp"],
    },
  },
  racas: {
    fantasia: [
      { nome: "Nascido no Anel", desc: "Criado na gravidade do anel.", bonus: { vigor: 1, percepcao: 1 }, traco: "Olho de corredor: vê no escuro a 9 m.", efeito: { veNoEscuro: 9 } },
    ],
    futuro: [
      { nome: "Tripulante", desc: "Vive de turno em turno.", bonus: { intelecto: 2 }, traco: "Mão de bordo: a bancada fica 3 mais fácil, e sela uma escotilha (2 PM).", efeito: { oficio: 3, dom: { nome: "Selar Escotilha", nivel: 1, custo: 2, tipo: "defesa", descricao: "Fecha a passagem entre você e o perigo." } } },
      { nome: "Clone de Serviço", desc: "Feito para o trabalho que ninguém quer.", bonus: { forca: 1, vigor: 1 }, traco: "Sem medo de fábrica: imune a medo, resiste a raio e o frio tira 1 a menos.", efeito: { imune: ["amedrontado"], resistencia: ["raio"], reduzDano: { gelo: 1 } } },
    ],
    /* 6.ª fatia: o companheiro sorteado na estação é quase sempre da tripulação,
       e o registo dela diz as raças no feminino */
    doCompanheiro: [{ raca: "Tripulante", peso: 3 }, { raca: "Nascido no Anel", peso: 1 }],
    registo: { "tripulanta": "Tripulante", "Nascida no Anel": "Nascido no Anel" },
  },
  /* 6.ª fatia: os oito da estação. O feitio (classe, arma, índole) é vocabulário
     do motor, e fica o dos oito da Taverna; o mundo dá a gente — o id, o nome,
     a raça e o ofício. */
  prontos: copia(DADOS_DO_CENARIO_PADRAO.prontos).map((p, i) => ({
    ...p, id: "o7-" + p.id, nome: p.nome + " da Doca",
    raca: ["Tripulante", "Nascido no Anel", "Clone de Serviço"][i % 3], profissao: i % 2 ? "Piloto" : "Mecânico",
  })),
};

sec("3. outro mundo — a Estação Órbita Sete, sem tocar em módulo");
{
  const o = CN.usarCenario(ORBITA);
  t("o mundo em uso é o novo", CN.cenarioAtivo() === o && o.nome === "Estação Órbita Sete");
  /* 29/10 (trilha A): o cartão de gênero dela diz o seu glifo, e a criação o recebe */
  t("os cartões da criação dela trazem o glifo de cada um", o.generos.criacao.map((g) => g.id + ":" + g.glifo).join() === "opera:foguete,scifi:foguete,livre:faiscas" && K.GENEROS === o.generos.criacao);
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
  /* 7.ª fatia: a prosa do evento é a dela — os moldes de `panteao.eventos` */
  {
    const evs = Array.from({ length: 80 }, (_, i) => DV.gerarEventoDivino({ lugar: i % 2 ? "Anel-7" : "" }, i, pan, G.rngDe("orbita|eventos|" + i))).filter(Boolean);
    const juntos = evs.map((e) => e.texto + " " + e.gancho).join(" ");
    t("os eventos divinos são os três dela, e nenhum é da Taverna", evs.length === 80 && evs.every((e) => ["📡", "🛰", "🔧"].includes(e.icone)) && ["📡", "🛰", "🔧"].every((ic) => evs.some((e) => e.icone === ic)) && !/Paladinos|relicário|Templos|profeta|milagre/.test(juntos), [...new Set(evs.map((e) => e.icone))].join());
    t("…com o lugar e sem ele, nas duas formas que ela escreveu", evs.filter((e, i) => e.icone === "🔧").every((e) => e.texto.includes("de Anel-7:") || e.texto.includes("da doca:")) && juntos.includes("de Anel-7") && juntos.includes("da doca"));
    t("…a sorte escolhe entre as formas dela", juntos.includes("leem nele um aviso") && juntos.includes("leem nele uma promessa"));
    const disputa = evs.find((e) => e.icone === "🛰");
    t("…o evento de dois deuses diz os dois, e nenhuma marca sobra no texto", disputa && pan.filter((d) => disputa.texto.includes(d.nome)).length === 2 && !/[{}]/.test(juntos), disputa && disputa.texto);
    const sos = Array.from({ length: 60 }, (_, i) => DV.gerarEventoDivino({}, i, pan.slice(0, 1), G.rngDe("orbita|so|" + i))).filter(Boolean);
    t("…e com um deus só, a disputa nunca sai (sorteia-se outro)", sos.length === 60 && !sos.some((e) => e.icone === "🛰"));
  }
  /* 29/10 (T4-B) · O GÊNERO DE RECUO É O DO MUNDO. 36 sítios em 18 módulos
     caíam em "Fantasia medieval" quando quem chama não dizia o gênero; agora
     caem em `generos.padrao`. A régua: com a Órbita em uso, a chamada SEM
     gênero responde o mesmo que a chamada com o gênero dela — e a prova
     morde, porque o bestiário corta por gênero: o mesmo pedido com
     "Fantasia medieval" explícito dá outras criaturas. Os sítios de
     `o.genero || …` usam a MESMA expressão que estes parâmetros; a catraca da
     §6 conta-os no código. */
  {
    const { MOLDES } = await import(S + "moldes.js");
    const GU = await import(S + "guildas.js"), CM = await import(S + "comodos.js"), OF = await import(S + "ofertas.js"), RA = await import(S + "raids.js"), SA = await import(S + "saga.js");
    const mapa = G.gerarGeografia("o7|mapa", MOLDES[0]);
    const cid = mapa.cidades[0], reg = mapa.regioes[0];
    const local = MB.locaisDaCidade("o7", cid, "Ópera de estação")[0];
    const RECUOS = [
      ["mundo-base locaisDaCidade", (g) => MB.locaisDaCidade("o7", cid, g)],
      ["mundo-base genteDoLocal", (g) => MB.genteDoLocal("o7", local, g)],
      ["mundo-base segredosDaCidade", (g) => MB.segredosDaCidade("o7", cid, g)],
      ["mundo-base criaturasDaRegiao", (g) => MB.criaturasDaRegiao("o7", reg, g)],
      ["mundo-base chefesDoMundo", (g) => MB.chefesDoMundo("o7", mapa, g)],
      ["mundo-base oQueExisteAqui", (g) => MB.oQueExisteAqui("o7", mapa, cid.nome, null, g)],
      ["mundo-base chaveDoLugar", (g) => MB.chaveDoLugar("o7", mapa, cid.nome, g === undefined ? {} : { genero: g })],
      ["guildas guildasDoMundo", (g) => GU.guildasDoMundo("o7", mapa, g)],
      ["comodos comodosDoLocal", (g) => CM.comodosDoLocal("o7", local, g)],
      ["ofertas ofertasDaqui", (g) => OF.ofertasDaqui({ semente: "o7", mapa, cidade: cid.nome, base: null, genero: g })],
      ["raids convocar", (g) => RA.convocar({ semente: "o7", genero: g })],
      ["raids abrirRaid", (g) => RA.abrirRaid({ semente: "o7", genero: g })],
      ["saga estenderEspinha", (g) => SA.estenderEspinha({ semente: "o7", mapa, genero: g, cidadeInicial: cid.nome })],
    ];
    const resp = (fn) => { try { return JSON.stringify(fn()); } catch (e) { return "ESTOUROU: " + e.message; } };
    const r = (f, g) => resp(() => f(g));
    for (const [nome, f] of RECUOS) {
      const sem = r(f, undefined), dela = r(f, "Ópera de estação");
      t(`recuo: ${nome} sem gênero é o padrão da Órbita`, !sem.startsWith("ESTOUROU") && sem === dela, sem.slice(0, 160));
    }
    t("…e a prova morde: o bestiário da Fantasia medieval explícita é outro", r(RECUOS[3][1], undefined) !== r(RECUOS[3][1], "Fantasia medieval") && r(RECUOS[4][1], undefined) !== r(RECUOS[4][1], "Fantasia medieval"));
  }
  const nomeDe = (sem) => NM.nomePessoa("Ópera de estação", "", G.rngDe(sem));
  t("mesma semente, mesmo mundo: o mesmo nome e o mesmo deus", nomeDe("o7|a") === nomeDe("o7|a") && JSON.stringify(DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") })) === JSON.stringify(DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") })));
  const naOrbita = [nomeDe("o7|a"), DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") }).nome];
  /* 5.ª fatia: os lugares, as raças e as palavras do céu são os dela */
  const ol = ORBITA.lugares.bancos["Ópera de estação"];
  const r2 = G.rngDe("orbita|lugares");
  t("os gêneros com banco de lugares são os dela, e os tipos de local os do motor", TP.generosDaToponimia().join() === "Ópera de estação" && TP.tiposComNome().join() === ["taverna", ...CN.ESQUEMA_DO_CENARIO.tiposDeLocal].join());
  const tav = Array.from({ length: 40 }, () => TP.nomeDeTaverna("Ópera de estação", r2));
  t("as tavernas dela nascem das palavras dela", tav.every((n) => /^(A Escotilha|O Reator|As Turbinas) /.test(n)) && tav.some((n) => n.includes("do Anel 7")), tav.slice(0, 4).join(" · "));
  t("…e com a gramática do motor: o plural concorda (as Turbinas Frias, Estelares), a locução não", tav.filter((n) => n.startsWith("As Turbinas ") && !n.includes(" & ") && !/ d[ao] /.test(n)).every((n) => /^As Turbinas (Frias|Estelares|Sem Ar)$/.test(n)) && tav.some((n) => /^As Turbinas (Frias|Estelares|Sem Ar)$/.test(n)), tav.filter((n) => n.startsWith("As Turbinas")).join(" · "));
  t("o Cyberpunk, que não tem banco de lugares nela, cai no do padrão dela", Array.from({ length: 20 }, () => TP.nomeDeTaverna("Cyberpunk", r2)).every((n) => /^(A Escotilha|O Reator|As Turbinas) /.test(n)));
  const merc = Array.from({ length: 20 }, () => TP.nomeDeLocal("mercado", "Ópera de estação", r2));
  t("o mercado dela é a Doca de Troca ou o Bazar", merc.every((n) => /^(A Doca de Troca|O Bazar) /.test(n)), merc.slice(0, 3).join(" · "));
  t("o tamanho do banco é o das palavras dela", TP.tamanhoDoBanco("taverna", "Ópera de estação") === 3 * (3 + 2 + 3) && TP.tamanhoDoBanco("mercado", "") === 2 * 8 && TP.tamanhoDoBanco("hangar", "") === 0);
  const locs = MB.locaisDaCidade("orbita", { nome: "Anel-7", porte: "cidade" }, "Ópera de estação");
  const doTipo = ORBITA.lugares.tipos;
  t("os locais da cidade dela têm os nomes dela (mundo-base.js não foi tocado)", locs.length > 0 && locs.filter((l) => l.tipo !== "taverna").every((l) => doTipo[l.tipo].some((x) => l.nome.includes(x.split("|")[0]))), locs.map((l) => l.nome).join(" · "));
  t("as raças da criação são as dela, nos dois grupos e nos dois catálogos", C.RACAS.map((r) => r.nome).join() === "Nascido no Anel" && C.ORIGENS.map((r) => r.nome).join() === "Tripulante,Clone de Serviço" && LX.GRUPOS_DE_RACA.fantasia.join() === "Nascido no Anel" && LX.RACAS_DO_SISTEMA.join() === "Nascido no Anel,Tripulante,Clone de Serviço");
  t("a ópera de estação abre a criação nas origens dela, e o Elfo já não existe", C.racasDoGenero("Ópera de estação").map((r) => r.nome).join() === "Tripulante,Clone de Serviço" && C.racaPorNome("Elfo") === null && C.racaPorNome("Tripulante").bonus.intelecto === 2);
  const anel = { raca: "Nascido no Anel" }, trip = { raca: "Tripulante", habilidades: [] }, clone = { raca: "clone de servico" };
  t("o traço dela age pelo motor: o nascido no anel vê no escuro a 9 m", TR.veNoEscuroDeTraco(anel) === 9 && TR.textoDoTraco(anel).includes("9 m") && TR.veNoEscuroDeTraco({ raca: "Elfo" }) === 0);
  t("o Tripulante ganha o dom dela como habilidade, e a bancada fica 3 mais fácil", TR.oficioDeTraco(trip) === 3 && TR.comDom(trip).habilidades.map((h) => h.nome).join() === "Selar Escotilha" && TR.domDe(trip).custo === 2);
  t("o clone (sem acento nem caixa) é imune a medo, resiste a raio e o gelo tira 1 a menos", TR.imuneDeTraco(clone, "amedrontado") && TR.resisteDeTraco(clone, "raio") && TR.reducaoDeTraco(clone, "gelo") === 1 && !TR.imuneDeTraco(clone, "cego"));
  t("a ficha de criação soma o bônus dela", AT.baseDeCriacao({ raca: "Tripulante", atributos: {} }).intelecto === 2 && AT.baseDeCriacao({ raca: "Elfo", atributos: {} }).destreza === 0);
  /* 6.ª fatia: os gêneros da criação são os dela, e o recuo do prompt e do códex também */
  t("a criação oferece os cartões dela (constantes.js GENEROS, ligação viva)", K.GENEROS.map((g) => g.label).join() === "Ópera de estação,Ficção científica,Universo próprio" && K.GENEROS[0].dica.startsWith("Docas"));
  const semMundo = PR.montarSystemPrompt("Órbita", null, FICHA_DO_PROMPT, [], null, "", "", "", "", "", "", "", null);
  t("o mundo que não diz o seu gênero é, no prompt, do gênero padrão dela", semMundo.includes("Gênero: Ópera de estação") && !semMundo.includes("Gênero: Fantasia medieval"));
  const fonteCx = fs.readFileSync(path.join(SRC, "painel-codex.jsx"), "utf8");
  t("o códex cai no gênero padrão do mundo em uso, e não num literal", fonteCx.includes("|| cenarioAtivo().generos.padrao") && !fonteCx.includes('"Fantasia medieval"') && B.criaturasDoGenero(CN.cenarioAtivo().generos.padrao).map((c) => c.nome).join() === "Rato de Duto,Drone de Segurança,Rainha da Colmeia,Capanga");
  /* 6.ª fatia: os prontos e o povo do companheiro são os dela */
  t("o roster é o dela: oito, com os ids dela", R.PRONTOS.length === 8 && R.PRONTOS.every((p) => p.id.startsWith("o7-")) && R.prontoPorId("muralha") === null);
  const muralha = R.montarPronto("o7-muralha");
  const pMuralha = R.prontoPorId("o7-muralha");
  t("o montador já não devolve null noutro mundo: a Muralha da Doca nasce Tripulante e Mecânico", !!muralha && muralha.raca === "Tripulante" && muralha.profissao === "Mecânico" && muralha.nome === "A Muralha da Doca", JSON.stringify(muralha && [muralha.raca, muralha.profissao]));
  t("…com o bônus da raça dela e o dom dela (pelo mesmo comDom da criação)", !!muralha && muralha.atributos.intelecto === pMuralha.atributos.intelecto + 2 && muralha.habilidades.some((h) => h.nome === "Selar Escotilha"));
  t("o clone e o nascido no anel também montam, e o pronto da Taverna já não", [1, 2].every((i) => !!R.montarPronto(R.PRONTOS[i].id)) && R.montarPronto("muralha") === null);
  const povo = Array.from({ length: 200 }, (_, i) => CP.racaDeCompanheiro({ nome: "Tripulante " + i }));
  const nTrip = povo.filter((r) => r === "Tripulante").length;
  t("o companheiro sorteado nasce do povo dela, e pelo peso dela (3 tripulantes para 1 do anel)", povo.every((r) => r === "Tripulante" || r === "Nascido no Anel") && nTrip > 120 && nTrip < 180, String(nTrip));
  t("o registo dela diz as raças no feminino (sem acento nem caixa), e o do padrão já não vale", CP.racaDeCompanheiro({ raca: "TRIPULANTA" }) === "Tripulante" && CP.racaDeCompanheiro({ raca: "nascida no anel" }) === "Nascido no Anel" && CP.racaDeCompanheiro({ raca: "elfa" }) === "elfa");
  t("o companheiro que se diz da estação acha a raça dela no catálogo (lido na hora, não no import)", CP.racaDeCompanheiro({ raca: "nascido no anel" }) === "Nascido no Anel");
  t("o pedido do léxico pede nome para as origens dela", LX.pedidoDoLexico({}).includes("<UM de: Tripulante, Clone de Serviço>"));
  const lexR = { racas: [{ raca: "tripulante", chamado: "Turno-Longo" }, { raca: "Clone de Serviço", chamado: "Cópia" }] };
  t("o léxico gerado para as origens dela não se perde, e a ficha diz o nome do mundo", LX.garantirLexico(lexR).racas.length === 2 && LX.racaNaFicha(lexR, "Tripulante", true) === "Turno-Longo (Tripulante)");
  t("os títulos do céu são os dela, com a física de sempre", DV.tituloDe(2) === "Eco do Casco" && DV.GRAUS[2].fieis === 10000 && DV.GRAUS[2].desc.startsWith("O metal") && DV.grauDe({ ehJogador: true, despertar: true, fieis: 12000 }) === 2);
  t("…e o Narrador lê a escala dela, nas duas linhas que a diziam", DV.DIVINDADE_PROMPT.includes("GD 0–4: Passageiro, Lenda da Doca (1k fiéis), Eco do Casco (10k), Voz do Vácuo (100k), A Própria Estação (1M+).") && /* 6.ª fatia: era "Servo Escolhido → Eco do Casco/Receptáculo" — o título já era
     dela e os estágios eram do código; agora a linha inteira é dela */ DV.DIVINDADE_PROMPT.includes("Escolhido do Turno → Eco do Casco/Casco Vivo → A Estação Desperta") && !DV.DIVINDADE_PROMPT.includes("Semideus"));
  /* 6.ª fatia: as palavras do céu que o Narrador lia escritas no código */
  t("…e os três estágios já não são os da Taverna", !DV.DIVINDADE_PROMPT.includes("Servo Escolhido") && !DV.DIVINDADE_PROMPT.includes("Receptáculo") && !DV.DIVINDADE_PROMPT.includes("Nova Divindade"));
  /* 28/10 (trilha B): o envelope do despertar foi movido à letra do App e
     ainda dizia a trilha da Taverna; o meio da frase é o título do GD 2,
     como sempre foi (lá, "Semideus") */
  {
    const d = EV.oEnvelopeDosPoderes("despertarDivino", DESPERTAR);
    t("o despertar divino diz a trilha dela", d.includes("(Escolhido do Turno → Eco do Casco → A Estação Desperta)"), d.slice(0, 120));
    t("…e nada da trilha da Taverna", !/Servo Escolhido|Semideus|Nova Divindade/.test(d));
  }
  const sysO = PR.montarSystemPrompt("Órbita", { genero: "Ópera de estação" }, FICHA_DO_PROMPT, [], null, "", "", "", "", "", "", "", null);
  t("o prompt do Narrador diz as palavras divinas dela, na regra das três medidas", DV.PALAVRAS_DIVINAS.join() === "Eco do Casco,Voz do Vácuo" && sysO.includes("Palavras divinas (Eco do Casco, Voz do Vácuo) são EXCLUSIVAS da fé") && !sysO.includes("(Semideus, Divindade)"));
  const fria = { nome: "Vera", dominio: "do Vácuo e do Silêncio", icone: "🌌", temperamento: "fria", culto: "a Tripulação de Vera" };
  const sinais = Array.from({ length: 40 }, (_, i) => DV.gerarEventoDivino({}, i, [fria], G.rngDe("orbita|sinal|" + i))).filter((e) => e && e.texto.includes("sinal impossível"));
  t("o deus frio manda o sinal que o domínio dela escreveu", sinais.length > 0 && sinais.every((e) => e.texto.includes("a geada que escreve nomes")), String(sinais.length));
  const paciente = { ...fria, temperamento: "paciente" };
  const semSinal = Array.from({ length: 40 }, (_, i) => DV.gerarEventoDivino({}, i, [paciente], G.rngDe("orbita|sinal|" + i))).filter((e) => e && e.texto.includes("sinal impossível"));
  t("…e o paciente, sem sinal escrito, o fenômeno que ninguém explica", semSinal.length > 0 && semSinal.every((e) => e.texto.includes("fenômeno que ninguém consegue explicar")));
  t("e o banco dos doze da Taverna não vale aqui", LX.garantirLexico({ profissoes: CN.CENARIO_PADRAO.ocupacoes.map((o) => ({ profissao: o.nome, chamado: "x " + o.nome })) }).profissoes.length === 0);

  /* determinismo: a mesma semente e o mesmo mundo, duas vezes */
  const banca = (s) => M.gerarMercador({ cidade: { nome: "Doca", porte: "cidade" }, semente: s, nivel: 4 });
  const a = banca("orbita|1"), b = banca("orbita|1");
  t("mesma semente, mesmo mundo: a mesma banca", JSON.stringify(a) === JSON.stringify(b));
  CN.usarCenario(CN.CENARIO_PADRAO);
  /* e de volta à Taverna, o despertar sai ao byte como o App o escrevia
     (a frase inteira, à letra, de antes de e036f1f) */
  t("de volta ao mundo padrão, o despertar divino sai ao byte como era",
    EV.oEnvelopeDosPoderes("despertarDivino", DESPERTAR) === `[DESPERTAR DIVINO — MARCO REGISTRADO PELO SISTEMA] Ao alcançar o nível 15, o nome do herói começou a ser sussurrado em orações: a ASCENSÃO começou. FATOS FIXOS sorteados pelo sistema: o jogador tem 120 fiéis iniciais (gente que já reza baixinho o nome dele) e GD 0→trilha aberta; o PANTEÃO local que ele agora consegue PERCEBER: Vela (do Vácuo e do Silêncio). Narre o despertar como um marco íntimo e arrepiado (um sinal, um olhar que se demora, uma prece espontânea de um estranho) — NÃO um show de poder: ele ainda é mortal (GD 0), mas o caminho dos três estágios (Servo Escolhido → Semideus → Nova Divindade) está aberto. As divindades acima já existiam — só agora ele as sente. Apresente UMA delas de leve neste turno.`);
  const p = banca("orbita|1");
  t("a mesma semente noutro mundo: as mesmas coisas, outros preços", a.estoque.map((x) => x.nome).join() === p.estoque.map((x) => x.nome).join() && a.estoque.map((x) => x.preco).join() !== p.estoque.map((x) => x.preco).join());
  t("…os cartões da criação também, e o recuo do prompt", K.GENEROS.length === 7 && K.GENEROS[0].label === "Fantasia medieval" && PR.montarSystemPrompt("x", null, FICHA_DO_PROMPT, [], null, "", "", "", "", "", "", "", null).includes("Gênero: Fantasia medieval"));
  t("…o céu do prompt também (os estágios e as palavras divinas)", DV.DIVINDADE_PROMPT.includes("(Servo Escolhido → Semideus/Receptáculo → Nova Divindade)") && PR.montarSystemPrompt("x", null, FICHA_DO_PROMPT, [], null, "", "", "", "", "", "", "", null).includes("Palavras divinas (Semideus, Divindade) são"));
  t("…o roster e o povo do companheiro também", R.PRONTOS.length === 8 && R.prontoPorId("muralha").raca === "Goliath" && R.montarPronto("o7-muralha") === null && CP.RACAS_DO_COMPANHEIRO.length === 8 && CP.racaDeCompanheiro({ raca: "elfa" }) === "Elfo");
  t("e de volta ao padrão, tudo como era", C.PROFISSOES.length === 12 && E.precoComum("caneca") === 1 && E.valorDeItem({ raridade: "raro" }) === 220);
  t("…o bestiário também", B.CRIATURAS_FANTASIA.length === 18 && B.ARQUETIPOS.length === 9 && B.completarInimigo({ nome: "Troll" }, 5).perfil.fraqueza.join() === "fogo");
  t("…a gente e o céu também (e a mesma semente dá outro nome noutro mundo)", NM.generosDisponiveis().length === 6 && NM.sexoDoNome("Aldric") === "masc" && NM.TRACOS_PESSOA.length === 26 && [NM.nomePessoa("Ópera de estação", "", G.rngDe("o7|a")), DV.gerarDivindade({}, 1, { sorte: G.rngDe("o7|d") }).nome].every((n, i) => n !== naOrbita[i]));
  t("…os lugares, as raças e o céu também", TP.generosDaToponimia().length === 6 && C.RACAS.length === 10 && C.ORIGENS.length === 6 && LX.RACAS_DO_SISTEMA.length === 16 && DV.tituloDe(2) === "Semideus" && DV.DIVINDADE_PROMPT.includes("Semideus (10k)") && TR.veNoEscuroDeTraco({ raca: "Elfo" }) === 18 && CP.racaDeCompanheiro({ raca: "elfo" }) === "Elfo");
  t("…os eventos divinos também (os paladinos e o relicário voltam)", Array.from({ length: 40 }, (_, i) => DV.gerarEventoDivino({ lugar: "Coroa" }, i, [{ nome: "Vela", dominio: "da Lua e dos Segredos", icone: "🌙", temperamento: "gentil", culto: "a Ordem de Vela" }], G.rngDe("padrao|ev|" + i))).some((e) => e && e.texto === "Paladinos da Ordem de Vela chegam a Coroa caçando um relicário roubado de Vela. Oferecem recompensa em bênçãos (PF) a quem ajudar."));
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
  /* 5.ª fatia: os TÍTULOS da escala passaram ao cenário (`titulos`), e a
     escala em si continua do motor — por isso `graus` continua recusado */
  caso("a escala de graus no cenário (é regra, fica no motor)", (d) => { d.panteao.graus = [{ gd: 0, titulo: "Tripulante" }]; }, "panteao.graus: campo desconhecido");
  caso("faltam os títulos dos graus", (d) => { delete d.panteao.titulos; }, "panteao.titulos: falta (lista)");
  /* 7.ª fatia: os eventos divinos e o molde de cada frase */
  caso("faltam os eventos divinos", (d) => { delete d.panteao.eventos; }, "panteao.eventos: falta (lista)");
  caso("um céu sem evento", (d) => { d.panteao.eventos = []; }, "panteao.eventos: precisa de ao menos 1 evento");
  caso("um evento sem gancho", (d) => { delete d.panteao.eventos[2].gancho; }, "panteao.eventos[2].gancho: falta");
  caso("um evento com campo que o motor não lê", (d) => { d.panteao.eventos[0].peso = 2; }, "panteao.eventos[0].peso: campo desconhecido");
  caso("uma marca que o motor não conhece", (d) => { d.panteao.eventos[0].texto += " {templo}"; }, "panteao.eventos[0].texto: marca desconhecida {templo}");
  caso("o lugar sem o @", (d) => { d.panteao.eventos[2].texto = "Selam {lugar:a doca|o anel}."; }, "panteao.eventos[2].texto: {lugar} leva duas formas");
  caso("a sorte com uma forma só", (d) => { d.panteao.eventos[0].gancho = "{sorte:sempre}"; }, "panteao.eventos[0].gancho: {sorte} leva duas formas ou mais");
  caso("o segundo deus num evento de um só", (d) => { d.panteao.eventos[2].texto += " E {nome2} ri."; }, "panteao.eventos[2].texto: {nome2} é do segundo deus");
  caso("uma forma numa marca que não leva", (d) => { d.panteao.eventos[2].texto = "{nome:o deus}"; }, "panteao.eventos[2].texto: {nome} não leva formas");
  caso("uma chave solta", (d) => { d.panteao.eventos[2].texto = "As escotilhas de {nome se fecham."; }, "panteao.eventos[2].texto: chave solta");
  caso("o evento de dois que não é booleano", (d) => { d.panteao.eventos[1].dois = "sim"; }, "panteao.eventos[1].dois: devia ser verdadeiro ou falso");
  caso("quatro títulos para cinco graus", (d) => { d.panteao.titulos.pop(); }, "panteao.titulos: são 5, um por grau (GD 0 a 4), e vieram 4");
  caso("um título sem frase", (d) => { delete d.panteao.titulos[2].desc; }, "panteao.titulos[2].desc: falta");
  caso("os fiéis do grau no título (é física)", (d) => { d.panteao.titulos[1].fieis = 500; }, "panteao.titulos[1].fieis: campo desconhecido");
  caso("o sinal de um temperamento que o domínio não tem", (d) => { d.panteao.dominios[0].sinais["colérica"] = "raios"; }, 'panteao.dominios[0].sinais["colérica"]: temperamento que este domínio não tem');
  caso("um sinal que não é texto", (d) => { d.panteao.dominios[0].sinais.fria = 3; }, "panteao.dominios[0].sinais: devia ser objeto de textos");
  /* 5.ª fatia: os lugares */
  const L0 = 'lugares.bancos["Ópera de estação"]';
  caso("faltam os lugares", (d) => { delete d.lugares; }, "lugares: falta (objeto)");
  caso("o gênero padrão sem banco de lugares", (d) => { d.lugares.bancos = { Cyberpunk: d.lugares.bancos["Ópera de estação"] }; }, 'lugares.bancos: falta o banco do gênero padrão (generos.padrao, "Ópera de estação")');
  caso("um substantivo com gênero que não existe", (d) => { d.lugares.bancos["Ópera de estação"].subst = ["Escotilha|x"]; }, L0 + ".subst: devia ser lista de substantivos");
  caso("um adjetivo com três formas", (d) => { d.lugares.bancos["Ópera de estação"].adj = ["Frio|Fria|Frios"]; }, L0 + ".adj: devia ser lista de adjetivos");
  caso("sem complemento", (d) => { d.lugares.bancos["Ópera de estação"].compl = []; }, L0 + ".compl: devia ser lista de textos, com ao menos um");
  caso("um tipo de local sem substantivo", (d) => { delete d.lugares.tipos.docas; }, "lugares.tipos.docas: falta");
  caso("um tipo de local que o motor não pede", (d) => { d.lugares.tipos.hangar = ["Hangar|m"]; }, "lugares.tipos.hangar: campo desconhecido");
  caso("os nomes prontos de taverna (a toponímia combina, não sorteia lista)", (d) => { d.lugares.bancos["Ópera de estação"].tavernas = ["O Vácuo"]; }, L0 + ".tavernas: campo desconhecido");
  /* 5.ª fatia: as raças */
  caso("faltam as raças", (d) => { delete d.racas; }, "racas: falta (objeto)");
  caso("mundo sem raça de fantasia", (d) => { d.racas.fantasia = []; }, "racas.fantasia: precisa de ao menos 1 raça");
  caso("gêneros do futuro sem origem", (d) => { d.racas.futuro = []; }, "racas.futuro: precisa de ao menos 1 origem, porque generos.futuristas não está vazio");
  caso("uma raça sem bônus", (d) => { delete d.racas.fantasia[0].bonus; }, "racas.fantasia[0].bonus: falta");
  caso("um bônus num atributo que não existe", (d) => { d.racas.fantasia[0].bonus = { sorte: 1 }; }, "racas.fantasia[0].bonus: devia ser objeto de atributos do motor");
  caso("um bônus quebrado", (d) => { d.racas.fantasia[0].bonus.vigor = 1.5; }, "racas.fantasia[0].bonus: devia ser objeto de atributos do motor");
  caso("um traço fora do vocabulário", (d) => { d.racas.fantasia[0].efeito.voar = true; }, "racas.fantasia[0].efeito.voar: campo desconhecido");
  caso("vantagem num atributo que não existe", (d) => { d.racas.futuro[0].efeito.vantagem = ["sorte"]; }, "racas.futuro[0].efeito.vantagem: devia ser lista de atributos do motor");
  caso("imune a uma condição que não existe", (d) => { d.racas.futuro[1].efeito.imune = ["tedio"]; }, "racas.futuro[1].efeito.imune: devia ser lista de condições ruins do motor");
  caso("imune a uma condição boa (imunidade ao que ajuda não é traço)", (d) => { d.racas.futuro[1].efeito.imune = ["abencoado"]; }, "racas.futuro[1].efeito.imune: devia ser lista de condições ruins");
  caso("redução de um dano que não existe", (d) => { d.racas.futuro[1].efeito.reduzDano = { acido: 1 }; }, "racas.futuro[1].efeito.reduzDano: devia ser objeto de tipos de dano do motor");
  caso("visão no escuro negativa", (d) => { d.racas.fantasia[0].efeito.veNoEscuro = -9; }, "racas.fantasia[0].efeito.veNoEscuro: devia ser número ≥ 0");
  caso("um dom sem custo", (d) => { delete d.racas.futuro[0].efeito.dom.custo; }, "racas.futuro[0].efeito.dom.custo: falta");
  caso("um dom de um tipo que não existe", (d) => { d.racas.futuro[0].efeito.dom.tipo = "magia"; }, "racas.futuro[0].efeito.dom.tipo: devia ser um tipo de habilidade do motor");
  /* 6.ª fatia: o roster e o povo apontam para a gente deste mundo */
  caso("a criação sem gêneros", (d) => { d.generos.criacao = []; }, "generos.criacao: precisa de ao menos 1 gênero");
  caso("um cartão sem dica", (d) => { delete d.generos.criacao[1].dica; }, "generos.criacao[1].dica: falta");
  caso("dois cartões com o mesmo rótulo", (d) => { d.generos.criacao[2].label = "Ópera de estação"; }, 'generos.criacao[2].label: "Ópera de estação" repetido');
  caso("o gênero padrão fora da criação", (d) => { d.generos.criacao.shift(); }, 'generos.padrao: "Ópera de estação" não é gênero da criação');
  caso("um gênero do futuro fora da criação", (d) => { d.generos.futuristas.push("Cyberpunk"); }, 'generos.futuristas[2]: "Cyberpunk" não é gênero da criação');
  caso("dois estágios na ascensão", (d) => { d.panteao.estagios.pop(); }, "panteao.estagios: são 3");
  caso("as palavras divinas vazias", (d) => { d.panteao.palavrasDivinas = []; }, "panteao.palavrasDivinas: devia ser lista de textos, com ao menos um");
  caso("faltam os prontos", (d) => { delete d.prontos; }, "prontos: falta (lista)");
  caso("sete prontos", (d) => { d.prontos.pop(); }, "prontos: são 8");
  caso("um pronto de uma raça de outro mundo", (d) => { d.prontos[0].raca = "Goliath"; }, 'prontos[0].raca: "Goliath" não é raça deste mundo');
  caso("um pronto de um ofício de outro mundo", (d) => { d.prontos[3].profissao = "Ferreiro"; }, 'prontos[3].profissao: "Ferreiro" não é ocupação deste mundo');
  caso("dois prontos com o mesmo id", (d) => { d.prontos[5].id = d.prontos[4].id; }, "prontos[5].id");
  caso("um pronto sem índole", (d) => { delete d.prontos[2].indole.proposito; }, "prontos[2].indole.proposito: falta");
  caso("um pronto com atributo que o motor não tem", (d) => { d.prontos[1].atributos.sorte = 1; }, "prontos[1].atributos: devia ser objeto de atributos do motor");
  caso("o companheiro sem povo", (d) => { d.racas.doCompanheiro = []; }, "racas.doCompanheiro: precisa de ao menos 1 povo");
  caso("um povo de uma raça de outro mundo", (d) => { d.racas.doCompanheiro[0].raca = "Elfo"; }, 'racas.doCompanheiro[0].raca: "Elfo" não é raça deste mundo');
  caso("um povo de peso zero", (d) => { d.racas.doCompanheiro[1].peso = 0; }, "racas.doCompanheiro[1].peso: devia ser número inteiro ≥ 1");
  caso("o registo que diz uma raça de outro mundo", (d) => { d.racas.registo.elfa = "Elfo"; }, 'racas.registo["elfa"]: "Elfo" não é raça deste mundo');
  caso("uma origem com o nome de uma raça (sem olhar a caixa)", (d) => { d.racas.futuro[1].nome = "NASCIDO NO ANEL"; }, 'racas.futuro[1].nome: "NASCIDO NO ANEL" repetido');
  caso("um terceiro grupo de raças", (d) => { d.racas.magia = []; }, "racas.magia: campo desconhecido");
  /* 6.ª fatia: sem origens, o povo do companheiro e os oito só podem ser da
     raça que sobra — o mundo sem futuro continua válido, com a gente dele */
  const semFuturo = { ...copia(ORBITA), generos: { ...copia(ORBITA.generos), futuristas: [] }, racas: { fantasia: copia(ORBITA.racas.fantasia), futuro: [], doCompanheiro: [{ raca: "Nascido no Anel", peso: 1 }], registo: {} } };
  semFuturo.prontos.forEach((p) => { p.raca = "Nascido no Anel"; });
  t("um mundo sem futuro pode vir sem origens", CN.validarCenario(semFuturo).ok, CN.validarCenario(semFuturo).erros.join(" | "));
  const v = CN.validarCenario({ formato: 1, id: "x" });
  t("a validação devolve todos os erros de uma vez", !v.ok && v.erros.length >= 3 && v.erros.some((e) => e.startsWith("nome")) && v.erros.some((e) => e.startsWith("precos")) && v.erros.some((e) => e.startsWith("ocupacoes")));
  t("o padrão e o mundo de teste passam", CN.validarCenario(DADOS_DO_CENARIO_PADRAO).ok && CN.validarCenario(ORBITA).ok);

  const antes = CN.cenarioAtivo();
  let caiu = false;
  try { CN.usarCenario({ ...copia(ORBITA), ocupacoes: [] }); } catch { caiu = true; }
  t("trocar por um mundo inválido não troca nada", caiu && CN.cenarioAtivo() === antes && C.PROFISSOES.length === 12 && LX.PROFISSOES_DO_SISTEMA.length === 12 && B.CRIATURAS_FANTASIA.length === 18 && NM.generosDisponiveis().length === 6 && NM.TRACOS_PESSOA.length === 26 && TP.generosDaToponimia().length === 6 && C.RACAS.length === 10 && DV.tituloDe(2) === "Semideus");
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
  t("as raças, os grupos do léxico e a escala divina saem congelados", Object.isFrozen(C.RACAS) && Object.isFrozen(C.RACAS[0].bonus) && Object.isFrozen(C.ORIGENS) && Object.isFrozen(LX.GRUPOS_DE_RACA) && Object.isFrozen(LX.GRUPOS_DE_RACA.fantasia) && Object.isFrozen(LX.RACAS_DO_SISTEMA) && Object.isFrozen(DV.GRAUS) && Object.isFrozen(DV.GRAUS[2]));
  const domD = TR.domDe({ raca: "Draconato" });
  domD.custo = 0;
  t("o dom entregue é do chamador: mexer nele não mexe na raça", TR.domDe({ raca: "Draconato" }).custo === 3);
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
  const rotulos = K.GENEROS.map((g) => g.label);
  t("o gênero padrão e os do futuro são gêneros da criação (constantes.js GENEROS)", rotulos.includes(CN.CENARIO_PADRAO.generos.padrao) && CN.CENARIO_PADRAO.generos.futuristas.every((g) => rotulos.includes(g)));
  t("o léxico e a criação nunca discordam do corte (todos os gêneros, dois mundos)", [CN.CENARIO_PADRAO, CN.carregarCenario(ORBITA)].every((m) => { CN.usarCenario(m); return [...rotulos, "Ópera de estação", "", "x"].every((g) => LX.racasDoMundo(g).join() === C.racasDoGenero(g).map((r) => r.nome).join()); }));
  CN.usarCenario(CN.CENARIO_PADRAO);
  t("as marcas do padrão estão escritas sem acento (a descrição é comparada assim)", CN.CENARIO_PADRAO.generos.marcasProprias.every((rx) => rx === rx.normalize("NFD").replace(/[\u0300-\u036f]/g, "") && rx === rx.toLowerCase()));
  const fonteLex = fs.readFileSync(path.join(SRC, "lexico.js"), "utf8"), fonteCla = fs.readFileSync(path.join(SRC, "classes.js"), "utf8");
  const fonteK = fs.readFileSync(path.join(SRC, "constantes.js"), "utf8");
  t("os cartões da criação já não são literais em constantes.js, nem o recuo do prompt em prompt.js (6.ª fatia)", !fonteK.includes('label: "Fantasia medieval"') && !fonteK.includes("Vapor, engrenagens") && !fs.readFileSync(path.join(SRC, "prompt.js"), "utf8").includes('genero: "Fantasia medieval"'));
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
  /* CAMINHOS_PROMPT e DIVINDADE_PROMPT entram na lista (29/10, a peça do pedido, src/motor/pedido-do-turno.js):
     são texto de regra que o pedido ao Narrador leva, não dado do céu; DIVINDADE_PROMPT é `let`, refeito
     quando o cenário muda (e036f1f), e o import é vivo — a peça lê sempre o do cenário em uso. */
  t("…e de divindades.js só funções e as tabelas da regra (nenhum dado do céu)", doDv.length > 0 && doDv.every((n) => typeof DV[n] === "function" || ["GRAUS", "MAGNITUDE_FE", "MILAGRES", "CAMINHOS_ASCENSAO", "CAMINHOS_PROMPT", "DIVINDADE_PROMPT"].includes(n)), doDv.join());
  t("o padrão: seis bancos, na ordem da criação (o Universo próprio cai no do padrão), e o do gênero padrão entre eles", NM.generosDisponiveis().length === 6 && NM.generosDisponiveis().every((g, i) => g === rotulos[i]) && !NM.generosDisponiveis().includes("Universo próprio") && rotulos.includes(CN.CENARIO_PADRAO.generos.padrao));
  t("o céu do padrão: 16 × 14 nomes, 12 domínios, 7 cultos", CN.CENARIO_PADRAO.panteao.nomes.inicio.length === 16 && CN.CENARIO_PADRAO.panteao.nomes.fim.length === 14 && CN.CENARIO_PADRAO.panteao.dominios.length === 12 && CN.CENARIO_PADRAO.panteao.cultos.length === 7);
  t("os campos de um banco são os que nomes.js lê (b.campo), nem mais nem menos", [...new Set([...fonteNm.matchAll(/\b(?:b|bancoDe\(g\))\.(\w+)/g)].map((m) => m[1]))].sort().join() === Object.keys(CN.ESQUEMA_DO_CENARIO.banco).sort().join(), [...new Set([...fonteNm.matchAll(/\b(?:b|bancoDe\(g\))\.(\w+)/g)].map((m) => m[1]))].sort().join());
  t("as faixas do padrão estão escritas na escala que o Narrador lê", CN.CENARIO_PADRAO.precos.comuns.filter((c) => c.faixa && c.faixa[0] !== c.faixa[1]).every((c) => E.ECONOMIA_PROMPT.includes(`◉ ${c.faixa[0]}–${c.faixa[1]}`)));

  /* 5.ª fatia: o vocabulário das raças e dos lugares é o do motor, e nada ficou literal */
  const fonteTr = fs.readFileSync(path.join(SRC, "tracos.js"), "utf8");
  const lidosTr = [...new Set([...fonteTr.matchAll(/efeitoDe\(pers\)\.(\w+)/g)].map((m) => m[1]))].sort();
  t("o vocabulário do traço é o que tracos.js lê, nem mais nem menos", lidosTr.join() === Object.keys(EQ.efeitoDeRaca).sort().join(), lidosTr.join());
  t("os atributos do esquema são os de constantes.js", EQ.atributos.join() === ATRIBUTOS.map((a) => a.id).join());
  t("as condições do esquema são as ruins de condicoes.js (das boas, imunidade não é traço)", EQ.condicoes.join() === Object.values(CD.CONDICOES).filter((c) => c.tipo === "ruim").map((c) => c.id).join());
  const tiposHab = new Set(C.CLASSES.flatMap((c) => (c.habilidades || []).map((h) => h.tipo)));
  t("os tipos de habilidade do esquema cobrem os da árvore", tiposHab.size > 0 && [...tiposHab].every((x) => EQ.tiposDeHabilidade.includes(x)), [...tiposHab].join());
  t("toda raça do padrão usa só o vocabulário, e o dom tem a forma da árvore", [...CN.CENARIO_PADRAO.racas.fantasia, ...CN.CENARIO_PADRAO.racas.futuro].every((r) => Object.keys(r.efeito).every((k) => k in EQ.efeitoDeRaca) && (!r.efeito.dom || EQ.tiposDeHabilidade.includes(r.efeito.dom.tipo))));
  const fonteMb = fs.readFileSync(path.join(SRC, "mundo-base.js"), "utf8");
  const blocoLocais = fonteMb.slice(fonteMb.indexOf("const LOCAIS = ["), fonteMb.indexOf("];", fonteMb.indexOf("const LOCAIS = [")));
  const tiposMb = [...new Set([...blocoLocais.matchAll(/tipo: "([^"]+)"/g)].map((m) => m[1]))].filter((x) => x !== "taverna").sort();
  t("os tipos de local do esquema são os que mundo-base.js pede (a taverna tem banco próprio)", tiposMb.join() === [...EQ.tiposDeLocal].sort().join(), tiposMb.join());
  t("o padrão: seis bancos de lugares, os mesmos gêneros dos nomes", TP.generosDaToponimia().join() === NM.generosDisponiveis().join());
  const fonteTp = fs.readFileSync(path.join(SRC, "toponimia.js"), "utf8");
  t("nenhuma palavra de lugar ficou literal em toponimia.js (bancos, sinônimos, o padrão)", !["\"Javali|m\"", "\"Rachado|Rachada\"","\"das Cinzas\"", "\"Zepelim|m\"", "\"Praça|f\"", "\"Termas|fp\""].some((x) => fonteTp.includes(x)) && !/\|\| FANTASIA/.test(fonteTp));
  const fontePr = fs.readFileSync(path.join(SRC, "prontos.js"), "utf8"), fonteCp = fs.readFileSync(path.join(SRC, "companheiros.js"), "utf8");
  t("nenhum pronto ficou literal em prontos.js, nem o povo do companheiro em companheiros.js (6.ª fatia)", !["\"A Muralha\"", "\"Goliath\"", "\"Espada Longa\"", "nome_na_lamina"].some((x) => fontePr.includes(x)) && !["{ raca: \"Halfling\", peso", "elfa: \"Elfo\"", "\"meio-elfa\""].some((x) => fonteCp.includes(x)));
  t("o roster do padrão tem os oito, e cada um monta (raça e ofício do mundo)", CN.CENARIO_PADRAO.prontos.length === EQ.exato.prontos && R.PRONTOS.every((p) => !!R.montarPronto(p.id) && R.profissaoValida(p.profissao)));
  t("o povo do companheiro e o registo do padrão só dizem raças da criação", CN.CENARIO_PADRAO.racas.doCompanheiro.every((p) => !!C.racaPorNome(p.raca)) && Object.values(CN.CENARIO_PADRAO.racas.registo).every((r) => !!C.racaPorNome(r)));
  t("nenhuma raça ficou literal em classes.js nem em lexico.js", !["\"Goliath\"", "\"Meio-orc\"", "\"Colono Orbital\"", "\"Vagante\""].some((x) => fonteCla.includes(x) || fonteLex.includes(x)) && !fonteCla.includes("Sopro Ancestral"));
  const fontePrm = fs.readFileSync(path.join(SRC, "prompt.js"), "utf8");
  t("nem os três estágios em divindades.js, nem as palavras divinas em prompt.js (6.ª fatia)", !["Servo Escolhido", "Nova Divindade", "/Receptáculo"].some((x) => fonteDv.includes(x)) && !fontePrm.includes("(Semideus, Divindade)"));
  t("nem os títulos da escala nem o sinal da tempestade em divindades.js", !["\"Semideus\"", "\"Herói Lendário\"", "Semideus (10k)", "\"colérica\"", "escrevem runas"].some((x) => fonteDv.includes(x)));
  t("a escala do cenário tem um título por grau da física", CN.CENARIO_PADRAO.panteao.titulos.length === DV.GRAUS.length && EQ.exato.titulos === DV.GRAUS.length && DV.GRAUS.every((g, i) => g.gd === i && g.titulo === CN.CENARIO_PADRAO.panteao.titulos[i].titulo));
  t("o sinal da tempestade é do domínio das Tempestades, e de um temperamento dele", CN.CENARIO_PADRAO.panteao.dominios.filter((x) => x.sinais).map((x) => x.dominio + ":" + Object.keys(x.sinais).join()).join() === "das Tempestades:colérica");
  const doTp = importados("toponimia"), doCl = importados("classes"), doLx = importados("lexico"), doTr = importados("tracos");
  t("o motor não copia lugar nem raça no import (só funções, se as importa)", [[doTp, TP], [doCl, C], [doLx, LX], [doTr, TR]].every(([nomes, mod]) => nomes.every((n) => typeof mod[n] === "function")), [...doTp, ...doCl, ...doLx, ...doTr].join());

  /* 29/10 (T4-B) · A CATRACA DO RECUO. Os 36 sítios que caíam no literal
     contam-se aqui, arquivo a arquivo, e o literal só pode morar onde é DADO
     ou memória: o cenário padrão; a chave do TOM das tavernas e dois
     comentários (nomes.js, lexico.js); o comentário do caminho (cenario.js);
     e o generoPadrao dos três moldes de fantasia (moldes.js), que só o
     App lê — é da trilha A, e fica dito no diário. */
  {
    /* 29/10 (Fase 4, trilha B): + motor/pauta-do-turno.js, 1 — o `generoMundo`
       que veio do App à letra trazia o literal (o App é da trilha A e não
       entrou na T4-B); na peça é o padrão do cenário, e passam a ser 37. */
    const RECUO_POR_ARQUIVO = { "abertura.js": 1, "batidas.js": 1, "cidade-por-dentro.js": 1, "comodos.js": 1, "companheiro-inicial.js": 1, "elenco.js": 1, "gente-por-dentro.js": 6, "geradores.js": 1, "guildas.js": 1, "mundo-base.js": 7, "nucleo.js": 1, "ofertas.js": 2, "raids.js": 2, "regiao.js": 6, "saga.js": 1, "subtramas.js": 1, "tarefas-antigas.js": 1, "motor/combate-do-turno.js": 1, "motor/pauta-do-turno.js": 1 };
    const LITERAL_PERMITIDO = { "cenario-padrao.js": 5, "nomes.js": 2, "lexico.js": 1, "cenario.js": 1, "moldes.js": 3 };
    const conta = (txt, x) => txt.split(x).length - 1;
    const arquivos = [...fs.readdirSync(SRC).filter((n) => n.endsWith(".js")), ...fs.readdirSync(path.join(SRC, "motor")).filter((n) => n.endsWith(".js")).map((n) => "motor/" + n)];
    const fora = arquivos.filter((n) => conta(fs.readFileSync(path.join(SRC, n), "utf8"), '"Fantasia medieval"') !== (LITERAL_PERMITIDO[n] || 0));
    t("nenhum recuo \"Fantasia medieval\" literal em src/*.js (só dado e memória)", fora.length === 0, fora.join());
    const torto = Object.entries(RECUO_POR_ARQUIVO).filter(([n, k]) => conta(fs.readFileSync(path.join(SRC, n), "utf8"), "cenarioAtivo().generos.padrao") !== k);
    t("…e os 37 recuos são o gênero padrão do mundo em uso, arquivo a arquivo", torto.length === 0 && Object.values(RECUO_POR_ARQUIVO).reduce((a, b) => a + b, 0) === 37, torto.map(([n]) => n).join());
    t("nem a prosa dos eventos divinos em divindades.js (7.ª fatia)", !["Paladinos", "relicário roubado", "Templos rivais", "profeta menor", "três noites seguidas", "praça pública"].some((x) => fonteDv.includes(x)) && CN.CENARIO_PADRAO.panteao.eventos.length === 6);
  }

  /* um catálogo que estoura a meio da troca não deixa meio mundo de cada lado */
  CN.aoTrocarDeCenario((c) => { if (c.id === "explode") throw new Error("catálogo de teste"); });
  let caiu = false;
  try { CN.usarCenario({ ...copia(ORBITA), id: "explode" }); } catch { caiu = true; }
  t("se um catálogo estoura, todos voltam ao mundo de antes", caiu && CN.cenarioAtivo() === CN.CENARIO_PADRAO && C.PROFISSOES.length === 12 && E.precoComum("caneca") === 1);
}

console.log(`\ncenário (T4-B): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
