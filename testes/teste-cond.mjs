import {
  normalizarCondicao, criarCondicao, mecanicaDe, estadoDeRolagem, tickCondicoes,
  limparPorDescanso, resumoCondicoesPrompt, listaCondicoes, condicaoPorId, CANAIS_DE_SAIDA,
} from "../src/condicoes.js";

let falhas = 0;
const ok = (cond, txt) => { if (!cond) { falhas++; console.log("  FALHA:", txt); } else console.log("  ok:", txt); };

console.log("\n[normalização] o Mestre escreve de qualquer jeito:");
for (const [entrada, esperado] of [
  ["Envenenado", "envenenado"], ["envenenada", "envenenado"], ["Envenenado gravemente", "envenenado"],
  ["intoxicado", "envenenado"], ["ATORDOADO", "atordoado"], ["atordoada", "atordoado"],
  ["Sangrando", "sangrando"], ["hemorragia", "sangrando"], ["Em chamas", "queimando"],
  ["Amedrontado", "amedrontado"], ["apavorado", "amedrontado"], ["Abençoado", "abencoado"],
  ["abencoado", "abencoado"], ["Paralisado", "paralisado"], ["congelado", "paralisado"],
  ["Cego", "cego"], ["Exausto", "exausto"], ["Enfurecido", "enfurecido"],
]) {
  const r = normalizarCondicao(entrada);
  ok(r && r.id === esperado, `"${entrada}" → ${r ? r.id : "null"} (esperado ${esperado})`);
}
ok(normalizarCondicao("Feliz da vida") === null, `"Feliz da vida" → null (não inventa condição)`);

console.log("\n[mecânica] o que cada uma faz:");
const env = criarCondicao("Envenenado gravemente");
ok(env && env.id === "envenenado" && env.turnos === 4, `Envenenado: ${env.turnos} turnos, "${env.efeito}"`);
const m1 = mecanicaDe([criarCondicao("envenenado"), criarCondicao("abencoado")]);
ok(m1.vantagem && m1.desvantagem, "veneno + bênção → tem vantagem E desvantagem…");
ok(estadoDeRolagem([criarCondicao("envenenado"), criarCondicao("abencoado")]).rotulo === "neutro", "…que se cancelam (regra 5e): neutro");
ok(mecanicaDe([criarCondicao("atordoado")]).perdeAcao, "Atordoado → perde a ação");
ok(mecanicaDe([criarCondicao("envenenado"), criarCondicao("sangrando")]).danoTurno === 5, "veneno(2) + sangramento(3) = 5 PV/turno");

console.log("\n[tick] passagem de turno:");
let cs = [criarCondicao("envenenado"), criarCondicao("atordoado")];
const t1 = tickCondicoes(cs);
ok(t1.dano === 2, `cobra ${t1.dano} de dano no turno`);
ok(t1.expiradas.length === 1 && t1.expiradas[0].id === "atordoado", "Atordoado (1 turno) expira");
ok(t1.condicoes.length === 1 && t1.condicoes[0].turnos === 3, "Envenenado continua, agora com 3t");
let persist = tickCondicoes([criarCondicao("exausto")]);
ok(persist.condicoes.length === 1 && persist.condicoes[0].turnos === null, "Exausto não expira sozinho (turnos null)");

/* ============================================================
   T1 · O RELÓGIO ALCANÇA O GRUPO (v9.221)

   O buraco que a etapa fecha: `tickCondicoes` tinha DOIS sítios no App —
   o herói e os inimigos — e o grupo não tinha nenhum. Cinco sítios vivos
   escreviam condição em `pers.grupo` e zero a decrementavam: desde a
   v9.2, condição de companheiro nascia e não vencia nunca.

   O MÓDULO NUNCA ESTEVE ERRADO, e é por isso que estas seções vêm em
   duas metades. `tickCondicoes` sempre soube decrementar qualquer lista;
   o que faltava era alguém o chamar com a lista do companheiro. Por isso
   provamos o COMPORTAMENTO aqui (o prazo vence — e vence também para a
   condição BOA, que é o dente que importa) e o SÍTIO no fim do arquivo
   (o terceiro chamador existe, é sobre `pers.grupo`, e está entre os
   outros dois). Uma metade sem a outra fica verde com o órgão desligado.

   Estas seções entram LOGO DEPOIS de [tick] porque é dele que falam, e
   nenhuma asserção de cima foi movida ou tocada para abrir espaço: o
   arquivo não tem seções numeradas, então acrescentar aqui não renumera
   nada nem muda o que qualquer prova antiga afirma.
   ============================================================ */

