/* teste-agressao.mjs (v9.73) — "o mestre chama os combates".

   Esta suíte é mais sobre o que o sistema NÃO faz do que sobre o que ele
   faz, e é de propósito. Abrir uma luta é a coisa mais cara que este
   programa sabe fazer sozinho: come a cena, mexe na ficha, gasta o dia e
   pode matar o herói. Um falso positivo aqui não custa uma linha na tela
   — custa a sessão.

   Por isso a régua é: o sistema nunca inventa o alvo. Se ele não estiver
   no registro e na cena, não há luta, e o turno vai para a IA com uma
   ordem de duas saídas em vez de uma sugestão. */
import {
  RX_AGRESSAO, NAO_E_AGRESSAO, ehDeclaracaoDeAtaque,
  PESO_DO_PAPEL, ameacaDoPapel, alvoDaAgressao, lerAgressao,
  falaDaAgressao, falaDoCompanheiro, envelopeDaAgressao, envelopeSemAlvo,
} from "../src/agressao.js";
import { PORTAS_DO_TURNO, decidirTurno, portasQueAbrem, cascataDoTurno, proximaPorta } from "../src/turno.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. o que É declarar um ataque");
{
  const sim = [
    "Ataco o bandido com a espada.",
    "Saco a espada e avanço sobre o guarda.",
    "Golpeio o ogro com o machado.",
    "Esfaqueio o cultista pelas costas.",
    "Parto para cima do capitão.",
    "Dou uma estocada no soldado.",
    "Avanço contra o lobo.",
    "Soco o taverneiro.",
    "Corto a corda do enforcado e ataco o carrasco.",
  ];
  for (const f of sim) t(`"${f.slice(0, 40)}…"`, ehDeclaracaoDeAtaque(f) === true);
}

sec("2. AS TRAVAS — o que tem cara de ataque e não é");
{
  /* cada linha aqui é um jeito de o sistema abrir uma luta que ninguém
     pediu, e uma luta aberta por engano custa a cena inteira */
  const nao = [
    ["figura de linguagem", "Ataco o problema de frente e proponho um acordo."],
    ["fome", "Ataco o jantar com vontade."],
    ["hipótese", "Se eu atacar o guarda agora, o que acontece?"],
    ["pergunta em voz alta", "Penso em atacar, mas fico quieto."],
    ["passado", "Ataquei um lobo ontem na estrada."],
    ["treino", "Treino o golpe com o boneco de palha."],
    ["conversa", "Pergunto ao ferreiro quanto custa a lâmina."],
    ["furto", "Bato a carteira do mercador."],
    ["intimidação", "Ameaço o guarda com a espada na bainha."],
    ["nada disso", "Olho em volta e espero."],
  ];
  for (const [porque, f] of nao) t(`${porque}: "${f.slice(0, 38)}…"`, ehDeclaracaoDeAtaque(f) === false);
  t("texto vazio não é ataque", ehDeclaracaoDeAtaque("") === false && ehDeclaracaoDeAtaque(null) === false);
  for (const n of NAO_E_AGRESSAO) t(`a trava "${n.id}" diz por que existe`, n.porque.length > 30);
}

sec("3. o peso de quem você atacou — a ameaça sai do PAPEL");
{
  t("capitão da guarda é competente", ameacaDoPapel("capitão da guarda").ameaca === "competente");
  t("guarda de portão é comum", ameacaDoPapel("guarda do portão").ameaca === "comum");
  t("mago é competente", ameacaDoPapel("mago da torre").ameaca === "competente");
  t("barão é elite", ameacaDoPapel("barão de Ponte do Sul").ameaca === "elite");
  t("ferreiro é comum (braço, não treino)", ameacaDoPapel("ferreiro").ameaca === "comum");
  t("taverneiro é fraco", ameacaDoPapel("taverneiro").ameaca === "fraco");
  t("criança é fraco", ameacaDoPapel("criança da rua").ameaca === "fraco");
  t("sem papel, o mundo trata como comum", ameacaDoPapel("").ameaca === "comum");
  t("papel desconhecido também", ameacaDoPapel("domador de abelhas").ameaca === "comum");
  t("acento não muda o peso", ameacaDoPapel("CAPITÃ DA GUARDA").ameaca === "competente");
  for (const x of PESO_DO_PAPEL) t(`o degrau "${x.id}" diz por que existe`, x.porque.length > 30);
}

sec("4. QUEM está sendo atacado — e o sistema nunca inventa");
{
  const presentes = [
    { nome: "Bram", papel: "taverneiro" },
    { nome: "Bram, o Torto", papel: "capitão da guarda" },
    { nome: "Iris", papel: "herborista" },
  ];
  t("o nome citado é o alvo", alvoDaAgressao("Ataco Iris.", { presentes }).nome === "Iris");
  /* mesma regra dos lugares e das habilidades: o nome mais longo ganha */
  t("o nome mais longo ganha", alvoDaAgressao("Ataco Bram, o Torto.", { presentes }).nome === "Bram, o Torto");
  t("quem não está na cena não é alvo", alvoDaAgressao("Ataco Kaelith.", { presentes }) === null);

  /* E AQUI ESTÁ A DIFERENÇA PARA O RESTO DA CASA: no teste social, com uma
     pessoa só na cena, o sistema escolhe ela por eliminação. Aqui não pode
     — escolher errado num teste social custa uma linha; escolher errado
     aqui abre uma luta contra quem o jogador não quis tocar. */
  t("com uma pessoa só na cena, ainda assim NÃO escolhe por eliminação",
    alvoDaAgressao("Ataco o sujeito.", { presentes: [{ nome: "Iris", papel: "herborista" }] }) === null);
}

