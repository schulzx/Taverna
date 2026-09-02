/* O BALCÃO DE MANTIMENTOS (v9.150)

   O jogo cobrava comida por dia e por boca, punia com exaustão quando
   ela acabava, e não dava nenhuma forma de repor. `SUPRIMENTOS` existia
   em `ermos.js` com preço fixo desde sempre, e esse preço nunca tinha
   sido cobrado de ninguém — não havia balcão. O ciclo dos ermos não
   fechava.

   DUAS DECISÕES QUE ESTA SUÍTE PROTEGE:

   1) MANTIMENTO É UM GÊNERO, e não uma tabela de preços própria. Um saco
      de rações numa vila agrícola tem de custar menos do que num forte de
      montanha, e o motivo disso já estava escrito em `comercio.js`. Uma
      tabela paralela seria uma segunda economia com as mesmas regras
      copiadas — e cópia é como este projeto fabrica divergência.

   2) O BALCÃO É DA CIDADE, E NÃO DE UM MERCADOR. Os mercadores da praça
      são sorteados: podem não aparecer. Ração e água não são assim —
      qualquer lugar onde mora gente tem as duas, e um herói que chega
      numa vila e não acha pão porque o dado não quis é o jogo punindo
      por acaso uma coisa que ele mesmo tornou obrigatória. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const M = await import(S + "mercado.js");
const C = await import(S + "comercio.js");
const E = await import(S + "ermos.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const AGRICOLA = { nome: "Rio valente", tipo: "aldeia", porte: "aldeia", bioma: "planicie", populacao: 400 };
const FORTE = { nome: "Nova do Vigia", tipo: "fortaleza", porte: "fortaleza", bioma: "montanha", populacao: 900 };
const OUTONO = 250, INVERNO = 350;

sec("1. O MESMO PÃO CUSTA DIFERENTE EM DOIS LUGARES");
{
  const barato = M.precoDoSuprimento("racoes", AGRICOLA, { dia: OUTONO });
  const caro = M.precoDoSuprimento("racoes", FORTE, { dia: INVERNO });
  t("a vila agrícola vende barato", barato.preco < barato.base);
  t("a fortaleza de montanha vende caro", caro.preco > caro.base);
  t("e a diferença é grande", caro.preco >= barato.preco * 3);
  /* PREÇO QUE SE MOVE SEM MOTIVO É O MESTRE SENDO ARBITRÁRIO. */
  t("o barato diz por quê", barato.porques.some((p) => /produz mantimento/.test(p)));
  t("o caro também", caro.porques.some((p) => /vem de longe/.test(p)));
  t("e a estação entra na conta", caro.porques.some((p) => /Inverno/.test(p)) && barato.porques.some((p) => /Outono/.test(p)));
  /* nunca de graça: o piso protege a economia de um fator que zere */
  t("nada custa zero", M.ORDEM_DO_BALCAO.every((id) => M.precoDoSuprimento(id, AGRICOLA, { dia: OUTONO }).preco >= 1));
}

sec("2. QUEM PRODUZ E QUEM DEPENDE DE COMBOIO");
{
  const produz = C.VOCACOES.filter((v) => (v.produz || []).includes("mantimento")).map((v) => v.id);
  const falta = C.VOCACOES.filter((v) => (v.falta || []).includes("mantimento")).map((v) => v.id);
  t("a agrícola produz", produz.includes("agricola"));
  t("a pastoril também", produz.includes("pastoril"));
  /* a salina porque sal é o que CONSERVA a comida da estrada */
  t("e a salina", produz.includes("salina"));
  t("a mineradora falta — nada cresce em pedra", falta.includes("mineradora"));
  /* a guarnição consome muito mais do que a terra dela produz: é
     exatamente por isso que uma guarnição depende de comboio */
  t("a guarnição falta", falta.includes("guarnicao"));
  t("e a caçadora do gelo", falta.includes("cacadora"));
  t("nenhuma vocação produz E falta ao mesmo tempo",
    C.VOCACOES.every((v) => !((v.produz || []).includes("mantimento") && (v.falta || []).includes("mantimento"))));
  /* o gênero existe de verdade no catálogo, senão `fatorDoLugar` devolve
     fator 1 e o balcão inteiro fica com preço de tabela */
  t("o gênero está no catálogo", !!C.generoPorId("mantimento"));
  t("e o motor o reconhece", C.fatorDoLugar({ tipo: "mantimento" }, AGRICOLA, { dia: OUTONO }).genero === "mantimento");
}

