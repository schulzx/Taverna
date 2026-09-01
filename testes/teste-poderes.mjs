/* teste-poderes.mjs (v9.76) — "eu não tenho invisibilidade, mas aconteceu".

   O relato mais grave que este projeto recebeu em muitas versões:

     "Se eu digo 'uso invisibilidade' e o narrador narrar que eu usei
     invisibilidade e fiz um roubo, acontece que acabei de fazer isso,
     mas estou com um personagem nível 1 e sem invisibilidade."

   O sistema tinha catálogo de magias, árvore de habilidades por classe e
   a ficha do herói na mão, e não consultava nenhum dos três antes de o
   turno virar ficção. A única coisa que separava o jogador de qualquer
   poder do jogo era escrever o nome dele — o grimório, a árvore de
   talentos e os vinte níveis de progressão viravam decoração.

   Metade desta suíte é a TRAVA, e é a metade que importa: um detector
   que recusasse qualquer "uso X" desconhecido transformaria cada objeto
   de mochila num erro. */
import {
  CATALOGO, PALAVRAS_COMUNS, RX_DECLARA, ESTADOS_RECLAMADOS,
  poderesDaFicha, temOPoder, poderDeclarado, estadoReclamado, lerPoder,
  falaDoPoder, envelopeDoPoder,
  lerConsumo, consumivelDeclarado, naBolsa, faltaRecurso, entradaNaFicha, habilidadeDeclarada,
} from "../src/poderes.js";
import { PORTAS_DO_TURNO, decidirTurno } from "../src/turno.js";
import { lugarPedido, tipoPedido, tiposPedidos, PALAVRAS_DO_TIPO } from "../src/lugar.js";
import { linhaDoFio } from "../src/mestria.js";
import { linhaDaIniciativa } from "../src/oraculo.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const nv1 = { nivel: 1, habilidades: ["Golpe Poderoso"], efeitos: [], condicoes: [] };
const comInvis = { nivel: 5, habilidades: ["Invisibilidade"], efeitos: [], condicoes: [] };
const invisAtiva = { nivel: 5, habilidades: [], efeitos: [{ nome: "Invisibilidade", descricao: "fica invisível até atacar" }], condicoes: [] };

sec("1. o catálogo — o sistema sabe o que existe no jogo");
{
  t("tem magias e habilidades", CATALOGO.size > 150);
  t("Invisibilidade está lá, e é magia", CATALOGO.get("invisibilidade").tipo === "magia");
  t("e sabe de que nível ela é", CATALOGO.get("invisibilidade").nivel === 3);
  t("habilidade de classe também entra", CATALOGO.has("golpe poderoso"));
  /* AS RUBRICAS NÃO SÃO PODER: a árvore tem três camadas de rótulo — a
     classe ("Guerreiro"), a subclasse ("Bárbaro", "Cavaleiro") e a
     especialização. Ninguém "usa Bárbaro", e deixá-los dentro faria o
     sistema recusar frases que citassem o próprio caminho do herói. */
  t("o nome da classe não é poder", !CATALOGO.has("guerreiro"));
  t("nem o da subclasse", !CATALOGO.has("barbaro") && !CATALOGO.has("cavaleiro"));
}

sec("2. O CASO DO RELATO");
{
  const v = lerPoder("uso invisibilidade", nv1);
  t("nível 1 sem a magia: recusado", v && v.tipo === "poderQueNaoTenho");
  t("e o sistema sabe o nome certo", v.nome === "Invisibilidade");
  t("a linha diz o que falta e como se consegue", /Você não tem Invisibilidade/.test(falaDoPoder(v)) && /nível 3/.test(falaDoPoder(v)));
  t("quem TEM a magia não é incomodado", lerPoder("uso invisibilidade", comInvis) === null);
  t("outra magia do catálogo, mesma régua", lerPoder("conjuro Bola de Fogo e queimo tudo", nv1).nome === "Bola de Fogo");
  t("e a habilidade que ele tem passa", lerPoder("uso Golpe Poderoso no bandido", nv1) === null);
}