sec("5. OS TRÊS DESFECHOS");
{
  const presentes = [{ nome: "Doran", papel: "guarda do portão" }, { nome: "Yorick", papel: "taverneiro" }];
  const grupo = [{ nome: "Kaelith" }];

  const a = lerAgressao("Ataco Doran com a espada.", { presentes, grupo });
  t("alvo conhecido abre a luta", a.tipo === "agressao" && a.nome === "Doran");
  t("e a ameaça vem do papel dele", a.ameaca === "comum");
  t("a linha do jogador diz que o combate abriu", /combate está aberto/.test(falaDaAgressao(a)));

  /* o companheiro: o sistema não abre e não vai ao Mestre */
  const c = lerAgressao("Ataco Kaelith.", { presentes: [...presentes, { nome: "Kaelith" }], grupo });
  t("companheiro não vira inimigo por uma frase", c.tipo === "companheiro");
  t("e a recusa pede que se diga com todas as letras", /todas as letras/.test(falaDoCompanheiro(c)));

  /* o alvo que só a IA conhece: a trava mais importante do arquivo */
  const s = lerAgressao("Ataco o dragão ancião.", { presentes, grupo });
  t("alvo fora do registro NÃO abre luta", s.tipo === "semAlvoConhecido");

  t("dentro do combate esta porta não existe", lerAgressao("Ataco Doran.", { presentes, grupo, emCombate: true }) === null);
  t("o que não é ataque devolve nada", lerAgressao("Converso com Doran.", { presentes, grupo }) === null);
}

sec("6. os envelopes — o que a IA não pode mais fazer");
{
  const a = lerAgressao("Ataco Doran.", { presentes: [{ nome: "Doran", papel: "guarda" }] });
  const env = envelopeDaAgressao(a);
  t("proíbe abrir o combate de novo", /NÃO envie "combate_iniciar"/.test(env));
  /* a parte que mais importa: sem isto a IA resolve a luta na prosa e o
     painel vira decoração */
  t("proíbe decidir se acertou", /NÃO decida se o golpe acertou/.test(env));
  t("proíbe fazer o alvo recuar ou se render", /recuar, fugir, se render/.test(env));
  t("e proíbe desfazer o que o jogador fez", /não há versão desta cena em que eu não ataquei/.test(env));

  const s = lerAgressao("Ataco o dragão ancião.", { presentes: [] });
  const env2 = envelopeSemAlvo(s, "Ataco o dragão ancião.");
  t("sem alvo, o envelope dá DUAS saídas e só duas", /decida UMA das duas coisas/.test(env2));
  t("uma delas é abrir o combate agora", /DECLARE "combate_iniciar"/.test(env2));
  t("a outra é dizer que não há ninguém", /NÃO há alvo aqui/.test(env2));
  t("e o que ela não pode é narrar a briga sem painel", /narrar a briga acontecendo sem abrir o combate/.test(env2));
  t("sem veredicto não há envelope", envelopeDaAgressao(null) === "" && envelopeSemAlvo(null) === "");
}

sec("7. A ORDEM — onde a porta nova entra");
{
  const base = {
    ehComando: false, temEscolhaPendente: false, ehConjuracao: false, ehPortal: false,
    ehEntradaEmMasmorra: false, ehSeguirViagem: false, ehPartidaPorNome: false, querPartir: false,
    temAlvoLocal: false, ehAgressao: false, ehDesafio: false, ehPerguntaAoMundo: false,
    temMilagreArmado: false, temHabilidadesSelecionadas: false, emCombate: false, emViagem: false, bloqueado: false,
  };
  t("a porta existe na tabela", PORTAS_DO_TURNO.some((p) => p.id === "agressao"));
  t("e diz por que está onde está", PORTAS_DO_TURNO.find((p) => p.id === "agressao").porque.length > 50);
  t("ataque puro vai para a agressão", decidirTurno({ ...base, ehAgressao: true }).id === "agressao");

  /* A PRECEDÊNCIA QUE IMPORTA: "avanço sobre a porta" acorda as duas —
     agressão e desafio. Ganha a agressão, e a recusa dela cai na porta
     SEGUINTE, que é o desafio: um ataque que o sistema não resolveu ainda
     pode ser um obstáculo. */
  const duas = { ...base, ehAgressao: true, ehDesafio: true };
  t("agressão ganha do desafio", decidirTurno(duas).id === "agressao");
  t("as duas aparecem na cascata", portasQueAbrem(duas).includes("agressao") && portasQueAbrem(duas).includes("desafio"));
  {
    const c = cascataDoTurno(duas);
    const i = c.atalhos.findIndex((p) => p.id === "agressao");
    const j = proximaPorta(c.atalhos, i);
    t("e a recusa da agressão cai no desafio", c.atalhos[j] && c.atalhos[j].id === "desafio");
  }

  /* mas a magia nomeada continua ganhando: "conjuro Mísseis Mágicos e ataco
     o goblin" é a magia, e ela tem alvo, custo e efeito próprios */
  t("magia nomeada ganha da agressão", decidirTurno({ ...base, ehAgressao: true, ehConjuracao: true }).id === "conjurar");
  t("e a resposta a uma pergunta do sistema também",
    decidirTurno({ ...base, ehAgressao: true, temEscolhaPendente: true }).id === "resposta");

  /* dentro da luta a porta some: quem age é o painel, com alcance, posição
     e economia de ação */
  t("em combate a porta não abre", !portasQueAbrem({ ...base, ehAgressao: true, emCombate: true }).includes("agressao"));
  t("e o turno cai na cena", decidirTurno({ ...base, ehAgressao: true, emCombate: true }).id === "cena");
}

console.log(`\nagressão v9.73: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
