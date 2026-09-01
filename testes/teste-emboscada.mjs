/* teste-emboscada.mjs (v9.74) — a outra metade da briga.

   A v9.73 deu ao sistema a metade que era dele: o jogador declara o
   primeiro golpe e a luta abre. Esta é a outra ponta, e a divisão é a
   mesma da casa inteira:

     ELA diz que há hostilidade e de que tipo — isso é cena.
     O SISTEMA decide o encontro — quantos são e se cabe no herói.

   Antes disto a IA mandava a lista inteira montada por conta própria e o
   sistema só carimbava um selo depois do fato consumado. O selo
   descrevia; não decidia. */
import {
  RX_INVESTIDA, NAO_E_INVESTIDA, ehInvestida,
  NUMEROS, quantosNaFrase, criaturaNaFrase,
  TETO_DO_DESPROPORCIONAL, montarEmboscada,
  falaDaEmboscada, envelopeDaEmboscada, envelopeSemCriatura, envelopeDesproporcional,
  conferirLista, falaDaListaAparada, envelopeDaListaAparada, envelopeDaLutaImpossivel,
} from "../src/emboscada.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const nv2 = { nivel: 2, vidaMax: 20, grupo: [] };
const nv10 = { nivel: 10, vidaMax: 80, grupo: [] };
const nv18 = { nivel: 18, vidaMax: 200, grupo: [] };

sec("1. isto é uma investida? — a régua é o VERBO, não o substantivo");
{
  const sim = [
    "Três bandidos saltam do mato com as lâminas em punho.",
    "Um lobo irrompe do matagal e se joga sobre você.",
    "Os goblins fecham o cerco.",
    "Dois soldados sacam as armas e avançam.",
    "É uma emboscada: capangas surgem dos dois lados.",
  ];
  for (const f of sim) t(`"${f.slice(0, 40)}…"`, ehInvestida(f) === true);

  /* AS TRAVAS. "Há bandidos na estrada" é cenário; a emboscada lembrada,
     sonhada ou contada por terceiros não está acontecendo agora; e o
     aviso de que algo PODERIA atacar é tensão — virar luta a partir dele
     rouba do jogador a decisão de recuar. */
  const nao = [
    ["cenário, não investida", "Há bandidos acampados na estrada mais adiante."],
    ["contado por terceiros", "Dizem que uma matilha de lobos ataca viajantes por aqui."],
    ["lembrança", "Você lembra do dia em que os goblins saltaram do mato."],
    ["condicional", "Se você se aproximar, os guardas avançam."],
    ["talvez", "Talvez os cultistas ataquem ao anoitecer."],
    ["nada disso", "A taverna cheira a cevada queimada."],
  ];
  for (const [porque, f] of nao) t(`${porque}: "${f.slice(0, 36)}…"`, ehInvestida(f) === false);
  t("texto vazio não é investida", ehInvestida("") === false && ehInvestida(null) === false);
  for (const n of NAO_E_INVESTIDA) t(`a trava "${n.id}" diz por que existe`, n.porque.length > 30);
}

sec("2. quantos são");
{
  t("dígito", quantosNaFrase("4 bandidos saltam do mato") === 4);
  t("por extenso", quantosNaFrase("três bandidos saltam") === 3);
  /* "um bando de goblins" tem a palavra "um" e não é um goblin — é o
     artigo do bando. Ler o "um" primeiro devolvia um goblin solitário
     para uma frase que descreve um cerco. */
  t("o coletivo ganha do artigo", quantosNaFrase("um bando de goblins fecha o cerco") === 4);
  t("matilha também", quantosNaFrase("uma matilha de lobos avança") === 4);
  t("mas o número explícito ganha do coletivo", quantosNaFrase("três lobos do bando avançam") === 3);
  t("sem número, é um", quantosNaFrase("o troll parte para cima") === 1);
  t("número absurdo não passa", quantosNaFrase("99 goblins") === 1);
}

sec("3. qual criatura — SÓ o bestiário");
{
  t("acha a criatura", criaturaNaFrase("três bandidos saltam do mato").nome === "Bandido");
  t("no plural também", criaturaNaFrase("os goblins cercam você").nome === "Goblin");
  /* o nome mais longo ganha, pela razão de sempre nesta casa */
  t("o nome mais longo ganha", criaturaNaFrase("um lobo atroz avança").nome === "Lobo Atroz");
  /* e a trava: o sistema não sabe quantos PV tem uma invenção, e um
     número chutado aqui reabriria o buraco que o orçamento existe para
     tapar */
  t("o que não está no bestiário não existe", criaturaNaFrase("a Aberração do Sétimo Selo avança") === null);
}

