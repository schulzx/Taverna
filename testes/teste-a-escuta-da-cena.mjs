/* teste-a-escuta-da-cena.mjs (M5 · 18/11/2026) — «a escuta da cena».

   O módulo é src/motor/a-escuta-da-cena.js: quando o catálogo (`lerAcao`)
   não ouve ato nenhum e há cena, a régua pede esta segunda escuta, que lê a
   ESTRUTURA da frase (a moldura, a fala que pede, o ato sem o verbo do
   catálogo, a pergunta que é gesto) e devolve o veredito do próprio
   catálogo. A escuta não decide se rola — a régua decide, pela cena.

   Quatro provas:
   1. as tabelas são o que dizem ser, e a frase traduzida é sempre uma que
      o catálogo ouve;
   2. cada porta, com uma frase nossa (nenhuma do exame) e a cena que a abre
      ou a fecha;
   3. sem cena não há escuta (a régua sem cena é o Mestre de hoje);
   4. a CATRACA dos nossos corpus: com uma cena generosa (um estranho, algo
      escondido, um assunto raro), quanto a escuta ouve do que o catálogo
      perde, e quanto ela ouve onde o rótulo diz «sem teste». */
import fs from "node:fs";
import { lerAcao, comoSeDiz } from "../src/desafios.js";
import {
  MOLDURAS_DO_ATO, ATO_EM_SUBSTANTIVO, FORMAS_DA_FALA, FORMAS_DO_ATO, PERGUNTAS_QUE_SAO_GESTO, PLURAL_QUE_FICA,
  escutarComCena,
  ESCRITA_DA_MESA, MOLDURAS_COMO_SINAL, molduraDe, PRESENTE_IRREGULAR, noPresente, CONECTORES_DE_ATOS, atosDaFrase,
  PERICIA_NOMEADA, periciaNomeada, MOLDURA_DO_PALPITE, PERGUNTA_DE_INFORMACAO, PALPITE_DA_CENA,
} from "../src/motor/a-escuta-da-cena.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const HEROI = { nivel: 1, inventario: ["Gazua"], habilidades: [], equipado: { arma: "Espada curta" }, moedas: 50 };
const CTX = { personagem: HEROI, semente: "teste-a-escuta", lugar: "Largo do Cereal", tentativas: {}, dia: 1 };
const P = (papel, ...estados) => ({ nome: "", papel, estados });
const cenaDe = (o) => ({ pessoas: [], criaturas: [], coisas: [], cena: { estados: [] }, ...o });
const ouve = (frase, cena) => escutarComCena(frase, cena, CTX);
const idDe = (frase, cena) => { const v = ouve(frase, cena); return v ? v.id : null; };

sec("1. as tabelas");
{
  t("as molduras são regex com o ato no primeiro grupo", MOLDURAS_DO_ATO.length >= 5 && MOLDURAS_DO_ATO.every((rx) => rx instanceof RegExp && /\(\.\+\)/.test(rx.source)));
  t("o ato em substantivo troca por um verbo", ATO_EM_SUBSTANTIVO.every((x) => x.rx instanceof RegExp && typeof x.por === "string" && x.por.length > 2));
  const todas = [...FORMAS_DA_FALA, ...FORMAS_DO_ATO, ...PERGUNTAS_QUE_SAO_GESTO];
  t("toda forma diz o desafio do catálogo e tem uma regex", todas.every((f) => typeof f.id === "string" && f.rx instanceof RegExp));
  t("toda forma sem «sobre» tem a frase que o catálogo ouve (comoSeDiz), e o catálogo a ouve como esse desafio",
    todas.filter((f) => !f.sobre).every((f) => { const v = lerAcao(comoSeDiz(f.id), CTX); return v && v.tipo === "teste" && v.id === f.id; }),
    todas.filter((f) => !f.sobre).filter((f) => { const v = lerAcao(comoSeDiz(f.id), CTX); return !(v && v.tipo === "teste" && v.id === f.id); }).map((f) => f.id).join(","));
  t("a fala diz o verbo do catálogo à frente da frase", FORMAS_DA_FALA.every((f) => typeof f.diz === "string" && /:$/.test(f.diz)));
  t("o plural que fica é de verbos que não são ação de ninguém", PLURAL_QUE_FICA.includes("vamos") && PLURAL_QUE_FICA.every((p) => /(amos|emos|imos|omos)$/.test(p)));
  t("as tabelas são congeladas", [MOLDURAS_DO_ATO, ATO_EM_SUBSTANTIVO, FORMAS_DA_FALA, FORMAS_DO_ATO, PERGUNTAS_QUE_SAO_GESTO, PLURAL_QUE_FICA].every(Object.isFrozen)
    && todas.every(Object.isFrozen));
}

