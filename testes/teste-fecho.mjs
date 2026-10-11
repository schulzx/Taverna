/* teste-fecho.mjs (Fase MM · a campanha que prende, item 2)
   — a última frase deixa de ser sempre um presságio

   Na 4.ª sessão de prova as respostas fechavam quase todas numa linha de
   ambiente a pressagiar ("o som atravessa a feira como um aviso", "o cheiro
   de chuva entra pela porta como um aviso"). O que empurrava para lá eram
   duas linhas do ofício da cena no prompt fixo — "Termine na imagem" e
   "a cena descrita, o silêncio depois dela" —, e nada que variasse de turno
   para turno. `fecho.js` escolhe o fecho por momento (cinco, numa tabela),
   nunca o mesmo dois turnos seguidos, e a pauta di-lo em `O FECHO`.

   A secção 5 é a sessão 4: a última frase de cada uma das 42 respostas do
   Narrador, tirada do registo, e a forma de cada turno.

   FALHA em HEAD de 11/10 (v9.386): `src/fecho.js` não existe, a pauta não
   tem `fecho`, e o prompt ainda manda terminar na imagem. */
import { lerOPedido } from "../src/escuta.js";
import { rng, hashSemente } from "../src/semente.js";
import { SECOES, porNaPauta, textoDaPauta } from "../src/pauta.js";
import { montarSystemPrompt } from "../src/prompt.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = "estourou") => { try { return f(); } catch { return d; } };

let F = null;
try { F = await import("../src/fecho.js"); } catch { F = null; }
t("o módulo existe e importa em Node", !!F);
if (!F) { console.log(`\nfecho: ${ok} passaram, ${mal + 1} falharam`); process.exit(1); }

const ATO = lerOPedido("Fecho a mão sobre o molho de chaves e saio da botica.");
const PERGUNTA = lerOPedido("Quem és tu, e quem te manda?");
const SISTEMA = lerOPedido("[VIAGEM — tudo rolado pelas tabelas]");
const semeada = (s) => rng(hashSemente(s));

sec("1. as tabelas");
{
  const ids = F.FECHOS.map((f) => f.id);
  t("cinco fechos: pergunta, escolha, corte, consequência, silêncio", ["pergunta", "escolha", "corte", "consequencia", "silencio"].every((x) => ids.includes(x)) && ids.length === 5);
  t("cada fecho diz O QUE é a última frase", F.FECHOS.every((f) => typeof f.diz === "string" && f.diz.length > 20));
  t("a pergunta e o silêncio precisam de alguém em cena", F.FECHOS.filter((f) => f.gente).map((f) => f.id).sort().join() === "pergunta,silencio");
  const M = F.FECHO_POR_MOMENTO;
  t("os cinco momentos têm tabela", ["pergunta", "ato", "sistema", "luta", "fimDeAto"].every((m) => M[m] && Object.keys(M[m]).length));
  t("toda entrada da tabela é um fecho que existe, com peso", Object.values(M).every((o) => Object.entries(o).every(([id, p]) => ids.includes(id) && p > 0)));
  t("o fim de ato acaba numa escolha", Object.keys(M.fimDeAto).join() === "escolha");
  t("o veto do ambiente é tabela", /cheiro/.test(F.VETO_DO_FECHO) && /pressagiar/.test(F.VETO_DO_FECHO));
}

sec("2. o momento");
{
  t("perguntei → pergunta", F.momentoDoFecho({ pedido: PERGUNTA }) === "pergunta");
  t("fiz → ato", F.momentoDoFecho({ pedido: ATO }) === "ato");
  t("envelope do sistema → sistema", F.momentoDoFecho({ pedido: SISTEMA }) === "sistema");
  t("luta ganha da frase", F.momentoDoFecho({ pedido: ATO, luta: true }) === "luta");
  t("o fim de ato ganha de tudo", F.momentoDoFecho({ pedido: PERGUNTA, luta: true, fimDeAto: true }) === "fimDeAto");
  t("lixo é sistema, sem estourar", tenta(() => F.momentoDoFecho(null)) === "sistema" && tenta(() => F.momentoDoFecho({})) === "sistema");
}

