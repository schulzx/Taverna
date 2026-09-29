/* teste-peneira-da-agressao.mjs (Fase MM) — "posso atacar o guarda?" não é
   um ataque, e "avanço para socá-lo" é.

   Os dois lados da mesma peneira, vistos a jogar:

   1. NÃO MORDIA O QUE DEVIA. Na prova jogada de MM5, "avanço para socá-lo"
      não abriu luta — o soco virou acidente de cena. A lista de verbos
      conhecia "soco" e não "socá-lo": a primeira pessoa do presente e
      nada mais, quando a ênclise é o jeito normal de um brasileiro
      escrever que bate em alguém.
   2. MORDIA O QUE NÃO DEVIA. `ehDeclaracaoDeAtaque("posso atacar o
      guarda?")` dava `true`, e com o guarda na cena a pergunta ao Mestre
      abria a luta. E, medido para esta suíte, mordia pior do que a pauta
      sabia: "desço a escada", "corto o pão", "chuto a porta", "levo um
      soco" — todos abriam luta (ou mandavam ao Mestre a ordem de abrir).

   A peneira agora é UMA (`peneira.js`), lida pela agressão e pelo
   improviso, oração a oração. Esta suíte prova as duas metades com um
   CORPUS de frases de jogador, cada uma com o veredito esperado. A taxa é
   impressa e o piso é 100%: aqui o falso positivo não custa uma linha,
   custa a cena ("o portão morde só o necessário"). */
import {
  RX_AGRESSAO, NAO_E_AGRESSAO, VERBOS_DE_GOLPE, QUEM_APANHA, PRONOME_DO_ALVO,
  ehDeclaracaoDeAtaque, alvoDaAgressao, lerAgressao, envelopeSemAlvo,
} from "../src/agressao.js";
import { NAO_E_DECLARACAO, PEDIDO_DE_LICENCA, soODeclarado } from "../src/peneira.js";
import { NAO_E_IMPROVISO, lerAcao } from "../src/desafios.js";
import { readFileSync } from "node:fs";

/* a fiação do App.jsx — lida como TEXTO, por âncora, nunca por linha (o
   arquivo tem ~20 mil delas e desloca a cada patch). Prova que a peneira
   e o pronome CHEGARAM ao golpe em combate e à agressão fora dele, sem
   copiar o código: se a âncora sumir ou mudar de forma, esta seção
   estoura primeiro, antes de o jogo mentir para alguém jogando. */