console.log("\n[T1 · a catraca do prazo] nenhuma condição sobrevive ao próprio prazo:");
/* Quantas voltas do relógio uma instância aguenta. O molde do laço é o de
   teste-efeitos.mjs:175 — rodar até a lista esvaziar, com teto, e contar
   as voltas. O número esperado NÃO aparece escrito aqui: sai da tabela. */
const quantosTiques = (inst, teto = 60) => {
  let lista = [inst], n = 0;
  while (lista.length && n < teto) { lista = tickCondicoes(lista).condicoes; n++; }
  return n;
};
const comPrazo = listaCondicoes().filter((c) => c.turnos != null);
const semPrazo = listaCondicoes().filter((c) => c.turnos == null);
for (const c of comPrazo) {
  const n = quantosTiques(criarCondicao(c.id));
  ok(n === c.turnos, `${c.rotulo} (${c.tipo}) vence em ${n} tiques — a tabela prometeu ${c.turnos}`);
}
/* A CONVERGÊNCIA: rodado o relógio até o teto, quem fica de pé é
   exatamente quem a tabela DECLARA sem prazo — não "quase nenhuma", não
   uma lista escrita à mão aqui. Uma condição nova que nascesse eterna por
   engano (campo `turnos` esquecido) cairia nesta asserção no mesmo dia. */
const eternas = listaCondicoes().filter((c) => quantosTiques(criarCondicao(c.id)) === 60).map((c) => c.id);
ok(eternas.join(",") === semPrazo.map((c) => c.id).join(","),
  `só ficam de pé as que a tabela declara sem prazo: ${eternas.join(", ") || "nenhuma"} (esperado ${semPrazo.map((c) => c.id).join(", ")})`);

console.log("\n[T1 · o dente inverso] a condição BOA também vence — é o conserto, não o efeito colateral:");
/* POR QUE ESTA SEÇÃO EXISTE SEPARADA. Uma asserção que só testasse veneno
   passaria feliz num mundo onde a vantagem do companheiro é eterna — e é
   exatamente esse mundo que T1 acabou de consertar. Das condições que
   chegam ao grupo hoje NENHUMA é ruim por golpe: são as sete de apoio dos
   PORTADORES, todas `tipo: "bom"` (a fronteira que guarda esse fato mora
   em `teste-afl.mjs`, que é o dono da tabela de portadores). O relógio
   TIRA vantagem do grupo, e isso é a etapa inteira.

   A cena tem a FORMA do bloco do App — um companheiro, a lista dele, um
   tique por volta — para que um `if (c.tipo === "bom")` posto amanhã no
   meio do relógio deixe a seção acima verde para as ruins e ESTA vermelha. */