sec("4. O ORÇAMENTO DECIDE — a parte que a ficção não tem como saber");
{
  const e1 = montarEmboscada("Três bandidos saltam do mato.", { pers: nv10 });
  t("o que cabe passa inteiro", e1.tipo === "emboscada" && e1.quantos === 3 && e1.aparado === false);

  const e2 = montarEmboscada("Seis ogros avançam sobre você.", { pers: nv2 });
  t("seis ogros contra um nível 2 são aparados", e2.aparado === true && e2.quantos < 6);
  t("e o sistema diz que aparou, com a conta", /a cena pediu 6 e o orçamento deste herói comporta/.test(e2.porque));
  t("nunca apara até zero", e2.quantos >= 1);

  const e3 = montarEmboscada("Seis ogros avançam sobre você.", { pers: nv10 });
  t("o mesmo pedido cabe mais num herói maior", e3.quantos > e2.quantos);

  /* O DEGRAU QUE NÃO EXISTE NA TABELA. Aparar a quantidade resolve seis
     ogros; não resolve UM dragão ancião — um é um, passa por qualquer
     teto de contagem, e continua sendo a morte certa. */
  const d = montarEmboscada("Um dragão ancião irrompe das nuvens e avança sobre você.", { pers: nv2 });
  t("um dragão ancião contra um nível 2 é recusado", d.tipo === "desproporcional");
  t("e a recusa traz a conta", d.razao > TETO_DO_DESPROPORCIONAL);
  t("o mesmo dragão contra um nível 18 abre normalmente",
    montarEmboscada("Um dragão ancião irrompe das nuvens e avança sobre você.", { pers: nv18 }).tipo === "emboscada");

  t("criatura fora do bestiário não monta nada",
    montarEmboscada("A Aberração do Sétimo Selo avança sobre você.", { pers: nv2 }).tipo === "semCriatura");
  t("o que não é investida devolve nada", montarEmboscada("Há bandidos na estrada.", { pers: nv2 }) === null);
}

sec("5. os envelopes — o que a IA não pode mais fazer");
{
  const e = montarEmboscada("Três bandidos saltam do mato.", { pers: nv10 });
  const env = envelopeDaEmboscada(e);
  t("proíbe abrir o combate de novo", /NÃO envie "combate_iniciar"/.test(env));
  t("proíbe decidir se alguém acertou", /NÃO decida se alguém acertou/.test(env));
  t("proíbe matar e proíbe fazer fugir", /NÃO mate ninguém/.test(env) && /recuarem ou fugirem/.test(env));
  t("a linha do jogador diz quantos são", /3× Bandido/.test(falaDaEmboscada(e)));

  const ap = montarEmboscada("Seis ogros avançam sobre você.", { pers: nv2 });
  const env2 = envelopeDaEmboscada(ap);
  t("quando apara, o envelope explica por quê", /não seria um encontro difícil, seria um acidente/.test(env2));
  t("e manda narrar o número que ficou", /quem não veio, não veio/.test(env2));

  const d = montarEmboscada("Um dragão ancião avança sobre você.", { pers: nv2 });
  const env3 = envelopeDesproporcional(d);
  t("a recusa dá duas saídas", /faça UMA das duas coisas/.test(env3));
  /* a primeira saída é a boa: ameaça vista de perto e não enfrentada é
     das melhores coisas que uma cena tem */
  t("uma delas é manter a ameaça, mas longe", /mas LONGE/.test(env3));
  t("a outra é trocar por algo do meu tamanho", /troque por algo do tamanho do que eu sou hoje/.test(env3));
  t("e nada aconteceu comigo neste turno", /nada aconteceu comigo neste turno/.test(env3));

  const env4 = envelopeSemCriatura();
  t("sem ficha, também duas saídas", /faça UMA das duas coisas/.test(env4));
  t("e o sistema admite que não inventa ficha", /ele não inventa ficha/.test(env4));

  t("sem emboscada não há envelope", envelopeDaEmboscada(null) === "" && envelopeDesproporcional(null) === "");
  t("e a linha da tela também não", falaDaEmboscada({ tipo: "semCriatura" }) === "");
}


