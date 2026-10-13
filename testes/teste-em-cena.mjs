/* teste-em-cena.mjs — F2a · EM CENA (Fase F2, a ficha de tudo, 12/10)

   "Hoje o mestre diz uma coisa que está em cena e o sistema tenta
   adivinhar, não deveria ser o contrário?" — a pessoa, depois da 9.ª
   sessão. Esta suíte prova a inversão com o que as sessões deram de
   verdade:

     1. a lista (`montarEmCena`): o registo, o grupo, o núcleo, a criatura
        da estrada, a banca à vista, o lugar — e o que o Mestre mostrou sem
        ninguém registar; ids estáveis pela semente; o que o herói SABE e
        nunca o segredo; determinismo, imutabilidade, lixo, tetos;
     2. a frase contra a lista (`quemNaFrase`): as dez frases reais da 6.ª à
        9.ª sessões que foram mal lidas (o cão sem pelo, o homem da tocha, o
        pescador de barba ruiva, a que leva a corrente, o rato gigante, o
        anel e as ataduras, o mestre de recados) — meta: 0 de 10;
     3. a linha da pauta (`emCenaParaPauta`, `pautaComEmCena`), medida nas
        141 pautas ENVIADAS da 6.ª, 7.ª e 8.ª sessões: o teto nunca passa,
        e nenhum veto, desfecho, resposta, fala, rumo, fecho, coração, o que
        volta, planta, batida, lugar ou nome à mão que chegava deixa de chegar;
     4. o Narrador limitado à lista: a regra O QUE É FATO aponta EM CENA, e o
        prompt fixo não cresce. Falha na árvore de antes (v9.435): o módulo
        não existe. */
import fs from "node:fs";
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
let EC = {};
try { EC = await import(S + "em-cena.js"); } catch (e) { console.log("  (em-cena.js não carrega: " + e.message + ")"); }
const montarEmCena = EC.montarEmCena || (() => []);
const quemNaFrase = EC.quemNaFrase || (() => []);
const emCenaParaPauta = EC.emCenaParaPauta || (() => "");
const pautaComEmCena = EC.pautaComEmCena || ((p) => p);
const A = await import(S + "agressao.js");
const vistosNaProsa = A.vistosNaProsa || (() => []);
const PA = await import(S + "pauta.js");
const NU = await import(S + "nucleo.js");
const N = await import(S + "nomes.js");
const { moldePorId } = await import(S + "moldes.js");

/* ---------------- o que as sessões deram ---------------- */
const R8 = JSON.parse(fs.readFileSync("./registo-s8-pauta.json", "utf8"));
const R9 = JSON.parse(fs.readFileSync("./registo-s9-historia.json", "utf8"));
const REG = JSON.parse(fs.readFileSync("./registo-s6-s7-pauta.json", "utf8"));
const C9 = R9.campanha;
const semente9 = `${C9.nomeCampanha}|${C9.genero}`;
const nucleo9 = NU.nucleoDaCampanha(semente9, R9.mapa, { genero: C9.genero, molde: moldePorId(C9.molde), lex: C9.lexico, espinha: R9.espinha, guildas: R9.guildas, base: R9.baseMundo, estado: R9.elencoMem, npcs: R9.npcs, grupo: R9.personagem.grupo, antecedente: R9.personagem.antecedente, reviravolta: null });
/* 6.ª, M36 e M39 (teste-mm-c0): o cão sem pelo */
const M36 = "Dário da Cova ergue o rosto, e pela primeira vez os olhos dele parecem menos cansados. \"Se é para ver morto, tem um cão sem pelo que anda pela paliçada norte desde a noite passada. Ronda a casa de Nira, o coveiro. Ele não dorme.\"";
const M39_6 = "Você ergue o cajado, e a manhã parece prender a respiração. O cão sem pelo não avança: ele se move um passo para o lado, lento, as costelas subindo e descendo sob a pele cinzenta.";
/* 7.ª, M18 e M60 (teste-sessao-7): os dois da tocha, o pescador */
const m18 = ["Tônia, num beco: — Não era para você me achar assim. Jaco, ofegante: — Tem dois carregando tocha na ladeira do porto."];
const m60 = ["— Então o bardo fala por ela? Pois que fale com a lâmina, não com a língua. O pescador de barba ruiva tira uma faca de pesca do cinto. Lia: — No meu telhado não. Lá fora, na lama. E sem faca."];
const P7 = [{ nome: "Tônia Lodoso" }, { nome: "Jaco Faro" }, { nome: "Lia Cinzela" }, { nome: "Marlo", papel: "camarada de Tônia, acusador" }];
/* 9.ª, M32 (teste-sessao-9-bolsa): os dois ratos gigantes */
const M32 = "Você e Sari seguem pela estrada do leste, com o céu nublado esmagando a luz cinzenta sobre a floresta. O caminho é de terra batida, com raízes retorcidas e o marrom das folhas caídas. À frente, dois ratos gigantes farejam entre os tocos, o pelo sujo de lama e fumaça. Eles erguem as cabeças ao mesmo tempo, olham para vocês, e desviam para a margem do caminho, rosnando baixo. Sari segura o cajado com as duas mãos. 'Rato de esgoto não foge por educação', diz ela, baixo. 'Ou tem dono, ou tá atrás de comida. E a comida aqui é nós.' Um dos ratos range os dentes.";
/* o ambulante do save da 9.ª (o painel de Mercado), com os preços do estoque */
const AMB = { id: "ambulante|7|412", nome: "Feira de Pedrabaixa (ambulante)", tipo: "ambulante", estoque: [
  { nome: "Frasco com terra vermelha", tipo: "curiosidade", preco: 31 },
  { nome: "Anel com nome gravado por dentro", tipo: "curiosidade", preco: 100 },
  { nome: "Elixir de Destreza", tipo: "consumivel", preco: 140 },
  { nome: "Ataduras de Linho", tipo: "consumivel", preco: 29 },
] };
const pres9 = Object.values(R9.npcs).filter((n) => n.local === "Buraco Norte");