const relogioDoGrupo = (grupo) => {
  const linhas = [];
  const novo = (grupo || []).map((g) => {
    if (!g || !((g.condicoes || []).length)) return g;
    const t = tickCondicoes(g.condicoes);
    for (const c of t.expiradas) linhas.push(`✓ ${g.nome}: ${c.nome} passou`);
    return { ...g, condicoes: t.condicoes };
  });
  return { grupo: novo, linhas };
};
let grupoT1 = [
  { nome: "Doran", condicoes: [criarCondicao("abencoado"), criarCondicao("protegido")] },
  { nome: "Sira", condicoes: [criarCondicao("amedrontado", { origem: "presença de Vharil" })] },
  { nome: "Kael", condicoes: [] },
];
const intacto = grupoT1[2];
let linhasT1 = [], voltas = 0;
while (grupoT1.some((g) => (g.condicoes || []).length) && voltas < 60) {
  const r = relogioDoGrupo(grupoT1);
  grupoT1 = r.grupo; linhasT1.push(...r.linhas); voltas++;
}
const maisLongo = Math.max(condicaoPorId("abencoado").turnos, condicaoPorId("protegido").turnos, condicaoPorId("amedrontado").turnos);
ok(voltas === maisLongo, `o grupo esvazia em ${voltas} turnos — o prazo da mais longa da mesa (${maisLongo})`);
ok(grupoT1.every((g) => !(g.condicoes || []).length), "e não sobra condição nenhuma de pé em companheiro nenhum");
ok(linhasT1.filter((l) => /Doran: Abençoado passou/.test(l)).length === 1, "A BÊNÇÃO DO COMPANHEIRO ACABA — a vantagem de trinta versões vence");
ok(linhasT1.filter((l) => /Doran: Protegido passou/.test(l)).length === 1, "…e o abrigo dele também: nenhuma condição boa é permanente");
ok(linhasT1.filter((l) => /Sira: Amedrontado passou/.test(l)).length === 1, "e a única ruim que chega ao grupo (o medo da presença) vence pelo mesmo relógio");
ok(linhasT1.length === 3, `uma linha por condição que passou, com o nome de quem a perdeu (${linhasT1.length})`);
ok(grupoT1[2] === intacto, "companheiro sem condição sai do relógio sendo o MESMO objeto — não há re-render de graça");
ok(relogioDoGrupo([null, undefined, { nome: "X" }]).grupo.length === 3, "nulo e buraco no grupo não estouram o relógio");
/* LEI DA CASA: estado é substituído, nunca mutado. Se o tique passar a
   decrementar em cima da lista que recebeu, o save e o undo mentem. */
const entrada = [criarCondicao("inspirado")];
const copiaAntes = JSON.stringify(entrada);
tickCondicoes(entrada);
ok(JSON.stringify(entrada) === copiaAntes, "o relógio não muta a lista que recebe");

console.log("\n[T1 · save antigo] a instância eterna vence pelo prazo, sem migração:");
/* A DECISÃO, escrita: NÃO há migração ao carregar. Uma condição vinda de
   save velho carrega `turnos` cheio porque nunca decrementou — ninguém
   rodava o relógio sobre ela. Ao carregar, o relógio simplesmente passa a
   correr e ela vence em N turnos pelo caminho normal. Zerar as condições
   antigas no load seria inventar um efeito que o jogador não viu
   acontecer; deixá-las vencer é o mesmo relógio de sempre, um turno
   atrasado. */
const velha = { id: "abencoado", nome: "Abençoado", icone: "✨", tipo: "bom", turnos: 5, efeito: "Vantagem nas rolagens.", origem: "save v9.220" };
ok(quantosTiques(velha) === condicaoPorId("abencoado").turnos,
  `a bênção eterna do save velho vence em ${quantosTiques(velha)} turnos, pelo caminho normal`);
for (const [rotulo, valor] of [["null", null], ["NaN", NaN], ["ausente", undefined], ["texto", "muitos"]]) {
  const inst = { id: "protegido", nome: "Protegido", turnos: valor };
  let r = null, estourou = false;
  try { r = tickCondicoes([inst]); } catch { estourou = true; }
  ok(!estourou, `turnos ${rotulo} não estoura o relógio`);
  /* SEGUE VIVA é o comportamento de hoje, e é o conservador: o relógio não
     sabe quanto falta, então não tira nada. Quem a remove é o descanso, a
     cura ou a porta declarada (T4). */
  ok(r && r.condicoes.length === 1 && r.condicoes[0].turnos === null, `turnos ${rotulo} segue viva com prazo nulo — não regride e não some`);
}
const sumida = { id: "amaldicoado", nome: "Amaldiçoado", turnos: 2 };
const rSumida = tickCondicoes([sumida]);
ok(rSumida.condicoes.length === 1 && rSumida.condicoes[0].turnos === 1 && rSumida.dano === 0,
  "condição que o catálogo não conhece mais ainda anda no relógio, e não cobra dano");
ok(quantosTiques(sumida) === 2, "…e some no prazo que a própria instância trazia");