sec("3. AS TRAVAS — o que o sistema NÃO pode recusar");
{
  /* um detector que recusasse qualquer "uso X" desconhecido
     transformaria cada objeto de mochila num erro */
  const passa = [
    ["objeto de mochila", "uso a corda para descer"],
    ["chave", "uso a chave na fechadura"],
    ["item comum", "uso o mapa para me orientar"],
    ["ferramenta", "uso a gazua na tranca"],
    ["nada disso", "converso com o taverneiro"],
    ["sem verbo de uso", "invisibilidade seria útil agora"],
  ];
  for (const [porque, f] of passa) t(`${porque}: "${f.slice(0, 34)}…"`, lerPoder(f, nv1) === null);

  /* A ÁRVORE DE CLASSES tem habilidades chamadas "Muralha", "Investida",
     "Provocação" — palavras que qualquer frase de português usa sem
     nenhuma intenção mecânica. */
  t("'uso a muralha para me esconder' é tática, não talento", lerPoder("uso a muralha para me esconder", nv1) === null);
  t("'uso o escudo' também", lerPoder("uso o escudo para aparar", nv1) === null);
  t("as palavras comuns estão declaradas", PALAVRAS_COMUNS.has("muralha") && PALAVRAS_COMUNS.has("escudo"));
  t("texto vazio não quebra", lerPoder("", nv1) === null && lerPoder(null, nv1) === null);
  t("ficha vazia não quebra", lerPoder("uso invisibilidade", null) !== null);
}

sec("4. O ESTADO RECLAMADO — a outra forma da mentira");
{
  /* "enquanto estou invisível roubo a carta" não nomeia poder nenhum:
     afirma um estado que o sistema nunca concedeu */
  const v = lerPoder("enquanto estou invisível roubo a carta de Lucan sem que ele veja", nv1);
  t("declarar o estado sem tê-lo é recusado", v && v.tipo === "estadoQueNaoTenho");
  t("e a linha explica a diferença", /efeito vem de um poder que está na sua ficha/.test(falaDoPoder(v)));
  /* mas quem ESTÁ invisível de verdade age normalmente */
  t("com o efeito ativo, nada é recusado",
    lerPoder("enquanto estou invisível roubo a carta de Lucan", invisAtiva) === null);
  t("ter a magia guardada não é estar invisível",
    lerPoder("enquanto estou invisível roubo a carta", comInvis).tipo === "estadoQueNaoTenho");
  t("voar sem voar também é recusado", lerPoder("estou voando sobre a muralha", nv1).id === "voando");
  t("atravessar parede idem", lerPoder("atravesso a parede e entro", nv1).id === "atravessando");
  for (const e of ESTADOS_RECLAMADOS) t(`o estado "${e.id}" diz por que existe`, e.porque.length > 30);
}

sec("5. os envelopes — o Mestre nunca soube que a coisa não existia");
{
  const v = lerPoder("uso invisibilidade e roubo o conde", nv1);
  const env = envelopeDoPoder(v, "uso invisibilidade e roubo o conde");
  t("crava que nada aconteceu", /nada disso aconteceu/.test(env));
  /* as três saídas pelas quais a IA devolveria o poder de outro jeito */
  t("proíbe narrar o efeito", /NÃO narre o efeito/.test(env));
  t("proíbe a versão fraca", /NÃO invente uma versão fraca/.test(env));
  t("proíbe dar o poder como dádiva", /NÃO me dê o poder como dádiva/.test(env));
  t("e proíbe explicar a regra na ficção", /não me explique a regra/.test(env));

  const env2 = envelopeDoPoder(lerPoder("enquanto estou invisível eu passo", nv1), "enquanto estou invisível eu passo");
  t("o do estado manda narrar sem ele", /narre a cena SEM esse estado/.test(env2));
  t("e proíbe o 'só desta vez'", /só desta vez/.test(env2));
  t("sem veredicto não há envelope", envelopeDoPoder(null) === "" && falaDoPoder(null) === "");
}