sec("2. as portas");
{
  const nada = cenaDe({});
  /* a moldura */
  t("«dá pra eu…?» sai, e o ato de dentro é ouvido", idDe("dá pra eu escalar a árvore?", nada) === "escalar" && idDe("dá pra eu trepar na árvore?", nada) === "escalar");
  t("«será que consigo…» e «queria ver se…» também", idDe("será que consigo nadar até a ilha?", nada) === "nadar" && idDe("queria ver se consigo escalar o paredão", nada) === "escalar");
  t("a porta da moldura fica escrita no veredito", (ouve("posso me esconder atrás da carroça?", nada) || {}).escuta === "moldura");
  t("«dar uma intimidada» vira intimidar", idDe("dá pra eu dar uma intimidada no ferreiro?", cenaDe({ pessoas: [P("ferreiro")] })) === "intimidar");
  t("o improviso cede à forma que diz mais: «consigo ouvir…?» é escutar", idDe("consigo ouvir o que dizem lá atrás?", cenaDe({ pessoas: [P("vozes")] })) === "escutar");
  /* o grupo */
  t("a mesa fala em grupo: «nos escondemos» é ouvido como «me escondo»", idDe("nos escondemos atrás do barril", nada) === "furtar_se" && (ouve("nos escondemos atrás do barril", nada) || {}).escuta === "grupo");
  /* a fala */
  const porteiro = cenaDe({ pessoas: [P("porteiro", "motivo_para_negar")] });
  t("a barganha é convencer", idDe("você abre o portão e eu te dou duas pratas", porteiro) === "convencer");
  t("a ameaça sem verbo de ameaçar é intimidar", idDe("se ele não abrir agora, a guarda vai saber de tudo", porteiro) === "intimidar");
  t("a afirmação falsa sobre si é mentir", idDe("explico que sou o sobrinho do juiz", porteiro) === "mentir");
  t("a fala direta a quem tem motivo para negar é convencer; a pergunta não", idDe("«Abre logo, que a noite está fria.»", porteiro) === "convencer"
    && idDe("«Que horas fecha o portão?»", porteiro) === null);
  t("sem ninguém para ouvir, a fala não é ouvida", idDe("você abre o portão e eu te dou duas pratas", nada) === null);
  t("o morto não ouve", idDe("você abre o portão e eu te dou duas pratas", cenaDe({ pessoas: [P("porteiro", "morta")] })) === null);
  /* o ato pela forma */
  t("descer pela corda é escalar", idDe("desço pela corda até o pátio", nada) === "escalar");
  t("passar a pinguela é equilíbrio", idDe("passo a pinguela devagar", nada) === "equilibrio");
  t("pé ante pé é esgueirar", idDe("sigo pé ante pé até a escada", nada) === "furtar_se");
  t("revirar é buscar", idDe("reviro a despensa", nada) === "buscar");
  t("tirar a bolsa de quem pode notar é mão leve; do morto, sem alvo, não", idDe("pego a bolsa dela", cenaDe({ pessoas: [P("viajante")] })) === "bater_carteira"
    && idDe("pego a bolsa dela", cenaDe({ pessoas: [P("viajante", "morta")] })) === null);
  t("seguir alguém de longe é seguir; sem ninguém, não", idDe("sigo o mensageiro de longe", cenaDe({ pessoas: [P("mensageiro")] })) === "seguir_alguem"
    && idDe("sigo o mensageiro de longe", nada) !== "seguir_alguem");
  t("julgar a sinceridade de alguém é ler a pessoa; dito a ela (você), não", idDe("ele parece sincero?", cenaDe({ pessoas: [P("mercador")] })) === "mentira"
    && idDe("você está sendo sincero?", cenaDe({ pessoas: [P("mercador")] })) !== "mentira");
  /* a pergunta que é gesto */
  const raro = cenaDe({ cena: { estados: ["assunto_raro"] } });
  t("a pergunta sobre o assunto raro, sem a quem perguntar, é lembrar", idDe("essa erva de flor preta cura febre?", raro) === "lembrar");
  t("a mesma pergunta com um estranho em cena é para ele: não é gesto", idDe("essa erva de flor preta cura febre?", cenaDe({ pessoas: [P("herbalista")], cena: { estados: ["assunto_raro"] } })) === null);
  t("a mesma pergunta sem assunto raro não é gesto", idDe("essa erva de flor preta cura febre?", nada) === null);
  t("«tem rastro?» com algo a achar é rastrear; sem nada, não", idDe("tem pegada nessa lama?", cenaDe({ coisas: [{ nome: "trilha", estados: ["ha_algo_escondido"] }] })) === "rastrear"
    && idDe("tem pegada nessa lama?", nada) === null);
}