sec("3. a escolha");
{
  const r = F.escolherFecho({ pedido: ATO, gente: true, sorte: () => 0 });
  t("devolve id, momento e a linha da pauta", r.id && r.momento === "ato" && /^termine em /.test(r.linha) && r.linha.includes(F.VETO_DO_FECHO));
  t("a linha é curta (cabe na pauta)", r.linha.length < 170);
  t("sorte 0 no ato: a consequência (o peso maior primeiro)", r.id === "consequencia");
  t("nunca o anterior", F.escolherFecho({ pedido: ATO, gente: true, ultimo: "consequencia", sorte: () => 0 }).id !== "consequencia");
  t("sem gente, nunca pergunta nem silêncio", Array.from({ length: 200 }, (_, i) => F.escolherFecho({ pedido: PERGUNTA, gente: false, sorte: semeada("g" + i) }).id).every((id) => id !== "pergunta" && id !== "silencio"));
  t("fim de ato: escolha", F.escolherFecho({ fimDeAto: true, sorte: () => 0.5 }).id === "escolha");
  t("fim de ato depois de uma escolha: outra coisa, não a mesma", F.escolherFecho({ fimDeAto: true, ultimo: "escolha", gente: true, sorte: () => 0 }).id !== "escolha");
  /* mil turnos seguidos, de momentos misturados: nunca dois iguais */
  let ult = "", rep = 0;
  const vistos = new Set();
  const formas = [ATO, PERGUNTA, SISTEMA];
  for (let i = 0; i < 1000; i++) {
    const x = F.escolherFecho({ pedido: formas[i % 3], luta: i % 7 === 0, gente: i % 5 !== 0, ultimo: ult, sorte: semeada("mil|" + i) });
    if (x.id === ult) rep++;
    ult = x.id; vistos.add(x.id);
  }
  t("mil turnos: zero repetições seguidas", rep === 0, `${rep}`);
  t("e os cinco fechos aparecem", vistos.size === 5);
  const seq = (s) => Array.from({ length: 30 }, (_, i) => F.escolherFecho({ pedido: ATO, gente: true, sorte: semeada(`${s}|${i}`) }).id).join();
  t("a mesma semente dá a mesma sequência", seq("a") === seq("a") && seq("a") !== seq("b"));
  t("sorte que não é função, ou que devolve lixo, não estoura", tenta(() => F.escolherFecho({ pedido: ATO, sorte: 3 }).id) !== "estourou" && tenta(() => F.escolherFecho({ pedido: ATO, sorte: () => NaN }).id) !== "estourou");
  t("lixo inteiro: um fecho, sem estourar", typeof tenta(() => F.escolherFecho(null).id) === "string");
}

sec("4. ler o fecho de uma resposta");
{
  t("o sino a dobrar como um aviso é presságio", F.fechoDaNarrativa("O sino da torre começa a dobrar, e o som atravessa a feira como um aviso.") === "pressagio");
  t("o ar abafado é presságio", F.fechoDaNarrativa("Lá fora, o ar abafado aperta a rua como mão no pescoço.") === "pressagio");
  t("a escuridão é presságio", F.fechoDaNarrativa("A escuridão devolve o gosto de ferro à boca.") === "pressagio");
  t("acabar dentro de uma pergunta é pergunta", F.fechoDaNarrativa("Euzébio se inclina. \"Por onde se vai primeiro?\"") === "pergunta");
  t("acabar dentro de uma fala é fala", F.fechoDaNarrativa("Euzébio acelera o passo. \"Falta pouco. E eu com fome.\"") === "fala");
  t("um gesto curto é corte", F.fechoDaNarrativa("Ele não ri. Ele olha para a corda.") === "corte");
  t("uma ação comprida é ação", F.fechoDaNarrativa("A Quimera, ferida, recua dois passos, levanta a pata dianteira e avança de novo contra Tomé e o ladino caído.") === "acao");
  t("vazio e lixo: nada", F.fechoDaNarrativa("") === "" && F.fechoDaNarrativa(null) === "" && F.fechoDaNarrativa({}) !== "estourou");
}

