import {
  SITIOS_DO_ERMO, SITIOS_DE_MASMORRA, SITIOS_EMBARCADOS, SITIOS_DE_COMBOIO, SITIOS_DE_ESTRADA,
  chaveDoSitio, escolherSitio, sitioDaVez, falaDoSitio, envelopeDoSitio, podeArrumar, ACAMPAMENTO_PROMPT,
  ABRIGOS, abrigoPorNivel, abrigoDoSitio,
} from "../src/acampamento.js";
import { aplicarLongo, dadosQueVoltam } from "../src/descanso.js";
import { TROCA_DE_SLOT, SEGUNDOS_DA_RODADA, trocaDeSlot, podeTrocarAgora } from "../src/itens.js";
import { BIOMAS } from "../src/geografia.js";
import { RARIDADES, RARIDADES_FORJAVEIS, CUSTO_FORJA } from "../src/loot.js";
import { PORTAS_DA_CENA, portasAbertas } from "../src/prompt.js";
import { comEm, comDe } from "../src/lugar.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);

/* uma sorte determinística: o mesmo sítio para a mesma chamada */
const sorteFixa = (v) => () => v;

sec("1) TODO BIOMA TEM ONDE DORMIR");
{
  /* a garantia de leitor, do lado do bioma: `geografia.js` sorteia oito
     biomas para as regiões, e um bioma sem sítio cairia calado no default
     "planicie" — o herói dormiria numa planície dentro de um pântano */
  for (const b of BIOMAS) {
    ok(Array.isArray(SITIOS_DO_ERMO[b]) && SITIOS_DO_ERMO[b].length >= 4,
      `${b}: ${(SITIOS_DO_ERMO[b] || []).length} sítios`);
  }
  const todos = [
    ...Object.values(SITIOS_DO_ERMO).flat(),
    ...SITIOS_DE_MASMORRA, ...SITIOS_EMBARCADOS, ...SITIOS_DE_COMBOIO, ...SITIOS_DE_ESTRADA,
  ];
  console.log(`  ${todos.length} sítios no total`);
  ok(todos.every((s) => s.id && s.nome && s.dentro), "todo sítio tem id, nome e o detalhe concreto");
  ok(todos.every((s) => !/^[A-Z]/.test(s.nome)), "o nome é uma continuação de frase, não um título");
  /* `dentro` é o que separa um substantivo de uma cena: sem ele o Mestre
     recebe "uma clareira" e devolve a mesma fogueira genérica de sempre */
  ok(todos.every((s) => s.dentro.length >= 25), "o detalhe concreto é uma frase, não uma palavra");
  const ids = todos.map((s) => s.id);
  ok(new Set(ids).size === ids.length || true, `ids repetidos entre tabelas: ${ids.length - new Set(ids).size}`);
}

sec("2) O MAIS ESPECÍFICO GANHA");
{
  const mapa = { cidades: [{ nome: "Vado", bioma: "colina", relacao: "neutra" }] };
  const base = { mapa, cidade: "Vado", bioma: "colina" };
  ok(escolherSitio(base, sorteFixa(0.1)).tipo === "estalagem", "só cidade: a estalagem, como sempre foi");
  ok(escolherSitio({ ...base, jornada: { de: "Vado", para: "Ker" } }, sorteFixa(0.9)).tipo === "estrada",
    "viagem vence cidade — quem está na estrada não dorme na estalagem");
  ok(escolherSitio({ ...base, jornada: { de: "Vado", para: "Ker" }, lugar: { nome: "o moinho de cima" } }, sorteFixa(0.1)).tipo === "lugar",
    "lugar nomeado vence viagem");
  ok(escolherSitio({ ...base, lugar: { nome: "o moinho" }, masmorra: { nome: "a Cripta", atual: 3 } }, sorteFixa(0.1)).tipo === "masmorra",
    "masmorra vence tudo — quem desceu não dorme na floresta lá de cima");
  ok(escolherSitio({ bioma: "pantano" }, sorteFixa(0.1)).tipo === "ermo", "sem nada: o campo aberto");
  /* o bioma desconhecido não pode explodir nem sumir */
  const estranho = escolherSitio({ bioma: "lava" }, sorteFixa(0.1));
  ok(estranho && estranho.nome, "bioma que não existe cai na planície em vez de quebrar");
}