const c6 = { semente: "s6", turno: 37, presentes: [{ nome: "Dário da Cova", papel: "coveiro", relacao: "neutro" }, { nome: "Nira", papel: "coveiro", relacao: "neutro" }], grupo: [{ nome: "Vando" }], mostrado: [M36, M39_6] };
const c7a = { semente: "s7", turno: 20, presentes: P7, grupo: [{ nome: "Jaco Faro" }], mostrado: m18 };
const c7b = { semente: "s7", turno: 61, presentes: P7, mostrado: m60 };
const c8 = { semente: "s8", turno: 39, grupo: [{ nome: "Freya" }], comigo: ["Ursa o Andarilho"], mostrado: R8.alvo.mostrado };
/* M41: duas falas depois — a que levava a corrente já não está na prosa;
   está na lista de antes, que o App guarda de um turno para o outro */
const c8b = { ...c8, turno: 41, mostrado: R8.alvo.mostradoM41, antes: montarEmCena(c8) };
const c9r = { semente: semente9, turno: 31, grupo: R9.personagem.grupo, encontro: { criatura: "Rato Gigante", ameaca: "comum", quantos: 2 }, mostrado: [M32] };
const c9a = (frase) => ({ semente: semente9, turno: 42, grupo: R9.personagem.grupo, bancas: [AMB], moeda: "marcos", frase });
const c9n = { semente: semente9, turno: 45, cidade: "Buraco Norte", presentes: pres9, grupo: R9.personagem.grupo, emCena: ["Sari", "Brina Pedra"], nucleo: nucleo9, lugar: { nome: "Buraco Norte" } };