sec("5. a sessão 4");
{
  /* a última frase de cada resposta do Narrador (M1..M42), do registo */
  const ULTIMAS = [
    "A gente vai atrás desse tal de Sino Quieto ou fica aqui enfeitando a praça?\" O sino da torre começa a dobrar para outro marcado na fila, e o som atravessa a feira como um aviso.",
    "aponta com o polegar para o beco escuro atrás do mercado. \"O Sino Quieto é por ali, mas o Belmira só abre quando quer.\"",
    "O sino da praça dobra uma vez, e o mercado inteiro parece prender a respiração.",
    "Ninguém olha para a taverna, mas a conversa fica mais baixa, como se t",
    "A praça segue seu comércio, mas o cheiro de cera e peixe agora tem gosto de recado.",
    "Se eu não voltar, vocês bebem por mim.\" Ele sai sem esperar resposta, e a praça, lá fora, já voltou a gritar seus preços, mas os dois guardas continuam parados, conversando baixo, como quem escolhe.",
    "Uma mulher de preto, com cheiro de ervas, fala baixo para um aprendiz: \"Os de lata já escolheram o canto.\" A praça começa a se armar, e o cheiro de cera gruda no ar como aviso.",
    "Ele olha para a corda.",
    "O sino já tocou fora de hora hoje, e ninguém dobrou duas vezes.\" A multidão se aperta mais, e o guarda levanta a mão para o sino da praça.",
    "Foi ensaio.\" E ninguém ri.",
    "E livro velho não paga homem.\" Inocência desvia o olhar para a janela, como se contasse as badaladas que não vêm.",
    "Sobre a calçada, um menino passa correndo atrás de um arco de madeira, e o barulho dos passos parece vir de muito longe.",
    "Mas o ar está grosso de quem espera.",
    "de Rio Cinzento fumegam sob a luz. Euzébio acelera o passo. \"Falta pouco. E eu com fome.\"",
    "Retalhos, e você não sabe o rosto dele. Euzébio te cutuca. \"É aqui. E a botica é ali no fim da rua. Vai devagar que eu quero te ver entrar primeiro.\"",
    "Lá fora, o ar abafado aperta a rua como mão no pescoço.",
    "O ar abafado cheira a enxofre e a chuva que não vem.",
    "Noé Laminado entra atrás dela, ferido no flanco, a respiração curta, e pergunta como quem diz um nome: \"Quem anda a perguntar por mim?\" Os dois vultos se afastam da vitrine e se perdem na rua, entre o pó e o cheiro de trovoada.",
    "A gaveta certa é a que nunca devia ter sido aberta.\" Lá fora, o ar abafado estala, e o cheiro de chuva entra pela porta aberta como um ladrão.",
    "O ar fica grosso, e o cheiro de chuva entra pela porta como um aviso.",
    "Euzébio assobia uma vez, baixo — o sinal de que não viu mais ninguém, só o silêncio que se arma.",
    "O forte não faz som: só a porta, aberta, e a respiração de Euzébio, curta e tensa.",
    "Euzébio espera, sem te largar os olhos.",
    "E contigo?\" A pergunta fica no ar, junto com o primeiro corvo a crocitar nas ameias.",
    "A tocha estremece, e Sibi dá o primeiro passo.",
    "A tocha balança, e a escuridão além do primeiro arco é uma garganta.",
    "escorre das paredes. Euzébio se inclina para a esquerda. \"Por onde se vai primeiro? Eu prefiro onde caiba a minha adaga.\"",
    "Deixa?\" O lobo dá outro passo para trás, a cauda rente ao chão, e a porta do guardião chia atrás dele.",
    "\"Aqui, ó!\" O lobo cai no vão da porta, as garras chiando no limo, e o corredor atrás dele respira escuro.",
    "A escuridão devolve o gosto de ferro à boca.",
    "o lobo estaca, atento; Euzébio pronto, os dois no fundo da sala, vultos inquietos na luz incerta da tocha que Sibi ergue.",
    "Mas no molho que Sibi carrega, uma das cinco chaves pretas parece mais quente que as outras.",
    "Ninguém viu; ninguém veio.",
    "E o chefe nos viu primeiro.\" A Quimera arranca um rugido que atravessa o peito como trovão, e a sala inteira aguça os sentidos.",
    "No chão, o colar de dentes assombrados escorrega da bolsa, e o fogo que morde as botas de Sibi desenha sombras na parede como um aviso encarnado.",
    "A chuva lá fora engrossa, e o vento uiva nas pedras — lá dentro, só a respiração do monstro e o estalo das chamas na pele.",
    "Sibi está caído, o colar de dentes escuros enrolado na mão como um último juramento.",
    "Sibi está caído, à beira da morte, a Quimera e o Cultista a um passo, Euzébio imóvel no chão.",
    "Dentro, a sala do chefe fica quieta, como quem engole o que nunca mais vai cuspir.",
    "Lá dentro, o portão do fundo range, como se alguém estivesse esperando.",
    "A Quimera range os dentes, cada cabeça olhando para um canto da sala, e avança de novo.",
    "Euzébio continua caído, a mão ainda perto da adaga.",
  ];
  /* a forma de cada turno (s sistema, ? pergunta, ! ato, L luta); o
     companheiro (Euzébio) está em cena até cair, no M37 */
  const FORMA = "s??????!?!???ss??????!ss!!!LLsLLsLLLLLLsLL";
  const lidas = ULTIMAS.map((u) => F.fechoDaNarrativa(u));
  const press = lidas.filter((x) => x === "pressagio").length;
  const fora = lidas.filter((x, i) => FORMA[i] !== "L");
  const pressFora = fora.filter((x) => x === "pressagio").length;
  console.log(`      ANTES: ${press} de ${ULTIMAS.length} respostas fecham em presságio (${pressFora} de ${fora.length} fora da luta)`);
  t("ANTES: a maioria das respostas fecha em presságio", press > ULTIMAS.length / 2);
  t("ANTES: e fora da luta, mais de dois terços", pressFora / fora.length > 2 / 3);
  let ult = "", rep = 0;
  const novos = {};
  const escolhidos = [];
  for (let i = 0; i < FORMA.length; i++) {
    const f = FORMA[i];
    const pedido = f === "?" ? PERGUNTA : f === "!" || f === "L" ? ATO : SISTEMA;
    const x = F.escolherFecho({ pedido, luta: f === "L", gente: i < 36, ultimo: ult, sorte: semeada(`s4|${i + 1}`) });
    if (x.id === ult) rep++;
    ult = x.id;
    novos[x.id] = (novos[x.id] || 0) + 1;
    escolhidos.push(x);
  }
  console.log(`      DEPOIS: ${Object.entries(novos).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  t("DEPOIS: nenhum turno pede presságio, e todo turno leva o veto", escolhidos.every((x) => x.id !== "pressagio" && x.linha.includes(F.VETO_DO_FECHO)));
  t("DEPOIS: nunca o mesmo fecho dois turnos seguidos", rep === 0);
  t("DEPOIS: nenhum fecho passa de um terço da sessão", Object.values(novos).every((v) => v <= FORMA.length / 3));
  t("DEPOIS: as perguntas fecham com quem respondeu (silêncio ou pergunta) na maioria",
    escolhidos.filter((x) => x.momento === "pergunta" && ["silencio", "pergunta"].includes(x.id)).length > escolhidos.filter((x) => x.momento === "pergunta").length / 2);
  t("DEPOIS: depois de cair o companheiro, ninguém pergunta", escolhidos.slice(36).every((x) => x.id !== "pergunta" && x.id !== "silencio"));
}

sec("6. o prompt e a pauta");
{
  /* o mesmo herói e a mesma chamada de teste-prompt.mjs */
  const pers = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
  const P = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal");
  t("o prompt já não manda terminar na imagem", !/Termine na imagem/.test(P));
  t("nem com \"a cena descrita, o silêncio depois dela\"", !/a cena descrita, o silêncio depois dela/.test(P));
  t("e veta o ambiente a pressagiar na última frase", /nunca no cheiro, no som ou no ar que pressagia/.test(P));
  t("sem perder o corte antes de explicar nem o veto às opções", /CORTE ANTES DE EXPLICAR/.test(P) && /NUNCA ofereça opções/.test(P));
  const s = SECOES.find((x) => x.id === "fecho");
  t("a pauta tem O FECHO, depois do RUMO, e é a última na leitura", !!s && s.rotulo === "O FECHO" && SECOES[SECOES.length - 1].id === "fecho");
  t("corta logo depois do rumo e antes da planta", !!s && s.prio > SECOES.find((x) => x.id === "rumo").prio && s.prio < SECOES.find((x) => x.id === "masmorra").prio);
  const x = F.escolherFecho({ pedido: PERGUNTA, gente: true, sorte: () => 0 });
  const txt = textoDaPauta(porNaPauta(porNaPauta({}, "rumo", "responda primeiro ao que perguntei"), "fecho", x.linha));
  t("e a linha chega à pauta, depois do rumo", /O RUMO[\s\S]*O FECHO\s+termine em /.test(txt));
}

console.log(`\nfecho: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
