/* teste-social.mjs (v9.65) — "convencer, intimidar e enganar rolavam contra
   um 14 fixo: o mesmo 14 para arrancar uma fofoca de um bêbado e para
   convencer o capitão da guarda a abrir o portão."

   Esta suíte é a resposta, e mede também o que ela custa em equilíbrio. */
import {
  TAMANHOS_DO_PEDIDO, FORA_DA_CONVERSA, ALAVANCAS, PESO_DA_RELACAO, PESO_DO_PAPEL,
  ESCADA_DA_RELACAO, tamanhoDoPedido, tamanhoPorId, tamanhoPadrao, foraDaConversa,
  pesoDoPapel, alavancasNaMesa, dificuldadeSocial, moverRelacao,
  envelopeSocial, envelopeForaDaConversa, falaDosBlefes,
  PAPEIS_DE_INFORMANTE, ehInformante, PEDIDOS_QUE_SAO_CONSULTA, consultouInformante,
} from "../src/social.js";
import { criarNPC, mesclarNPC, registrarConsulta, vezesQueUsouInformante } from "../src/npcs.js";
import fs from "node:fs";
import {
  lerAcao, registrarTentativa, CUSTO_DE_FALHAR, custoPorAlvo, desfechoDaFalha, falaDoCusto, envelopeDoCusto,
  quedaDe, rolarQueda, dcDaQueda,
  DESAFIOS,
} from "../src/desafios.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const heroi = { nivel: 5, moedas: 600, inventario: [], habilidades: [], equipado: { arma: { nome: "Espada longa" } } };
const pobre = { nivel: 5, moedas: 3, inventario: [], habilidades: [], equipado: {} };
const guarda = { nome: "Vela", papel: "capitão da guarda", relacao: "desconhecido", segredo: "", notas: "" };
const amigo = { nome: "Bram", papel: "taverneiro", relacao: "amigo", segredo: "deve ao agiota", notas: "" };
const inimigo = { nome: "Corvo", papel: "nobre", relacao: "inimigo", segredo: "envenenou o irmão", notas: "" };
const base = { personagem: heroi, semente: "taverna|social", lugar: "a praça", tentativas: {}, dia: 1 };
const ler = (frase, pessoa, extra = {}) => lerAcao(frase, { ...base, ...extra, pessoaDe: () => pessoa });

sec("1. a escada do pedido existe e sobe");
{
  t("seis degraus", TAMANHOS_DO_PEDIDO.length === 6);
  t("cada degrau diz o que cede E o que não cede",
    TAMANHOS_DO_PEDIDO.every((x) => x.cede.length > 25 && x.nunca.length > 20));
  const dcs = TAMANHOS_DO_PEDIDO.map((x) => x.dc);
  t("e a escada sobe monotonicamente", dcs.every((d, i) => i === 0 || d > dcs[i - 1]));
  console.log("      escada: " + TAMANHOS_DO_PEDIDO.map((x) => `${x.id} ${x.dc}`).join(" · "));
  /* A PROPRIEDADE QUE PROTEGE A TROCA DE RÉGUA: onde o sistema não sabe ler
     o tamanho, o degrau é o 14 de antes. A mudança só morde com informação. */
  t("o degrau padrão é o 14 de sempre", tamanhoPadrao().dc === 14);
  t("frase ilegível cai no padrão", tamanhoDoPedido("tento convencer ele de umas coisas").id === "favor");
  t("e o mais caro ganha quando há dois pedidos na mesma frase",
    tamanhoDoPedido("me diz o que se comenta e abre o portão para mim").id === "risco");
}