sec("6. A LISTA QUE VEM PELO CAMPO ANTIGO (v9.75) — a última régua dupla");
{
  /* `combate_iniciar` é por onde entra a maior parte das lutas do jogo — a
     nêmese, os eventos globais, tudo o que a IA abre por conta própria — e
     nunca teve orçamento. A emboscada nova era conferida e a lista antiga
     não: duas réguas para a mesma pergunta. */
  const L = (n, q) => Array.from({ length: q }, (_, i) => ({ nome: q > 1 ? `${n} ${i + 1}` : n, ameaca: "" }));

  t("o que cabe passa intacto", conferirLista(L("Bandido", 3), nv10).tipo === "cabe");
  t("e devolve a lista original", conferirLista(L("Bandido", 3), nv10).inimigos.length === 3);

  const ap = conferirLista(L("Bandido", 8), nv2);
  t("oito bandidos contra um nível 2 são aparados", ap.tipo === "aparado" && ap.para < 8);
  t("nunca apara até zero", ap.para >= 1);
  /* o corte começa pelo FIM da lista: é lá que ficam as cópias, e o
     primeiro nome é o que a ficção nomeou primeiro — chefe é um */
  t("o primeiro da lista sobrevive ao corte", ap.inimigos[0].nome === "Bandido 1");
  t("a lista devolvida tem o tamanho anunciado", ap.inimigos.length === ap.para);
  t("e o sistema diz a conta", /a cena trouxe 8 e o orçamento deste herói comporta/.test(ap.porque));

  /* A DIFERENÇA PARA A EMBOSCADA, e ela tem motivo: lá o sistema constrói
     o encontro do zero e pode escolher. Aqui a cena já existe e pode ser o
     clímax que a campanha inteira preparou, ou uma luta que o jogo QUER
     que o herói perca e fuja. Recusar seria o sistema apagando a história
     que o motor dele mesmo mandou construir. */
  const f = conferirLista([{ nome: "Dragão Ancião" }], nv2);
  t("o grande demais NÃO é recusado", f.tipo === "fuga" && f.ok === true);
  t("e a lista volta inteira", f.inimigos.length === 1);
  t("mas o sistema registra o tamanho", f.razao > TETO_DO_DESPROPORCIONAL);
  t("lista vazia não é assunto", conferirLista([], nv2).ok === false && conferirLista(null, nv2).ok === false);

  const envA = envelopeDaListaAparada(ap);
  t("o envelope do corte manda narrar o número que ficou", /narre o número que ficou/i.test(envA));
  /* a trava que importa: sem ela o Mestre traz os cortados como reforço
     três rodadas depois, e o corte não terá servido para nada */
  t("proíbe trazer os cortados como reforço", /não os traga como reforço/i.test(envA));
  t("e proíbe comentar o corte", /não comente o corte/i.test(envA));
  t("sem corte não há envelope", envelopeDaListaAparada({ tipo: "cabe" }) === "");
  /* v9.76: E NÃO HÁ LINHA NA TELA. Ela contava ao jogador uma decisão de
     bastidor sobre uma luta que ele nunca viu com oito inimigos — para ele
     sempre foram dois, e é isso que o envelope manda o Mestre narrar.
     Dizer o contrário na tela desmancharia a própria ordem. */
  t("o corte não aparece na tela", falaDaListaAparada(ap) === "");

  const envF = envelopeDaLutaImpossivel(f);
  t("o aviso da luta grande manda deixar a saída existir", /deixe a saída existir/.test(envF));
  t("e visível desde a primeira frase", /VISÍVEL desde a primeira frase/.test(envF));
  t("a fuga funciona, mesmo custando caro", /a fuga funciona/.test(envF));
  t("proíbe fechar o cerco", /NÃO feche o cerco/.test(envF));
  /* e o sistema não fala de si mesmo dentro da ficção: nada de "cuidado,
     você vai morrer" em voz de mecânica */
  t("proíbe avisar em voz de sistema", /não me avise em voz de sistema/.test(envF));
  t("sem fuga não há aviso", envelopeDaLutaImpossivel({ tipo: "cabe" }) === "");
}

console.log(`\nemboscada v9.75: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