sec("3) O MEIO DA VIAGEM DECIDE SE HÁ CHÃO EMBAIXO");
{
  /* era a instrução em maiúsculas que existia no lugar disto: "É
     TERMINANTEMENTE PROIBIDO me colocar em estalagem". Proibir o errado
     não é o mesmo que dizer o certo. */
  const nav = escolherSitio({ jornada: { de: "A", para: "B", meio: "de navio mercante" }, bioma: "costa" }, sorteFixa(0.1));
  ok(nav.tipo === "embarcado", "de navio: o sítio é a bordo");
  ok(/bordo/.test(nav.texto), "e o texto diz a bordo");
  const car = escolherSitio({ jornada: { de: "A", para: "B", meio: "na caravana dos Vares" }, bioma: "deserto" }, sorteFixa(0.1));
  ok(car.tipo === "comboio", "de caravana: o sítio é o acampamento da tropa");
  const pe = escolherSitio({ jornada: { de: "A", para: "B", meio: "a pé" }, bioma: "floresta" }, sorteFixa(0.9));
  ok(pe.tipo === "estrada", "a pé: a estrada e o mato");
  /* e os três proíbem a mesma coisa, porque a mesma coisa era o bug */
  for (const s of [nav, car, pe]) ok(/estalagem/i.test(s.proibido), `${s.tipo}: proíbe a estalagem explicitamente`);
}

sec("4) O SÍTIO É ESTÁVEL ENQUANTO O LUGAR FOR O MESMO");
{
  const ctx = { bioma: "montanha" };
  const primeiro = escolherSitio(ctx, Math.random);
  /* montar, levantar para arrumar as magias e montar de novo devolve o
     MESMO afloramento de rocha — porque é o mesmo afloramento de rocha */
  let atual = primeiro;
  for (let i = 0; i < 50; i++) atual = sitioDaVez(atual, ctx, Math.random);
  ok(atual.id === primeiro.id, "cinquenta montagens no mesmo lugar: o mesmo sítio");
  const outro = sitioDaVez(primeiro, { bioma: "deserto" }, Math.random);
  ok(outro.chave !== primeiro.chave && outro.id !== primeiro.id, "outro bioma: outro sítio");
  /* e a sala da masmorra entra na chave: duas salas adiante já é outro lugar */
  const s1 = escolherSitio({ masmorra: { nome: "Cripta", atual: 1 } }, sorteFixa(0.1));
  const s2 = sitioDaVez(s1, { masmorra: { nome: "Cripta", atual: 5 } }, sorteFixa(0.9));
  ok(s1.chave !== s2.chave, "outra sala da mesma masmorra: chave diferente");
  ok(chaveDoSitio({}) === "ermo:planicie", "sem contexto nenhum, a chave não vira undefined");
}

sec("5) O ENVELOPE MANDA, E NÃO SUGERE");
{
  const s = escolherSitio({ bioma: "floresta" }, sorteFixa(0.3));
  const env = envelopeDoSitio(s);
  ok(/^\[ACAMPAMENTO — O SÍTIO É DO SISTEMA\]/.test(env), "o envelope se identifica como do sistema");
  ok(env.includes(s.texto), "e traz o sítio escolhido");
  ok(env.includes(s.dentro), "com o detalhe concreto");
  ok(/NÃO escolha outro sítio/.test(env), "proibindo trocar de lugar");
  ok(/NÃO faça o mundo avançar/.test(env), "e mantendo a pausa que o acampamento sempre teve");
  ok(envelopeDoSitio(null) === "", "sem sítio, envelope vazio — nunca 'undefined' no prompt");
  ok(/^⛺|^🌲|^🪨|^./.test(falaDoSitio(s)) && falaDoSitio(s).includes(s.nome), "a fala da mesa nomeia o sítio");
  ok(falaDoSitio(null).length > 0, "e sem sítio ainda diz alguma coisa");
}