sec("2. a dificuldade sai da pessoa E do pedido");
{
  const fofoca = ler("tento convencer o guarda a me dizer o que se comenta na rua", guarda);
  const portao = ler("tento convencer o guarda a abrir o portão para mim", guarda);
  const traicao = ler("tento convencer o guarda a entregar seu capitão", guarda);
  console.log(`      mesmo guarda: fofoca ${fofoca.dc} · portão ${portao.dc} · traição ${traicao.dc}`);
  t("arrancar fofoca é mais fácil que abrir o portão", fofoca.dc < portao.dc);
  t("e abrir o portão é mais fácil que trair o capitão", portao.dc < traicao.dc);

  const mesmoFavor = [
    ["ao amigo taverneiro", ler("tento convencer o Bram a me dar um desconto", amigo).dc],
    ["ao guarda estranho", ler("tento convencer o guarda a me dar um desconto", guarda).dc],
    ["ao nobre inimigo", ler("tento convencer o Corvo a me dar um desconto", inimigo).dc],
  ];
  console.log("      mesmo favor: " + mesmoFavor.map(([q, d]) => `${q} ${d}`).join(" · "));
  t("o mesmo favor é mais barato com quem gosta de você", mesmoFavor[0][1] < mesmoFavor[1][1]);
  t("e mais caro com quem odeia", mesmoFavor[2][1] > mesmoFavor[1][1]);
  t("a razão de cada número vai para a tela", /amigo/.test(ler("tento convencer o Bram a me dar um desconto", amigo).deOnde));

  /* sem pessoa resolvida, o sistema não chuta: cai no degrau e mais nada */
  const anonimo = ler("tento convencer alguém a me dar um desconto", null);
  t("sem saber com quem se fala, sobra só o degrau", anonimo.dc === tamanhoPadrao().dc);
  t("e o veredicto diz que não há nome", anonimo.quem === "");
}

sec("3. as alavancas — e os blefes que não colam");
{
  t("quatro alavancas", ALAVANCAS.length === 4);
  t("todas conferem alguma coisa na ficha", ALAVANCAS.every((a) => typeof a.confere === "function" && a.semIsso));

  const semOuro = ler("tento convencer o guarda a abrir o portão, ofereço ouro", guarda, { personagem: pobre });
  const comOuro = ler("tento convencer o guarda a abrir o portão, ofereço ouro", guarda);
  console.log(`      portão: prometendo ouro ${semOuro.dc} · tendo ouro ${comOuro.dc}`);
  t("prometer ouro que não se tem não desconta nada", semOuro.dc > comOuro.dc);
  t("e o sistema DIZ que o blefe não contou", semOuro.social.blefes.some((b) => b.id === "moeda"));
  t("o blefe aparece na linha do jogador", /Não contou/.test(falaDosBlefes(semOuro.social)));
  t("e sem blefe não há linha nenhuma", falaDosBlefes(comOuro.social) === "");
  t("quem tem ouro paga de verdade", comOuro.social.custoEmMoedas > 0);

  const chantagem = ler("tento convencer o Bram a mentir por mim, eu sei o que ele esconde", amigo);
  t("saber o segredo é a alavanca mais forte", chantagem.social.alavancas.some((a) => a.id === "segredo"));
  t("e ela cobra na relação", chantagem.social.alavancas.find((a) => a.id === "segredo").piora > 0);
  const semSegredo = ler("tento convencer o guarda a mentir por mim, eu sei o que ele esconde", guarda);
  t("com quem não esconde nada, a chantagem é blefe", semSegredo.social.blefes.some((b) => b.id === "segredo"));

  /* o aço só vale para quem intimida: ameaçar enquanto se tenta convencer
     é uma contradição, não um bônus */
  const aco = alavancasNaMesa("encosto a lâmina no pescoço dele", { pers: heroi, pericia: "intimidacao" });
  const acoConvencendo = alavancasNaMesa("encosto a lâmina no pescoço dele", { pers: heroi, pericia: "persuasao" });
  t("o aço conta para quem intimida", aco.valem.some((a) => a.id === "aco"));
  t("e não conta para quem tenta convencer", !acoConvencendo.valem.some((a) => a.id === "aco"));
  t("desarmado, o aço não existe", !alavancasNaMesa("encosto a lâmina nele", { pers: pobre, pericia: "intimidacao" }).valem.some((a) => a.id === "aco"));
}

sec("4. o que conversa nenhuma compra");
{
  t("três coisas fora da conversa", FORA_DA_CONVERSA.length === 3);
  t("e todas dizem o que um dia mudaria", FORA_DA_CONVERSA.every((f) => f.comoSeria.length >= 2));
  const v = ler("tento convencer o guarda a se matar por mim", guarda);
  t("pedir a própria vida não é teste difícil — é outra categoria", v.tipo === "foraDaConversa");
  t("e o sistema diz por quê", /a pr[óo]pria vida/.test(v.porque));
  t("o envelope proíbe a fresta", /NÃO abra uma fresta/.test(envelopeForaDaConversa(FORA_DA_CONVERSA[0], "Vela")));
  t("entregar a família também", ler("tento convencer o Bram a entregar a própria filha", amigo).tipo === "foraDaConversa");
  /* e não vira tentativa registrada: não é algo que um dia reabra com ajuda */
  t("não gera chave de tentativa", !v.chave);
}