console.log("\n[descanso]:");
const dCurto = limparPorDescanso([criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("exausto")], "curto");
ok(dCurto.removidas.length === 1 && dCurto.removidas[0].id === "sangrando", "curto estanca sangramento e só isso");
const dLongo = limparPorDescanso([criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("exausto"), criarCondicao("abencoado")], "longo");
ok(dLongo.removidas.length === 3, "longo cura veneno, sangramento e exaustão");
ok(dLongo.condicoes.length === 1 && dLongo.condicoes[0].id === "abencoado", "…e a bênção fica");

/* ============================================================
   T2 · A CURA NÃO LIMPA — os canais de saída (v9.239)

   A lei desta etapa, tirada de D&D 5e: cura normal apenas recupera PV,
   não remove a condição. Quem tira é o RELÓGIO, o DESCANSO, ou uma porta
   DECLARADA (T4).

   O DESCANSO FICOU COMO ESTAVA, e o motivo está no módulo: ele não é
   cura, é PASSAGEM DE TEMPO — faz duas coisas ao mesmo tempo, e a
   limpeza vem da metade do tempo, não da metade de PV (a de PV mora em
   `descanso.js`, que não tem uma linha tocando `condicoes`). É também a
   única saída de `exausto`, que tem `turnos: null`.

   O QUE MUDOU: quatro condições diziam `saiCom: ["cura"]` e ninguém lia
   esse canal — `limparPorDescanso` é o único leitor de `saiCom` e só
   recebe "curto" e "longo". Promessa morta, e que contradizia a lei. O
   canal foi RENOMEADO para "restauracao" (a porta declarada de T4), não
   apagado: apagá-lo deixaria `enfeiticado` com `saiCom` VAZIO, e a regra
   implícita de que o longo limpa toda condição ruim sem canal passaria a
   quebrar encantamento — o jogador veria a diferença.

   As asserções abaixo são NOVAS; nenhuma asserção antiga foi movida. As
   duas do descanso, logo acima, continuam exatamente como estavam — e
   continuarem verdes é metade da prova de que T2 não mexeu no que o
   jogador vive.
   ============================================================ */
console.log("\n[T2 · os canais de saída]:");
{
  const ids = CANAIS_DE_SAIDA.map((c) => c.id);
  ok(ids.includes("curto") && ids.includes("longo"), "a tabela declara os dois canais de descanso");
  ok(CANAIS_DE_SAIDA.filter((c) => c.porDescanso).length === 2, "…e só esses dois são de descanso");
  ok(CANAIS_DE_SAIDA.every((c) => c.id && c.diz), "toda linha da tabela diz o que é");
  ok(!ids.includes("cura"), "e nenhum canal se chama `cura` — a lei da etapa");

  /* NENHUMA CONDIÇÃO PROMETE O QUE A LEI PROÍBE */
  const prometem = listaCondicoes().filter((c) => (c.saiCom || []).some((s) => /^cura/i.test(s)));
  ok(prometem.length === 0, "nenhuma condição declara sair com `cura`: " + (prometem.map((c) => c.id).join(", ") || "nenhuma"));
  const fora = listaCondicoes().flatMap((c) => (c.saiCom || []).filter((s) => !ids.includes(s)).map((s) => `${c.id}:${s}`));
  ok(fora.length === 0, "todo canal declarado pelo catálogo existe na tabela: " + (fora.join(", ") || "todos"));

  /* AS QUATRO QUE PERDERAM O CANAL continuam com saída pelo relógio —
     nenhuma ficou presa para sempre por causa desta etapa */
  for (const id of ["envenenado", "sangrando", "cego", "enfeiticado"]) {
    ok(Number(condicaoPorId(id).turnos) > 0, `${id} perdeu o canal "cura" mas ainda vence no relógio (${condicaoPorId(id).turnos}t)`);
  }

  /* A PORTA DO DESCANSO SÓ ABRE PARA CANAL DE DESCANSO. Sem isto,
     `limparPorDescanso(c, "cura")` seria a maneira mais fácil de uma cura
     futura apagar condição sem parecer que apagava. */
  const tres = [criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("exausto")];
  for (const canal of ["cura", "restauracao", "poção", "", null]) {
    const r = limparPorDescanso(tres, canal);
    ok(r.removidas.length === 0 && r.condicoes.length === 3, `canal ${JSON.stringify(canal)} não tira nada do descanso`);
  }
  /* `undefined` é o único que não cai na recusa, e de propósito: dispara o
     parâmetro-padrão `tipo = "curto"`, de que todo chamador de um argumento
     só depende. `null` NÃO dispara o padrão (lei da casa) e é recusado. */
  ok(limparPorDescanso(tres, undefined).removidas.length === limparPorDescanso(tres, "curto").removidas.length,
    "…mas `undefined` cai no padrão `curto`, como sempre caiu");

  /* E O COMPORTAMENTO NÃO MUDOU: a noite inteira continua sem quebrar
     encantamento. É a prova de que renomear guardou o jogo onde estava. */
  ok(limparPorDescanso([criarCondicao("enfeiticado")], "longo").removidas.length === 0,
    "a noite inteira continua NÃO quebrando encantamento");
  ok(limparPorDescanso([criarCondicao("envenenado")], "longo").removidas.length === 1,
    "…e continua levando o veneno, que sempre declarou o canal `longo`");
}