/* ============================================================ */
sec("1. a lista: o que existe à vista, com id e com o que o herói sabe");
{
  const l9 = montarEmCena(c9r);
  const rato = l9.find((x) => x.tipo === "criatura");
  t("a criatura da estrada entra com o nome do bestiário e quantos são (2× Rato Gigante)", !!rato && rato.nome === "Rato Gigante" && rato.quantos === 2 && rato.hostil === true && rato.aqui === true, J(rato));
  t("…e o «dois ratos gigantes» da prosa é ela, não um segundo bicho («Rato»)", l9.filter((x) => x.tipo === "criatura").length === 1);
  t("o «'Rato de esgoto…'» da fala da Sari não é bicho nenhum", !l9.some((x) => /esgoto/i.test(x.nome)));
  t("a Sari é do grupo: à vista e «contigo»", l9.some((x) => x.tipo === "pessoa" && x.nome === "Sari" && x.comigo && x.aqui));
  t("o cajado na mão da Sari não arma vulto nenhum", !l9.some((x) => x.tipo === "pessoa" && x.armado));
  const l8 = montarEmCena(c8);
  t("8.ª: as duas sombras da prosa entram, cada uma pela arma que leva", ["Sombra do archote", "Sombra da corrente"].every((n) => l8.some((x) => x.nome === n && x.armado)), J(l8.map((x) => x.nome)));
  t("…e a Ursa é gente que anda comigo, nunca bicho", l8.some((x) => x.nome === "Ursa o Andarilho" && x.tipo === "pessoa" && x.comigo) && !l8.some((x) => x.tipo === "criatura" && /ursa/i.test(x.nome)));
  t("«uma coisa que só eu sei» não é bicho à vista", !l8.some((x) => x.tipo === "criatura"));
  const l6 = montarEmCena(c6);
  t("6.ª: o cão sem pelo entra com o nome da prosa", l6.some((x) => x.tipo === "criatura" && x.nome === "Cão sem pelo"));
  t("7.ª: «tem dois carregando tocha» dá o vulto da tocha", montarEmCena(c7a).some((x) => x.nome === "Vulto de tocha" && x.arma === "tocha"));
  t("7.ª: «o pescador de barba ruiva tira uma faca» dá o pescador, com o nome que a prosa lhe pendura", montarEmCena(c7b).some((x) => x.nome === "Pescador de barba ruiva" && x.arma === "faca"));
  t("…e «pois que fale com a lâmina» e «sem faca» não armam ninguém", montarEmCena(c7b).filter((x) => x.armado).length === 1);

  const ln = montarEmCena(c9n);
  const oren = ln.find((x) => x.nome === "Oren Trançado");
  t("9.ª: o elo que vive na cidade está na lista (a frase pode procurá-lo), sem estar à vista", !!oren && oren.aqui === false && oren.papel === "mestre de recados da guilda", J(oren));
  t("…e o que o herói sabe dele é o passado, nunca o que ele esconde", !!oren && oren.sabe.some((s) => /mestre de recados/.test(s)) && !oren.sabe.some((s) => /vendeu o herói|recados a/.test(s)), J(oren && oren.sabe));
  t("quem a cena põe aqui (Sari, Brina Pedra) está à vista; quem só vive na cidade, não", ln.filter((x) => x.tipo === "pessoa" && x.aqui).map((x) => x.nome).sort().join() === "Brina Pedra,Sari", J(ln.filter((x) => x.aqui).map((x) => x.nome)));
  t("o vilão não entra sem rosto conhecido", !ln.some((x) => /Gigante a Damada/.test(x.nome)));
  t("…e entra quando é conhecido e está em cena", montarEmCena({ ...c9n, emCena: ["Gigante a Damada Fenda"], vilaoConhecido: true }).some((x) => /Gigante a Damada/.test(x.nome)));
  const naLuta = montarEmCena({ semente: "x", combate: { inimigos: [{ nome: "Rato Gigante 1" }, { nome: "Rato Gigante 2" }, { nome: "Rato Gigante 3", vida: 0 }] } });
  t("na luta, os iguais numerados são um bicho com quantos (o caído não conta)", naLuta.length === 1 && naLuta[0].nome === "Rato Gigante" && naLuta[0].quantos === 2, J(naLuta));
  t("o lugar onde se está é da lista", ln.some((x) => x.tipo === "lugar" && x.nome === "Buraco Norte" && x.aqui));
  /* o segredo nunca; a revelação acrescenta */
  const sec0 = montarEmCena({ semente: "x", presentes: [{ nome: "Doran", papel: "ferreiro", segredo: "matou o irmão", relacao: "aliado" }], emCena: ["Doran"] });
  t("o segredo do registo nunca vai ao que o herói sabe", sec0.length === 1 && !J(sec0).includes("matou o irmão") && sec0[0].sabe.includes("ferreiro"), J(sec0));
  const brina = nucleo9.pessoas.find((p) => p.nome === "Brina Pedra");
  const esc = brina.ficha.esconde.o;
  t("o segredo do núcleo só entra depois de revelado", !J(montarEmCena(c9n)).includes(esc) && montarEmCena({ ...c9n, revelados: ["Brina Pedra"] }).find((x) => x.nome === "Brina Pedra").sabe.includes(esc));
  t("a Intuição e a conversa acrescentam o que deram (`sabe`)", montarEmCena({ ...c9n, sabe: { "Brina Pedra": ["conta moedas que não são dela"] } }).find((x) => x.nome === "Brina Pedra").sabe.includes("conta moedas que não são dela"));
  /* a banca */
  const la = montarEmCena(c9a("Compro as ataduras de linho."));
  const atad = la.find((x) => x.nome === "Ataduras de Linho");
  t("a banca à vista traz cada coisa com o preço do estoque (◉ 29), e a moeda do mundo", !!atad && atad.preco === 29 && atad.moeda === "marcos" && atad.aqui && atad.sabe.includes("◉ 29 marcos"), J(atad));
  const naCidade = montarEmCena({ semente: "x", cidade: "Vau", bancas: [{ id: "b1", nome: "Banca do Ivo", tipo: "armeiro", estoque: [{ nome: "Adaga", preco: 12 }, { nome: "Espada Longa", preco: 40 }] }], frase: "Quanto custa a adaga?" });
  t("na cidade, só a coisa que a frase nomeia fica à vista (a banca inteira fica na lista)", naCidade.length === 2 && naCidade.find((x) => x.nome === "Adaga").aqui && !naCidade.find((x) => x.nome === "Espada Longa").aqui);
  /* o id */
  const ids = (l) => l.map((x) => x.id).join();
  t("determinística: a mesma cena dá a mesma lista, byte a byte", J(montarEmCena(c9n)) === J(montarEmCena(c9n)) && J(montarEmCena(c8)) === J(montarEmCena(c8)));
  t("o id é estável de um turno ao outro (o mesmo rato, o mesmo id)", montarEmCena({ ...c9r, turno: 40 }).find((x) => x.tipo === "criatura").id === rato.id);
  t("…e outra campanha não partilha ids", montarEmCena({ ...c9r, semente: "outra" }).find((x) => x.tipo === "criatura").id !== rato.id);
  t("os ids não se repetem dentro da lista", new Set(montarEmCena(c9n).map((x) => x.id)).size === montarEmCena(c9n).length && new Set(la.map((x) => x.id)).size === la.length);
  t("o id não diz o nome (é da mão, nunca da tela)", !ids(ln).toLowerCase().includes("oren") && la.every((x) => /^[pclp][0-9a-z]+$/.test(x.id)));
  /* a memória */
  const M = EC.EM_CENA_MEMORIA || {};
  const lb = montarEmCena(c8b);
  const corrente = lb.find((x) => x.nome === "Sombra da corrente");
  t("a que levava a corrente fica na lista duas falas depois (a lista de antes)", !!corrente && corrente.id === l8.find((x) => x.nome === "Sombra da corrente").id, J(lb.map((x) => x.nome)));
  t("…já fora da vista (sai da linha e do pronome) passados `aVista` turnos", !!corrente && corrente.aqui === false);
  const velho = montarEmCena({ ...c8, turno: 39 + (M.turnos || 0) + 1, mostrado: [], antes: l8 });
  t("…e sai da lista passados `turnos` turnos sem voltar à prosa", !velho.some((x) => x.deOnde === "prosa") && montarEmCena({ ...c8, turno: 39 + (M.turnos || 0), mostrado: [], antes: l8 }).some((x) => x.nome === "Sombra da corrente"));
  t("a memória é tabela, e curta", M.turnos >= 2 && M.turnos <= 10 && M.aVista >= 0 && M.aVista < M.turnos);
  /* os tetos */
  const MAX = EC.EM_CENA_MAX || {};
  const muitos = montarEmCena({ semente: "x", presentes: Array.from({ length: 30 }, (_, i) => ({ nome: `Pessoa Número${i}` })), emCena: ["Pessoa Número29"] });
  t("o teto por tipo é tabela, e a lista não passa dele", ["pessoa", "criatura", "coisa", "lugar"].every((k) => Number.isFinite(MAX[k])) && muitos.length === MAX.pessoa);
  t("…e quem está à vista entra primeiro (o 30.º, posto pela cena, não cai)", muitos.some((x) => x.nome === "Pessoa Número29" && x.aqui));
  /* lixo e imutabilidade */
  t("lixo não estoura e dá lista vazia", [null, undefined, {}, 7, "x", { presentes: null, grupo: {}, nucleo: null, bancas: [null, {}], encontro: null, mostrado: [null, 5] }].every((c) => Array.isArray(montarEmCena(c)) && montarEmCena(c).length === 0));
  const copia = J(c9n.presentes) + J(R8.alvo) + J(AMB);
  montarEmCena(c9n); montarEmCena(c8b); montarEmCena(c9a("compro o anel"));
  t("não muta o que recebe", J(c9n.presentes) + J(R8.alvo) + J(AMB) === copia);
  t("vistosNaProsa: tabela com o porquê, e lixo não estoura", !!(A.VISTO_NA_PROSA || {}).porque && Array.isArray(vistosNaProsa(null)) && vistosNaProsa([null, 3]).length === 0);
}