sec("6. a porta no despachante");
{
  const base = {
    ehComando: false, temEscolhaPendente: false, declarouPoderQueNaoTem: false, ehConjuracao: false,
    ehPortal: false, ehEntradaEmMasmorra: false, ehSeguirViagem: false, ehPartidaPorNome: false,
    querPartir: false, temAlvoLocal: false, ehAgressao: false, ehDesafio: false,
    ehPerguntaAoMundo: false, temMilagreArmado: false, temHabilidadesSelecionadas: false,
    emCombate: false, emViagem: false, bloqueado: false,
  };
  t("a porta existe", PORTAS_DO_TURNO.some((p) => p.id === "poder"));
  t("e diz por que está onde está", PORTAS_DO_TURNO.find((p) => p.id === "poder").porque.length > 50);
  t("poder que não tenho vai para ela", decidirTurno({ ...base, declarouPoderQueNaoTem: true }).id === "poder");
  /* conferir vem antes de agir — e não há conflito, porque quem TEM o
     poder nunca abre esta porta */
  t("ela vem antes de conjurar",
    PORTAS_DO_TURNO.findIndex((p) => p.id === "poder") < PORTAS_DO_TURNO.findIndex((p) => p.id === "conjurar"));
  t("mas depois da resposta a uma pergunta do sistema",
    decidirTurno({ ...base, declarouPoderQueNaoTem: true, temEscolhaPendente: true }).id === "resposta");
  t("e depois do comando de autor",
    decidirTurno({ ...base, declarouPoderQueNaoTem: true, ehComando: true }).id === "comando");
  t("ganha do desafio e da agressão",
    decidirTurno({ ...base, declarouPoderQueNaoTem: true, ehDesafio: true, ehAgressao: true }).id === "poder");
}

sec("7. O LUGAR TAMBÉM SE PEDE PELO TIPO (v9.76)");
{
  /* "cada lugar tem seu nome, mas também tem seu tipo — se eu digo 'vou
     até o mercado' ele identifica o mercado daquela cidade". E não
     identificava: os nomes são gerados pela toponímia, e ninguém decora
     que o templo desta cidade se chama "Santuário das Cinzas". */
  const aqui = [
    { nome: "A Feira Baixa", tipo: "mercado", onde: "dentro" },
    { nome: "Santuário das Cinzas", tipo: "templo", onde: "dentro" },
    { nome: "O Javali Cambaleante", tipo: "taverna", onde: "dentro" },
    { nome: "Entreposto do Vau", tipo: "mercado", onde: "arredores" },
  ];
  t("vou até o templo", lugarPedido("vou até o templo", aqui).tipo === "templo");
  t("vou ao mercado", lugarPedido("vou ao mercado", aqui).nome === "A Feira Baixa");
  t("vou até a taverna", lugarPedido("vou até a taverna", aqui).tipo === "taverna");
  /* as palavras são as do JOGADOR, não as da toponímia: quem escreve
     "igreja" quer o templo, mesmo que "igreja" não esteja em nome nenhum */
  t("vou até a igreja acha o templo", lugarPedido("vou até a igreja", aqui).tipo === "templo");
  t("vou à praça acha o mercado", lugarPedido("vou até a praça", aqui).tipo === "mercado");
  /* e o de DENTRO ganha do de fora: quem diz "vou ao mercado" quer o da
     praça, não o entreposto a quarenta minutos de caminhada */
  t("entre dois do mesmo tipo, vence o de dentro", lugarPedido("vou ao mercado", aqui).onde === "dentro");
  /* O NOME CONTINUA GANHANDO DO TIPO: quem escreveu o nome já disse qual é */
  t("o nome ganha do tipo", lugarPedido("vou até o Entreposto do Vau", aqui).nome === "Entreposto do Vau");
  t("tipo que não existe aqui não inventa lugar", lugarPedido("vou até as docas", aqui) === null);
  t("sem verbo de ir, não é pedido de lugar", lugarPedido("o templo é bonito", aqui) === null);
  t("tipoPedido acha a palavra mais longa", tipoPedido("vou até a casa de banhos") === "casa de banhos");

  /* UMA PALAVRA PODE APONTAR PARA MAIS DE UM TIPO, e isso não é
     ambiguidade: é o mundo. O templo DENTRO da cidade e a capela do
     cinturão de FORA são tipos diferentes no gerador e a mesma coisa para
     quem escreve "vou à igreja". Foi exatamente isso que fez a primeira
     versão desta peça falhar em jogo: a cidade da prova não tinha templo
     dentro, tinha "o santuário à beira do caminho" fora, e o pedido não
     achava nada — a função estava certa e a tabela estava curta. */
  t("igreja aponta para templo E para capela",
    tiposPedidos("vou à igreja").includes("templo") && tiposPedidos("vou à igreja").includes("capela"));
  const semTemplo = [
    { nome: "A Garça da Bruma", tipo: "taverna", onde: "dentro" },
    { nome: "o santuário à beira do caminho", tipo: "capela", onde: "arredores" },
  ];
  t("sem templo dentro, acha a capela de fora", lugarPedido("vou até o templo", semTemplo).tipo === "capela");
  t("e 'vou à igreja' também", lugarPedido("vou até a igreja", semTemplo).tipo === "capela");
  const comOsDois = [...semTemplo, { nome: "A Basílica da Garça", tipo: "templo", onde: "dentro" }];
  t("com os dois, o de DENTRO ganha", lugarPedido("vou à igreja", comOsDois).onde === "dentro");
  t("o moinho do cinturão também é pedível",
    lugarPedido("vou até o moinho", [{ nome: "o moinho quebrado", tipo: "moinho", onde: "arredores" }]).tipo === "moinho");
  t("todo tipo tem pelo menos uma palavra", Object.values(PALAVRAS_DO_TIPO).every((v) => v.length > 0));
}