/* v9.49: aqui testava-se o cao de guarda que lia a narracao atras de
   condicoes. Ele saiu — ver teste-consequencias.mjs. A lista de casos que
   ficava aqui e o proprio epitafio dele: previa o orc envenenado aos pes do
   heroi e o "se voce ficar envenenado", e nao previa "o ar preso na
   garganta", que foi o que apareceu jogando. */

console.log("\n[o que o Mestre lê]:");
const pers = { nome: "Vera", condicoes: [criarCondicao("envenenado"), criarCondicao("atordoado")], grupo: [{ nome: "Doran", condicoes: [criarCondicao("sangrando")] }] };
console.log(resumoCondicoesPrompt(pers, pers.grupo));

/* ============================================================
   T1 · LIGADO AO JOGO — o terceiro chamador do relógio

   NO MOLDE DA SEÇÃO 15 DE `teste-efeitos.mjs`, que P3 escreveu para o
   irmão exato deste bloco: o relógio dos EFEITOS do grupo. Ela mora na
   suíte do módulo que estava sendo fiado (`tickEfeitos`), e esta mora na
   suíte do módulo que está sendo fiado agora (`tickCondicoes`). Mesmo
   critério, arquivo diferente — território é de quem edita.

   E a lição de R4 que aquela seção escreveu vale igual: definição *E*
   sítio. A metade de cima deste arquivo prova que o relógio funciona; se
   ninguém o chamar com a lista do companheiro, ela continua verde para
   sempre — que foi precisamente o estado do jogo entre a v9.2 e hoje.
   Se o bloco sumir amanhã, é ESTA seção que fica vermelha.
   ============================================================ */