sec("5. o sucesso compra o que está escrito, e nada além");
{
  const v = ler("tento convencer o guarda a abrir o portão para mim", guarda);
  const env = envelopeSocial(v.social, { passou: true, quem: "Vela", rotulo: "convencer" });
  t("o envelope diz o que o sucesso comprou", /O QUE O SUCESSO COMPROU, exatamente:/.test(env));
  t("e o que ele NÃO comprou", /O QUE ELE NÃO COMPROU:/.test(env));
  t("e proíbe o sucesso de escalar para o favor seguinte", /um sucesso não escala para o favor seguinte/.test(env));
  const envN = envelopeSocial(v.social, { passou: false, quem: "Vela", rotulo: "convencer" });
  t("na recusa, proíbe a meia-concessão", /NÃO me dê metade do que pedi/.test(envN));
  t("e proíbe o terceiro que faz o favor no lugar dela", /terceiro que faça o favor/.test(envN));
}

sec("6. a relação se mexe — e as quatro do começo não são temperatura");
{
  t("a escada tem dez degraus", ESCADA_DA_RELACAO.length === 10);
  t("ameaçar um neutro o afasta", moverRelacao("neutro", 2) === "rival");
  t("e um rival vira inimigo", moverRelacao("rival", 1) === "inimigo");
  t("inimigo é o fundo", moverRelacao("inimigo", 3) === "inimigo");
  /* um cônjuge irritado não vira "aliado": laço não é humor */
  t("um cônjuge ameaçado continua cônjuge", moverRelacao("conjuge", 2) === "conjuge");
  t("um aliado ameaçado continua aliado", moverRelacao("aliado", 2) === "aliado");
  t("relação desconhecida não quebra", moverRelacao("xyz", 2) === "xyz");
}

sec("7. O CUSTO DA FALHA — falhar deixa de ser um beco");
{
  t("a tabela cobre os alvos que têm preço", CUSTO_DE_FALHAR.length >= 10);
  t("todo custo tem a frase da falha seca", CUSTO_DE_FALHAR.every((c) => c.seca && c.seca.length > 20));
  t("e todo `porPouco` tem o preço escrito", CUSTO_DE_FALHAR.filter((c) => c.porPouco).every((c) => c.preco && c.preco.length > 20));
  /* o social fica FORA de propósito: ali "consegui, mas caro" já é um
     degrau da escada do pedido, e somar os dois daria o favor duas vezes */
  const sociais = DESAFIOS.filter((d) => d.social).map((d) => d.alvo);
  t("nenhum alvo social está na tabela de custo", sociais.every((a) => !custoPorAlvo(a)));

  const tranca = ler("arrombo a porta no braço", guarda);
  const dc = tranca.dc;
  t("falhar por 1 vira sucesso pago", desfechoDaFalha(tranca, dc - 1, dc).porPouco === true);
  t("falhar por 2 também", desfechoDaFalha(tranca, dc - 2, dc).porPouco === true);
  t("falhar por 3 é falha seca", desfechoDaFalha(tranca, dc - 3, dc).porPouco === false);
  t("passar não gera custo", desfechoDaFalha(tranca, dc, dc) === null);
  /* dentro da luta o turno JÁ é o preço: nada de vitória a prazo */
  t("no meio da luta não há vitória paga", desfechoDaFalha(tranca, dc - 1, dc, { emCombate: true }).porPouco === false);

  const pago = desfechoDaFalha(tranca, dc - 1, dc);
  t("o preço da tranca é tempo", pago.minutosExtra > 0);
  t("e barulho — que vira pergunta ao oráculo", pago.barulhoExtra === true);
  t("a falha seca não acrescenta barulho novo", desfechoDaFalha(tranca, dc - 5, dc).barulhoExtra === false);
  t("a fala ao jogador mostra por quanto faltou", /Faltaram 1/.test(falaDoCusto(pago)));
  t("o envelope do sucesso pago manda narrar os DOIS", /narre o sucesso E o preço/.test(envelopeDoCusto(pago, "abrir")));
  t("e proíbe inventar um custo maior", /não invente um custo maior que este/i.test(envelopeDoCusto(pago, "abrir")));
  t("o envelope da falha seca proíbe o 'nada acontece'", /não como um "nada acontece"/.test(envelopeDoCusto(desfechoDaFalha(tranca, dc - 8, dc), "abrir")));

  /* escutar não tem vitória paga: ou se ouve ou não se ouve */
  const escuta = ler("encosto o ouvido na porta", guarda);
  t("escutar não negocia por pouco", desfechoDaFalha(escuta, escuta.dc - 1, escuta.dc).porPouco === false);
  t("mas ainda assim cobra alguma coisa", desfechoDaFalha(escuta, escuta.dc - 1, escuta.dc).minutosExtra > 0);
}