/* ============================================================ */
sec("2. a frase contra a lista: as dez frases reais que foram mal lidas");
{
  /* cada uma, como a sessão a deu, e o que ela aponta. Na sessão, as dez
     foram mal lidas (mente/mm11-sessao-6..9.md): o «ele» foi ao Dário, a
     Nira virou alvo, a ladeira «estava vazia», o pescador ficou SEM ALVO, a
     Ursa apanhou o golpe e o pedido de desculpa reabriu a luta, o rato não
     existia, o anel e as ataduras não tinham preço, a compra pagou 5 em vez
     de 29, e o mestre de recados não chegava a ninguém. */
  const casos = [
    ["6.ª M37", "Ataco o cão sem pelo antes que ele avance.", c6, "Cão sem pelo", [], []],
    ["6.ª J37", "Vou até a paliçada norte e procuro o cão sem pelo, perto da casa de Nira. Quando o vir, ataco primeiro.", c6, "Cão sem pelo", [], ["Nira"]],
    ["7.ª M20", "Mando Tônia ficar atrás de mim. Avanço com Jaco e ataco o homem da tocha.", c7a, "Vulto de tocha", [], ["Tônia Lodoso", "Jaco Faro"]],
    ["7.ª M61", "Aceito o desafio. Saio para a lama, sem faca, como Lia mandou, e ataco o pescador de barba ruiva com os punhos.", c7b, "Pescador de barba ruiva", [], ["Lia Cinzela"]],
    ["8.ª M39", R8.alvo.m39, c8, "Sombra da corrente", [], ["Ursa o Andarilho", "Freya", "Sombra do archote"]],
    ["8.ª M41", R8.alvo.m41, c8b, "Sombra da corrente", [], ["Ursa o Andarilho"]],
    ["9.ª M33", "Ataco o rato gigante da frente com a minha faca.", c9r, "Rato Gigante", [], ["Sari"]],
    ["9.ª M43", "Pergunto quanto custa o anel com nome gravado por dentro, e também as ataduras de linho. Quero ver o nome dentro do anel.", c9a("Pergunto quanto custa o anel com nome gravado por dentro, e também as ataduras de linho."), "Anel com nome gravado por dentro", ["Ataduras de Linho"], []],
    ["9.ª M44", "Compro as ataduras de linho e pago as cinco moedas que ele pediu.", c9a("Compro as ataduras de linho e pago as cinco moedas que ele pediu."), "Ataduras de Linho", [], ["Frasco com terra vermelha"]],
    ["9.ª M47", "Cresci na guilda dos dedos. Procuro meu antigo mestre de recados, que devia estar aqui em Buraco Norte. Vou à taverna O Machado e a Rosa perguntar por ele ao taverneiro.", c9n, "Oren Trançado", [], ["Sari", "Brina Pedra"]],
  ];
  let malLidos = 0;
  for (const [quem, frase, ctx, principal, tambem, nunca] of casos) {
    const lista = montarEmCena(ctx);
    const r = quemNaFrase(frase, lista);
    const certo = r.length > 0 && r[0].nome === principal && tambem.every((n) => r.some((x) => x.nome === n)) && !nunca.includes((r[0] || {}).nome);
    if (!certo) malLidos++;
    t(`${quem}: «${frase.slice(0, 60)}…» → ${principal}`, certo, J(r.map((x) => `${x.nome}/${x.como}/${x.faz}`)));
  }
  console.log(`      (mal lidos: ${malLidos} de ${casos.length}; na sessão, ${casos.length} de ${casos.length})`);
  t("mal lidos: 0 de 10 (a meta da F2)", malLidos === 0, String(malLidos));
  const r39 = quemNaFrase(R8.alvo.m39, montarEmCena(c8));
  t("8.ª M39: a companheira nem aparece entre o que a frase aponta (o «ela» não vai a ela)", !r39.some((x) => /Ursa|Freya/.test(x.nome)), J(r39));
  t("…e o golpe está dito: `faz` é o golpe", (r39[0] || {}).faz === "golpe");
  const r33 = quemNaFrase("Ataco o rato gigante da frente com a minha faca.", montarEmCena(c9r))[0] || {};
  t("9.ª M33: «o rato gigante da frente» é UM dos dois", r33.quantos === 1 && r33.como === "raiz");
  t("«ataco os ratos» são os dois", (quemNaFrase("Ataco os ratos com a faca.", montarEmCena(c9r))[0] || {}).quantos === 2);
  t("«ataco um dos ratos» é um", (quemNaFrase("Ataco um dos ratos.", montarEmCena(c9r))[0] || {}).quantos === 1);
  t("o género casa como na agressão: «a loba» é o lobo da lista", (quemNaFrase("ataco a loba", montarEmCena({ semente: "x", encontro: { criatura: "Lobo Cinzento", quantos: 1 } }))[0] || {}).nome === "Lobo Cinzento");
  /* a compra: o que a frase compra é a coisa do estoque */
  const r44 = quemNaFrase("Compro as ataduras de linho e pago as cinco moedas que ele pediu.", montarEmCena(c9a("")))[0] || {};
  t("9.ª M44: a compra é das Ataduras de Linho (a do estoque, ◉ 29), e `faz` é a compra", r44.nome === "Ataduras de Linho" && r44.faz === "compra");
  const r42 = quemNaFrase("Paro diante do mercador ambulante e olho os frascos. Quanto custa um frasco de cura? Compro um.", montarEmCena(c9a("")));
  t("9.ª M42: «um frasco de cura» não é o Frasco com terra vermelha (o complemento desmente)", !r42.some((x) => x.nome === "Frasco com terra vermelha" && x.faz === "compra"), J(r42));
  /* o pronome */
  const lr = montarEmCena(c9r);
  t("o pronome, sem mais nada e com UM candidato à vista, aponta-o", (quemNaFrase("Avanço e acerto-o com a faca.", lr)[0] || {}).como === "pronome");
  t("…e nunca quem anda comigo (só a companheira à vista: nada)", quemNaFrase("Avanço para socá-la.", montarEmCena({ semente: "x", grupo: [{ nome: "Freya" }], comigo: ["Ursa o Andarilho"] })).length === 0);
  t("…e com dois candidatos, nada (o sistema não adivinha)", quemNaFrase("Avanço e acerto-o.", montarEmCena(c8)).length === 0);
  t("o «não Ursa» tira a Ursa daquela oração", !quemNaFrase("Eu queria atacar a da corrente, não Ursa.", montarEmCena(c8)).some((x) => /Ursa/.test(x.nome)));
  t("«Brina» e «Brina Pedra»: o nome inteiro ganha", (quemNaFrase("Falo com Brina Pedra.", montarEmCena(c9n))[0] || {}).nome === "Brina Pedra");
  t("a tabela da ação diz o porquê, e as forças põem o golpe à frente da fala", !!(EC.ACAO_QUE_APONTA || {}).porque && EC.ACAO_QUE_APONTA.forca.golpe > EC.ACAO_QUE_APONTA.forca.fala);
  t("lixo não estoura", [null, "", 7].every((f) => Array.isArray(quemNaFrase(f, lr)) && quemNaFrase(f, lr).length === 0) && quemNaFrase("ataco o rato", null).length === 0 && quemNaFrase("ataco o rato", [null, {}, { id: 1 }]).length === 0);
  const antes = J(lr);
  quemNaFrase("Ataco os ratos.", lr);
  t("não muta a lista", J(lr) === antes);
}