sec("R3. como o jogador brasileiro diz o que faz (estudo §10.4; rodada 3, 18/11/2026)");
{
  const nada = cenaDe({});
  t("as tabelas novas são congeladas", [ESCRITA_DA_MESA, MOLDURAS_COMO_SINAL, PRESENTE_IRREGULAR, PERICIA_NOMEADA, PALPITE_DA_CENA].every(Object.isFrozen)
    && CONECTORES_DE_ATOS instanceof RegExp && MOLDURA_DO_PALPITE instanceof RegExp && PERGUNTA_DE_INFORMACAO instanceof RegExp);
  /* a moldura como sinal */
  t("a moldura diz o sinal: licença, tentativa, anúncio, pedido do dado",
    molduraDe("posso subir no muro?") === "licenca" && molduraDe("dá pra eu pular?") === "licenca" && molduraDe("vou tentar pular pro telhado") === "tentativa"
    && molduraDe("vou pegar a tocha") === "anuncio" && molduraDe("deixa eu ver isso") === "anuncio" && molduraDe("preciso rolar alguma coisa?") === "pedido"
    && molduraDe("mando uma percepção") === "pedido" && molduraDe("reviro a despensa") === "" && molduraDe(null) === "");
  /* o infinitivo no presente */
  t("o infinitivo volta ao presente: regular, por grafia e irregular",
    noPresente("escalar") === "escalo" && noPresente("esconder") === "escondo" && noPresente("subir") === "subo" && noPresente("seguir") === "sigo"
    && noPresente("proteger") === "protejo" && noPresente("conhecer") === "conheco" && noPresente("fazer") === "faco" && noPresente("") === "");
  t("«vou + infinitivo» é ouvido pelo verbo de dentro", idDe("vou me esconder atrás da carroça", nada) === "furtar_se" && (ouve("vou me esconder atrás da carroça", nada) || {}).escuta === "futuro");
  t("«a gente vai…» também", idDe("a gente vai escalar o muro pelo lado da hera", nada) === "escalar");
  /* a escrita e o tu */
  t("«tu acha que dá pra eu…?» sai, e o ato de dentro é ouvido", idDe("tu acha que dá pra eu escalar a árvore?", nada) === "escalar");
  t("a escrita do chat vira a palavra inteira", ESCRITA_DA_MESA.some((x) => x.por === "voce") && idDe("vc acha que da pra eu escalar a arvore?", nada) === "escalar");
  /* as ações encadeadas */
  t("as ações encadeadas se partem nos conectores", JSON.stringify(atosDaFrase("aí eu pego a tocha. depois eu desço a escada")) === JSON.stringify(["pego a tocha", "desco a escada"])
    && JSON.stringify(atosDaFrase("vou fazer o seguinte: distraio o guarda e vocês passam")) === JSON.stringify(["distraio o guarda", "voce passam"]) && atosDaFrase("reviro a despensa").length === 0);
  t("o ato que começa no infinitivo herda a tentativa", atosDaFrase("tento acalmar o povo e convencer eles a fugir").includes("tento convencer eles a fugir"));
  /* a perícia nomeada, também em inglês */
  t("a perícia nomeada, em português ou em inglês", periciaNomeada("mando uma percepção") === "percepcao" && periciaNomeada("meu stealth") === "furtividade"
    && periciaNomeada("jogo um intimidante nele") === "intimidacao" && periciaNomeada("vou na estrada") === "");
  t("a perícia nomeada diz o desafio do catálogo", idDe("mando uma percepção", nada) === "buscar" || idDe("mando uma percepção", nada) === "investigar");
  /* a barganha, a ameaça pelo objeto à mostra, a furtividade pelo advérbio, ler a cara */
  const porteiro = cenaDe({ pessoas: [P("porteiro", "motivo_para_negar")] });
  t("«e se eu…» é barganha", idDe("e se eu oferecer metade do ouro?", porteiro) === "convencer");
  t("a arma à mostra é ameaça; sacada para atacar, não", idDe("mostro o machado ainda sujo de sangue", porteiro) === "intimidar" && idDe("mostro o machado e ataco", porteiro) !== "intimidar");
  t("o advérbio diz a furtividade", idDe("vou devagarinho até a carroça, sem chamar atenção", nada) === "furtar_se");
  t("ler a pessoa pela cara dela", idDe("reparo se o mercador muda de cara", cenaDe({ pessoas: [P("mercador")] })) === "mentira");
  /* o palpite da cena: a moldura de risco, sem ato ouvido, e a cena que se opõe */
  const vigia = cenaDe({ coisas: [{ nome: "pátio", estados: ["vigiado"] }] });
  t("o palpite: «posso passar ali?» onde há vigia é esgueirar; sem vigia, nada", idDe("posso passar ali do outro lado?", vigia) === "furtar_se" && idDe("posso passar ali do outro lado?", nada) === null
    && (ouve("posso passar ali do outro lado?", vigia) || {}).escuta === "palpite");
  t("o palpite nunca é a pergunta pela informação", idDe("posso saber quem mora ali?", vigia) === null && PALPITE_DA_CENA.every((p) => typeof p.se === "function"));
}