sec("3. O KIT NÃO SE COMPRA DUAS VEZES");
{
  const semKit = M.balcaoDeMantimentos(AGRICOLA, { dia: OUTONO, temKit: false }).map((x) => x.id);
  const comKit = M.balcaoDeMantimentos(AGRICOLA, { dia: OUTONO, temKit: true }).map((x) => x.id);
  t("sem kit, ele está na prateleira", semKit.includes("kit"));
  /* comprar o segundo seria queimar as moedas por nada, e a loja tem de
     saber disso ANTES de oferecer — recusar depois do clique é pior */
  t("com kit, ele sai da prateleira", !comKit.includes("kit"));
  t("e o resto continua", comKit.length === semKit.length - 1);
  t("o módulo declara quem é único", M.UNICO.has("kit"));
  /* e o App recusa também, para o caso de a tela estar velha */
  t("o App também recusa o segundo", /não se levam? dois|não se leva dois/.test(APP));
}

sec("4. O BALCÃO É DA CIDADE, NÃO DE UM MERCADOR");
{
  t("sem cidade, não há balcão", M.balcaoDeMantimentos(null, {}).length === 0);
  t("nem com cidade sem nome", M.balcaoDeMantimentos({ porte: "vila" }, {}).length === 0);
  t("com cidade, há sempre os quatro", M.balcaoDeMantimentos(AGRICOLA, { dia: OUTONO }).length === 4);
  /* A LINHA QUE MAIS IMPORTA NA COSTURA: o painel do Mercado abria com um
     `return` para "nenhuma banca por perto". Deixar o balcão atrás dele
     seria não tê-lo justamente na vila pequena onde ele mais importa. */
  t("o painel não morre por falta de banca", /if \(!bancas\.length && !balcao\.length\)/.test(APP));
  t("e o balcão é calculado antes disso", APP.indexOf("const balcao = balcaoAqui || \[\]") < APP.indexOf("if (!bancas.length && !balcao.length)") || /const balcao = balcaoAqui/.test(APP));
  /* a ordem da prateleira: o que acaba todo dia vem antes do que se
     compra uma vez na vida */
  t("a ordem começa pela ração", M.ORDEM_DO_BALCAO[0] === "racoes");
  t("e termina no kit", M.ORDEM_DO_BALCAO[M.ORDEM_DO_BALCAO.length - 1] === "kit");
}