/* ============================================================ */
sec("3. a linha EM CENA, medida nas pautas enviadas");
const NOMES = N.linhaDosNomesAMao([{ nome: "Aldric", genero: "ele" }, { nome: "Alba da Pedra", genero: "ela" }]);
{
  const sec0 = PA.secaoPorId("emCena");
  t("a secção existe, com o rótulo EM CENA, e corta onde cortavam os nomes (2,477)", !!sec0 && sec0.rotulo === "EM CENA" && sec0.prio === PA.secaoPorId("nomes").prio);
  t("…depois de todo veto, do coração e da batida; antes da ficha e da decoração", !!sec0 && sec0.prio > PA.prioDaLinha(PA.secaoPorId("naoPode"), 8) && sec0.prio > PA.secaoPorId("coracao").prio && sec0.prio > PA.secaoPorId("momento").frente[0] && sec0.prio < PA.secaoPorId("quemE").prio && sec0.prio < PA.secaoPorId("economia").prio);
  t("na luta cede (a vista da luta é a lista)", PA.SECOES_QUE_CEDEM.luta.includes("emCena"));
  t("o teto da pauta não subiu", PA.TETO_DA_PAUTA === 1400);

  const l33 = emCenaParaPauta(montarEmCena(c9r), {});
  console.log(`      (9.ª M33: "${l33}" — ${l33.length} caracteres)`);
  /* 12/10 (fiação da F2a, frontend): "Sari (contigo)" passou a "Sari (com
     você)" — o jogo trata o jogador por você (teste-subtramas §7b), e a
     linha vai ao Narrador, que copia o registo que lê (EM_CENA_TRATO) */
  t("9.ª M33: a linha diz a Sari e os dois ratos gigantes", l33 === "Rato Gigante ×2 (hostil); Sari (com você)" || l33 === "Sari (com você); Rato Gigante ×2 (hostil)", l33);
  const l44 = emCenaParaPauta(montarEmCena(c9a("Compro as ataduras de linho.")), {});
  console.log(`      (9.ª M44: "${l44}" — ${l44.length} caracteres)`);
  t("9.ª M44: o que está à venda vai com o preço do estoque e a moeda uma vez", /à venda, em marcos: /.test(l44) && /◉29/.test(l44) && (l44.match(/marcos/g) || []).length === 1, l44);
  const l47 = emCenaParaPauta(montarEmCena(c9n), { nomes: [NOMES] });
  console.log(`      (9.ª M47: "${l47}" — ${l47.length} caracteres)`);
  t("9.ª M47: a gente à vista com o papel, e os nomes à mão no fim, inteiros", l47.startsWith("Brina Pedra (aprendiz)") && l47.endsWith(NOMES), l47);
  t("…quem só vive na cidade não vai à linha (o Oren, o Tomas)", !/Oren|Tomas/.test(l47));
  const todas = [l33, l44, l47, emCenaParaPauta(montarEmCena(c8), {}), emCenaParaPauta(montarEmCena(c6), {})];
  const todosIds = [c9r, c9a(""), c9n, c8, c6].flatMap((c) => montarEmCena(c).map((x) => x.id));
  t("o sistema não fala de si: nem «ficha», nem id, nem o nome de mecanismo", todas.every((l) => !/ficha|EM CENA|registo|núcleo|\belo\b/i.test(l) && !todosIds.some((id) => l.includes(id))), J(todas));
  t("o que já está dito na pauta não se repete (a resposta de PERGUNTOU)", !/Ataduras/.test(emCenaParaPauta(montarEmCena(c9a("Compro as ataduras de linho.")), { jaDito: "à venda aqui: Ataduras de Linho ◉ 29 marcos (Feira)" })));
  t("os tetos da linha são tabela", Object.values(EC.EM_CENA_NA_PAUTA || {}).every((n) => Number.isFinite(n) && n > 0));
  t("sem nada à vista nem nomes: linha vazia", emCenaParaPauta([], {}) === "" && emCenaParaPauta(null, null) === "");

  /* a prova com as pautas ENVIADAS: as 138 da 6.ª e da 7.ª (o texto lido de
     volta para as secções, registo-s6-s7-pauta.json) e as 3 da 8.ª
     (os confrontos, registo-s8-pauta.json). Por cima de cada uma, fora da
     luta: os NOMES À MÃO (a linha da E1) e uma linha EM CENA — a típica
     (a 9.ª, M33 e M44: gente, bicho e banca) e a pior (o teto de cada tipo,
     com nomes longos) */
  const tipica = [...montarEmCena(c9r), ...montarEmCena(c9a("Compro as ataduras de linho."))];
  const pior = montarEmCena({ semente: "pior", presentes: [1, 2, 3, 4].map((i) => ({ nome: `Bartolomeu Quebra-Pedras ${i}`, papel: "mestre de armas da guarda velha, veterano" })), emCena: [1, 2, 3, 4].map((i) => `Bartolomeu Quebra-Pedras ${i}`),
    encontro: { criatura: "Aranha Gigante das Cavernas", quantos: 4 }, combate: null, sala: { inimigos: [{ nome: "Esqueleto Guardião do Portão" }, { nome: "Esqueleto Guardião do Portão" }] },
    bancas: [{ id: "a", tipo: "ambulante", nome: "x", estoque: [1, 2, 3, 4].map((i) => ({ nome: `Elixir de Resistência Maior ${i}`, preco: 1000 + i })) }], moeda: "coroas de prata" });
  const pautas = [
    ...REG.turnos.map((tu) => { const b = {}; for (const [id, ix] of Object.entries(tu.secoes)) b[id] = ix.map((i) => REG.linhas[i]); return { b, cena: { luta: tu.luta, masmorra: tu.masmorra } }; }),
    ...R8.confrontos.map((c) => ({ b: c.pauta.secoes, cena: { luta: false } })),
  ];
  const medir = (lista) => {
    let cand = 0, entra = 0, comItem = 0, nomesAntes = 0, teto = 0, tira = 0, nomesFora = 0, maior = 0, custo = 0, luta = 0, lutaMexe = 0;
    const tirou = [];
    for (const { b, cena } of pautas) {
      const com0 = PA.cederNaCena(cena.luta ? b : { ...b, nomes: [NOMES] }, cena);
      if (cena.luta) {
        luta++;
        if (J(pautaComEmCena(com0, lista, { luta: true })) !== J(PA.garantirPauta(com0))) lutaMexe++;
        continue;
      }
      cand++;
      const tx0 = PA.textoDaPauta(com0, { turno: 99 });
      const p1 = pautaComEmCena(com0, lista, { turno: 99 });
      const tx1 = PA.textoDaPauta(p1, { turno: 99 });
      if (tx1.length > PA.TETO_DA_PAUTA) teto++;
      maior = Math.max(maior, tx1.length);
      const guardadas = [...(com0.naoPode || []), ...(com0.desfecho || []), ...(com0.vetoDoDesfecho || []), ...(com0.pergunta || []), ...(com0.fala || []), ...(com0.rumo || []), ...(com0.fecho || []), ...(com0.coracao || []), ...(com0.volta || []), ...(com0.masmorra || []), (com0.momento || [])[0], (com0.onde || [])[0]].filter(Boolean);
      for (const v of guardadas) if (tx0.includes(v) && !tx1.includes(v)) { tira++; tirou.push(v.slice(0, 50)); }
      if (tx0.includes(NOMES)) nomesAntes++;
      if (tx0.includes(NOMES) && !tx1.includes(NOMES)) nomesFora++;
      if (p1.emCena && tx1.includes(p1.emCena[0])) { entra++; custo += tx1.length - tx0.length; if (p1.emCena[0] !== NOMES) comItem++; }
    }
    return { cand, entra, comItem, nomesAntes, teto, tira, tirou, nomesFora, maior, custo: entra ? Math.round(custo / entra) : 0, luta, lutaMexe };
  };
  for (const [nome, lista] of [["típica", tipica], ["pior", pior]]) {
    const m = medir(lista);
    console.log(`      (${nome}: EM CENA entra em ${m.entra}/${m.cand} pautas fora da luta, ${m.comItem} delas com gente, bicho ou coisa dentro; os NOMES À MÃO entravam em ${m.nomesAntes}; custa em média +${m.custo} caracteres ao texto; a maior pauta: ${m.maior}/${PA.TETO_DA_PAUTA})`);
    t(`${nome}: o teto nunca passa nas ${pautas.length} pautas`, m.teto === 0);
    t(`${nome}: nenhum veto, desfecho, resposta, fala, rumo, fecho, coração, o que volta, planta, batida ou lugar que chegava deixa de chegar`, m.tira === 0, J(m.tirou));
    t(`${nome}: os nomes à mão que chegavam continuam a chegar (agora dentro da linha)`, m.nomesFora === 0, String(m.nomesFora));
    t(`${nome}: na luta, a pauta fica como era (${m.luta} pautas de luta)`, m.lutaMexe === 0);
    t(`${nome}: a linha entra em toda pauta onde os nomes à mão entravam`, m.entra >= m.nomesAntes, `${m.entra}/${m.nomesAntes}`);
    if (nome === "típica") t("típica: com gente, bicho ou coisa dentro em 90% ou mais das pautas onde os nomes entravam", m.comItem >= m.nomesAntes * 0.9, `${m.comItem}/${m.nomesAntes}`);
    else t("pior: mesmo com o teto de cada tipo, com alguma coisa dentro (encolhida) em metade ou mais", m.comItem >= m.nomesAntes * 0.5, `${m.comItem}/${m.nomesAntes}`);
  }
  /* os nomes vão DENTRO da linha */
  const so = pautaComEmCena({ onde: ["em Vau"], nomes: [NOMES] }, montarEmCena(c9r), {});
  t("os NOMES À MÃO vão dentro da linha EM CENA, e a secção deles fica vazia", !so.nomes && so.emCena && so.emCena[0].endsWith(NOMES) && PA.textoDaPauta(so).includes(NOMES));
  t("sem nada à vista, a linha leva só os nomes", (pautaComEmCena({ onde: ["em Vau"], nomes: [NOMES] }, [], {}).emCena || [])[0] === NOMES);
  t("sem nada à vista nem nomes, a pauta fica como era", J(pautaComEmCena({ onde: ["em Vau"] }, [], {})) === J(PA.garantirPauta({ onde: ["em Vau"] })));
  const viva = { onde: ["em Vau"], nomes: [NOMES], pergunta: ["à venda aqui: Ataduras de Linho ◉ 29"] };
  const copia = J(viva);
  pautaComEmCena(viva, tipica, {});
  t("não muta a pauta", J(viva) === copia);
  t("lixo não estoura", [null, {}, 7].every((p) => typeof pautaComEmCena(p, null, null) === "object"));
  t("a tabela do que a linha não tira diz o porquê", !!(EC.EM_CENA_NAO_TIRA || {}).porque && EC.EM_CENA_NAO_TIRA.secoes.includes("naoPode") && EC.EM_CENA_NAO_TIRA.secoes.includes("pergunta"));

  /* v9.438: o "já dito" lê o TEXTO que chega ao Narrador, não a pauta. A
     QUEM É corta depois da EM CENA (2,485 contra 2,477): numa pauta cheia
     ela cai no teto, e quem ela nomeava saía da EM CENA por "já dito" —
     sumia das duas. Na abertura viva foi o companheiro Lucan. Prova-se nas
     pautas enviadas (6.ª a 8.ª, fora da luta), com uma QUEM É do
     companheiro por cima de cada uma: onde a QUEM É não chega e a linha
     dele caberia, ele TEM de estar na EM CENA; onde a QUEM É chega, ele
     não se repete; e o teto e as linhas guardadas ficam como estavam. */
  {
    const QE = "Lucan Varro, que anda consigo: quer provar que não é covarde, fala curto e seco, traz a espada velha do pai e a dívida dele";
    const lucan = [{ id: "p:lucan", tipo: "pessoa", nome: "Lucan Varro", aqui: true, comigo: true }];
    const so = "Lucan Varro (" + EC.EM_CENA_TRATO.comigo + ")";
    let cortada = 0, cabia = 0, some = 0, chega = 0, repete = 0, teto = 0, tira = 0;
    const tirou = [];
    for (const { b, cena } of pautas) {
      if (cena.luta) continue;
      const com0 = PA.cederNaCena({ ...b, nomes: [NOMES], quemE: [QE] }, cena);
      const tx0 = PA.textoDaPauta(com0, { turno: 99 });
      const p1 = pautaComEmCena(com0, lucan, { turno: 99 });
      const tx1 = PA.textoDaPauta(p1, { turno: 99 });
      const naLinha = (p1.emCena || []).some((l) => l.includes("Lucan") && tx1.includes(l));
      if (tx1.length > PA.TETO_DA_PAUTA) teto++;
      const guardadas = EC.EM_CENA_NAO_TIRA.secoes.flatMap((id) => com0[id] || []).concat(EC.EM_CENA_NAO_TIRA.primeira.map((id) => (com0[id] || [])[0])).filter(Boolean);
      for (const v of guardadas) if (tx0.includes(v) && !tx1.includes(v)) { tira++; tirou.push(v.slice(0, 50)); }
      if (tx1.includes(QE)) { chega++; if (naLinha) repete++; continue; }
      cortada++;
      /* a linha dele, sozinha, chegaria ao texto sem tirar nada que chegava
         (o teto a engolir tudo, ou um veto que sairia, é recusa certa)? */
      const so1 = PA.textoDaPauta(PA.garantirPauta({ ...com0, nomes: undefined, emCena: [so + "; " + NOMES] }), { turno: 99 });
      if (!so1.includes(so) || guardadas.some((v) => tx0.includes(v) && !so1.includes(v))) continue;
      cabia++;
      if (!naLinha) some++;
    }
    console.log(`      (a QUEM É do companheiro: chega em ${chega}, cortada em ${cortada}; dessas, a linha dele cabia em ${cabia})`);
    t("a QUEM É cortada pelo teto não esconde a pessoa: onde a linha dela cabia, ela está na EM CENA", cabia > 0 && some === 0, `some em ${some}/${cabia}`);
    t("onde a QUEM É chega ao texto, a pessoa não se repete na EM CENA", chega > 0 && repete === 0, `${repete}/${chega}`);
    t("com a QUEM É por cima: o teto nunca passa", teto === 0, String(teto));
    t("com a QUEM É por cima: nenhum veto, desfecho, resposta, fala, rumo, fecho, coração, o que volta, planta, batida ou lugar que chegava deixa de chegar", tira === 0, J(tirou));
    /* o caso mínimo, à mão: a cabeça e uma pauta que só cabe uma das duas */
    const cheia = { onde: ["em Vau, na estalagem do Corvo"], naoPode: ["x".repeat(1000)], quemE: [QE] };
    const pc = pautaComEmCena(cheia, lucan, { turno: 1 });
    const txc = PA.textoDaPauta(pc, { turno: 1 });
    t("à mão: a QUEM É não cabe, o veto fica, e o companheiro vem na EM CENA", !txc.includes(QE) && txc.includes("x".repeat(1000)) && txc.includes(so), txc.slice(-160));
  }
}