sec("3. sem cena não há escuta; lixo não estoura");
{
  t("cena null devolve null", ouve("dá pra eu escalar a árvore?", null) === null);
  t("frase vazia, null e lixo devolvem null", ["", "   ", null, 42, {}].every((f) => escutarComCena(f, cenaDe({}), CTX) === null));
  t("leitura null não estoura", escutarComCena("reviro a despensa", cenaDe({}), null) !== undefined);
  t("a mesma frase e a mesma cena dão o mesmo veredito", JSON.stringify(ouve("reviro a despensa", cenaDe({}))) === JSON.stringify(ouve("reviro a despensa", cenaDe({}))));
  /* 18/11 (preparo da fiação, MUDADA E O MOTIVO): esta asserção lia o TEXTO
     do módulo (readFileSync + regex), e teste-assercoes-de-texto proíbe ler o
     texto de src/motor/ — o motor se prova jogando. A intenção fica: o módulo
     não sorteia nem lê o relógio. Agora prova-se pelo comportamento: Math.random
     e Date.now trocados por espiões que contam, o módulo jogado, e nenhuma
     chamada. (O «sem React» já se prova pelo próprio import em Node; o
     «new Date» não se espiona sem trocar o construtor global, e a repetição
     idêntica, provada nesta mesma secção, cobre o que ele mudaria.) */
  const sorte0 = Math.random, agora0 = Date.now;
  let tocou = 0;
  Math.random = () => { tocou++; return 0.5; };
  Date.now = () => { tocou++; return 0; };
  try {
    for (const f of ["dá pra eu escalar a árvore?", "reviro a despensa", "vou tentar convencer o guarda", "consigo ouvir o que dizem?", "mando uma percepção"])
      for (const c of [cenaDe({}), cenaDe({ pessoas: [P("guarda", "desconfiada")], coisas: [{ nome: "lugar", estados: ["ha_algo_escondido"] }] })]) escutarComCena(f, c, CTX);
  } finally { Math.random = sorte0; Date.now = agora0; }
  t("sem sorteio, sem relógio: a escuta jogada nunca chama Math.random nem Date.now", tocou === 0, String(tocou));
}