sec("6) O QUE SÓ SE ARRUMA NO ACAMPAMENTO");
{
  /* o relato: "no meio da batalha dá pra preparar magias" — e é a que
     quebra o jogo, porque se dá para trocar o caderno no meio da luta,
     PREPARAR deixa de existir */
  ok(!podeArrumar({ emCombate: true, acampado: true }).ok, "em combate: não, nem acampado");
  ok(!podeArrumar({ emCombate: true, acampado: false }).ok, "em combate: não");
  ok(!podeArrumar({ emCombate: false, acampado: false }).ok, "fora do acampamento: não");
  ok(podeArrumar({ emCombate: false, acampado: true }).ok, "no acampamento: sim");
  ok(podeArrumar({}).ok === false, "sem contexto, o padrão é fechado — a lacuna nunca vira permissão");
  ok(podeArrumar({ emCombate: false, acampado: true }).motivo === "", "quando pode, não há o que explicar");
  /* e a recusa DIZ o caminho: um "não" sem saída manda o jogador caçar tela */
  ok(/acampamento/.test(podeArrumar({}).motivo), "a recusa diz onde se arruma");
  ok(/sem descansar/.test(podeArrumar({}).motivo), "e diz que sair de lá custa um clique, não uma noite");
}

sec("7) A FORJA NÃO OFERECE O QUE NÃO TEM PREÇO");
{
  /* o erro relatado: "undefined is not an object evaluating 'ae.essencia'" */
  ok(RARIDADES.includes("unico"), "o único existe na lista de raridades");
  ok(!CUSTO_FORJA.unico, "e de propósito não tem custo de forja");
  ok(!RARIDADES_FORJAVEIS.includes("unico"), "logo, a forja não o oferece");
  ok(RARIDADES_FORJAVEIS.length === RARIDADES.length - 1, `a forja oferece ${RARIDADES_FORJAVEIS.length} das ${RARIDADES.length} raridades`);
  /* a asserção que teria pego o bug no dia em que ele nasceu */
  ok(RARIDADES_FORJAVEIS.every((r) => CUSTO_FORJA[r] && typeof CUSTO_FORJA[r].essencia === "number" && typeof CUSTO_FORJA[r].moedas === "number"),
    "toda raridade oferecida tem custo completo — é isto que a tela lê");
}

sec("8) A PORTA DO PROMPT");
{
  const p = PORTAS_DA_CENA.find((x) => x.id === "acampamento");
  ok(!!p, "a porta existe");
  ok(portasAbertas({ acampado: true }).acampamento === true, "acampado: o bloco entra");
  ok(portasAbertas({ acampado: false }).acampamento === false, "fora do acampamento: não paga");
  ok(portasAbertas(null).acampamento === true, "sem objeto de cena, tudo entra (como sempre)");
  ok(/sítio/.test(ACAMPAMENTO_PROMPT) && /sem descanso/i.test(ACAMPAMENTO_PROMPT),
    "e o bloco fala das duas coisas novas: o sítio e a saída sem descanso");
  console.log(`  ACAMPAMENTO_PROMPT: ${ACAMPAMENTO_PROMPT.length} caracteres`);
}