const APP = readFileSync("../src/App.jsx", "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

sec("1. UMA peneira, não duas");
{
  t("as linhas da peneira são as primeiras da agressão, as mesmas",
    NAO_E_DECLARACAO.every((n, i) => NAO_E_AGRESSAO[i] === n));
  t("e, por ela, as primeiras do improviso",
    NAO_E_DECLARACAO.every((n, i) => NAO_E_IMPROVISO[i] === n));
  t("a pergunta e a hipótese estão nela", ["pergunta", "hipotese", "negacao", "passado", "fraseFeita"].every((id) => NAO_E_DECLARACAO.some((n) => n.id === id)));
  t("toda linha diz por que existe", NAO_E_AGRESSAO.every((n) => n.porque && n.porque.length > 30));
  t("ids únicos na agressão", new Set(NAO_E_AGRESSAO.map((n) => n.id)).size === NAO_E_AGRESSAO.length);
  t("a licença do fim diz por que existe", PEDIDO_DE_LICENCA.porque.length > 30);
  t("a lista de quem apanha diz por que é de inclusão", /inclus/.test(QUEM_APANHA.porque));
  t("o pronome diz por que nunca escolhe por eliminação", /elimina/.test(PRONOME_DO_ALVO.porque));
  t("a tabela de verbos tem os dois tipos", VERBOS_DE_GOLPE.some((v) => v.so) && VERBOS_DE_GOLPE.some((v) => !v.so));
  t("todo verbo tem a 1ª pessoa e o infinitivo", VERBOS_DE_GOLPE.every((v) => v.eu && /r$/.test(v.inf)));
  t("RX_AGRESSAO é uma regex só, lida pelos dois", RX_AGRESSAO instanceof RegExp && NAO_E_IMPROVISO.some((n) => n.rx === RX_AGRESSAO));
}

sec("2. a peneira lê ORAÇÃO a oração, e guarda as posições");
{
  const f = "Posso? Ataco o guarda.";
  const s = soODeclarado(f);
  t("o texto peneirado tem o tamanho do original", s.length === f.length);
  t("a pergunta vira espaço", s.slice(0, 6).trim() === "");
  t("a declaração fica", /ataco o guarda/.test(s));
  t("a licença do fim cala o texto inteiro", soODeclarado("Ataco o guarda. Posso?").trim() === "");
  t("a pergunta sobre o depois não cala o antes", /ataco o guarda/.test(soODeclarado("Ataco o guarda. Será que ele revida?")));
  t("a fala entre aspas sai, a ação depois dela fica", /e ataco o guarda/.test(soODeclarado('Digo: "morra!" e ataco o guarda.')));
  t("a fala sem aspas depois de 'digo:' vai até o fim", soODeclarado("Digo: vou te socar e depois ataco.").replace(/digo/, "").trim() === "");
  t("lixo não quebra", soODeclarado(null) === "" && soODeclarado(undefined) === "" && soODeclarado(42) === "42");
  t("travas lixo caem na peneira da casa", soODeclarado("Posso atacar?", null).trim() === "");
  /* o improviso ganha a mesma leitura: a pergunta de antes não cala a
     declaração de depois, e a licença do fim cala tudo */
  const heroi = { nivel: 3, inventario: [], habilidades: [], equipado: {} };
  const ctx = { personagem: heroi, semente: "pen", lugar: "o Corvo", tentativas: {}, dia: 1 };
  const a = lerAcao("Posso? Salto do balcão para o lustre.", ctx);
  t("no improviso, 'Posso? Salto…' ganha o dado", !!a && a.tipo === "teste" && a.atributo === "destreza", JSON.stringify(a && a.tipo));
  t("e 'Salto… Posso?' não ganha", lerAcao("Salto do balcão para o lustre. Posso?", ctx) === null);
  t("e 'Salto o mais alto que posso' é o salto, não a dúvida", (lerAcao("Salto do balcão para o lustre o mais alto que posso", ctx) || {}).atributo === "destreza");
}

sec("3. O CORPUS — frases de jogador, e o que cada uma é");
{
  /* [frase, esperado, porquê (só onde não é óbvio)] */
  const ABRE = [
    /* --- a ênclise, a mesóclise e o infinitivo de intenção --- */
    ["Avanço para socá-lo.", true, "o caso de MM5"],
    ["Vou socá-lo até ele cair.", true],
    ["Parto para socá-lo.", true],
    ["Tento esfaqueá-la pelas costas.", true],
    ["Esmurro-o no queixo.", true],
    ["Salto sobre a mesa e chuto-o no peito.", true],
    ["Atacá-lo-ei agora mesmo.", true, "a mesóclise do futuro é promessa de golpe"],
    ["Corro até ela e golpeio-a com o cabo da espada.", true],
    ["Ataco-o sem hesitar.", true, "o 'sem' vem DEPOIS do verbo"],
    ["Sem pensar duas vezes, apunhalo-o.", true, "o 'sem' não nega o verbo que vem depois da vírgula"],
    ["Tento derrubá-lo com uma rasteira.", true],
    ["Corto-os com a espada, um por um.", true],
    ["Mato-o antes que grite.", true],
    ["Vou matá-lo.", true],
    ["Quero chutá-lo para longe da porta.", true],
    ["Decido atacá-los de uma vez.", true],
    ["Vou socar o guarda.", true],
    /* --- a próclise --- */
    ["Eu o soco com toda a força.", true],
    ["Então o esfaqueio.", true],
    ["Eu a golpeio com o escudo.", true],
    ["O chuto para fora do caminho.", true],
    ["Eu lhe acerto um soco.", true],
    /* --- o "lhe" e o golpe nomeado --- */
    ["Dou-lhe um soco.", true],
    ["Acerto-lhe um murro na cara.", true],
    ["Meto-lhe a espada.", true],
    ["Lhe dou uma bofetada.", true],
    ["Dou-lhe uma cabeçada.", true],
    ["Dou um soco nele.", true],
    ["Dou um soco na cara do bandido.", true],
    ["Enfio a faca nas costas do guarda.", true],
    ["Cravo a adaga no peito dele.", true],
    ["Desço o machado no ogro.", true],
    ["Quebro a garrafa na cabeça do bêbado.", true],
    ["Dou uma joelhada no estômago dele.", true],
    ["Acerto um chute na canela do guarda.", true],
    /* --- o presente com alguém do outro lado --- */
    ["Soco o taverneiro.", true],
    ["Chuto o cachorro.", true],
    ["Corto a garganta do cultista.", true],
    ["Acerto o guarda com o cabo da espada.", true],
    ["Mato o goblin.", true],
    ["Derrubo o bandido com uma rasteira.", true],
    ["Chuto ele.", true],
    ["Bato nele com o porrete.", true],
    ["Bato no guarda até ele cair.", true],
    ["Esfaqueio o mercador pelas costas.", true],
    /* --- o nome próprio, com a maiúscula --- */
    ["Corto Doran de cima a baixo.", true],
    ["Soco o Doran.", true],
    ["Dou um soco em Doran.", true],
    ["Avanço sobre Doran.", true],
    /* --- as formas de sempre (v9.73) --- */
    ["Ataco o bandido com a espada.", true],
    ["Parto para cima dele.", true],
    ["Avanço contra o lobo.", true],
    ["Me atiro sobre o guarda.", true],
    ["Saco a espada e avanço.", true],
    /* --- a pergunta seguida da declaração, e o que só parece pergunta --- */
    ["Posso? Ataco o guarda.", true, "perguntou e não esperou: a declaração vale"],
    ["Chega de conversa. Ataco o guarda.", true],
    ["Não, eu ataco o guarda!", true, "o 'não' com vírgula responde ao Mestre; a ação vale"],
    ["Mestre, ataco o guarda.", true, "falar ao Mestre não é pergunta; o improviso cala, a luta não"],
    ["Ataco o guarda. Será que ele revida?", true, "a pergunta é sobre o depois"],
    ["Nem penso duas vezes: ataco o guarda.", true, "'nem penso' é ênfase, não recusa"],
    ['Digo: "morra!" e ataco o guarda.', true, "a fala é entre aspas; o ataque, fora dela"],
    ["Ataco o mestre de armas.", true],
    ["Ataco o guarda que tinha roubado minha bolsa.", true, "o mais-que-perfeito é do guarda, não do herói"],
    ["Ataco o capitão que devia proteger a cidade.", true, "o 'devia' é do capitão, não uma dúvida do herói"],
  ];
  const NAO_ABRE = [
    /* --- pergunta, licença, hipótese, condição --- */
    ["Posso atacar o guarda?", false, "o caso da pauta"],
    ["Posso atacar o guarda", false, "sem ponto de interrogação continua pergunta"],
    ["Devo atacar o guarda?", false],
    ["Dá para socá-lo daqui?", false],
    ["Consigo acertar o guarda daqui", false],
    ["E se eu atacar o guarda?", false],
    ["Será que consigo derrubá-lo?", false],
    ["Eu podia socá-lo agora.", false],
    ["Se eu atacar o guarda, a cidade inteira vem atrás de mim?", false],
    ["Se o guarda sacar a espada, ataco-o.", false, "condição: o guarda ainda não sacou"],
    ["Quando ele virar as costas, apunhalo-o.", false, "plano para um momento que ainda não chegou"],
    ["Apunhalá-lo-ei quando dormir.", false, "idem — a promessa tem data, e a data é depois"],
    ["Ataco o guarda. Posso?", false, "a licença do fim vale para a frase inteira"],
    ["Ataco o guarda, posso?", false],
    ["Mestre, posso socá-lo?", false],
    ["Golpeá-lo-ia, se pudesse.", false, "a mesóclise do condicional é hipótese"],
    ["Atacaria o guarda se ele me ameaçasse.", false],
    ["Acho que consigo socá-lo antes que ele reaja.", false],
    ["Penso em atacar, mas fico quieto.", false],
    ["Quero saber se dá para atacar o guarda sem a cidade ver.", false],
    ["Durmo e sonho que ataco um dragão.", false, "o sonho é imaginação — achado na varredura fora do corpus"],
    /* --- negação --- */
    ["Não ataco o guarda.", false],
    ["Eu não o ataco; guardo a espada.", false],
    ["Passo pelo guarda sem atacá-lo.", false],
    ["Nunca socaria uma criança.", false],
    ["Não vou socá-lo.", false],
    ["Em vez de atacar o guarda, converso com ele.", false],
    ["Guardo a espada e evito socá-lo.", false],
    /* --- passado e o golpe dos outros --- */
    ["Ele me socou ontem.", false],
    ["Eu tinha socado o guarda antes de fugir.", false],
    ["Ataquei um lobo ontem na estrada.", false],
    ["O bandido me esfaqueou.", false],
    ["Levo um soco no queixo.", false, "o substantivo, não o verbo"],
    ["Ele me deu um soco.", false],
    ["O soco dele me pega de surpresa.", false],
    ["O guarda me ataca!", false, "o mundo atacando primeiro é do Narrador"],
    /* --- figura de linguagem --- */
    ["Essa conta me mata.", false],
    ["Morro de rir com a piada do bardo.", false],
    ["Vou socar essa comida toda.", false],
    ["Ataco o problema de frente.", false],
    ["Ataco o jantar com vontade.", false],
    ["Mato a sede no riacho.", false],
    ["Mato o tempo jogando dados.", false],
    ["Acerto a conta com o taverneiro.", false],
    ["Acerto na mosca a resposta do enigma.", false],
    ["Chuto o balde e vou embora.", false],
    ["Acerto a mão no tempero.", false],
    /* --- o verbo com coisa, não com alguém --- */
    ["Desço a escada até o salão.", false, "a v9.73 abria luta aqui"],
    ["Corto o pão e como.", false],
    ["Chuto a porta.", false, "é o obstáculo, e o obstáculo é do catálogo"],
    ["Dou um soco na mesa.", false, "raiva, não luta"],
    ["Corto a corda do sino.", false],
    ["Derrubo a mesa para me proteger.", false],
    ["Soco a massa do pão.", false],
    ["Acerto o alvo de palha com uma flecha.", false],
    ["Baixo a espada diante do guarda.", false],
    ["Enfio a faca na bainha.", false],
    ["Meto a mão no bolso.", false],
    /* --- fala, e não ato: a ameaça é da intimidação --- */
    ['Digo: "vou te socar".', false, "o soco está na boca, não no punho"],
    ["Grito: vou atacar todos vocês!", false],
    ["Aviso o guarda: se tocar nela, eu o mato.", false],
    ["Sussurro 'eu o mato' para a Iris.", false],
    /* --- treino, brincadeira, finta --- */
    ["Treino o golpe com o boneco de palha.", false],
    ["De brincadeira, dou um soco no ombro do Bram.", false],
    ["Finjo atacar o guarda para distraí-lo.", false, "a finta é engano, não o primeiro golpe"],
    ["Dou um tapa nas costas dele, rindo.", false],
    ["Treino socos no saco de areia.", false],
    /* --- o que nunca foi ataque --- */
    ["Ameaço o guarda com a espada na bainha.", false],
    ["Olho em volta e espero.", false],
    ["Pergunto ao ferreiro quanto custa a lâmina.", false],
    ["Encaro o guarda nos olhos.", false],
  ];
  const CORPUS = [...ABRE, ...NAO_ABRE];
  const erros = [];
  for (const [f, esp, pq] of CORPUS) {
    let got;
    try { got = ehDeclaracaoDeAtaque(f); } catch (e) { got = "estourou: " + e.message; }
    if (got !== esp) erros.push(`"${f}" deu ${got}, esperado ${esp}${pq ? " (" + pq + ")" : ""}`);
  }
  const n = CORPUS.length;
  const taxa = Math.round(((n - erros.length) / n) * 1000) / 10;
  console.log(`      corpus da agressão: ${n - erros.length}/${n} (${taxa}%) · ${ABRE.length} abrem · ${NAO_ABRE.length} não abrem`);
  for (const e of erros) console.log("      erra: " + e);
  t(`o corpus tem ao menos 80 frases (${n})`, n >= 80);
  t("e os dois lados pesam", ABRE.length >= 40 && NAO_ABRE.length >= 40);
  t("toda frase do corpus sai com o veredito esperado (piso: 100%)", erros.length === 0, erros.join(" | "));
}

sec("4. o nome em minúscula — o sistema confere quem está na cena");
{
  t("'corto doran' sem saber quem é Doran não morde", ehDeclaracaoDeAtaque("corto doran ao meio") === false);
  t("sabendo, morde", ehDeclaracaoDeAtaque("corto doran ao meio", { nomes: ["Doran"] }) === true);
  t("opções null não quebram", ehDeclaracaoDeAtaque("Ataco o guarda.", null) === true);
  t("texto lixo não é ataque", ehDeclaracaoDeAtaque(null) === false && ehDeclaracaoDeAtaque("") === false && ehDeclaracaoDeAtaque(42) === false);
  t("e lerAgressao passa os nomes da cena",
    (lerAgressao("corto doran ao meio", { presentes: [{ nome: "Doran", papel: "guarda" }] }) || {}).nome === "Doran");
}

sec("5. O ALVO do pronome — o último citado, o único hostil, ou ninguém");
{
  const doran = { nome: "Doran", papel: "guarda do portão", relacao: "neutra" };
  const yorick = { nome: "Yorick", papel: "taverneiro", relacao: "neutra" };
  const rufino = { nome: "Rufino", papel: "salteador", relacao: "inimigo" };
  const kaelith = { nome: "Kaelith", papel: "", relacao: "aliada" };

  const a = lerAgressao("Avanço para socá-lo.", { presentes: [doran, yorick], recentes: ["Doran cospe no chão e ri de você."] });
  t("o último citado na conversa é o 'lo'", a && a.tipo === "agressao" && a.nome === "Doran", JSON.stringify(a));
  const b = lerAgressao("Avanço para socá-lo.", { presentes: [doran, yorick], recentes: ["Doran resmunga.", "Yorick enxuga um copo e te encara."] });
  t("o mais novo dos recentes ganha", b && b.nome === "Yorick");
  const c = lerAgressao("Avanço para socá-lo.", { presentes: [doran, yorick], recentes: ["Doran empurra Yorick contra o balcão."] });
  t("no mesmo texto, o citado por último ganha", c && c.nome === "Yorick");
  const d = lerAgressao("Avanço para socá-lo.", { presentes: [doran, rufino] });
  t("sem conversa, o único hostil da cena", d && d.tipo === "agressao" && d.nome === "Rufino");
  const e = lerAgressao("Avanço para socá-lo.", { presentes: [doran, yorick] });
  t("dois presentes, ninguém citado, nenhum hostil: NÃO abre", e && e.tipo === "semAlvoConhecido" && e.porPronome === true);
  const f = lerAgressao("Avanço para socá-lo.", { presentes: [rufino, { ...doran, relacao: "hostil" }] });
  t("dois hostis e ninguém citado: também não", f && f.tipo === "semAlvoConhecido");
  const g = lerAgressao("Avanço para socá-lo.", { presentes: [{ nome: "Iris", papel: "herborista" }] });
  t("uma pessoa só na cena NÃO é o 'lo' por eliminação", g && g.tipo === "semAlvoConhecido");
  const h = lerAgressao("Avanço para socá-lo.", { presentes: [doran, rufino, kaelith], grupo: [kaelith], recentes: ["Kaelith tropeça e derruba sua caneca."] });
  t("se o último citado é do grupo, o sistema recusa — não pula para outro", h && h.tipo === "companheiro");
  const i = lerAgressao("Avanço para socá-lo.", { presentes: [doran, yorick], recentes: ["Um tal Garrik passou por aqui."] });
  t("citado que não está na cena não conta", i && i.tipo === "semAlvoConhecido");
  t("o nome na própria frase continua ganhando do pronome",
    (lerAgressao("Doran ri. Avanço para socá-lo.", { presentes: [doran, rufino] }) || {}).nome === "Doran");
  t("sem pronome e sem nome, o hostil NÃO é escolhido ('ataco o sujeito')",
    alvoDaAgressao("Ataco o sujeito.", { presentes: [rufino] }) === null);
  t("o alvo por pronome diz de onde veio", d.nome === "Rufino" && alvoDaAgressao("Avanço para socá-lo.", { presentes: [rufino] }).deOnde === "hostil");
  t("opções null não quebram", alvoDaAgressao("Ataco-o.", null) === null && lerAgressao("Ataco-o.", null).tipo === "semAlvoConhecido");

  const env = envelopeSemAlvo(e, "Avanço para socá-lo.");
  t("o envelope do pronome diz que não citei nome", /não citei nome/.test(env));
  t("e mantém as duas saídas", /decida UMA das duas coisas/.test(env));
  t("o do nome fora do registro continua o de antes",
    /ninguém com o nome que eu citei/.test(envelopeSemAlvo(lerAgressao("Ataco o dragão ancião.", { presentes: [] }), "x")));
}

sec("6. a pergunta não abre luta — nem com o guarda na cena");
{
  const guarda = [{ nome: "Doran", papel: "guarda" }];
  t("'posso atacar Doran?' não é agressão", lerAgressao("Posso atacar Doran?", { presentes: guarda }) === null);
  t("'posso atacar Doran' (sem ?) também não", lerAgressao("Posso atacar Doran", { presentes: guarda }) === null);
  t("'Posso? Ataco Doran.' é", (lerAgressao("Posso? Ataco Doran.", { presentes: guarda }) || {}).tipo === "agressao");
  t("determinismo: mesma frase, mesmo veredito",
    JSON.stringify(lerAgressao("Avanço para socá-lo.", { presentes: guarda, recentes: ["Doran ri."] }))
      === JSON.stringify(lerAgressao("Avanço para socá-lo.", { presentes: guarda, recentes: ["Doran ri."] })));
  const pres = Object.freeze([Object.freeze({ nome: "Doran", papel: "guarda" })]);
  let explodiu = false;
  try { lerAgressao("Ataco-o.", Object.freeze({ presentes: pres, recentes: Object.freeze(["Doran ri."]) })); } catch { explodiu = true; }
  t("não muta o que recebe (congelado, e nada estoura)", !explodiu);
}

sec("7. a fiação no App.jsx — a peneira chegou ao golpe em combate, e o pronome ao pé da letra");
{
  /* `resolverAtaqueJogador` é o golpe DENTRO da luta (o texto digitado e o
     botão, pela porta única) — tinha o MESMO defeito da agressão fora do
     combate: o verbo cru casava "posso atacar?" pelo "atacar" que casa
     "ataco". O corpo da função vai até o próximo `const` de função no
     mesmo nível — `aplicarGolpeDoJogador` —, e é ele que se examina, nunca
     o arquivo inteiro (uma âncora ambígua mentiria sobre qual golpe leu). */
  const iniGolpe = APP.indexOf("const resolverAtaqueJogador = (acao, pers) => {");
  t("resolverAtaqueJogador foi encontrado no App", iniGolpe >= 0);
  const fimGolpe = APP.indexOf("const aplicarGolpeDoJogador = (acao, pers) => {", iniGolpe);
  t("e o fim do seu corpo também (a próxima porta)", fimGolpe > iniGolpe);
  const corpoGolpe = APP.slice(iniGolpe, fimGolpe);
  t("o golpe em combate peneira a frase antes de confiar no verbo cru",
    /soODeclarado\(acao,\s*NAO_E_AGRESSAO\)/.test(corpoGolpe));
  t("e aceita a ênclise pela mesma ehDeclaracaoDeAtaque da agressão fora da luta",
    /ehDeclaracaoDeAtaque\(acao\)/.test(corpoGolpe));
  t("o detector antigo (a regex extraída pelas outras suítes) continua de pé, agora só como sinal",
    /const verboAtaque = \/.+?\/\.test\(acaoN\);/.test(corpoGolpe));
  t("estourar a peneira não pode custar o turno (calou, com try/catch em volta)",
    /try \{\s*const semTravas = soODeclarado/.test(corpoGolpe) && /catch \(e\) \{ calou\(/.test(corpoGolpe));

  /* `declararAgressao` é a porta que abre a luta a partir do texto livre
     (fora do combate). `recentes` é o que faltava para "avanço para
     socá-lo" achar de quem se fala quando há mais de um presente — a
     Seção 5 prova o módulo puro; aqui se prova que o App de fato entrega
     as últimas falas, e não um `undefined` que faria o pronome nunca
     resolver nada em jogo. */
  const iniAgr = APP.indexOf("const declararAgressao = (acao) => {");
  t("declararAgressao foi encontrado no App", iniAgr >= 0);
  const fimAgr = APP.indexOf("\n  };", iniAgr);
  const corpoAgr = APP.slice(iniAgr, fimAgr);
  t("a chamada de lerAgressao leva `recentes`",
    /lerAgressao\(acao,\s*\{[^)]*\brecentes\b[^)]*\}\)/s.test(corpoAgr));
  t("e `recentes` vem das últimas mensagens já guardadas (mensagensRef) — não é estado novo",
    /mensagensRef\.current/.test(corpoAgr) && /\.slice\(-4\)/.test(corpoAgr));
}

console.log(`\npeneira da agressão: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