sec("8. O QUE O JOGADOR NÃO PRECISA VER");
{
  /* "gostaria que tirasse o aviso 'notícia chega do lugar que você
     descobriu e não voltou a ver' e todos parecidos com este — o player
     não precisa saber dos métodos do mestre." */
  t("o fio da memória não se anuncia", linhaDoFio({ id: "lugar", diz: "notícia chega do lugar" }) === "");
  t("a iniciativa do mundo também não", linhaDaIniciativa({ id: "boato", diz: "o mundo se mexe" }) === "");
}

sec("9. TER NÃO É PODER USAR (v9.78) — o que custa e o que se gasta");
{
  const cura = { nome: "Poção de Cura Pequena", consumivel: "cura_p" };
  const seco = { nivel: 3, mana: 1, manaMax: 6, inventario: [], efeitos: [], condicoes: [], habRecarga: {},
    habilidades: [{ nome: "Bola de Fogo", custo: 5 }, { nome: "Golpe Poderoso", custo: 0 }] };
  const cheio = { ...seco, mana: 6, inventario: [cura] };
  const cansado = { ...cheio, habRecarga: { "golpe poderoso": 2 } };

  /* o painel de habilidades sempre soube disso — desenha a magia apagada
     quando falta mana. Só que o painel é um caminho e o TECLADO é outro, e
     toda regra que mora num só de dois vira bug: quem clicava obedecia à
     economia, quem digitava o mesmo nome não pagava nada. */
  t("tem a magia mas não tem PM: recusado", lerPoder("conjuro Bola de Fogo", seco).tipo === "semRecurso");
  t("e a linha diz a conta", /custa 5 PM e você tem 1/.test(falaDoPoder(lerPoder("conjuro Bola de Fogo", seco))));
  t("com PM, passa", lerPoder("conjuro Bola de Fogo", cheio) === null);
  t("recarregando também é recusa", lerPoder("uso Golpe Poderoso", cansado).turnos === 2);
  t("e diz quantos turnos faltam", /faltam 2 turnos/.test(falaDoPoder(lerPoder("uso Golpe Poderoso", cansado))));
  t("sem recarga, a de custo zero passa", lerPoder("uso Golpe Poderoso", cheio) === null);

  /* A DÁDIVA QUE DESCONTA PM tem de valer aqui também, ou o teclado voltaria
     a discordar do painel — só que agora para o lado severo. */
  t("o desconto de PM conta", lerPoder("conjuro Bola de Fogo", { ...seco, mana: 4 }, { desconto: 1 }) === null);

  /* A BOLSA TAMBÉM É FICHA */
  t("beber o que não se tem é recusado", lerPoder("bebo a poção de cura", seco).tipo === "itemQueNaoTenho");
  t("e a linha diz o que falta", /não tem 🧪 Poção de Cura Pequena na bolsa/.test(falaDoPoder(lerPoder("bebo a poção de cura", seco))));
  t("com o frasco na bolsa, quem age é o sistema", lerConsumo("bebo a poção de cura", cheio).tipo === "consumir");
  t("e ele devolve o nome COMO ESTÁ na bolsa", lerConsumo("bebo a poção de cura", cheio).item === "Poção de Cura Pequena");
  t("o veredicto de recusa não estraga o consumo", lerPoder("bebo a poção de cura", cheio) === null);
  t("o nome vago vira o frasco pequeno", consumivelDeclarado("bebo uma poção de cura").id === "cura_p");
  t("e o tamanho escrito ganha", consumivelDeclarado("bebo a poção de cura grande").id === "cura_g");
  t("uma cerveja não é consumível de ficha", lerConsumo("bebo uma cerveja", cheio) === null);

  /* O `tipo` VEM DEPOIS DO ESPALHAMENTO. Escrito ao contrário, o veredicto
     de dentro ("semMana", "semItem") sobrescrevia o de fora e a fala voltava
     VAZIA — a peça inteira ficava muda sem quebrar nada. */
  for (const [rot, v] of [
    ["sem PM", lerPoder("conjuro Bola de Fogo", seco)],
    ["sem frasco", lerPoder("bebo a poção de cura", seco)],
    ["sem poder", lerPoder("uso invisibilidade", seco)],
  ]) t(`a recusa "${rot}" fala e manda envelope`, falaDoPoder(v).length > 20 && envelopeDoPoder(v, "x").length > 80);

  t("o envelope do PM proíbe cobrar em sangue", /NÃO cobre um preço alternativo em sangue/.test(envelopeDoPoder(lerPoder("conjuro Bola de Fogo", seco), "x")));
  t("o da bolsa proíbe o frasco esquecido", /NÃO invente um frasco esquecido/.test(envelopeDoPoder(lerPoder("bebo a poção de cura", seco), "x")));

  t("a porta do consumo existe", PORTAS_DO_TURNO.some((p) => p.id === "consumir"));
  t("e vem antes de conjurar", PORTAS_DO_TURNO.findIndex((p) => p.id === "consumir") < PORTAS_DO_TURNO.findIndex((p) => p.id === "conjurar"));
}