sec("4. a catraca dos nossos corpus");
{
  /* a cena generosa: um estranho, algo escondido, um assunto raro — a escuta
     com todas as portas abertas. Mede-se o que ela OUVE; quem decide rolar
     é a régua, e por isso «ouve onde o rótulo é sem teste» não é dado
     indevido: é o teto do que a régua teria de calar. */
  const GENEROSA = cenaDe({ pessoas: [P("guarda")], coisas: [{ nome: "lugar", estados: ["ha_algo_escondido"] }], cena: { estados: ["assunto_raro"] } });
  const SEM_TESTE = ["mover", "conversa", "livre", "atacar", "naoSePede"];
  /* SUBIU no treino da rodada 3 (18/11/2026), só o «ouve», e só para cima:
     a escrita da mesa, o «vou + infinitivo», a perícia nomeada, as molduras
     novas e o palpite da cena ouvem mais do que o catálogo perde (era 10 e
     26). O «ouve onde o rótulo é sem teste» ficou onde estava: duas formas
     que o subiam (o palpite com «tentando» no meio da narração, a arma
     sacada antes do ataque) foram apertadas até ele voltar a 31 e 9. */
  const CATRACA = {
    data: "2026-11-18 (rodada 3)",
    "corpus-da-mesa": { ouveMin: 11, falsasMax: 31 },
    "corpus-das-situacoes": { ouveMin: 31, falsasMax: 9 },
  };
  for (const nome of ["corpus-da-mesa", "corpus-das-situacoes"]) {
    const C = JSON.parse(fs.readFileSync(new URL(`./${nome}.json`, import.meta.url), "utf8"));
    let perde = 0, ouvidas = 0, falsas = 0;
    for (const x of C.frases) {
      let v = null;
      try { v = lerAcao(x.frase, CTX); } catch { v = null; }
      if (v && v.tipo === "teste") continue;
      const e = escutarComCena(x.frase, GENEROSA, CTX);
      if (SEM_TESTE.includes(x.rotulo)) { if (e) falsas++; } else { perde++; if (e) ouvidas++; }
    }
    console.log(`     ${nome}: o catálogo perde ${perde} · a escuta ouve ${ouvidas} · ouve onde o rótulo é sem teste ${falsas}`);
    t(`${nome}: a escuta ouve ao menos ${CATRACA[nome].ouveMin} do que o catálogo perde (${CATRACA.data})`, ouvidas >= CATRACA[nome].ouveMin, String(ouvidas));
    t(`${nome}: a escuta não ouve mais de ${CATRACA[nome].falsasMax} onde o rótulo é sem teste (${CATRACA.data})`, falsas <= CATRACA[nome].falsasMax, String(falsas));
  }
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