/* ============================================================ */
sec("4. o Narrador limitado à lista");
{
  const src = fs.readFileSync(S + "prompt.js", "utf8");
  const regra = (src.match(/^O QUE É FATO: [^\n]*/m) || [""])[0];
  t("a regra O QUE É FATO aponta EM CENA como o que existe, e dá nome a quem não tem", regra.includes("(EM CENA é o que existe e dá nome a quem não tem; o preço, em PERGUNTOU e O PREÇO)"), regra.slice(0, 80));
  t("…no lugar do parêntese de antes, e um caractere mais curta: o prompt fixo não cresce", !regra.includes("leva um dos NOMES À MÃO") && regra.length <= 651, String(regra.length));
  const app = fs.readFileSync(S + "App.jsx", "utf8");
  /* a fiação é do frontend, na mesma fase (teste-ligacao: AGUARDANDO).
     Até lá a regra aponta EM CENA, e a linha dos nomes continua a vir na
     secção deles — o Narrador lê "a quem não tem nome:" pela própria linha. */
  /* 12/10: a fiação chegou (frontend, F2a). A asserção de espera ("o App
     ainda não importa") virou a prova da fiação, ponto a ponto. */
  const pdt = (app.split("const pautaDoTurno = ")[1] || "").split("\n  };\n")[0];
  const decl = (app.split("const declararAgressao = ")[1] || "").split("const a = lerAgressao(")[0];
  t("fiação · o App importa as três de em-cena.js", /import \{ montarEmCena, pautaComEmCena, quemNaFrase \} from "\.\/em-cena\.js";/.test(app));
  t("fiação · pautaDoTurno monta a lista DEPOIS do cederNaCena, guarda-a e põe a linha, num calou próprio", pdt.indexOf('calou("cederNaCena"') > 0 && pdt.indexOf("montarEmCena(") > pdt.indexOf('calou("cederNaCena"') && /emCenaRef\.current = lista;/.test(pdt) && /p = pautaComEmCena\(p, lista, \{ luta: !!combateRef\.current/.test(pdt) && pdt.includes('calou("EM CENA"'));
  t("fiação · a lista de antes vai de um turno ao outro (antes: emCenaRef.current)", /antes: emCenaRef\.current/.test(app));
  t("fiação · a criatura à vista guarda quantos", /criaturaAVistaRef\.current = \(inv[^;]*quantos: inv\.quantos/.test(app));
  t("fiação · declararAgressao lê a frase contra a lista, e o bicho do golpe vai em conhecidas", /* MOVIDA na F2b (12/10, oficial): a frase já não se lê só livre — a
     ficha tocada vem à frente enquanto a frase a nomeia (alvoDoEnvio →
     fichas.js#quemNoEnvio, que sem toque É quemNaFrase). A intenção fica:
     a frase lê-se contra a lista, e o bicho do golpe vai em conhecidas. */
  /(quemNaFrase|alvoDoEnvio)\(acao, /.test(decl) && /faz === "golpe"/.test(decl) && /conhecidas = \[/.test(decl));
  t("fiação · a lista não vai ao save (refaz-se das fontes que já se salvam)", !/emCena(Ref)?:\s*emCenaRef/.test(app));
}

/* ============================================================ */
sec("5. o jogo trata o jogador por você (a linha EM CENA, 120 mundos)");
/* A catraca de teste-subtramas §7b, estendida à linha EM CENA e ao que a
   lista diz que o herói sabe: nasceu "Sari (contigo)" e "do teu passado".
   Os mundos são os do núcleo (o companheiro inicial, o elo com o papel do
   passado), com o grupo, a cidade, a estrada e uma banca à vista. */
{
  const { companheiroInicial } = await import(S + "companheiro-inicial.js");
  const { abrirAbertura } = await import(S + "abertura.js");
  const { gerarGeografia } = await import(S + "geografia.js");
  const { estenderEspinha } = await import(S + "saga.js");
  const { MOLDES } = await import(S + "moldes.js");
  const { guildasDoMundo } = await import(S + "guildas.js");
  const { elencoDoMundo } = await import(S + "elenco.js");
  const { ANTECEDENTES } = await import(S + "antecedentes.js");
  /* 12/10 (F2b, fichas.js): o que a lista diz que o herói sabe vai agora à
     tela, no cartão — e o lugar dizia "onde estás", que a catraca de antes
     não via (só olhava pronomes). Passa a ver também o verbo na 2.ª pessoa. */
  const TU = /(?<![\p{L}])(tua|teu|tuas|teus|contigo|convosco|estás|és|tens|vês|sabes|queres|podes|vais|foste)(?![\p{L}])|-te(?![\p{L}])/iu;
  const G = "Fantasia medieval";
  const ANTS = ["", ...ANTECEDENTES.map((a) => a.id)];
  const ruins = [];
  let linhas = 0, comGrupo = 0;
  for (let i = 0; i < 120; i++) {
    const M = MOLDES[i % MOLDES.length];
    const semente = `Sonda Em Cena|${i}`;
    const mapa = gerarGeografia(semente, M);
    const cidade = mapa.cidades[0].nome;
    const guildas = guildasDoMundo(semente, mapa, G, null);
    const antecedente = ANTS[i % ANTS.length];
    const espinha = estenderEspinha({ semente, mapa, genero: G, molde: M, estrutura: "jornada", cidadeInicial: cidade, antecedente, dia: 1 });
    const ab = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente, genero: G, molde: M, nivel: 1, dia: 1 });
    const ci = ab && ab.abertura ? companheiroInicial({ semente, mapa, genero: G, molde: M, espinha, guildas, cidade, antecedente, heroi: { nome: "Brann", nivel: 1, classe: "Guerreiro" }, abertura: ab.abertura }) : null;
    const grupo = ci ? [ci.comp] : [];
    const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: M, espinha, guildas });
    const nucleo = NU.nucleoDaCampanha(semente, mapa, { genero: G, molde: M, espinha, guildas, antecedente, grupo, elenco });
    const lista = montarEmCena({ semente, turno: 7, cidade, grupo, emCena: (nucleo.pessoas || []).slice(0, 2).map((p) => p.nome), nucleo, encontro: { criatura: "Lobo Cinzento", quantos: 2 }, bancas: [AMB], moeda: "moedas", lugar: { nome: cidade }, saidas: ["a porta do norte"], perto: [{ nome: "o Moinho Velho", distancia: "2 h", rumo: "norte" }] });
    const linha = emCenaParaPauta(lista, {});
    if (linha) linhas++;
    if (grupo.length && linha.includes("(" + (EC.EM_CENA_TRATO || {}).comigo + ")")) comGrupo++;
    for (const tx of [linha, ...lista.flatMap((x) => x.sabe || [])]) if (TU.test(tx)) ruins.push(`${i}: ${tx}`);
  }
  console.log(`      (${linhas} linhas EM CENA em 120 mundos; ${comGrupo} com o companheiro "(com você)")`);
  t("a tabela do trato existe e fala por você", (EC.EM_CENA_TRATO || {}).comigo === "com você" && !Object.values(EC.EM_CENA_TRATO || {}).some((x) => TU.test(x)));
  t("o lugar onde o herói está diz «onde você está», não «onde estás» (F2b)", (EC.EM_CENA_TRATO || {}).ondeEsta === "onde você está" && (montarEmCena({ semente: "x", lugar: { nome: "Buraco Norte" } }).find((x) => x.tipo === "lugar") || { sabe: [] }).sabe.includes("onde você está"));
  t("nenhum tu/teu/contigo na linha EM CENA nem no que a lista diz que o herói sabe, nos 120 mundos", ruins.length === 0, J(ruins.slice(0, 5)));
  t("…e a varredura tem o que varrer: a linha em todos os mundos, o companheiro com «(com você)» na maioria", linhas === 120 && comGrupo >= 60, `${linhas}/${comGrupo}`);
}

console.log(`\nem cena (F2a): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