console.log("\n[T1 · ligado ao jogo] o relógio do grupo no App.jsx:");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const quantas = (rx) => (APP.match(rx) || []).length;

  const iHeroi = APP.indexOf("const t = tickCondicoes(pers.condicoes)");
  const iGrupo = APP.indexOf("const t = tickCondicoes(g.condicoes)");
  const iInimigos = APP.indexOf("const t = tickCondicoes(e.condicoes)");
  ok(iHeroi > 0 && iInimigos > 0, "os dois relógios antigos continuam onde estavam (herói e inimigos)");
  ok(iGrupo > 0, "e nasceu o TERCEIRO: o relógio corre sobre a lista do companheiro");
  ok(quantas(/tickCondicoes\(/g) === 3, `o órgão tem exatamente três chamadores no App (${quantas(/tickCondicoes\(/g)})`);
  /* A POSIÇÃO É A PROMESSA. O bloco tem de estar no MESMO passo do turno
     que os outros dois: se migrar para o relógio de rodadas do combate, a
     condição do companheiro passa a vencer só em luta e, fora dela, o
     buff fica de pé para sempre outra vez — de volta ao buraco da v9.2,
     com a suíte verde. */
  ok(iHeroi < iGrupo && iGrupo < iInimigos, `e está ENTRE os dois — herói(${iHeroi}) → grupo(${iGrupo}) → inimigos(${iInimigos})`);

  const iFim = APP.indexOf('calou("prazo-da-condicao-do-grupo", e)');
  const iTry = APP.lastIndexOf("try {", iGrupo);
  ok(quantas(/calou\("prazo-da-condicao-do-grupo",\s*e\)/g) === 1, "a fiação nova cala em vez de custar o turno (`calou`), uma vez só");
  /* "Perto de um catch" não é "dentro de um try": a prova é que o try mais
     próximo ABRE antes do tique e não se fecha no meio do caminho. */
  ok(iTry > 0 && iFim > iGrupo && !/catch/.test(APP.slice(iTry, iGrupo)), "e o tique está DENTRO desse try, não ao lado dele");

  /* RECORTE HONESTO OU NENHUM. Se o bloco sumir, `iFim` vem −1 e um
     `slice(iTry, -1)` entregaria o ARQUIVO QUASE INTEIRO como se fosse o
     bloco — e aí as duas provas de ausência lá embaixo acendem por
     encontrarem `t.dano` em qualquer outro lugar do App, não por este
     bloco cobrar dano. Vermelho pelo motivo errado hoje é verde pelo
     motivo errado amanhã. Sem recorte válido, `bloco` é vazio e TODA
     asserção daqui para baixo — presença e ausência — exige `achou`. */
  const achou = iGrupo > 0 && iTry > 0 && iFim > iGrupo;
  const bloco = achou ? APP.slice(iTry, iFim) : "";
  ok(achou && /\(pers\.grupo \|\| \[\]\)\.map\(/.test(bloco), "o relógio é sobre `pers.grupo` — a lista dos companheiros, não a minha");
  ok(achou && /if \(!g \|\| !\(\(g\.condicoes \|\| \[\]\)\.length\)\) return g;/.test(bloco), "companheiro nulo ou sem condição sai intacto");
  /* Tique que não escreve de volta é tique que não conta: a lista nova tem
     de voltar para a ficha, senão o prazo roda em cópia e o save guarda a
     condição cheia — o mesmo sintoma de antes, com o relógio ligado. */
  ok(achou && /return \{ \.\.\.g, condicoes: t\.condicoes \};/.test(bloco), "o prazo é ESCRITO de volta na ficha do companheiro");
  ok(achou && /pers = \{ \.\.\.pers, grupo: grupoComPrazo \};/.test(bloco), "…e a ficha nova substitui a antiga — o tique não roda em cópia");
  ok(achou && /\$\{g\.nome\}: \$\{c\.nome\} passou/.test(bloco), "e o jogador lê quem perdeu o quê: nome do companheiro e nome da condição");

  /* ---------------- O QUE O BLOCO NÃO FAZ, DE PROPÓSITO ----------------
     Duas ausências, e ausência mente quando o bloco some junto — as duas
     só valem porque as asserções acima já exigiram que ele exista.

     1. NÃO COBRA `dano`. `tickCondicoes` devolve `dano`/`fontes` e os dois
        irmãos os cobram; o grupo não. Companheiro morrendo de veneno é um
        jeito NOVO de o jogador perder um companheiro, e isso é decisão da
        pessoa, não efeito colateral de fiação. A fronteira que guarda o
        zero — nenhum portador de grupo aponta para condição com
        `danoTurno` — mora em `teste-afl.mjs`, que é o dono da tabela.
     2. NÃO FILTRA POR VIDA, e a diferença para o relógio dos inimigos é
        deliberada: o inimigo derrotado sai de cena, o companheiro caído
        continua nela e pode ser erguido. O tempo passa para ele também. */
  ok(achou && !/t\.dano/.test(bloco), "o relógio do grupo NÃO cobra dano por turno — decisão da pessoa, não esquecimento");
  ok(achou && !/vida/.test(bloco), "e NÃO filtra por vida: o tempo passa para o companheiro caído também");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