sec("8. o que isso custa em equilíbrio, medido");
{
  /* a pergunta honesta: quanto o `porPouco` sobe a chance de conseguir?
     Rolamos d20+mod contra a dificuldade, 20 mil vezes, com e sem a regra. */
  const tranca = ler("arrombo a porta no braço", guarda);
  const dc = tranca.dc, mod = 1, N = 20000;
  let antes = 0, depois = 0;
  for (let i = 0; i < N; i++) {
    const total = 1 + Math.floor(Math.random() * 20) + mod;
    if (total >= dc) { antes++; depois++; }
    else if (dc - total <= 2) depois++;
  }
  const a = Math.round((antes / N) * 100), d = Math.round((depois / N) * 100);
  console.log(`      dif. ${dc}, bônus +${mod}: conseguia ${a}% · agora consegue ${d}% (dos quais ${d - a} pagando)`);
  t("a regra sobe a chance em cerca de dez pontos", d - a >= 8 && d - a <= 12);
  t("e a maioria dos sucessos continua sendo limpa", a > (d - a));
}

sec("9. o livro de tentativas fecha o PEDIDO, não a conversa");
{
  /* chavear o social pelo LUGAR faria o segundo assunto com o mesmo
     taverneiro ouvir "você já tentou isso aqui" — falso, e travaria a
     conversa inteira depois de uma recusa qualquer */
  const primeiro = ler("tento convencer o guarda a me dizer o que se comenta", guarda);
  const reg = registrarTentativa({}, primeiro.chave, { resultado: "falha", dia: 1 });
  const repetido = ler("tento convencer o guarda a me dizer o que se comenta", guarda, { tentativas: reg });
  const outroPedido = ler("tento convencer o guarda a me emprestar a chave", guarda, { tentativas: reg });
  const outraPessoa = ler("tento convencer o Bram a me dizer o que se comenta", amigo, { tentativas: reg });
  t("insistir no MESMO pedido à mesma pessoa é barrado", repetido.tipo === "jaTentou");
  t("mas outro pedido à mesma pessoa rola", outroPedido.tipo === "teste");
  t("e o mesmo pedido a outra pessoa rola", outraPessoa.tipo === "teste");
  t("a chave carrega quem e o quê", /vela/i.test(primeiro.chave) && /conversa/.test(primeiro.chave));
}