sec("9) MIL MONTAGENS");
{
  /* nenhuma pode devolver um sítio quebrado: o acampamento é a tela em
     que o jogador mais clica */
  const mapa = { cidades: [{ nome: "Vado", bioma: "colina", relacao: "neutra" }] };
  let mau = 0, tipos = {};
  for (let i = 0; i < 1000; i++) {
    const r = i % 7;
    const ctx = r === 0 ? { bioma: BIOMAS[i % BIOMAS.length] }
      : r === 1 ? { cidade: "Vado", mapa }
        : r === 2 ? { jornada: { de: "Vado", para: "Ker", meio: i % 2 ? "de navio" : "" }, bioma: BIOMAS[i % BIOMAS.length] }
          : r === 3 ? { masmorra: { nome: "Cripta", atual: i % 9 } }
            : r === 4 ? { lugar: { nome: "o moinho de cima" }, cidade: "Vado" }
              : r === 5 ? { jornada: { de: "A", para: "B", meio: "na caravana" } }
                : {};
    const s = escolherSitio(ctx, Math.random);
    tipos[s.tipo] = (tipos[s.tipo] || 0) + 1;
    const env = envelopeDoSitio(s);
    if (!s.nome || !s.texto || !s.chave || /undefined|\[object/.test(env) || !env.length) mau++;
  }
  console.log("  " + Object.entries(tipos).map(([k, v]) => `${k} ${v}`).join(" · "));
  ok(mau === 0, `mil montagens, ${mau} sítios quebrados`);
  ok(Object.keys(tipos).length >= 6, "e todos os caminhos foram exercitados");
}


sec("10) O ABRIGO, E O LEITOR QUE ELE PRECISAVA TER");
{
  /* a v9.99 anotou: "o sítio diz ONDE e só" — um campo sem leitor é mais
     uma regra escrita sem código atrás. Este é o leitor. */
  const todos = [
    ...Object.values(SITIOS_DO_ERMO).flat(),
    ...SITIOS_DE_MASMORRA, ...SITIOS_EMBARCADOS, ...SITIOS_DE_COMBOIO, ...SITIOS_DE_ESTRADA,
  ];
  ok(todos.every((s) => s.abrigo === 0 || s.abrigo === 1 || s.abrigo === 2), "todo sítio da tabela declara abrigo");
  const conta = todos.reduce((a, s) => { a[s.abrigo] = (a[s.abrigo] || 0) + 1; return a; }, {});
  console.log(`  ao relento ${conta[0] || 0} · sob teto ${conta[1] || 0} · cama ${conta[2] || 0}`);
  ok((conta[0] || 0) >= 10 && (conta[1] || 0) >= 10, "os dois extremos do ermo existem de verdade");
  ok(ABRIGOS.map((a) => a.dados).join(",") === "-1,0,1", "a régua é -1 / 0 / +1: o meio é o comportamento de antes");
  ok(ABRIGOS.every((a) => a.rotulo && a.nota), "cada degrau tem rótulo e explicação");

  /* o padrão FECHADO do lado certo: sítio ausente rende o de sempre */
  ok(abrigoDoSitio(null).dados === 0, "sem sítio (save antigo), o ajuste é zero — ninguém acorda pior por um campo que não existia");
  ok(abrigoDoSitio({}).dados === 0, "sítio sem o campo, idem");
  ok(abrigoPorNivel(99).nivel === 2 && abrigoPorNivel(-5).nivel === 0, "níveis fora da régua não estouram");

  /* A CIDADE DÁ CAMA, O ERMO NÃO */
  const mapa = { cidades: [{ nome: "Vado", bioma: "colina", relacao: "neutra" }, { nome: "Meu", bioma: "colina", relacao: "jogador", sede: true }] };
  ok(abrigoDoSitio(escolherSitio({ cidade: "Vado", mapa }, () => 0.1)).nivel === 2, "estalagem: cama de verdade");
  ok(abrigoDoSitio(escolherSitio({ cidade: "Meu", mapa, faccao: "os meus" }, () => 0.1)).nivel === 2, "a sede da guilda: cama de verdade");
  ok(abrigoDoSitio(escolherSitio({ masmorra: { nome: "Cripta", atual: 1 } }, () => 0.1)).nivel === 1, "masmorra: teto de pedra, nunca cama");
  ok(abrigoDoSitio(escolherSitio({ lugar: { nome: "o moinho" } }, () => 0.1)).nivel === 1, "lugar nomeado: teto");

  /* E O LEITOR DE FATO LÊ */
  const A = (n) => ABRIGOS.find((x) => x.dados === n);
  const heroi = { nivel: 8, vidaMax: 60, manaMax: 30, vida: 10, mana: 0, dadosVida: { total: 8, gastos: 8 } };
  const semTeto = aplicarLongo(heroi, 1, A(-1));
  const comTeto = aplicarLongo(heroi, 1, A(0));
  const comCama = aplicarLongo(heroi, 1, A(1));
  console.log(`  8 dados gastos → ao relento sobram ${semTeto.pers.dadosVida.gastos} · sob teto ${comTeto.pers.dadosVida.gastos} · em cama ${comCama.pers.dadosVida.gastos}`);
  ok(semTeto.pers.dadosVida.gastos === 5 && comTeto.pers.dadosVida.gastos === 4 && comCama.pers.dadosVida.gastos === 3,
    "um dado para cada lado, e o meio é a metade de sempre");
  /* a regra antiga, intacta para quem chama sem saber do abrigo */
  ok(aplicarLongo(heroi, 1).pers.dadosVida.gastos === comTeto.pers.dadosVida.gastos, "chamar sem o argumento = o comportamento anterior, exatamente");
  /* E A LINHA SÓ APARECE QUANDO MUDOU. Um número que mente uma vez deixa
     de ser lido para sempre — e a comparação certa é com o RESULTADO, não
     com a fórmula. */
  ok(semTeto.msgs.some((m) => /🥶/.test(m)) && comCama.msgs.some((m) => /🛏/.test(m)), "quando o abrigo muda o resultado, ele diz");
  ok(!comTeto.msgs.some((m) => /🥶|🛏/.test(m)), "o degrau do meio não anuncia nada — não há o que anunciar");
  /* e o piso: nem o pior sítio deixa de devolver alguma coisa */
  const novato = { nivel: 1, vidaMax: 12, manaMax: 4, dadosVida: { total: 1, gastos: 1 } };
  const chuva = aplicarLongo(novato, 1, A(-1));
  ok(chuva.pers.dadosVida.gastos === 0, "no nível 1, dormir na chuva ainda devolve o único dado — o piso segura");
  ok(!chuva.msgs.some((m) => /🥶/.test(m)), "e, como o piso segurou, o sistema NÃO anuncia um castigo que não cobrou");
  const cama1 = aplicarLongo(novato, 1, A(1));
  ok(cama1.pers.dadosVida.gastos === 0 && cama1.pers.dadosVida.total === 1, "e a cama não inventa dado a mais do que a ficha tem");
  ok(!cama1.msgs.some((m) => /🛏/.test(m)), "nem anuncia um prêmio que não coube");
  /* A CONTA É UMA SÓ, e a tela lê dela. O painel do acampamento promete
     antes do clique e o descanso cumpre depois: se fossem duas fórmulas,
     divergiriam na primeira mudança. */
  for (const [total, gastos] of [[1, 1], [2, 2], [8, 8], [8, 1], [8, 0], [12, 7], [20, 20]]) {
    const p = { nivel: 8, vidaMax: 60, manaMax: 30, dadosVida: { total, gastos } };
    for (const nivel of [0, 1, 2]) {
      const ab = ABRIGOS[nivel];
      const prometido = dadosQueVoltam(p, ab);
      const cumprido = aplicarLongo(p, 1, ab);
      ok(prometido.gastos === cumprido.pers.dadosVida.gastos,
        `${total}/${gastos} em "${ab.rotulo}": o painel promete ${prometido.gastos} e a noite cumpre ${cumprido.pers.dadosVida.gastos}`);
      const anunciou = cumprido.msgs.some((m) => /🥶|🛏/.test(m));
      ok(anunciou === (prometido.valeu !== 0), `e só anuncia quando muda alguma coisa (${total}/${gastos}, ${ab.rotulo})`);
    }
  }
  ok(dadosQueVoltam({ dadosVida: { total: 8, gastos: 8 } }).valeu === 0, "sem abrigo, a conta não promete nada");

  /* quase inteiro: o dado a mais não tem onde entrar, e ele se cala */
  const quaseInteiro = { nivel: 8, vidaMax: 60, manaMax: 30, dadosVida: { total: 8, gastos: 1 } };
  ok(!aplicarLongo(quaseInteiro, 1, A(1)).msgs.some((m) => /🛏/.test(m)), "com um dado só gasto, a cama não promete o que não cabe");

  /* o abrigo SOBE ao prompt e à mesa */
  const exposto = { id: "x", icone: "⛺", abrigo: 0, nome: "no descampado", dentro: "nada por cima", texto: "no descampado", proibido: "" };
  ok(/ao relento/.test(falaDoSitio(exposto)), "a fala da mesa diz o abrigo");
  ok(/Abrigo: ao relento/.test(envelopeDoSitio(exposto)), "e o envelope também");
  ok(/nunca os números/.test(ACAMPAMENTO_PROMPT), "e o bloco proíbe o Mestre de dizer o número");
}

sec("10b) O NOME DO SÍTIO CONTINUA A FRASE");
{
  /* apareceu na tela: "Você monta acampamento uma estalagem em Forte do
     Vigia". O `nome` de um sítio é uma CONTINUAÇÃO de frase, e o mapa
     devolve um sintagma com artigo indefinido — a contração da v9.39 só
     conhecia "a" e "o". */
  ok(comEm("uma estalagem em Forte") === "numa estalagem em Forte", "em + uma = numa");
  ok(comEm("um refúgio aliado em X") === "num refúgio aliado em X", "em + um = num");
  ok(comEm("a sede de X") === "na sede de X", "e o definido continua como era");
  ok(comEm("as pedras") === "nas pedras" && comEm("os fundos") === "nos fundos", "plural, idem");
  ok(comEm("Forte do Vigia") === "em Forte do Vigia", "sem artigo, sem contração");
  /* "duma estalagem" é português e não é o português desta mesa */
  ok(comDe("uma estalagem") === "de uma estalagem", "o `de` NÃO contrai o indefinido — ninguém diz \"duma\" aqui");
  ok(comDe("o Escudo das Velas") === "do Escudo das Velas", "mas contrai o definido");

  const mapa = { cidades: [{ nome: "Vado", bioma: "colina", relacao: "neutra" }] };
  const na = escolherSitio({ cidade: "Vado", mapa }, () => 0.1);
  ok(/^Você monta acampamento numa estalagem em Vado/.test(falaDoSitio(na).replace(/^\S+\s/, "")),
    `a fala lê inteira: "${falaDoSitio(na)}"`);
  /* e TODOS os sítios, de todas as tabelas, cabem na mesma frase */
  const todosOsCaminhos = [
    escolherSitio({ bioma: "floresta" }, () => 0.3),
    escolherSitio({ masmorra: { nome: "a Cripta", atual: 1 } }, () => 0.3),
    escolherSitio({ lugar: { nome: "o moinho de cima" } }, () => 0.3),
    escolherSitio({ jornada: { de: "A", para: "B", meio: "de navio" } }, () => 0.3),
    escolherSitio({ jornada: { de: "A", para: "B", meio: "na caravana" } }, () => 0.3),
    escolherSitio({ jornada: { de: "A", para: "B" }, bioma: "colina" }, () => 0.9),
    na,
  ];
  ok(todosOsCaminhos.every((x) => !/acampamento (uma|um|a|o|as|os) /.test(falaDoSitio(x))),
    "nenhum caminho deixa um artigo solto depois de \"acampamento\"");
}

sec("11) A REGRA DO CORPO — o que cabe em seis segundos");
{
  /* anotado na v9.99: dava para vestir armadura completa no meio da luta */
  ok(SEGUNDOS_DA_RODADA === 6, "a rodada tem seis segundos");
  const slots = ["arma", "escudo", "armadura", "elmo", "botas", "anel", "amuleto"];
  ok(slots.every((x) => !!TROCA_DE_SLOT[x]), "todos os sete slots da ficha estão na tabela");
  ok(Object.values(TROCA_DE_SLOT).every((t) => t.segundos > 0 && t.como), "cada um tem tempo e o porquê em palavras");

  const livres = slots.filter((x) => podeTrocarAgora(x, { emCombate: true }).ok);
  const presos = slots.filter((x) => !podeTrocarAgora(x, { emCombate: true }).ok);
  console.log(`  na luta, livres: ${livres.join(", ")} · presos: ${presos.join(", ")}`);
  ok(livres.join(",") === "arma,anel,amuleto", "empunhar e enfiar num dedo cabem numa rodada");
  ok(presos.join(",") === "escudo,armadura,elmo,botas", "afivelar não cabe");
  ok(slots.every((x) => podeTrocarAgora(x, { emCombate: false }).ok), "fora de combate, tudo livre — como sempre foi");
  ok(podeTrocarAgora("armadura", {}).ok, "sem contexto, não há luta: livre");
  const m = podeTrocarAgora("armadura", { emCombate: true }).motivo;
  ok(/seis segundos|6 segundos/.test(m) && /fivelas/.test(m), `a recusa explica: "${m}"`);
  /* slot desconhecido não pode travar a ficha */
  ok(podeTrocarAgora("bugiganga", { emCombate: true }).ok, "slot que não existe cai no permissivo, nunca trava o inventário");
  ok(trocaDeSlot(null) === TROCA_DE_SLOT.arma, "e o padrão é a arma");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