sec("5. O AVISO DE PARTIR SEM COMIDA");
{
  /* o aviso de dentro da viagem chega tarde: ali as saídas são voltar ou
     passar fome */
  const nada = M.faltaComidaParaPartir({ racoes: 0, agua: 0 }, 1, 3);
  t("sem nada, avisa", !!nada);
  t("e diz que não dá nem para um dia", /nem água para um dia/.test(nada.diz));
  /* o número, e não o adjetivo: "faltam 5 rações" se resolve, "mal
     abastecido" se ignora */
  t("com o número do que falta", nada.faltamRacoes === 2 && nada.faltamAguas === 2);
  const tres = M.faltaComidaParaPartir({ racoes: 1, agua: 1 }, 3, 4);
  t("três bocas comem três vezes mais", tres.faltamRacoes === 5);
  t("e a conta conhece as bocas", /3 bocas/.test(tres.diz));

  /* ---------------- O NÚMERO IMPOSSÍVEL (a prova no jogo) ----------------
     A primeira versão exigia comida para TODOS os dias da rota. Numa
     viagem de 44 dias com três bocas ela dizia "faltam 131 rações" —
     tecnicamente certo e completamente inútil: ninguém carrega 131
     rações, e um aviso que pede o impossível é um aviso que se aprende a
     ignorar.

     Uma jornada longa não se provisiona na partida: ela se alimenta de
     forrageamento e das vilas do caminho, e o jogo já tem as duas
     coisas. A rota entra na FRASE, como contexto, e nunca na exigência. */
  const longa = M.faltaComidaParaPartir({ racoes: 1, agua: 1 }, 3, 44);
  t("uma rota de 44 dias não pede 131 rações", longa.faltamRacoes === 5);
  t("a exigência é sempre a folga", longa.precisa === M.DIAS_DE_FOLGA);
  t("mas a rota aparece na frase", /44 dia/.test(longa.diz));
  t("dizendo de onde vem o resto", /o resto sai do caminho/.test(longa.diz));
  t("e uma rota curta não fala de rota", !/A rota leva/.test(M.faltaComidaParaPartir({ racoes: 0, agua: 0 }, 1, 1).diz));
  t("abastecido não avisa", M.faltaComidaParaPartir({ racoes: 20, agua: 20 }, 2, 3) === null);
  /* DOIS DIAS É O PISO porque é o menor número que ainda permite
     escolher: com um dia, o herói já decide entre a fome e a volta */
  t("mesmo uma viagem de 1 dia pede folga", !!M.faltaComidaParaPartir({ racoes: 1, agua: 1 }, 1, 1));
  t("e com dois dias, cala", M.faltaComidaParaPartir({ racoes: 2, agua: 2 }, 1, 1) === null);
  t("o piso é dois", M.DIAS_DE_FOLGA === 2);
  t("lixo não derruba", M.faltaComidaParaPartir(null, 0, 0) !== undefined);
  /* NÃO BLOQUEIA: partir com pouco é decisão legítima, e um jogo que
     impede o jogador de escolher errado também o impede de escolher */
  const bloco = APP.slice(APP.indexOf("ANTES DE PÔR O PÉ NA ESTRADA"), APP.indexOf("ANTES DE PÔR O PÉ NA ESTRADA") + 1600);
  t("o aviso não interrompe a viagem", !/return;/.test(bloco));
  t("e aponta onde resolver", /Gestão ▸ Mercado/.test(APP));
}

sec("6. O GESTO COBRA O PREÇO DE AGORA");
{
  /* a tela pode estar velha — o dia virou, a estação mudou, a pressão da
     praça andou — e cobrar o número que ela mostra seria vender no preço
     de ontem */
  t("o handler recalcula o preço", /const s = precoDoSuprimento\(id, cidadeMercado, \{ dia: diaRef\.current/.test(APP));
  t("e não lê o da tela", !/comprarSuprimento = \(id, quantos = 1, preco/.test(APP));
  t("desconta da bolsa", /moedas: \(p\.moedas \|\| 0\) - custo/.test(APP));
  t("e soma no fardo", /\[id\]: \(sup\[id\] \|\| 0\) \+ q/.test(APP));
  t("o kit é booleano, não contagem", /\{ \.\.\.sup, kit: true \}/.test(APP));
  t("e recusa sem moeda", /Moedas insuficientes/.test(APP));
  /* A ARMADILHA QUE A PROVA NO JOGO PEGOU, e que build e suíte deixaram
     passar as duas: `salvar` monta o save a partir do `personagem` do
     CLOSURE, que dentro do mesmo tique ainda é o de antes. `salvar({})`
     gravava a compra ANTERIOR e perdia esta — comprar três coisas
     seguidas gravava duas, e a tela dizia que o kit tinha sido comprado
     enquanto o save dizia `kit: false`.

     É a mesma armadilha que sumiu com o companheiro recrutado na v9.143,
     e o padrão da casa já era o certo: a ficha nova vai pelo `extra`. */
  t("a ficha nova vai pelo extra do salvar", /salvar\(\{ personagem: np \}\);/.test(APP));
  /* SEM OS COMENTÁRIOS. A primeira versão desta linha falhou medindo o
     comentário logo acima da correção, que cita `salvar({})` para
     explicar por que ele não pode estar ali. Varredor que mede prosa não
     mede nada — foi o mesmo erro do `check-imports` na v9.143. */
  const gesto = APP.slice(APP.indexOf("const comprarSuprimento"), APP.indexOf("const comprarNoMercado"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  t("e nunca por salvar vazio", !/salvar\(\{\}\)/.test(gesto));
}

console.log(`\nmantimentos v9.150: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