sec("10. O PREÇO EM PELE (v9.66)");
{
  const escalar = ler("escalo o muro pelo lado da hera", guarda);
  const dc = escalar.dc;
  t("escalar carrega a queda", !!escalar.queda && escalar.queda.metros >= 2);
  t("e ela tem nome, para o Mestre descrever sem inventar", escalar.queda.nome.length > 3);
  t("vasculhar não carrega queda nenhuma", ler("reviro o quarto", guarda).queda === null);

  /* a altura sai do LUGAR e da semente: a mesma parede é a mesma parede */
  const outraVez = ler("escalo o muro pelo lado da hera", guarda);
  t("a mesma parede tem sempre a mesma altura", outraVez.queda.metros === escalar.queda.metros);
  const penhasco = ler("escalo o penhasco", guarda);
  const escadaria = ler("subo pela escadaria", guarda);
  console.log(`      muro ${escalar.queda.metros} m · penhasco ${penhasco.queda.metros} m · escadaria ${escadaria.queda.metros} m`);
  t("o penhasco é mais alto que o muro", penhasco.queda.metros > escalar.queda.metros);
  t("e a frase manda sobre o lugar", penhasco.queda.nome === "o penhasco");

  /* os dois lados do preço são DIFERENTES: subir machucado não é despencar */
  const seca = desfechoDaFalha(escalar, dc - 6, dc);
  const paga = desfechoDaFalha(escalar, dc - 1, dc);
  t("falhar feio na escalada é cair", !!seca.pele && seca.pele.queda === true);
  t("falhar por pouco é subir machucado, não cair", !paga.pele.queda && paga.pele.condicao === "enfraquecido");
  t("a tranca cobra o ombro na vitória paga", desfechoDaFalha(ler("arrombo a porta", guarda), 10, 15).pele === null);
  {
    const tr = ler("arrombo a porta no braço", guarda);
    t("e cobra quando falha por pouco", desfechoDaFalha(tr, tr.dc - 1, tr.dc).pele.dano === 2);
  }
  /* onde não há preço em pele, o campo é nulo — e não um objeto vazio que
     alguém, um dia, leria como "tem alguma coisa aqui" */
  {
    const busca = ler("reviro o quarto", guarda);
    t("vasculhar não custa pele nenhuma", desfechoDaFalha(busca, busca.dc - 1, busca.dc).pele === null);
  }

  /* a queda rola 1d6 por 3 m, com teto — e a sorte entra por parâmetro,
     para ninguém sortear isto com Math.random escondido */
  {
    const q = { metros: 9, dados: 3, nome: "o penhasco" };
    t("três dados numa queda de nove metros", rolarQueda(q, { sorte: () => 0 }).dados === 3);
    t("o pior caso é 1 por dado", rolarQueda(q, { sorte: () => 0 }).total === 3);
    t("e o melhor é 6", rolarQueda(q, { sorte: () => 0.999 }).total === 18);
    t("o teto existe: nem uma torre vira 20d6", quedaDe("x", "a torre altíssima do farol", "escalo a torre").dados <= 8);
  }

  /* ---- REGRESSÃO: a dificuldade da queda é do PENHASCO ----
     Achado JOGANDO, e é o mesmo bug pela quarta vez neste projeto: a
     primeira versão passava por `dcDaFonte`, que soma nível/3. Na tela, 10
     metros viraram dificuldade 19 para um herói de nível 12 — um alpinista
     experiente errando a salvaguarda que um recruta passaria. */
  {
    t("cair de mais alto é mais difícil de aguentar", dcDaQueda(12) > dcDaQueda(3));
    t("e a conta não conhece o herói", dcDaQueda(9) === dcDaQueda(9));
    t("um tombo de metro e meio não vira dificuldade de dragão", dcDaQueda(1.5) <= 12);
    t("e nem o abismo passa de 20", dcDaQueda(200) === 20);
    console.log("      dif. da queda: 3 m → " + dcDaQueda(3) + " · 10 m → " + dcDaQueda(10) + " · 30 m → " + dcDaQueda(30));
  }
}

sec("11. A APROXIMAÇÃO (v9.69) — a frase da elfa");
{
  const elfa = { nome: "Lírien", papel: "batedora", relacao: "desconhecido", segredo: "", notas: "" };
  const q = (f, p = elfa, extra = {}) => ler(f, p, extra);
  /* o relato veio com a frase exata; ela caía em `livre` e virava ficção
     pura — sem dado, sem torcida, sem prêmio nem consequência */
  const v = q("vou na elfa bonita que acabou de passar por mim e digo: você caiu do céu? porque você é um anjo");
  t("a frase da elfa vira teste", v.tipo === "teste" && v.id === "impressionar");
  t("é Persuasão", v.pericia === "persuasao");
  t("e o degrau é a simpatia, não um favor", v.social.tamanho === "simpatia");
  t("o sucesso compra atenção, não afeto", /a conversa continua/.test(v.social.cede));
  t("e o envelope diz o que ele NÃO compra", /não se ganha numa frase/.test(v.social.nunca));

  /* O GATILHO É A ESTRUTURA, não o conteúdo da cantada: aproximar-se de
     alguém e dirigir uma fala a ela. Nenhum regex separa um galanteio de
     conversa fiada pelo conteúdo, e tentar isso pediria dado a cada frase. */
  for (const f of ["dou uma cantada nela", "elogio o vestido dela", "puxo conversa com ela", "me aproximo dela e digo que nunca vi ninguém assim", "chego junto e solto um gracejo"]) {
    t(`"${f}" também`, (q(f) || {}).id === "impressionar");
  }
  /* e o outro lado, que é o que impede o teste a cada turno */
  for (const f of ["pergunto o nome dele", "converso com o taverneiro", "ando até o balcão", "digo bom dia", "sento numa mesa"]) {
    const r = q(f);
    t(`"${f}" continua sem dado`, !r || r.tipo === "livre");
  }
  t("e agredir alguém não é cortejá-lo", (q("vou até ele e ataco com a espada") || {}).id !== "impressionar");
  t("nem arrombar a porta a caminho", (q("vou até a porta e a arrombo no braço") || {}).id === "tranca");

  /* O FREIO contra a insistência não é o regex: é o livro de tentativas.
     Cada pessoa dá UMA primeira impressão. */
  {
    const um = q("dou uma cantada nela");
    const reg = registrarTentativa({}, um.chave, { resultado: "falha", dia: 1 });
    t("a mesma cantada na mesma pessoa é barrada", q("dou uma cantada nela", elfa, { tentativas: reg }).tipo === "jaTentou");
    t("mas com outra pessoa rola de novo", q("dou uma cantada nela", { ...elfa, nome: "Bram" }, { tentativas: reg }).tipo === "teste");
  }

  /* REGRESSÃO achada aqui: "dou uma cantada" contava como OURO NA MESA,
     porque a alavanca aceitava o verbo `dou` solto e o herói tinha moedas.
     A dificuldade caía três pontos por um suborno que ninguém ofereceu. */
  {
    const cantada = q("dou uma cantada nela");
    t("dar uma cantada não é dar dinheiro", !cantada.social.alavancas.some((a) => a.id === "moeda"));
    const ouro = ler("tento convencer o guarda a abrir o portão, ofereço 300 moedas", guarda);
    t("mas oferecer 300 moedas continua sendo", ouro.social.alavancas.some((a) => a.id === "moeda"));
  }
}