sec("10. A METADE POSITIVA (v9.79) — a habilidade que eu TENHO");
{
  const p = { nivel: 3, mana: 6, manaMax: 6, habRecarga: {}, inventario: [], efeitos: [], condicoes: [],
    habilidades: [{ nome: "Golpe Poderoso", custo: 2, tipo: "ataque" }, { nome: "Postura Defensiva", custo: 2 }] };

  t("nomear a habilidade que tenho devolve a entrada da ficha",
    (habilidadeDeclarada("uso Golpe Poderoso no bandido", p) || {}).nome === "Golpe Poderoso");
  t("e a entrada traz o custo, que é o que o executor precisa",
    habilidadeDeclarada("ativo Postura Defensiva", p).custo === 2);

  /* SEM VERBO DE USO, NÃO É DECLARAÇÃO. "Adoto uma postura defensiva e
     espero" é descrição de postura, não o talento de Guerreiro — e disparar
     a habilidade ali cobraria PM de quem só estava narrando. */
  t("descrever não é declarar", habilidadeDeclarada("adoto uma postura defensiva e espero", p) === null);
  t("o que não está na ficha não passa por aqui", habilidadeDeclarada("uso invisibilidade", p) === null);
  t("nem uma frase comum", habilidadeDeclarada("converso com o taverneiro", p) === null);
  t("texto vazio não quebra", habilidadeDeclarada("", p) === null && habilidadeDeclarada(null, p) === null);

  /* AS DUAS METADES SE ENCAIXAM SEM SE MORDER: quem TEM e pode pagar sai
     por aqui; quem TEM e não pode pagar é recusado pela v9.78; quem NÃO
     tem é recusado pela v9.76. */
  const seco = { ...p, mana: 0 };
  t("sem PM, quem responde é a recusa", lerPoder("uso Golpe Poderoso", seco).tipo === "semRecurso");
  t("e a metade positiva ainda reconhece a habilidade", !!habilidadeDeclarada("uso Golpe Poderoso", seco));
  t("com PM, a recusa cala", lerPoder("uso Golpe Poderoso", p) === null);
}


console.log(`\npoderes v9.79: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