sec("12. QUEM VIVE DE CONTAR (R1) — o informante deixa traço");
{
  /* Arrancar informação é a coisa mais feita fora da luta, e até aqui não
     deixava traço nenhum: o sistema não sabia separar a pessoa a quem se
     perguntou uma vez daquela a quem se pergunta tudo há semanas — e a
     segunda é uma relação, não uma conversa.

     R1 só CRIA o sinal. Quem o lê é R2; aqui prova-se o julgamento, o
     registro e a fiação, e mais nada. */

  /* ---- o catálogo, e o que ele recusa ---- */
  t(`há papéis de informante (${PAPEIS_DE_INFORMANTE.length})`, PAPEIS_DE_INFORMANTE.length >= 5);
  t("cada um tem id e regra", PAPEIS_DE_INFORMANTE.every((x) => x.id && x.rx instanceof RegExp));
  t("e nenhum id se repete", new Set(PAPEIS_DE_INFORMANTE.map((x) => x.id)).size === PAPEIS_DE_INFORMANTE.length);
  for (const p of ["informante", "informador", "dedo-duro", "dedoduro", "alcaguete", "delator",
    "espião", "espiã do porto", "espionagem", "olheiro da guilda", "os ouvidos do barão",
    "observador", "batedor", "batedora", "contato na doca", "fixer", "atravessador", "intermediário"])
    t(`"${p}" vive de contar`, ehInformante(p) === true);
  /* O VIZINHO QUE NÃO É. O guarda que conta um boato fez um favor; o
     informante que conta um boato fez o trabalho dele — e é a diferença
     entre uma conversa e uma relação que se repete. Confundir os dois faria
     toda campanha "usar informante" sem nunca ter procurado um. */
  for (const p of ["taverneiro", "capitão da guarda", "mercador", "estalajadeiro", "ferreiro",
    "sacerdote", "nobre", "camponês", "mendigo", "ladrão", "barqueira", "escriba"])
    t(`"${p}" não é informante`, ehInformante(p) === false);
  /* e os dois recuos escritos na tabela: batedor DE CARTEIRAS furta, e
     batedor DE MANIFESTOS confere papel — nenhum dos dois vende notícia */
  t("o batedor de carteiras não é informante", ehInformante("batedor de carteiras") === false);
  t("nem o batedor de manifestos", ehInformante("batedor de manifestos") === false);
  t("lixo não é informante",
    [null, undefined, "", 0, {}, [], NaN, false].every((v) => ehInformante(v) === false));

  /* A TABELA NÃO MEXE NO PREÇO, de propósito: uma linha a mais em
     `PESO_DO_PAPEL` mudaria a dificuldade de toda conversa de toda campanha
     em curso. Aqui só se RECONHECE o papel. */
  t("nenhum papel de informante pesa na escada",
    PAPEIS_DE_INFORMANTE.every((x) => pesoDoPapel(x.id) === null));
  {
    const semPapel = { nome: "Ninguém", papel: "", relacao: "desconhecido", segredo: "", notas: "" };
    const espiao = { ...semPapel, nome: "Vir", papel: "espião" };
    const frase = "pergunto o que se comenta na rua";
    t("e a conta com informante sai igual à conta com ninguém",
      dificuldadeSocial({ texto: frase, pessoa: espiao }).dc === dificuldadeSocial({ texto: frase, pessoa: semPapel }).dc);
  }

  /* ---- as três portas do julgamento ---- */
  const espiao = { nome: "Vir", papel: "espião do porto", relacao: "desconhecido", segredo: "", notas: "" };
  const taverneiro = { nome: "Bram", papel: "taverneiro", relacao: "amigo", segredo: "", notas: "" };
  t(`os degraus que são consulta (${PEDIDOS_QUE_SAO_CONSULTA.join(", ")})`,
    PEDIDOS_QUE_SAO_CONSULTA.length === 2 && PEDIDOS_QUE_SAO_CONSULTA.every((id) => !!tamanhoPorId(id)));
  /* são os DOIS PRIMEIROS da escada, e isso não é coincidência: pedir uma
     direção e pedir o que se comenta é pedir INFORMAÇÃO. Do favor para cima
     já se está pedindo que a pessoa FAÇA alguma coisa. */
  t("e são os dois mais baratos da escada",
    PEDIDOS_QUE_SAO_CONSULTA.join() === TAMANHOS_DO_PEDIDO.slice(0, 2).map((x) => x.id).join());

  const conta = (frase) => dificuldadeSocial({ texto: frase, pessoa: espiao });
  const consulta = conta("pergunto o que se comenta na rua");
  t("o pedido de informação é reconhecido como consulta", PEDIDOS_QUE_SAO_CONSULTA.includes(consulta.tamanho));
  t("as três portas abertas contam",
    consultouInformante({ conta: consulta, pessoa: espiao, passou: true }) === true);
  /* AS TRÊS RECUSAS, uma a uma — cada porta fechada sozinha basta */
  t("recusa 1: o teste falhou (perguntar e levar não é a mesma coisa)",
    consultouInformante({ conta: consulta, pessoa: espiao, passou: false }) === false);
  const favor = conta("me empresta a chave do armazém");
  t("recusa 2: o pedido não era de informação",
    !PEDIDOS_QUE_SAO_CONSULTA.includes(favor.tamanho)
    && consultouInformante({ conta: favor, pessoa: espiao, passou: true }) === false);
  t("recusa 3: a pessoa não vive disso",
    consultouInformante({ conta: consulta, pessoa: taverneiro, passou: true }) === false);
  /* e o lixo: `= {}` no destructuring não cobre `null` explícito, e um
     `null` aqui é o caso normal — o App chama isto com o que tiver */
  t("sem nada, não contou",
    [null, undefined, {}, { passou: true }, { conta: consulta, passou: true },
      { pessoa: espiao, passou: true }, { conta: null, pessoa: null, passou: true }]
      .every((d) => consultouInformante(d) === false));
  t("e conta sem tamanho não contou", consultouInformante({ conta: {}, pessoa: espiao, passou: true }) === false);

  /* ---- o razão, em npcs.js ---- */
  const reg0 = { Vir: criarNPC("Vir", { papel: "espião do porto" }), Bram: criarNPC("Bram", { papel: "taverneiro" }) };
  t("gente nasce sem consulta nenhuma", reg0.Vir.consultas === 0 && reg0.Bram.consultas === 0);
  const reg1 = registrarConsulta(reg0, "Vir");
  t("registrar conta um", reg1.Vir.consultas === 1);
  /* IMUTÁVEL, como tudo aqui: registro novo, ficha nova, nada mexido no
     lugar — é o que deixa o autosave e o undo do App confiarem no ref */
  t("e o registro de entrada não muda", reg0.Vir.consultas === 0 && reg1 !== reg0 && reg1.Vir !== reg0.Vir);
  t("quem não foi consultado fica como estava", reg1.Bram === reg0.Bram);
  const reg3 = registrarConsulta(registrarConsulta(reg1, "vir"), "VIR");
  t("a caixa das letras é da IA, não minha", reg3.Vir.consultas === 3);
  t("nome que não existe não quebra nem inventa ficha",
    registrarConsulta(reg1, "Fulano") === reg1 && Object.keys(registrarConsulta(reg1, "Fulano")).length === 2);
  t("registro nulo não quebra",
    registrarConsulta(null, "Vir") === null && registrarConsulta(undefined, "Vir") === undefined);
  t("e sem nome também não", registrarConsulta(reg1, "") === reg1 && registrarConsulta(reg1, null) === reg1);

  /* ---- a soma da campanha ---- */
  t("a campanha sem consulta vale zero", vezesQueUsouInformante(reg0) === 0);
  t("e soma o que houve", vezesQueUsouInformante(reg3) === 3);
  /* FICHA DE SAVE ANTIGO não tem o campo, e ficha mexida à mão pode ter
     qualquer coisa nele: tudo que não é inteiro positivo vale zero. É o que
     faz o campo novo não precisar de migração nenhuma. */
  t("save antigo, sem o campo, vale zero", vezesQueUsouInformante({ Velho: { nome: "Velho", papel: "espião" } }) === 0);
  t("e lixo no campo também",
    vezesQueUsouInformante({
      a: { consultas: null }, b: { consultas: "muitas" }, c: { consultas: -4 },
      d: { consultas: NaN }, e: { consultas: {} }, f: {}, g: null,
    }) === 0);
  t("fração conta pelo inteiro de baixo", vezesQueUsouInformante({ a: { consultas: 2.9 } }) === 2);
  t("registro vazio ou nulo vale zero",
    vezesQueUsouInformante({}) === 0 && vezesQueUsouInformante(null) === 0 && vezesQueUsouInformante(undefined) === 0);
  /* E CONTA OS MORTOS: o herói se apoiou naquela boca, e o que ela soube
     dele não desaparece porque ela morreu. */
  t("e os mortos continuam contando",
    vezesQueUsouInformante({ ...reg3, Vir: { ...reg3.Vir, status: "morto" } }) === 3);

  /* SOBREVIVE AO MERGE. Toda cena remescla a ficha de quem aparece; se o
     merge zerasse o campo, o razão seria apagado no turno seguinte ao da
     consulta e ninguém notaria — o número é bastidor. */
  const mesclado = mesclarNPC(reg3.Vir, { local: "as docas", notas: "sabe do contrabando", papel: "espião do porto" });
  t("mesclarNPC preserva a contagem", mesclado.consultas === 3);
  t("e o merge muda o que tinha de mudar", mesclado.local === "as docas");
  t("a soma sobrevive ao merge", vezesQueUsouInformante({ ...reg3, Vir: mesclado }) === 3);

  /* ---- ligado ao jogo ---- */
  {
    const APP = fs.readFileSync("../src/App.jsx", "utf8");
    const i = APP.indexOf("if (consultouInformante(");
    t("a fiação existe no App", i > 0);
    /* dentro do bloco social: é ele que tem a conta, a ficha e o resultado
       do dado na mão no mesmo instante */
    const iSocial = APP.indexOf("if (des && des.social)");
    t("e mora dentro do bloco social", iSocial > 0 && iSocial < i);
    /* o bloco é lido do `try {` que o abre até o `calou` que o fecha — é
       assim que se prova que a fiação está DENTRO do embrulho, e não ao
       lado dele com um try qualquer por perto */
    const marca = 'catch (e) { calou("consultaDeInformante", e); }';
    const fim = APP.indexOf(marca, i);
    t("o calou fecha depois da fiação", fim > i);
    const bloco = APP.slice(APP.lastIndexOf("try {", i), fim + marca.length);
    t("julga com a conta, a pessoa e o resultado do dado",
      /consultouInformante\(\{ conta: des\.social, pessoa: des\.pessoa, passou \}\)/.test(bloco));
    t("e grava no razão de pessoas", /registrarConsulta\(npcsRef\.current, des\.pessoa\.nome\)/.test(bloco));
    t("guardando no ref e no estado", /npcsRef\.current =/.test(bloco) && /setNpcs\(npcsRef\.current\)/.test(bloco));
    /* NUNCA PODE CUSTAR O TURNO: um contador que estoura não pode derrubar
       a cena nem engolir o envelope social logo abaixo */
    t("tudo dentro de um try", /^try \{/.test(bloco));
    t("e o catch é o calou da casa", /catch \(e\) \{ calou\("consultaDeInformante", e\); \}$/.test(bloco));
    /* O SISTEMA NÃO FALA DE SI MESMO: a contagem é bastidor. O jogador vive
       a consulta; o número só vai aparecer pelo efeito, quando R2 o ler. */
    t("nada disto vai à tela", !/pushMsgs|setAviso|notaRef/.test(bloco));
  }
}

console.log(`\nsocial + custo da falha + pele v9.69: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
