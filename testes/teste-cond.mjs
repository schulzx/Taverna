import {
  normalizarCondicao, criarCondicao, mecanicaDe, estadoDeRolagem, tickCondicoes,
  limparPorDescanso, resumoCondicoesPrompt, listaCondicoes, condicaoPorId, CANAIS_DE_SAIDA,
  SALVAGUARDA_DO_FIM_DO_TURNO, salvaguardaDeSaida, linhaDaSaidaDeCondicao,
  tentarSaidaNoFimDoTurno, CONDICOES,
  PORTAS_DE_SAIDA, portaDeSaida, removerPelaPorta, linhaDaPortaDeSaida, coberturaDasCondicoes,
} from "../src/condicoes.js";
/* T4 lê a lista do ITEM de quem a escreveu, nunca de uma cópia aqui: o
   `porItem` de `coberturaDasCondicoes` entra por argumento porque `pocoes.js`
   IMPORTA `condicoes.js` e importá-lo de volta fecharia ciclo — a suíte não
   tem esse problema, então é ela quem faz a ponte. Copiar os dez ids para cá
   provaria que a suíte sabe digitar, não que o frasco remove. */
import { CONSUMIVEIS } from "../src/pocoes.js";
import { RELIQUIAS } from "../src/relicas.js";
/* E a lista da MAGIA e da HABILIDADE de quem as guarda: `portas[].nome` é o
   laço com o acervo, e um nome que morrer lá tem de acender aqui. */
import { MAGIAS } from "../src/grimorio.js";
import { CLASSES } from "../src/classes.js";
/* T3 lê de volta de quem ROLA, não de uma cópia: os ids de atributo da tabela
   têm de existir em `SALVAGUARDAS`, e o bônus de proficiência tem de ser o
   mesmo número que `bonusDeSalvaguarda` soma. Copiar "3" aqui provaria que a
   suíte sabe somar, não que o jogo soma. */
import { SALVAGUARDAS } from "../src/salvaguardas.js";
import { bonusProficiencia } from "../src/regras.js";

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

/* ============================================================
   T3 · A SALVAGUARDA NO FIM DO TURNO (v9.240)

   A lei é da pessoa: *"os testes de resistência para alguns venenos — tipo,
   teste de salvaguarda de Constituição exigido pelo veneno no final do
   turno."* A palavra que carrega a fase é ALGUNS: no 5e a segunda chance é
   EXCEÇÃO DECLARADA, nunca cortesia geral.

   A CATRACA QUE A ETAPA EXIGE, escrita na pauta e provada logo abaixo:
   *toda condição do catálogo declarou sua posição (permite ou não), e
   nenhuma que permite fica sem CD.* É o mesmo espírito de
   `CONCENTRACAO_DA_MAGIA` — lista de EXCEÇÃO, nunca de permissão: uma
   condição ruim nova amanhã que nasça sem se declarar cai aqui no dia em
   que nascer, não na primeira vez que alguém a sofrer na mesa.

   ESTAS SEÇÕES SÃO NOVAS E NENHUMA ASSERÇÃO ANTIGA FOI MOVIDA OU TOCADA.
   Entram aqui, depois de [T2], porque T3 é a etapa seguinte e o arquivo
   não tem seções numeradas — acrescentar no fim de uma fase não renumera
   nada nem muda o que qualquer prova anterior afirma.
   ============================================================ */

const T3 = SALVAGUARDA_DO_FIM_DO_TURNO;

/* O PISO DO ALCANCE, no molde de `check-cura-nao-limpa.mjs`. Uma catraca
   que percorre um catálogo passa VERDE E VAZIA no dia em que a leitura do
   catálogo quebrar — foi o vício que aquele varredor já guardou. Os
   números são `>=`, nunca `===`: condição nova amanhã tem de entrar na
   varredura, não derrubá-la. */
const MEDIDA_T3 = {
  /* medido em 14/09: 13 ruins + 8 boas */
  pisoDoCatalogo: 21,
  pisoDeRuins: 13,
  pisoDeBoas: 8,
  /* as sete que dão segunda chance; se um dia forem seis, é decisão que
     tem de ser escrita, não silêncio */
  pisoQuePermitem: 7,
};

/* SABOTAR E DEVOLVER. Um número que a suíte só prova COPIANDO não prova
   nada: prova que duas pessoas sabem digitar 14. Estragar a tabela e ver a
   rolagem mudar é o que prova que a rolagem LÊ a tabela. O `finally`
   garante que a tabela volta inteira mesmo se a asserção estourar. */
const sabotando = (obj, campo, valor, fn) => {
  const antes = obj[campo];
  obj[campo] = valor;
  try { return fn(); } finally { obj[campo] = antes; }
};
/* Um portador descartável com as condições pedidas — o molde do que o App
   entrega nos três sítios (`portador.condicoes`). */
const quemCarrega = (ids, extra = {}) => ({ ...extra, condicoes: ids.map((id) => criarCondicao(id)) });

console.log("\n[T3 · a catraca] toda condição declarou sua posição, e quem permite tem CD:");
{
  const todas = listaCondicoes();
  const ruins = todas.filter((c) => c.tipo === "ruim");
  const boas = todas.filter((c) => c.tipo === "bom");
  ok(todas.length >= MEDIDA_T3.pisoDoCatalogo, `a catraca percorre o catálogo inteiro: ${todas.length} condições (piso ${MEDIDA_T3.pisoDoCatalogo})`);
  ok(ruins.length >= MEDIDA_T3.pisoDeRuins && boas.length >= MEDIDA_T3.pisoDeBoas, `e os dois lados estão de pé: ${ruins.length} ruins, ${boas.length} boas`);

  /* A CATRACA, PALAVRA POR PALAVRA DA PAUTA — metade um: POSIÇÃO. */
  const semPosicao = todas.filter((c) => { const p = salvaguardaDeSaida(c.id); return !p || !p.declarada; }).map((c) => c.id);
  ok(semPosicao.length === 0, `nenhuma condição sem posição declarada: ${semPosicao.join(", ") || "nenhuma"}`);
  /* …e o motivo junto. Posição sem motivo escrito é decisão apagada em
     silêncio — a lei da casa vale para a tabela como vale para a suíte. */
  const semMotivo = todas.filter((c) => !String(salvaguardaDeSaida(c.id).porque || "").trim()).map((c) => c.id);
  ok(semMotivo.length === 0, `e nenhuma sem o PORQUÊ escrito: ${semMotivo.join(", ") || "nenhuma"}`);

  /* Metade dois: NENHUMA QUE PERMITE FICA SEM CD — e o atributo tem de
     existir em quem vai rolar, senão `salvaguardaPorId` cai no primeiro da
     lista e a condição rolaria Vigor achando que rola outra coisa. */
  const idsDeSalva = SALVAGUARDAS.map((s) => s.id);
  const permitem = todas.map((c) => salvaguardaDeSaida(c.id)).filter((p) => p.permite);
  ok(permitem.length >= MEDIDA_T3.pisoQuePermitem, `${permitem.length} condições dão segunda chance (piso ${MEDIDA_T3.pisoQuePermitem})`);
  const mancas = permitem.filter((p) => !(p.cd > 0) || !idsDeSalva.includes(p.salva) || !String(p.sai).trim()).map((p) => p.id);
  ok(mancas.length === 0, `toda que permite tem CD > 0, salvaguarda que existe e frase de saída: ${mancas.join(", ") || "todas"}`);
  /* A FORMA DE QUEM NÃO PERMITE É UMA SÓ. `salvaguardaDeSaida` nunca
     devolve `null` para dizer "não permite" (null é "não é condição
     nenhuma"), e quem não permite não pode carregar CD nem frase pendurada
     — meia declaração é o jeito de uma condição parecer ligada e não estar. */
  const naoPermitem = todas.map((c) => salvaguardaDeSaida(c.id)).filter((p) => !p.permite);
  const sujas = naoPermitem.filter((p) => p.cd !== 0 || p.salva !== "" || p.sai !== "").map((p) => p.id);
  ok(sujas.length === 0, `e quem não permite não carrega CD, salvaguarda nem frase penduradas: ${sujas.join(", ") || "todas limpas"}`);

  /* A CONVERGÊNCIA: as duas listas escritas mais as boas cobertas pela
     regra geral dão o catálogo INTEIRO, sem sobra e sem repetição. É o que
     transforma "ninguém ficou sem posição" em "a tabela fala do catálogo
     que existe", e não de um catálogo que existia. */
  const escritas = [...T3.permitem.map((x) => x.id), ...T3.naoPermitem.map((x) => x.id)];
  const orfas = escritas.filter((id) => !condicaoPorId(id));
  ok(orfas.length === 0, `nenhuma linha da tabela aponta para condição que não existe: ${orfas.join(", ") || "nenhuma"}`);
  ok(new Set(escritas).size === escritas.length, "e nenhuma condição está escrita nos dois lados ao mesmo tempo");
  ok(T3.permitem.length + T3.naoPermitem.length + boas.length === todas.length,
    `${T3.permitem.length} permitem + ${T3.naoPermitem.length} não permitem + ${boas.length} boas pela regra geral = ${todas.length}, o catálogo inteiro`);

  /* O DENTE DA CATRACA, provado em vez de prometido. Sem isto a seção
     acima ficaria verde para sempre mesmo que `declarada` fosse `true`
     cravado: tirar UMA linha da tabela tem de acender a lâmpada, e é
     exatamente o que acontece quando uma condição ruim nova nascer sem
     declarar posição. A tabela volta inteira no `finally`. */
  const semExausto = sabotando(T3, "naoPermitem", T3.naoPermitem.filter((x) => x.id !== "exausto"),
    () => todas.filter((c) => !salvaguardaDeSaida(c.id).declarada).map((c) => c.id));
  ok(semExausto.join(",") === "exausto", `tirada uma linha da tabela, a catraca acende nela e só nela (${semExausto.join(",") || "nenhuma"})`);
  ok(T3.naoPermitem.length === MEDIDA_T3.pisoDoCatalogo - MEDIDA_T3.pisoQuePermitem - MEDIDA_T3.pisoDeBoas || T3.naoPermitem.some((x) => x.id === "exausto"),
    "e a tabela volta inteira depois da sabotagem");
}

console.log("\n[T3 · o critério lido de volta] os três testes batem com quem está de cada lado:");
{
  const crit = T3.criterio;
  ok(Array.isArray(crit) && crit.length === 3 && crit.every((s) => String(s).trim()), `o critério é legível pela suíte: ${crit.length} testes escritos`);

  /* TESTE 1 — o número sai do TEXTO do critério, não de um literal aqui.
     Trocar o critério para "turnos >= 3" sem mover ninguém de lado fica
     vermelho, que é o ponto: critério e tabela não podem discordar. */
  const minTurnos = Number((String(crit[0]).match(/turnos\s*>=\s*(\d+)/) || [])[1]);
  ok(minTurnos >= 2, `o teste 1 declara o prazo mínimo no próprio texto: turnos >= ${minTurnos}`);
  const curtasQuePermitem = T3.permitem.filter((x) => { const c = condicaoPorId(x.id); return !(Number(c.turnos) >= minTurnos); }).map((x) => x.id);
  ok(curtasQuePermitem.length === 0, `nenhuma que permite tem prazo abaixo de ${minTurnos} (nem prazo nulo): ${curtasQuePermitem.join(", ") || "nenhuma"}`);
  const curtas = listaCondicoes().filter((c) => c.tipo === "ruim" && c.turnos != null && c.turnos < minTurnos);
  ok(curtas.length > 0, `e o teste 1 tem sobre quem morder: ${curtas.map((c) => c.id).join(", ")}`);
  const curtasSemCitar = curtas.filter((c) => !/teste 1/i.test(salvaguardaDeSaida(c.id).porque)).map((c) => c.id);
  ok(curtasSemCitar.length === 0, `toda condição de prazo curto está fora CITANDO o teste 1: ${curtasSemCitar.join(", ") || "todas citam"}`);

  /* TESTE 2 — o ferimento em curso. Ele é julgamento, e por isso a prova é
     a AMARRAÇÃO ao catálogo: as três condições que cobram dano por turno
     são exatamente as que o teste 2 discute, e a tabela tem de separá-las
     do jeito declarado — as duas de ferimento fora, e o veneno dentro,
     porque foi o exemplo que a PESSOA deu. Mover qualquer uma acende. */
  ok(/ferimento|fogo/i.test(String(crit[1])), "o teste 2 nomeia no próprio texto o que ele corta: ferimento e fogo");
  const doem = listaCondicoes().filter((c) => c.danoTurno > 0).map((c) => c.id).sort();
  ok(doem.join(",") === "envenenado,queimando,sangrando", `as que cobram dano por turno são três: ${doem.join(", ")}`);
  const porTeste2 = T3.naoPermitem.filter((x) => /teste 2/i.test(x.porque)).map((x) => x.id).sort();
  ok(porTeste2.join(",") === "queimando,sangrando", `duas delas saem pelo teste 2 (ferimento em curso): ${porTeste2.join(", ")}`);
  ok(salvaguardaDeSaida("envenenado").permite === true && /pessoa/i.test(salvaguardaDeSaida("envenenado").porque),
    "e a terceira é o veneno, que ENTRA — é o exemplo que a pessoa deu, e o motivo diz isso");

  /* TESTE 3 — ninguém resiste à própria bênção. As oito boas são cobertas
     pela REGRA, não por oito linhas iguais: se alguém as escrever uma a
     uma amanhã, a convergência acima muda e esta seção diz onde. */
  ok(/ruim|bênção|bencao/i.test(String(crit[2])), "o teste 3 diz no texto que só condição ruim rola");
  const boas = listaCondicoes().filter((c) => c.tipo === "bom");
  const boasQuePermitem = boas.filter((c) => salvaguardaDeSaida(c.id).permite).map((c) => c.id);
  ok(boasQuePermitem.length === 0, `nenhuma condição boa dá salvaguarda de saída: ${boasQuePermitem.join(", ") || "nenhuma"}`);
  const boasForaDaRegra = boas.filter((c) => salvaguardaDeSaida(c.id).porque !== T3.porqueBoaNaoRola).map((c) => c.id);
  ok(boasForaDaRegra.length === 0, `e as ${boas.length} são cobertas pelo MESMO motivo da regra, não por oito linhas repetidas: ${boasForaDaRegra.join(", ") || "todas"}`);
  const escritas = [...T3.permitem.map((x) => x.id), ...T3.naoPermitem.map((x) => x.id)];
  ok(!boas.some((c) => escritas.includes(c.id)), "nenhuma boa aparece escrita em lista nenhuma — a regra basta");

  /* ENTRADA E SAÍDA SÃO PERGUNTAS DIFERENTES, e o módulo escreveu isso:
     `resistir` é o teste de quando a condição PEGA; esta tabela é o de
     quando ela SAI. Os dois casos opostos ficam guardados aqui para que
     ninguém "conserte" a divergência fundindo os dois campos. */
  ok(condicaoPorId("enfeiticado").resistir && salvaguardaDeSaida("enfeiticado").permite === false,
    "enfeitiçado TEM teste de entrada e NÃO tem de saída");
  ok(!condicaoPorId("cego").resistir && salvaguardaDeSaida("cego").permite === true,
    "…e cego não tem de entrada e TEM de saída — os campos não são o mesmo");

  /* A CD NÃO É ESCOLHA DE GOSTO: onde há entrada declarada ela é a MESMA
     (um veneno tem uma força só), e onde não há é o piso da faixa que o
     catálogo inteiro já usa — lido do catálogo, não copiado para cá. */
  const comEntrada = T3.permitem.filter((x) => condicaoPorId(x.id).resistir);
  ok(comEntrada.length > 0 && comEntrada.every((x) => x.cd === condicaoPorId(x.id).resistir.dif),
    `as ${comEntrada.length} que têm entrada repetem a dificuldade dela — a mesma condição não tem duas forças`);
  const piso = Math.min(...listaCondicoes().filter((c) => c.resistir).map((c) => c.resistir.dif));
  const semEntrada = T3.permitem.filter((x) => !condicaoPorId(x.id).resistir);
  ok(semEntrada.length > 0 && semEntrada.every((x) => x.cd === piso),
    `e as ${semEntrada.length} sem entrada usam o piso da faixa do catálogo (${piso}), não um número inventado`);
}

console.log("\n[T3 · a CD sai da tabela] sabotado o número, a rolagem muda:");
{
  /* A prova de que a dificuldade é LIDA. `paralisado` é a mais dura das
     sete; com o dado cravado em 13 e modificador zero ela falha por um
     ponto. Baixada a CD na tabela — e só ela —, o MESMO dado passa. */
  const linha = T3.permitem.find((x) => x.id === "paralisado");
  const cdReal = linha.cd;
  const antes = tentarSaidaNoFimDoTurno(quemCarrega(["paralisado"]), { d20: 13 });
  const depois = sabotando(linha, "cd", cdReal - 2, () => tentarSaidaNoFimDoTurno(quemCarrega(["paralisado"]), { d20: 13 }));
  ok(antes.mudou === false && depois.mudou === true, `o mesmo d20 13 falha contra CD ${cdReal} e passa contra CD ${cdReal - 2}`);
  ok(antes.rolagens[0].dc === cdReal && depois.rolagens[0].dc === cdReal - 2, "e a dificuldade que a rolagem usou é a que estava na tabela no instante da rolagem");
  ok(linha.cd === cdReal, "…e a tabela volta inteira depois da sabotagem");

  /* A FRASE CARREGA OS DOIS NÚMEROS, e um deles é a CD. Agora que o TEXTO
     que o jogador lê diz a dificuldade, um número à mão no App seria uma
     segunda verdade — é a mesma lição de C2 com `RESISTENCIA_DA_CONCENTRACAO`. */
  const saiu = tentarSaidaNoFimDoTurno(quemCarrega(["paralisado"]), { d20: 19 });
  ok(saiu.linhas.length === 1 && saiu.linhas[0].includes(String(cdReal)) && saiu.linhas[0].includes(String(saiu.rolagens[0].total)),
    `a frase traz os dois números: "${saiu.linhas[0]}"`);
  ok(/^🥶 /.test(saiu.linhas[0]), "…com o ícone da própria condição na frente, o mesmo que o HUD mostra");
  /* VOZ DE MUNDO: o jogador não lê o nome do mecanismo. A lei da casa —
     "o sistema não fala de si mesmo" — vale para esta linha também. */
  ok(!/salvaguard|CD|dificuldade|d20|rolagem|vigor|condi[çc]/i.test(saiu.linhas[0]), "e sem uma palavra do mecanismo — nem salvaguarda, nem CD, nem d20");
  /* A linha 🎲 é a irmã de depuração e continua existindo em separado:
     quem quiser ver a falha tem ela, atrás de `mostrarRolagens`. */
  ok(saiu.linhasTecnicas.length === 1 && /Salvaguarda de/.test(saiu.linhasTecnicas[0]), "a linha técnica é outra, e é ela que nomeia o mecanismo");
}

console.log("\n[T3 · determinismo] mesma semente, mesmo resultado:");
{
  /* A LEI: mesma semente = mesmo resultado, em qualquer máquina. É o único
     árbitro que um sistema sem servidor tem — e aqui ele entra por `d20`,
     que aceita número (todas com o mesmo dado) ou função `(inst, i)`. */
  const portador = quemCarrega(["envenenado", "sangrando", "abencoado"], { nome: "Vera" });
  const a = tentarSaidaNoFimDoTurno(portador, { d20: 20 });
  const b = tentarSaidaNoFimDoTurno(portador, { d20: 20 });
  ok(JSON.stringify(a) === JSON.stringify(b), "duas chamadas com o mesmo dado devolvem o MESMO objeto inteiro — saídas, linhas e rolagens");
  ok(a.saidas.length === 1 && a.saidas[0].id === "envenenado", "só o veneno saiu: sangrando não permite e abençoado é boa");
  ok(a.rolagens.length === 1, "e rolou UMA vez — não se rola para quem não permite");
  ok(a.condicoes.length === 2, "as outras duas ficam de pé");

  /* d20 POR FUNÇÃO: dados diferentes por condição, que é o que uma semente
     de verdade entrega. O índice conta só as que ROLAM — quem não permite
     não consome dado, senão a semente andaria sozinha. */
  const dados = [3, 19, 4];
  const r = tentarSaidaNoFimDoTurno(quemCarrega(["envenenado", "cego", "lento"]), { d20: (inst, i) => dados[i] });
  ok(r.saidas.length === 1 && r.saidas[0].id === "cego", "com três dados diferentes, sai exatamente quem tirou o dado que passa");
  const comBoaNoMeio = tentarSaidaNoFimDoTurno(quemCarrega(["envenenado", "abencoado", "cego"]), { d20: (inst, i) => dados[i] });
  ok(comBoaNoMeio.saidas.length === 1 && comBoaNoMeio.saidas[0].id === "cego",
    "…e uma condição boa no meio da lista NÃO gasta um dado — a sequência da semente não anda à toa");

  /* O CRÍTICO E O DESASTRE VÊM DE `rolarSalvaguarda`, e é de propósito: a
     rolagem não mora neste módulo, para não existirem dois d20 na casa. */
  const critico = sabotando(T3.permitem.find((x) => x.id === "envenenado"), "cd", 30,
    () => tentarSaidaNoFimDoTurno(quemCarrega(["envenenado"]), { d20: 20 }));
  ok(critico.mudou === true && critico.rolagens[0].critico === true, "d20 20 sai mesmo contra uma dificuldade impossível — o crítico é respeitado");
  const desastre = tentarSaidaNoFimDoTurno(quemCarrega(["envenenado"]), { d20: 1, modDe: () => 20 });
  ok(desastre.mudou === false && desastre.rolagens[0].desastre === true && desastre.rolagens[0].total > desastre.rolagens[0].dc,
    `d20 1 falha mesmo somando ${desastre.rolagens[0].total} contra ${desastre.rolagens[0].dc} — o desastre é respeitado`);
  ok(desastre.linhas.length === 0, "e falha não gera linha nenhuma: a frase nasce só no sucesso");
}

console.log("\n[T3 · os três portadores] herói, companheiro e inimigo, cada um com o seu bônus:");
{
  /* A DIFERENÇA ENTRE OS TRÊS ENTRA POR `modDe`, e é o que faz este módulo
     servir os três sítios do App sem saber qual é qual. */
  const nivel = 5, prof = bonusProficiencia(nivel);

  /* O HERÓI tem ficha de atributo, e quem sabe somar atributo + equipamento
     + efeito é `atributoEfetivo` — que entra por argumento porque
     `regras-jogo.js` importa `condicoes.js` e chamá-lo daqui fecharia ciclo. */
  const heroi = quemCarrega(["envenenado"], { nome: "Vera", classe: "Clérigo", nivel });
  const rH = tentarSaidaNoFimDoTurno(heroi, { d20: 8, modDe: () => 3 });
  ok(rH.rolagens[0].mod === 3 + prof, `o herói soma o atributo que o App passa (3) e a proficiência da classe (${prof}) = ${rH.rolagens[0].mod}`);
  ok(rH.rolagens[0].proficiente === true, "…e a rolagem diz que ele é proficiente (Clérigo salva em Vigor)");
  const rH0 = tentarSaidaNoFimDoTurno(heroi, { d20: 8, modDe: () => 0 });
  ok(rH0.rolagens[0].mod === prof && rH.mudou === true && rH0.mudou === false,
    "e o `modDe` é LIDO de verdade: com atributo 0 o mesmo dado deixa de passar");

  /* O COMPANHEIRO não traz `atributos` — e a proficiência dele soma
     SOZINHA, porque ele declara `classe`. Um Guerreiro aguenta veneno
     melhor que um Mago, que é o que a classe dele promete. */
  const guerreiro = quemCarrega(["envenenado"], { nome: "Bruno", classe: "Guerreiro", nivel });
  const mago = quemCarrega(["envenenado"], { nome: "Lira", classe: "Mago", nivel });
  const rG = tentarSaidaNoFimDoTurno(guerreiro, { quem: "Bruno" });
  ok(rG.rolagens.length === 1, "o companheiro rola sem `modDe` nenhum — o App não lhe passa um");
  const rG9 = tentarSaidaNoFimDoTurno(guerreiro, { d20: 9, quem: "Bruno" });
  const rM9 = tentarSaidaNoFimDoTurno(mago, { d20: 9, quem: "Lira" });
  ok(rG9.rolagens[0].mod === prof && rG9.rolagens[0].proficiente === true, `o Guerreiro soma ${prof} só de proficiência, sem ficha de atributo`);
  ok(rM9.rolagens[0].mod === 0 && rM9.rolagens[0].proficiente === false, "e o Mago, que não salva em Vigor, soma zero");
  ok(rG9.mudou === true && rM9.mudou === false, "com o MESMO dado 9 o Guerreiro se livra do veneno e o Mago não — a classe pesa");
  ok(rG9.linhas[0].startsWith("🧪 Bruno: "), `e o jogador lê de quem é o corpo: "${rG9.linhas[0]}"`);

  /* O INIMIGO é zero puro: o bestiário não traz `atributos` e ele não
     declara classe nenhuma. O piso é DECLARADO na tabela, não acidente —
     derivar um modificador de nível ou ameaça seria regra nova e invisível. */
  const inimigo = quemCarrega(["envenenado"], { nome: "Aranha-do-Fosso", vida: 10, vidaMax: 10 });
  const rI = tentarSaidaNoFimDoTurno(inimigo, { d20: 12, quem: "Aranha-do-Fosso" });
  ok(rI.rolagens[0].mod === T3.modSemFicha, `o inimigo fica no piso declarado da tabela: ${T3.modSemFicha}`);
  ok(T3.modSemFicha === 0 && String(T3.porqueModSemFicha || "").trim(), "…e esse piso tem o motivo escrito ao lado dele");
  ok(rI.mudou === true && rI.linhas[0].startsWith("🧪 Aranha-do-Fosso: "), "o veneno sai do inimigo com dado cru, e a linha traz o nome dele");
  /* SEM NOME, A FRASE COMEÇA MAIÚSCULA — é o herói, que fala em primeira
     pessoa e não se anuncia pelo nome na própria linha. */
  const semNome = tentarSaidaNoFimDoTurno(quemCarrega(["envenenado"]), { d20: 18 });
  ok(/^🧪 [A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(semNome.linhas[0]), `sem nome, a frase é a do herói e começa em maiúscula: "${semNome.linhas[0]}"`);
}

console.log("\n[T3 · imutabilidade e lixo] nada é mutado e nada estoura:");
{
  /* LEI DA CASA: estado é substituído, nunca mutado. Se a porta passar a
     tirar a condição de dentro da lista que recebeu, o save e o undo mentem
     — é a mesma asserção que o relógio já tem, sobre a porta nova. */
  const portador = quemCarrega(["envenenado", "cego"], { nome: "Vera", vida: 9 });
  const copia = JSON.stringify(portador);
  const r = tentarSaidaNoFimDoTurno(portador, { d20: 20 });
  ok(JSON.stringify(portador) === copia, "o portador recebido sai intocado — nem a ficha nem a lista dele são mexidas");
  ok(r.condicoes !== portador.condicoes, "e a lista devolvida é OUTRA, não a mesma com menos itens");
  ok(r.saidas.length === 2 && r.condicoes.length === 0, "com d20 20 as duas que permitem saem de uma vez");
  ok(r.linhas.length === 2 && r.rolagens.length === 2, "uma linha e uma rolagem por condição que rolou");

  for (const [rotulo, valor, vazia] of [["null", null, true], ["indefinido", undefined, true], ["vazio", {}, true], ["condicoes null", { condicoes: null }, true], ["condicoes texto", { condicoes: "muitas" }, false], ["número", 7, true]]) {
    let r2 = null, estourou = false;
    try { r2 = tentarSaidaNoFimDoTurno(valor, { d20: 20 }); } catch { estourou = true; }
    ok(!estourou, `portador ${rotulo} não estoura a porta`);
    /* NADA SAI E NADA FALA é o que importa em todo lixo: a cena segue igual.
       `condicoes` como TEXTO é o único que não devolve lista vazia — string é
       iterável, então cada letra entra como "condição" que o catálogo não
       conhece e fica de pé, sem rolar. É o mesmo comportamento conservador
       que `tickCondicoes` já tem para instância desconhecida, e não chega a
       produzir nada na tela; por isso é medido aqui em vez de exigido
       diferente. */
    ok(r2 && r2.mudou === false && r2.linhas.length === 0 && r2.rolagens.length === 0, `…e nada sai, nada rola e nada é dito (${rotulo})`);
    if (vazia) ok(r2 && r2.condicoes.length === 0, `…com lista vazia de volta (${rotulo})`);
  }
  /* SEM OPÇÕES NENHUMAS: o App poderia chamar com um argumento só, e a
     porta tem de rolar do mesmo jeito (com d20 de verdade). */
  let semOpcoes = null, estourouOpcoes = false;
  try { semOpcoes = tentarSaidaNoFimDoTurno(quemCarrega(["envenenado"])); } catch { estourouOpcoes = true; }
  ok(!estourouOpcoes && semOpcoes && semOpcoes.rolagens.length === 1, "chamada com um argumento só rola normalmente — o padrão do segundo cobre");

  /* INSTÂNCIA DE CONDIÇÃO QUE O CATÁLOGO NÃO CONHECE: fica de pé, sem
     rolar e sem estourar — o mesmo comportamento conservador do relógio. */
  const fantasma = { id: "amaldicoado", nome: "Amaldiçoado", turnos: 2 };
  const rF = tentarSaidaNoFimDoTurno({ condicoes: [fantasma, criarCondicao("envenenado")] }, { d20: 20 });
  ok(rF.rolagens.length === 1 && rF.condicoes.length === 1 && rF.condicoes[0] === fantasma,
    "condição que o catálogo não conhece não rola, não some e continua sendo o mesmo objeto");
  const rLixo = tentarSaidaNoFimDoTurno({ condicoes: [null, undefined, {}, { nome: "" }] }, { d20: 20 });
  ok(rLixo.mudou === false && rLixo.condicoes.length === 4, "buraco e objeto vazio na lista de condições não estouram e não somem");

  /* A PORTA DE CONSULTA aceita os quatro jeitos pelos quais a pergunta
     chega nesta casa — e devolve `null` só para o que não é condição. */
  ok(salvaguardaDeSaida("Envenenado").permite === true, "a consulta aceita o rótulo");
  ok(salvaguardaDeSaida("intoxicado").permite === true, "…o nome da ficção (alias)");
  ok(salvaguardaDeSaida({ id: "envenenado", turnos: 2 }).permite === true, "…e a instância que está na ficha");
  for (const lixo of [null, undefined, "", "banana", {}, { id: "" }, 0, []]) {
    ok(salvaguardaDeSaida(lixo) === null, `e ${JSON.stringify(lixo) || String(lixo)} não é condição nenhuma → null`);
  }
  /* A FRASE NÃO NASCE SOZINHA: sem porta, sem rolagem ou sem sucesso, é
     string vazia — nunca uma linha meia-boca na tela do jogador. */
  ok(linhaDaSaidaDeCondicao(null, { passou: true }) === "", "sem porta, a frase é vazia");
  ok(linhaDaSaidaDeCondicao(salvaguardaDeSaida("envenenado"), null) === "", "sem rolagem, a frase é vazia");
  ok(linhaDaSaidaDeCondicao(salvaguardaDeSaida("envenenado"), { passou: false, total: 5, dc: 12 }) === "", "e na falha a frase é vazia — só o sucesso fala");
  ok(linhaDaSaidaDeCondicao(salvaguardaDeSaida("exausto"), { passou: true, total: 20, dc: 12 }) === "", "quem não permite não tem frase nem quando alguém finge que passou");
}

console.log("\n[T3 · a ordem é contrato] o relógio primeiro, a segunda chance depois:");
{
  /* A ORDEM ESTÁ ESCRITA NO MÓDULO E NOS TRÊS SÍTIOS DO APP, e é regra, não
     arrumação: o veneno cobra NO turno e a chance vem no FIM dele. Invertida,
     passar na salvaguarda apagaria retroativamente o dano de um turno em que
     o corpo esteve envenenado.

     A prova roda as DUAS ordens sobre a mesma cena e exige que elas
     DISCORDEM — uma asserção que só medisse a ordem certa ficaria verde no
     dia em que alguém invertesse os dois blocos por engano. */
  const umTurno = (invertida) => {
    let lista = [criarCondicao("envenenado")];
    let dano = 0;
    if (invertida) {
      lista = tentarSaidaNoFimDoTurno({ condicoes: lista }, { d20: 20 }).condicoes;
      const t = tickCondicoes(lista); dano += t.dano; lista = t.condicoes;
    } else {
      const t = tickCondicoes(lista); dano += t.dano; lista = t.condicoes;
      lista = tentarSaidaNoFimDoTurno({ condicoes: lista }, { d20: 20 }).condicoes;
    }
    return { dano, ficaram: lista.length };
  };
  const certa = umTurno(false), errada = umTurno(true);
  ok(certa.ficaram === 0 && certa.dano === condicaoPorId("envenenado").danoTurno,
    `na ordem certa o veneno sai no turno 1 E AINDA ASSIM custa ${certa.dano} PV — o turno em que esteve no sangue foi pago`);
  ok(errada.dano === 0, "na ordem invertida o mesmo turno sairia de graça…");
  ok(certa.dano !== errada.dano, "…e é por isso que inverter os dois blocos acende esta asserção");

  /* E O RELÓGIO JÁ TIROU QUEM VENCEU: não se rola para uma condição que ia
     sair de qualquer jeito. É o que torna a ordem barata além de correta. */
  const noUltimoTurno = tickCondicoes([{ ...criarCondicao("envenenado"), turnos: 1 }]);
  const depois = tentarSaidaNoFimDoTurno({ condicoes: noUltimoTurno.condicoes }, { d20: 20 });
  ok(noUltimoTurno.expiradas.length === 1 && depois.rolagens.length === 0,
    "a condição que o relógio acabou de vencer não chega a rolar — a chance não é gasta à toa");
}

console.log("\n[T3→T4 · os zeros que a etapa guardou, e o que os pagou]:");
{
  /* GUARDAR O ZERO FOI O QUE IMPEDIU T4 DE NASCER DE CARONA — e a seção
     cumpriu o que prometia: as duas coisas abaixo estavam MEDIDAS como
     ausentes, e T4 veio aqui, como estava escrito, trocar o zero pela prova
     de leitura. O TÍTULO MUDOU JUNTO ("o que a etapa NÃO fez, guardado como
     zero" → este), porque uma seção que diz zero e prova leitura é uma
     mentira no console.

     O QUE NÃO MUDOU, e é o ponto: a varredura é a MESMA, sobre o `src/`
     inteiro, com a mesma peneira por contexto que a escada de sabotagem
     apertou duas vezes. Só o SINAL dela virou, e por decisão escrita — em
     vez de exigir zero leitor, exige leitor, e diz onde ele tem de morar. */

  /* (a) O CANAL `restauracao` GANHOU LEITOR — era T4 quem o ligava.
     A varredura é sobre o `src/` inteiro, com piso de alcance, para não
     passar verde medindo lista vazia. */
  const { readdirSync, readFileSync } = await import("node:fs");
  const arquivos = readdirSync("../src").filter((f) => /\.(js|jsx)$/.test(f));
  ok(arquivos.length >= 100, `a varredura alcança o src inteiro: ${arquivos.length} arquivos (piso 100)`);
  /* A ESCADA DE SABOTAGEM ACHOU O BURACO AQUI, e o achado vale mais que a
     asserção: a primeira versão desta varredura PULAVA `condicoes.js`
     inteiro — e um leitor do canal nascido dentro do próprio catálogo
     (`export const X = () => "restauracao"`) passava verde. A exclusão por
     arquivo é o mesmo vício do recorte largo que T1 registrou: o lugar mais
     provável de o canal ganhar leitor é exatamente o arquivo que o declara.

     Agora a varredura é sobre o `src/` INTEIRO, sem exceção de arquivo, e a
     peneira é por CONTEXTO: o literal só é declaração quando está dentro de
     um `saiCom: [...]` ou é o `id:` da linha de `CANAIS_DE_SAIDA`. Qualquer
     outra aparição é alguém LENDO o canal, e é o que T4 vai fazer. Assim uma
     condição nova que declare a porta amanhã continua verde, e um leitor
     nascido em qualquer arquivo — este incluído — acende. */
  const semBlocos = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
  const leitores = [];
  for (const f of arquivos) {
    const texto = semBlocos(readFileSync("../src/" + f, "utf8"));
    for (const m of texto.matchAll(/"restauracao"/g)) {
      const antes = texto.slice(Math.max(0, m.index - 120), m.index);
      const depois = texto.slice(m.index + 13, m.index + 40);
      /* A ESCADA APERTOU ESTA PENEIRA DUAS VEZES. Aceitar qualquer `id:` na
         frente deixava passar `algumaCoisa({ id: "restauracao" })`, que é
         uso e não declaração — a linha de `CANAIS_DE_SAIDA` é reconhecida
         pela forma inteira dela, com o `porDescanso` logo atrás. */
      const declara = /saiCom:\s*\[[^\]]*$/.test(antes) || (/\bid:\s*$/.test(antes) && /^,\s*porDescanso:/.test(depois));
      if (!declara) leitores.push(`${f}:${texto.slice(0, m.index).split("\n").length}`);
    }
  }
  /* A ASSERÇÃO MOVEU, E O MOTIVO É ESTE. Até T3 ela era
     `leitores.length === 0` — "o canal segue sem leitor, é T4 quem o liga".
     T4 ligou, então o zero virou mentira; o que a asserção sempre quis dizer
     é "o canal não é declaração morta", e isso agora se prova pelo lado de
     cá. O piso é `>= 1` e não `=== 1` porque um leitor novo amanhã (o App
     perguntando o canal a esta tabela, por exemplo) é crescimento legítimo;
     o que NÃO pode voltar é o zero. */
  ok(leitores.length >= 1, `o canal "restauracao" TEM leitor — T4 o ligou: ${leitores.join(", ") || "ninguém o lê"}`);
  /* E ele tem de morar onde a tabela mora. Um leitor do canal nascido longe
     de `condicoes.js` é uma segunda autoridade sobre a mesma palavra — a
     doença que esta casa mais produziu —, e acende aqui no dia em que nascer. */
  const foraDeCasa = leitores.filter((l) => !/^condicoes\.js:/.test(l));
  ok(foraDeCasa.length === 0, `e o leitor mora no próprio catálogo, com a tabela: ${foraDeCasa.join(", ") || "só condicoes.js"}`);
  /* O DENTE: apagado o leitor do texto, a varredura volta a zero. Sem isto a
     asserção acima ficaria verde para sempre mesmo que a peneira parasse de
     casar — foi o vício que a escada já achou duas vezes neste mesmo bloco. */
  {
    const textoSem = semBlocos(readFileSync("../src/condicoes.js", "utf8")).replace(/canal:\s*"restauracao"/g, 'canal: "SABOTADO"');
    const aindaLeem = [...textoSem.matchAll(/"restauracao"/g)].filter((m) => {
      const antes = textoSem.slice(Math.max(0, m.index - 120), m.index);
      const depois = textoSem.slice(m.index + 13, m.index + 40);
      return !(/saiCom:\s*\[[^\]]*$/.test(antes) || (/\bid:\s*$/.test(antes) && /^,\s*porDescanso:/.test(depois)));
    });
    ok(aindaLeem.length === 0, `sabotado o único leitor no texto, a varredura volta a acusar zero (${aindaLeem.length})`);
  }
  ok(CANAIS_DE_SAIDA.find((c) => c.id === "restauracao").porDescanso === false, "…e ele continua declarado como porta que NÃO é descanso");
  /* A AUTORIDADE DA MAGIA, provada pelos dois lados. O canal é lido como
     CRITÉRIO (`PORTAS_DE_SAIDA.criterio[0]`) e a lista `remove` da magia é
     escrita à mão — o que amarra as duas é esta asserção, e só ela. Sem ela,
     acrescentar um id à Restauração sem declarar o canal passaria verde, e a
     autoridade declarada viraria enfeite.

     NÃO É IGUALDADE CRUA, e a diferença é deduzida em vez de perdoada: quem
     declara o canal e a magia não alcança tem de ser exatamente quem o teste
     2 do critério corta — o ferimento em curso, que é a mesma peneira que T3
     já usou para deixar `sangrando` fora da salvaguarda. */
  const declaramCanal = listaCondicoes().filter((c) => (c.saiCom || []).includes("restauracao")).map((c) => c.id).sort();
  const daMagia = [...new Set(PORTAS_DE_SAIDA.portas.filter((p) => p.familia === "magia").flatMap((p) => portaDeSaida(p.nome).remove))].sort();
  ok(declaramCanal.length >= 7, `${declaramCanal.length} condições declaram o canal (piso 7): ${declaramCanal.join(", ")}`);
  const magiaSemCanal = daMagia.filter((id) => !declaramCanal.includes(id));
  ok(magiaSemCanal.length === 0, `a magia não alcança nada que não declare o canal: ${magiaSemCanal.join(", ") || "nenhuma"}`);
  const canalSemMagia = declaramCanal.filter((id) => !daMagia.includes(id));
  const cortadasPeloTeste2 = canalSemMagia.filter((id) => /teste 2/i.test(salvaguardaDeSaida(id).porque || ""));
  ok(canalSemMagia.join(",") === cortadasPeloTeste2.join(","),
    `e quem declara o canal sem ser alcançada é só o ferimento em curso, cortado pelo teste 2: ${canalSemMagia.join(", ") || "ninguém"}`);
  ok(/ferimento|fogo/i.test(String(PORTAS_DE_SAIDA.criterio[1])), "…e o teste 2 de T4 nomeia no próprio texto o que corta");
  /* A prova de comportamento, que é a que importa: `enfeiticado` é a única
     cuja ÚNICA saída declarada é esse canal, e ela não sai por lugar nenhum
     que não seja o próprio prazo. Dar-lhe salvaguarda aqui teria apagado a
     decisão de T2 em silêncio — este é o dente que guarda aquilo. */
  const enf = condicaoPorId("enfeiticado");
  ok(String(enf.saiCom || "") === "restauracao", "enfeitiçado continua com `restauracao` como única saída declarada");
  ok(tentarSaidaNoFimDoTurno(quemCarrega(["enfeiticado"]), { d20: 20 }).mudou === false, "…e nem um d20 20 a tira: a salvaguarda de saída não a alcança");
  ok(limparPorDescanso([criarCondicao("enfeiticado")], "longo").removidas.length === 0, "…nem a noite inteira, como T2 travou");

  /* (b) `concentrado` ERA A CONDIÇÃO SEM SAÍDA NENHUMA, e T4 o RESOLVEU —
     não o perdoou. Foi o caso que a catraca de T4 ("toda condição tem ao
     menos uma saída") acendeu primeiro, exatamente como esta seção previu.

     DUAS DAS QUATRO ASSERÇÕES ABAIXO MUDARAM DE LADO, e o motivo vai escrito
     em cada uma. O QUE NÃO MUDOU é o que continua sendo verdade e continua
     importando: ele segue sem prazo (o relógio não o vence), segue sem
     salvaguarda (é `tipo: "bom"` e cai no teste 3 do critério de T3), e nada
     no `src/` o aplica. O conserto veio pela porta certa — o canal de
     descanso, no catálogo —, e não fingindo que o relógio ou a salvaguarda
     davam conta. */
  const con = condicaoPorId("concentrado");
  ok(con.turnos === null, "concentrado segue sem prazo: o relógio não o vence");
  /* MOVIDA POR T4: era `(con.saiCom || []).length === 0` — "sem canal de
     saída declarado". T3 guardou aquele zero de propósito, para que T4 não
     nascesse de carona; T4 chegou e o pagou. No 5e a concentração não
     sobrevive a um descanso: quem para para respirar larga o que estava
     segurando. Os DOIS canais, e não só o longo, porque uma hora de parada já
     é mais que o teto de uma concentração inteira. A lista é lida por inteiro
     (não `length >= 1`) porque perder o `"curto"` amanhã seria mudança de
     regra, e mudança de regra tem de acender. */
  ok((con.saiCom || []).join(",") === "curto,longo", `…e AGORA tem canal declarado: [${(con.saiCom || []).join(", ")}] — T4 pagou o zero que T3 guardou`);
  ok(salvaguardaDeSaida("concentrado").permite === false && salvaguardaDeSaida("concentrado").declarada === true,
    "…sem salvaguarda de saída, e com a posição declarada mesmo assim (a regra das boas o cobre)");
  /* MOVIDA POR T4 pelo mesmo motivo, e é a METADE DE COMPORTAMENTO do de
     cima: era `removidas.length === 0` — "a noite inteira não o pega, porque
     a regra implícita só vale para as ruins". Continua verdade que a regra
     implícita não o pega; o que mudou é que ele deixou de depender dela, por
     canal ESCRITO. As duas asserções andam juntas: declarar o canal sem que o
     descanso o tire seria promessa morta, que é a doença que T2 curou. */
  ok(limparPorDescanso([criarCondicao("concentrado")], "longo").removidas.length === 1, "…e a noite inteira AGORA o larga — por canal escrito, não pela regra implícita das ruins");
  ok(limparPorDescanso([criarCondicao("concentrado")], "curto").removidas.length === 1, "…e uma hora de parada também: no 5e a concentração não sobrevive a descanso nenhum");
  /* O DENTE, e ele é a sabotagem que guarda o conserto: devolvido o
     `saiCom: []` de antes, a condição volta a não ter saída nenhuma e a
     catraca de T4 acende nela. É a prova de que o conserto é o canal, e não
     alguma outra coisa que passou a cobri-lo por acaso. */
  {
    const antes = con.saiCom;
    con.saiCom = [];
    try {
      ok(limparPorDescanso([criarCondicao("concentrado")], "longo").removidas.length === 0
        && coberturaDasCondicoes().semSaida.join(",") === "concentrado",
        "sabotado de volta para `saiCom: []`, ele volta a ser a condição sem saída nenhuma — e a catraca o acusa");
    } finally { con.saiCom = antes; }
  }
  ok((con.saiCom || []).join(",") === "curto,longo" && coberturaDasCondicoes().semSaida.length === 0, "…e o catálogo volta inteiro depois da sabotagem");
  /* Mesma peneira por contexto, e a escada de sabotagem ensinou o mesmo
     aperto: a única aparição lícita do literal no `src/` inteiro é a
     PRÓPRIA entrada do catálogo (`concentrado: { id: "concentrado"`) — e ela
     é reconhecida pela forma inteira, porque `{ id: "concentrado" }` é
     exatamente como alguém APLICARIA a condição. Bastava aceitar "qualquer
     `id:` na frente" para o aplicador passar verde, que foi o que aconteceu.
     E o dia em que alguém a aplicar, ela vira permanente em quem a receber:
     `turnos: null`, `saiCom: []`, sem salvaguarda. */
  const aplicam = [];
  for (const f of arquivos) {
    const texto = semBlocos(readFileSync("../src/" + f, "utf8"));
    for (const m of texto.matchAll(/["']concentrado["']/g)) {
      if (!/\bconcentrado:\s*\{\s*id:\s*$/.test(texto.slice(Math.max(0, m.index - 120), m.index))) aplicam.push(`${f}:${texto.slice(0, m.index).split("\n").length}`);
    }
  }
  ok(aplicam.length === 0, `e nada no src o APLICA, que é o que o mantém latente: ${aplicam.join(", ") || "nenhum sítio"}`);
}

/* ============================================================
   T4 · AS PORTAS DE SAÍDA DECLARADAS (v9.241) — E A CATRACA QUE FECHA A FASE

   A lei é da pessoa: *"cura normal apenas recupera PV mas não remove a
   condição; daí vêm magias, habilidades de classe, itens e os testes de
   resistência."* T2 provou a primeira metade (45 portas de cura, nenhuma
   escreve em `condicoes`); T3 deu a segunda chance a sete condições; T4 abre
   as portas declaradas e fecha a fase com a catraca que a pauta exige:
   TODA CONDIÇÃO TEM AO MENOS UMA SAÍDA — prazo, salvaguarda ou porta.

   ESTAS SEÇÕES SÃO NOVAS. As três asserções que MUDARAM estão lá em cima, na
   seção [T3→T4], cada uma com o motivo escrito ao lado — nenhuma foi apagada
   e nenhuma outra foi tocada para abrir espaço aqui.
   ============================================================ */

const T4 = PORTAS_DE_SAIDA;

/* O PISO DO ALCANCE, no molde de `check-cura-nao-limpa.mjs` (que o escreveu
   com piso de 35 portas / 8 arquivos) e de `MEDIDA_T3` logo acima. Uma
   catraca que percorre um catálogo passa VERDE E VAZIA no dia em que a
   leitura do catálogo quebrar — e "nenhuma condição sem saída" é a asserção
   mais fácil do mundo de satisfazer com uma lista vazia. Os números são
   `>=`, nunca `===`: acervo novo amanhã tem de entrar na varredura, não
   derrubá-la. O único `<=` é o teto do que pode ficar sem saída, que é ZERO
   e é a lei da etapa. */
const MEDIDA_T4 = {
  /* medido em 14/09: 21 condições — 13 ruins + 8 boas */
  pisoDoCatalogo: 21, pisoDeRuins: 13, pisoDeBoas: 8,
  /* as quatro colunas da conta, medidas na mesma data. Guardam o alcance de
     CADA leitura em separado: um `limparPorDescanso` que parasse de casar
     zeraria `descanso` e a catraca continuaria verde só com o prazo. */
  pisoDePrazo: 19, pisoDeDescanso: 13, pisoDeSalvaguarda: 7, pisoDePorta: 13,
  pisoComMaisDeUma: 13,
  /* e o alcance de cada família que ABRE hoje */
  pisoDeMagia: 6, pisoDeItem: 10,
  /* A LEI DA ETAPA, cravada: nenhuma condição sem saída nenhuma. */
  tetoSemSaida: 0,
};

/* AS EXCEÇÕES DECLARADAS, no molde de `CONCENTRACAO_DA_MAGIA.excecoes` e do
   `NAO_E_CURA` de `check-cura-nao-limpa.mjs`: uma lista de perdão SEM MOTIVO
   ESCRITO vira o lugar onde os bugs vão morar — bastaria acrescentar um id
   para calar a catraca, e aí ela não protege mais nada.

   HOJE ESTÁ VAZIA, E É O ESTADO CERTO: `concentrado` era a única candidata e
   T4 o RESOLVEU em vez de o perdoar (canal de descanso, no catálogo). Se um
   dia alguma condição precisar de fato ficar sem saída, ela entra aqui com o
   `porque` escrito — e as duas asserções logo abaixo cobram tanto o motivo
   quanto o dente inverso (perdão que sobra é dívida escondida). */
const SEM_SAIDA_PERDOADA = [];

/* A LISTA DO ITEM, LIDA DE QUEM A ESCREVEU. `porItem` entra por argumento em
   `coberturaDasCondicoes` porque `pocoes.js` importa `condicoes.js` — a suíte
   é quem pode fazer a ponte sem fechar ciclo. A colheita é RECURSIVA de
   propósito: a `limpa` da relíquia mora em `ativo.efeito.limpa` hoje, e uma
   relíquia nova que a ponha num `poderes[].efeito` continuaria sendo verdade
   do acervo — um caminho cravado aqui deixaria de a ver em silêncio. */
const colherLimpa = (no, achadas = []) => {
  if (!no || typeof no !== "object") return achadas;
  if (Array.isArray(no)) { for (const x of no) colherLimpa(x, achadas); return achadas; }
  for (const [k, v] of Object.entries(no)) {
    if (k === "limpa" && Array.isArray(v)) achadas.push(...v);
    else colherLimpa(v, achadas);
  }
  return achadas;
};
const DO_CONSUMIVEL = [...new Set(CONSUMIVEIS.filter((c) => c.tipo === "limpa").flatMap((c) => c.remove || []))];
const DA_RELIQUIA = [...new Set(colherLimpa(RELIQUIAS))];
const REMOVIDAS_POR_ITEM = [...new Set([...DO_CONSUMIVEL, ...DA_RELIQUIA])].filter((id) => condicaoPorId(id));

/* SABOTAR O CATÁLOGO E DEVOLVÊ-LO INTEIRO — inclusive na ORDEM, porque
   `listaCondicoes()` é lida por outras seções e por `CONDICOES_PROMPT`, e uma
   chave que volta para o fim do objeto é uma mudança silenciosa de ordem. */
const comCatalogo = (mexer, fn) => {
  const guardado = { ...CONDICOES };
  try { mexer(); return fn(); }
  finally {
    for (const k of Object.keys(CONDICOES)) delete CONDICOES[k];
    Object.assign(CONDICOES, guardado);
  }
};

console.log("\n[T4 · A CATRACA QUE FECHA A FASE] toda condição tem ao menos uma saída:");
{
  const cob = coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM });

  /* 1. O ALCANCE, ANTES DO DENTE. Sem estes pisos a catraca passaria verde
     medindo lista vazia — que é exatamente como uma catraca morre. */
  ok(cob.total >= MEDIDA_T4.pisoDoCatalogo, `a conta percorre o catálogo inteiro: ${cob.total} condições (piso ${MEDIDA_T4.pisoDoCatalogo})`);
  ok(cob.total === listaCondicoes().length, "…e é o MESMO catálogo que o resto da suíte lê, não uma cópia");
  ok(cob.ruins >= MEDIDA_T4.pisoDeRuins && cob.boas >= MEDIDA_T4.pisoDeBoas, `os dois lados de pé: ${cob.ruins} ruins, ${cob.boas} boas`);
  ok(cob.ruins + cob.boas === cob.total, "…e toda condição é de um dos dois tipos: não há terceira gaveta");
  ok(cob.prazo >= MEDIDA_T4.pisoDePrazo, `${cob.prazo} saem pelo prazo (piso ${MEDIDA_T4.pisoDePrazo})`);
  ok(cob.descanso >= MEDIDA_T4.pisoDeDescanso, `${cob.descanso} saem por descanso (piso ${MEDIDA_T4.pisoDeDescanso})`);
  ok(cob.salvaguarda >= MEDIDA_T4.pisoDeSalvaguarda, `${cob.salvaguarda} saem por salvaguarda (piso ${MEDIDA_T4.pisoDeSalvaguarda})`);
  ok(cob.porta >= MEDIDA_T4.pisoDePorta, `${cob.porta} saem por porta declarada (piso ${MEDIDA_T4.pisoDePorta})`);
  ok(cob.comMaisDeUma >= MEDIDA_T4.pisoComMaisDeUma, `${cob.comMaisDeUma} têm mais de uma saída (piso ${MEDIDA_T4.pisoComMaisDeUma})`);
  /* A salvaguarda tem de bater com a OUTRA porta que a responde: se as duas
     leituras discordarem, uma delas está medindo coisa nenhuma. */
  const permitem = listaCondicoes().filter((c) => salvaguardaDeSaida(c.id).permite).length;
  ok(cob.salvaguarda === permitem, `e a coluna da salvaguarda bate com \`salvaguardaDeSaida\`: ${cob.salvaguarda} = ${permitem}`);

  /* 2. O DENTE — A LEI DA ETAPA. */
  const semSaida = cob.semSaida.filter((id) => !SEM_SAIDA_PERDOADA.some((p) => p.id === id));
  ok(semSaida.length <= MEDIDA_T4.tetoSemSaida,
    `NENHUMA condição sem saída nenhuma (teto ${MEDIDA_T4.tetoSemSaida}): ${semSaida.join(", ") || "todas têm por onde sair"}`);
  /* A lista de perdão cobra motivo POR LINHA — é a lei da casa aplicada à
     tabela, no molde de `CONCENTRACAO_DA_MAGIA`. */
  const semMotivo = SEM_SAIDA_PERDOADA.filter((p) => !p.id || !String(p.porque || "").trim()).map((p) => p.id || "?");
  ok(semMotivo.length === 0, `toda exceção declarada traz o PORQUÊ escrito: ${semMotivo.join(", ") || "nenhuma exceção hoje"}`);
  /* O DENTE INVERSO: perdão que parou de casar tem de sair, senão a lista
     cresce e vira decoração — a mesma catraca dos dois sentidos de
     `teste-ligacao` e de `check-cura-nao-limpa`. */
  const perdaoMorto = SEM_SAIDA_PERDOADA.filter((p) => !cob.semSaida.includes(p.id)).map((p) => p.id);
  ok(perdaoMorto.length === 0, `e nenhum perdão sobrando: ${perdaoMorto.join(", ") || "a lista está vazia, que é o estado certo"}`);

  /* 3. O DENTE DO DENTE — a catraca MORDE. Uma condição nova que nasça sem
     saída nenhuma tem de acender no dia em que nascer, e o molde é o que o
     `backend` mediu: `{ turnos: null, tipo: "bom", saiCom: [] }`. É boa de
     propósito, porque a RUIM sem canal cai na regra implícita do descanso
     longo e teria saída — a armadilha é exatamente a condição BOA eterna,
     que foi o que `concentrado` esperou trinta versões para alguém notar. */
  const orfa = comCatalogo(
    () => { CONDICOES.perpetua = { id: "perpetua", rotulo: "Perpétua", icone: "∞", tipo: "bom", turnos: null, saiCom: [], desc: "Nunca passa.", aliases: [] }; },
    () => coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM }),
  );
  ok(orfa.semSaida.join(",") === "perpetua", `nascida uma condição sem saída, a catraca acende nela e só nela (${orfa.semSaida.join(", ") || "nenhuma"})`);
  ok(orfa.total === cob.total + 1, "…e a conta a viu de verdade: o total subiu junto");
  ok(coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM }).semSaida.length === 0 && !CONDICOES.perpetua, "…e o catálogo volta inteiro depois da sabotagem");

  /* 4. O PISO DE ALCANCE MORDE. Esvaziado o catálogo, a catraca de cima
     continuaria verde (lista vazia não tem ninguém sem saída) — e é o piso
     que a salva. Sem esta prova, os `>=` de `MEDIDA_T4` seriam decoração. */
  const vazia = comCatalogo(
    () => { for (const k of Object.keys(CONDICOES)) delete CONDICOES[k]; },
    () => coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM }),
  );
  ok(vazia.semSaida.length === 0 && vazia.total === 0,
    "com o catálogo vazio a catraca passaria verde sem ter medido nada…");
  ok(!(vazia.total >= MEDIDA_T4.pisoDoCatalogo) && !(vazia.prazo >= MEDIDA_T4.pisoDePrazo) && !(vazia.porta >= MEDIDA_T4.pisoDePorta),
    "…e é o PISO DE ALCANCE que acende nesse caso, nas três colunas de uma vez");
  ok(listaCondicoes().length === cob.total, "…e o catálogo volta inteiro depois desta sabotagem também");
}

console.log("\n[T4 · as três famílias, três autoridades] e o canal manda só na magia:");
{
  ok(Array.isArray(T4.familias) && T4.familias.length === 3, `a tabela declara as três famílias: ${T4.familias.map((f) => f.id).join(", ")}`);
  const mancas = T4.familias.filter((f) => !String(f.autoridade || "").trim() || !String(f.porque || "").trim()).map((f) => f.id);
  ok(mancas.length === 0, `e cada uma diz QUEM manda nela e POR QUÊ: ${mancas.join(", ") || "todas"}`);
  ok(Array.isArray(T4.criterio) && T4.criterio.length === 3 && T4.criterio.every((s) => String(s).trim()), `o critério da magia é legível pela suíte: ${T4.criterio.length} testes escritos`);
  ok(/restauracao/.test(String(T4.criterio[0])) && T4.canal === "restauracao", "o teste 1 nomeia o canal, e o canal está declarado na tabela");
  const semPorque = T4.portas.filter((p) => !String(p.porque || "").trim()).map((p) => p.nome);
  ok(semPorque.length === 0, `e toda porta traz o porquê por linha: ${semPorque.join(", ") || "todas"}`);

  /* A DECISÃO MEDIDA, E É A QUE UM DESCUIDO FUTURO DESFAZ PRIMEIRO: o canal é
     a autoridade da MAGIA e SÓ DELA. Poção e relíquia removem ids que o canal
     não declara, e filtrar as portas existentes pelo canal apagaria essas
     remoções EM SILÊNCIO — regressão que nenhuma prova de hoje pegaria, porque
     o item continuaria "funcionando", só que tirando menos. */
  const declaramCanal = listaCondicoes().filter((c) => (c.saiCom || []).includes("restauracao")).map((c) => c.id);
  ok(REMOVIDAS_POR_ITEM.length >= MEDIDA_T4.pisoDeItem, `o item alcança ${REMOVIDAS_POR_ITEM.length} condições, lidas de \`pocoes.js\` e \`relicas.js\` (piso ${MEDIDA_T4.pisoDeItem})`);
  ok(DO_CONSUMIVEL.length > 0 && DA_RELIQUIA.length > 0, `e as duas fontes foram lidas de verdade: ${DO_CONSUMIVEL.length} do consumível, ${DA_RELIQUIA.length} da relíquia`);
  const foraDoCanal = REMOVIDAS_POR_ITEM.filter((id) => !declaramCanal.includes(id)).sort();
  ok(foraDoCanal.length === 6, `${foraDoCanal.length} das que o item remove NÃO declaram o canal: ${foraDoCanal.join(", ")}`);
  ok(foraDoCanal.join(",") === "agarrado,amedrontado,atordoado,caido,lento,queimando",
    "…e são exatamente as seis que o `backend` mediu — a lista está escrita para que uma sétima, ou uma a menos, acenda");

  /* A SABOTAGEM: a poção passando a ser filtrada pelo canal. A conta tem de
     PERDER as seis — e o número real tem de continuar sendo o de cima. */
  const filtrada = coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM.filter((id) => declaramCanal.includes(id)) });
  const real = coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM });
  ok(filtrada.porItem.length === REMOVIDAS_POR_ITEM.length - 6 && real.porItem.length === REMOVIDAS_POR_ITEM.length,
    `filtrado o item pelo canal, ele perde as seis (${real.porItem.length} → ${filtrada.porItem.length}) — e é por isso que T4 não o filtra`);
  ok(filtrada.porta < real.porta, `…e a cobertura por porta cairia de ${real.porta} para ${filtrada.porta}, em silêncio`);
  /* E O AVISO FICA ESCRITO NA TABELA, não só aqui: a família do item nomeia
     a regressão que evitou. Apagar essa frase é apagar o motivo. */
  const fItem = T4.familias.find((f) => f.id === "item");
  ok(/seis|6/.test(String(fItem.porque)) && foraDoCanal.every((id) => String(fItem.porque).includes(id)),
    "e a própria tabela nomeia as seis que se perderiam — o motivo não mora só na suíte");

  /* SEM O ITEM, A CATRACA CONTINUA DE PÉ. É a promessa escrita em
     `coberturaDasCondicoes`: nenhuma condição depende SÓ do item para ter
     saída. Quem chamar a conta sem passar `porItem` recebe menos cobertura,
     nunca um falso alarme. */
  const semItem = coberturaDasCondicoes();
  ok(semItem.semSaida.length === 0, `sem a lista do item, nenhuma condição fica órfã: ${semItem.semSaida.join(", ") || "nenhuma"}`);
  ok(semItem.porItem.length === 0 && semItem.porta < real.porta, `…e a conta é honesta sobre o que não viu (${semItem.porta} portas contra ${real.porta})`);
  for (const lixo of [null, undefined, { porItem: null }, { porItem: ["banana", "", null] }, {}]) {
    let r = null, estourou = false;
    try { r = coberturaDasCondicoes(lixo); } catch { estourou = true; }
    ok(!estourou && r && r.total === listaCondicoes().length, `lixo em \`opcoes\` (${JSON.stringify(lixo)}) não estoura a conta nem muda o catálogo`);
  }
}

console.log("\n[T4 · a porta, por nome] `portaDeSaida` acha, herda e achata:");
{
  const menor = portaDeSaida("Restauração Menor");
  const maior = portaDeSaida("Restauração Maior");
  ok(menor && menor.familia === "magia" && menor.resolve === true, `a Menor é porta de magia e RESOLVE: ${menor.remove.join(", ")}`);
  ok(menor.remove.join(",") === "envenenado,cego,paralisado", "…e tira o que o 5e manda: veneno, cegueira e paralisia");
  /* A HERANÇA É REGRA, NÃO CÓPIA: a Maior tem três ids escritos e devolve
     seis. Provado pela CONTINÊNCIA, não por uma lista copiada — se a Menor
     crescer amanhã, a Maior cresce junto e esta asserção segue verde. */
  ok(maior.remove.length === menor.remove.length + 3, `a Maior devolve ${maior.remove.length}: as ${menor.remove.length} da Menor mais as três dela`);
  ok(menor.remove.every((id) => maior.remove.includes(id)), "a Maior alcança TUDO que a Menor alcança — um 5º círculo que não fizesse o do 2º seria armadilha de ficha");
  ok(new Set(maior.remove).size === maior.remove.length, "…e sem repetir id nenhum: o `herdaDe` vem achatado e único");
  ok(maior.remove.every((id) => !!condicaoPorId(id)), "todo id que a porta promete existe no catálogo — nome morto acende aqui");
  /* A SABOTAGEM: a Maior deixando de herdar da Menor. É a regressão mais
     barata de cometer (apagar uma linha) e a mais cara de notar em mesa. */
  {
    const linha = T4.portas.find((p) => p.nome === "Restauração Maior");
    const antes = linha.herdaDe;
    delete linha.herdaDe;
    let sem = null;
    try { sem = portaDeSaida("Restauração Maior"); } finally { linha.herdaDe = antes; }
    ok(sem.remove.length === 3 && !sem.remove.includes("envenenado"),
      `tirado o \`herdaDe\`, a Maior encolhe para ${sem.remove.length} e perde o veneno — é a herança que a segura`);
    ok(portaDeSaida("Restauração Maior").remove.length === maior.remove.length, "…e a tabela volta inteira depois da sabotagem");
  }

  /* A PERGUNTA CHEGA DOS TRÊS JEITOS, e o nome é o LAÇO COM O ACERVO: um
     nome que morrer no grimório ou em `classes.js` tem de acender aqui. */
  const doGrimorio = MAGIAS.find((m) => m.nome === "Restauração Menor");
  ok(!!doGrimorio && doGrimorio.funcao === "curar_condicao", "a Menor existe MESMO no grimório, com `funcao: curar_condicao`");
  ok(portaDeSaida(doGrimorio) && portaDeSaida(doGrimorio).nome === menor.nome, "…e a consulta aceita o objeto da magia, não só o nome cru");
  const habsDoClerigo = (CLASSES.find((c) => c.nome === "Clérigo") || {}).habilidades || [];
  for (const nome of ["Purificar", "Palavra de Coragem"]) {
    const hab = habsDoClerigo.find((h) => h.nome === nome);
    ok(!!hab, `${nome} existe MESMO em classes.js (Clérigo nv${hab ? hab.nivel : "?"})`);
    ok(!!hab && portaDeSaida(hab) && portaDeSaida(hab).familia === "habilidade", `…e a consulta a aceita pelo objeto da ficha`);
  }
  ok(portaDeSaida("restauracao MENOR").nome === "Restauração Menor", "o acento e a caixa não separam a pergunta da resposta");
  for (const lixo of [null, undefined, "", "banana", {}, { nome: "" }, 0, [], "Restauração"]) {
    ok(portaDeSaida(lixo) === null, `e ${JSON.stringify(lixo) || String(lixo)} não é porta nenhuma → null`);
  }
  /* TODA PORTA DA TABELA TEM DE APONTAR PARA ACERVO VIVO — o dente inverso,
     no molde do `NAO_E_CURA` de `check-cura-nao-limpa`. */
  const nomesDoAcervo = new Set([...MAGIAS.map((m) => m.nome), ...CLASSES.flatMap((c) => (c.habilidades || []).map((h) => h.nome))]);
  const fantasmas = T4.portas.filter((p) => !nomesDoAcervo.has(p.nome)).map((p) => p.nome);
  ok(fantasmas.length === 0, `toda porta declarada aponta para magia ou habilidade que existe: ${fantasmas.join(", ") || "todas"}`);
  const herancasQuebradas = T4.portas.filter((p) => p.herdaDe && !T4.portas.some((q) => q.nome === p.herdaDe)).map((p) => p.nome);
  ok(herancasQuebradas.length === 0, `e todo \`herdaDe\` aponta para porta que existe: ${herancasQuebradas.join(", ") || "todos"}`);
}

console.log("\n[T4 · a promessa não conta como saída] Purificar e Palavra de Coragem aguardam:");
{
  /* O PONTO HONESTO DA CONTA. As duas estão DECLARADAS e não RESOLVEM: não
     existe resolvedor de habilidade de classe nesta casa. Contá-las seria a
     cobertura passando VERDE numa promessa — que é a doença exata que T2
     curou no catálogo (`saiCom: ["cura"]` sem leitor). */
  const naoResolvem = T4.portas.filter((p) => !p.resolve);
  ok(naoResolvem.length === 2 && naoResolvem.every((p) => p.familia === "habilidade"), `as duas que não resolvem são de habilidade: ${naoResolvem.map((p) => p.nome).join(", ")}`);
  const semAguarda = naoResolvem.filter((p) => !String(p.aguarda || "").trim()).map((p) => p.nome);
  ok(semAguarda.length === 0, `e cada uma diz O QUE espera, por escrito: ${semAguarda.join(", ") || "as duas"}`);
  const cob = coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM });
  ok(cob.aguardando.join(", ") === naoResolvem.map((p) => p.nome).join(", "), `a conta as devolve em \`aguardando\`, nunca em \`porta\`: ${cob.aguardando.join(", ")}`);
  ok(cob.porHabilidade.length > 0, `…e o alcance delas fica registrado como informação (${cob.porHabilidade.join(", ")})`);
  /* A SABOTAGEM: Purificar passando a contar como saída. A cobertura TEM de
     mudar — se não mudar, é porque a conta nunca separou promessa de porta. */
  {
    const linha = T4.portas.find((p) => p.nome === "Purificar");
    const antes = linha.resolve;
    linha.resolve = true;
    let com = null;
    try { com = coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM }); } finally { linha.resolve = antes; }
    ok(com.aguardando.length === cob.aguardando.length - 1 && !com.aguardando.includes("Purificar"),
      `posta a resolver, Purificar sai de \`aguardando\` (${cob.aguardando.length} → ${com.aguardando.length}) — a conta lê o campo de verdade`);
    ok(coberturaDasCondicoes({ porItem: REMOVIDAS_POR_ITEM }).aguardando.length === cob.aguardando.length, "…e a tabela volta inteira depois da sabotagem");
  }
  /* E A PORTA QUE NÃO RESOLVE NÃO TIRA NADA. Declarada não é ligada, e a
     função não finge que é — é a metade de comportamento da asserção acima. */
  const p = portaDeSaida("Purificar");
  ok(p.resolve === false && p.remove.length > 0, `Purificar declara alcance (${p.remove.join(", ")}) e ainda assim não resolve`);
  const r = removerPelaPorta({ condicoes: [criarCondicao("envenenado"), criarCondicao("cego")] }, p);
  ok(r.mudou === false && r.removidas.length === 0 && r.condicoes.length === 2,
    "…e chamada sobre quem carrega o que ela alcança, não tira uma única condição");
}

console.log("\n[T4 · a remoção] `removerPelaPorta` tira o que a porta alcança, e nada mais:");
{
  const portador = { nome: "Vera", vida: 9, condicoes: [criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("abencoado"), criarCondicao("cego")] };
  const copia = JSON.stringify(portador);
  const r = removerPelaPorta(portador, "Restauração Menor", { quem: "Vera" });
  ok(r.mudou === true && r.removidas.map((i) => i.id).sort().join(",") === "cego,envenenado", `a Menor tira o que alcança: ${r.removidas.map((i) => i.id).join(", ")}`);
  /* A ORDEM DA FICHA É PRESERVADA: quem fica, fica onde estava. O HUD lê essa
     lista na ordem, e reordenar por acidente é a condição pulando de lugar na
     tela sem nada ter acontecido. */
  ok(r.condicoes.map((i) => i.id).join(",") === "sangrando,abencoado", `…e quem fica, fica na ordem em que estava: ${r.condicoes.map((i) => i.id).join(", ")}`);
  ok(r.condicoes[0] === portador.condicoes[0], "…sendo os MESMOS objetos, não cópias — sem re-render de graça");
  /* LEI DA CASA: estado é substituído, nunca mutado. */
  ok(JSON.stringify(portador) === copia, "o portador recebido sai intocado — nem a ficha nem a lista dele são mexidas");
  ok(r.condicoes !== portador.condicoes, "e a lista devolvida é OUTRA, não a mesma com menos itens");
  /* A HERANÇA VISTA EM MESA, e não só na lista: numa ficha que carrega o que
     só o 5º círculo alcança, a Menor tira duas e a Maior tira essas duas MAIS
     a sua — é o superconjunto acontecendo num corpo, não numa asserção de
     tabela. */
  const dosDois = { condicoes: [criarCondicao("envenenado"), criarCondicao("exausto"), criarCondicao("cego")] };
  const pelaMenor = removerPelaPorta(dosDois, "Restauração Menor");
  const pelaMaior = removerPelaPorta(dosDois, "Restauração Maior");
  ok(pelaMenor.removidas.length === 2 && pelaMaior.removidas.length === 3
    && pelaMenor.removidas.every((i) => pelaMaior.removidas.some((j) => j.id === i.id)),
    `na mesma ficha a Menor tira ${pelaMenor.removidas.length} e a Maior tira essas mesmas mais a exaustão (${pelaMaior.removidas.map((i) => i.id).join(", ")})`);
  /* QUEM A PORTA NÃO ALCANÇA NÃO SAI, e é metade da lei da fase: a porta é
     DECLARADA, não um apagador de condições. */
  ok(!r.removidas.some((i) => i.id === "sangrando"), "o sangramento NÃO sai pela Restauração: é ferimento, e o teste 2 do critério o corta");
  ok(!r.removidas.some((i) => i.id === "abencoado"), "…e a bênção também não: porta declarada não varre a ficha");

  /* O TETO É LIDO DA TABELA, não cravado na função. `quantasPorVez: null` é
     "todas as que alcança"; sabotado para 1, a mesma porta passa a tirar uma
     — que é o "escolha uma por conjuração" do 5e, no dia em que a casa mudar
     de ideia. Sem esta prova, `quantasPorVez` seria declaração morta. */
  ok(T4.quantasPorVez === null && String(T4.porqueTodas || "").trim(), "o teto declara `null` (todas) e traz o motivo escrito ao lado");
  {
    const antes = T4.quantasPorVez;
    T4.quantasPorVez = 1;
    let um = null;
    try { um = removerPelaPorta(portador, "Restauração Menor"); } finally { T4.quantasPorVez = antes; }
    ok(um.removidas.length === 1, `posto o teto em 1, a mesma porta tira uma só (${um.removidas.map((i) => i.id).join(", ")})`);
    ok(removerPelaPorta(portador, "Restauração Menor").removidas.length === 2, "…e a tabela volta inteira depois da sabotagem");
  }

  /* NADA A TIRAR É SILÊNCIO, NUNCA UMA LINHA MEIA-BOCA NA TELA. */
  const nada = removerPelaPorta({ condicoes: [criarCondicao("sangrando")] }, "Restauração Menor");
  ok(nada.mudou === false && nada.linha === "" && nada.condicoes.length === 1, "sobre quem não carrega nada que ela alcance, a porta não fala e não muda nada");
  for (const [rotulo, valor] of [["null", null], ["indefinido", undefined], ["vazio", {}], ["condicoes null", { condicoes: null }], ["número", 7]]) {
    let r2 = null, estourou = false;
    try { r2 = removerPelaPorta(valor, "Restauração Maior", null); } catch { estourou = true; }
    ok(!estourou && r2 && r2.mudou === false && r2.linha === "" && r2.condicoes.length === 0, `portador ${rotulo} não estoura a porta, e nada sai nem é dito`);
  }
  /* `opcoes` NULO é o caso que a lei da casa nomeia: `= {}` no destructuring
     NÃO cobre `null` explícito. A linha acima já passa `null` de propósito. */
  let semOpcoes = null, estourouOpcoes = false;
  try { semOpcoes = removerPelaPorta(portador, "Restauração Menor", null); } catch { estourouOpcoes = true; }
  ok(!estourouOpcoes && semOpcoes && semOpcoes.removidas.length === 2, "`opcoes` nulo não estoura: `= {}` não cobre `null`, e a função trata");
  for (const lixo of [null, undefined, "", "banana", {}, 0]) {
    const r3 = removerPelaPorta(portador, lixo);
    ok(r3.mudou === false && r3.condicoes.length === portador.condicoes.length, `porta ${JSON.stringify(lixo) || String(lixo)} não tira nada de ninguém`);
  }
  /* CONDIÇÃO QUE O CATÁLOGO NÃO CONHECE não sai e não some — o mesmo
     comportamento conservador do relógio e da salvaguarda. */
  const fantasma = { id: "amaldicoado", nome: "Amaldiçoado", turnos: 2 };
  const rF = removerPelaPorta({ condicoes: [fantasma, criarCondicao("envenenado")] }, "Restauração Menor");
  ok(rF.removidas.length === 1 && rF.condicoes.length === 1 && rF.condicoes[0] === fantasma, "condição que o catálogo não conhece não é tirada por porta nenhuma, e continua sendo o mesmo objeto");
}

console.log("\n[T4 · a frase] voz de mundo, e nenhuma condição tem duas:");
{
  const portador = { condicoes: [criarCondicao("envenenado"), criarCondicao("cego")] };
  const r = removerPelaPorta(portador, "Restauração Menor", { quem: "Vera" });
  ok(r.linha.startsWith("🧪 Vera: "), `o jogador lê de quem é o corpo, com o ícone da PRIMEIRA que saiu: "${r.linha}"`);
  /* A LEI DA CASA: o sistema não fala de si mesmo. Nem o nome da magia entra
     — quem conjurou sabe o que conjurou; o que se vê é o corpo mudando. */
  ok(!/salvaguard|CD|dificuldade|d20|rolagem|condi[çc]|restaura|porta|magia/i.test(r.linha), "…e sem uma sílaba do mecanismo: nem salvaguarda, nem CD, nem o nome da magia");
  const semNome = removerPelaPorta(portador, "Restauração Menor").linha;
  ok(/^🧪 [A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(semNome), `sem nome, a frase é a do herói e começa em maiúscula: "${semNome}"`);
  ok(r.linha.split(";").length === 2, "duas condições saíram, duas frases na mesma linha — uma por corpo que mudou");
  /* A FRASE NÃO NASCE SOZINHA. */
  ok(linhaDaPortaDeSaida(null, [criarCondicao("envenenado")]) === "", "sem porta, a frase é vazia");
  ok(linhaDaPortaDeSaida(portaDeSaida("Restauração Menor"), []) === "", "sem ninguém que tenha saído, a frase é vazia");
  ok(linhaDaPortaDeSaida(portaDeSaida("Restauração Menor"), [null, undefined, {}]) === "", "e lixo na lista de removidas não vira linha meia-boca");
  /* NENHUMA CONDIÇÃO TEM DUAS FRASES. `alivio` só guarda as que faltavam; as
     outras reusam a `sai` de T3, porque é a MESMA coisa que o jogador vê — e
     duas frases para o mesmo corpo é a segunda verdade envelhecendo primeiro. */
  const naSalvaguarda = SALVAGUARDA_DO_FIM_DO_TURNO.permitem.map((x) => x.id);
  const duplicadas = Object.keys(T4.alivio).filter((id) => naSalvaguarda.includes(id));
  ok(duplicadas.length === 0, `nenhuma condição tem duas frases de alívio: ${duplicadas.join(", ") || "nenhuma"}`);
  const alivioOrfao = Object.keys(T4.alivio).filter((id) => !condicaoPorId(id));
  ok(alivioOrfao.length === 0, `e toda frase de alívio aponta para condição viva: ${alivioOrfao.join(", ") || "todas"}`);
  /* E TODA CONDIÇÃO QUE UMA PORTA QUE RESOLVE ALCANÇA TEM FRASE — senão a
     porta se abre e o jogador não lê nada acontecendo com ele. */
  const alcancadasQueResolvem = [...new Set(T4.portas.filter((p) => p.resolve).flatMap((p) => portaDeSaida(p.nome).remove))];
  const mudas = alcancadasQueResolvem.filter((id) => !linhaDaPortaDeSaida(portaDeSaida("Restauração Maior"), [criarCondicao(id)]));
  ok(mudas.length === 0, `toda condição que a magia tira tem frase de mundo: ${mudas.join(", ") || "todas falam"}`);
}

console.log("\n[T4 · REGRESSÃO ZERO] o que o descanso limpa é IDÊNTICO ao de antes:");
{
  /* A PROVA POR ASSERÇÃO, NÃO POR AFIRMAÇÃO. Três condições ganharam
     `"restauracao"` em `saiCom` (`paralisado`, `enfraquecido`, `exausto`) e
     uma ganhou os dois canais de descanso (`concentrado`). As listas abaixo
     são as de ANTES de T4, escritas por extenso: uma mexida futura em
     `saiCom` que mude o que a noite ou a parada levam acende aqui, mesmo que
     toda outra prova da suíte continue verde.

     `concentrado` é a ÚNICA diferença, e é a etapa inteira: ele era a
     condição sem saída nenhuma. O efeito em mesa é ZERO e está medido na
     seção [T3→T4] acima — nada no `src/` o aplica. */
  const ANTES_CURTO = ["cego", "queimando", "sangrando"];
  const ANTES_LONGO = ["agarrado", "amedrontado", "atordoado", "caido", "cego", "enfraquecido", "envenenado", "exausto", "lento", "paralisado", "queimando", "sangrando"];
  const limpaNo = (canal) => listaCondicoes().filter((c) => limparPorDescanso([criarCondicao(c.id)], canal).removidas.length > 0).map((c) => c.id).sort();
  const curto = limpaNo("curto"), longo = limpaNo("longo");
  ok(curto.join(",") === [...ANTES_CURTO, "concentrado"].sort().join(","), `a parada de uma hora limpa as MESMAS de antes, mais concentrado: ${curto.join(", ")}`);
  ok(longo.join(",") === [...ANTES_LONGO, "concentrado"].sort().join(","), `e a noite inteira idem: ${longo.join(", ")}`);
  ok(ANTES_CURTO.every((id) => curto.includes(id)) && ANTES_LONGO.every((id) => longo.includes(id)), "nenhuma condição PAROU de sair por descanso — é a metade que mais custaria em mesa");
  ok(curto.every((id) => longo.includes(id)), "…e tudo que a parada limpa a noite também limpa: a noite nunca faz menos que a hora");
  ok(!longo.includes("enfeiticado"), "a noite continua NÃO quebrando encantamento — a decisão de T2, intacta");

  /* AS TRÊS QUE GANHARAM O CANAL continuam saindo pelo descanso EXATAMENTE
     como saíam. `paralisado` é o caso perigoso e tem prova própria logo
     abaixo; as outras duas já diziam `"longo"` e a segunda palavra entrou ao
     lado, não no lugar. */
  for (const id of ["paralisado", "enfraquecido", "exausto"]) {
    const c = condicaoPorId(id);
    ok((c.saiCom || []).includes("restauracao") && (c.saiCom || []).includes("longo"), `${id} declara o canal novo SEM largar o "longo": [${(c.saiCom || []).join(", ")}]`);
    ok(limparPorDescanso([criarCondicao(id)], "longo").removidas.length === 1, `…e a noite continua o levando, como sempre levou`);
  }

  /* A ARMADILHA EXATA QUE T2 MEDIU EM `enfeiticado`, agora em `paralisado`:
     `saiCom` NÃO-VAZIO DESLIGA A REGRA IMPLÍCITA do descanso longo. Ele não
     tinha canal nenhum e saía pela regra implícita; declarar só
     `["restauracao"]` o teria tirado da noite EM SILÊNCIO. O `"longo"` junto
     é obrigatório, e esta sabotagem é quem o guarda. */
  {
    const c = condicaoPorId("paralisado");
    const antes = c.saiCom;
    c.saiCom = ["restauracao"];
    let sem = null;
    try { sem = limparPorDescanso([criarCondicao("paralisado")], "longo"); } finally { c.saiCom = antes; }
    ok(sem.removidas.length === 0, "tirado o `longo` de paralisado, a noite deixa de o levar — a regra implícita não volta, porque `saiCom` não-vazio a desliga");
    ok(limparPorDescanso([criarCondicao("paralisado")], "longo").removidas.length === 1, "…e a tabela volta inteira depois da sabotagem");
  }
  /* E A PROVA DE QUE A REGRA IMPLÍCITA CONTINUA EXISTINDO para quem depende
     dela: as ruins sem canal nenhum saem na noite. Se alguém a apagar, estas
     cinco ficam presas para sempre e a catraca da fase acende. */
  const semCanal = listaCondicoes().filter((c) => c.tipo === "ruim" && !(c.saiCom || []).length).map((c) => c.id).sort();
  ok(semCanal.join(",") === "agarrado,amedrontado,atordoado,caido,lento", `as ${semCanal.length} ruins sem canal saem pela regra implícita: ${semCanal.join(", ")}`);
  ok(semCanal.every((id) => longo.includes(id)), "…e a noite leva todas elas");

  /* O ACERVO DO ITEM NÃO FOI TOCADO: as listas que `pocoes.js` e `relicas.js`
     escrevem continuam sendo a palavra final delas, e estão aqui por extenso
     para que uma mexida futura acenda — é o que T2 já guardou em
     `check-cura-nao-limpa.mjs`, seção 4, pelo lado do texto-fonte. */
  ok(DO_CONSUMIVEL.sort().join(",") === "amedrontado,atordoado,envenenado,exausto,sangrando", `o consumível \`tipo: "limpa"\` remove as mesmas cinco: ${DO_CONSUMIVEL.join(", ")}`);
  ok(DA_RELIQUIA.sort().join(",") === "agarrado,caido,enfraquecido,envenenado,exausto,lento,queimando,sangrando", `e a relíquia as mesmas oito: ${DA_RELIQUIA.join(", ")}`);
  ok(CONSUMIVEIS.filter((c) => c.tipo === "limpa").length === 4, `são quatro consumíveis de limpeza: ${CONSUMIVEIS.filter((c) => c.tipo === "limpa").map((c) => c.nome).join(", ")}`);
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

/* ============================================================
   T3 · LIGADO AO JOGO — os três sítios da segunda chance

   NO MOLDE DA SEÇÃO DE T1 LOGO ACIMA, e pela mesma lição de R4:
   definição *E* sítio. A metade de cima deste arquivo prova que a porta
   funciona; se ninguém a chamar, ela continua verde para sempre com o
   órgão desligado — que foi exatamente o estado de `testeConcentracao`
   entre a v9.0 e a Fase C.

   E COM A ARMADILHA QUE T1 REGISTROU NO CARO: um recorte de âncora mal
   feito vira "o App inteiro", e aí as provas de ausência acendem por
   encontrarem a palavra em qualquer outro lugar do arquivo — vermelho
   pelo motivo errado hoje é verde pelo motivo errado amanhã. Por isso
   cada sítio é recortado entre o `try {` mais próximo e a própria etiqueta
   do `calou`, e TODA asserção do bloco exige o `achou` correspondente.
   ============================================================ */
console.log("\n[T3 · ligado ao jogo] os três sítios da salvaguarda no App.jsx:");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const quantas = (rx) => (APP.match(rx) || []).length;

  ok(/import \{[^}]*tentarSaidaNoFimDoTurno[^}]*\} from "\.\/condicoes\.js"/.test(APP), "o App importa a porta do catálogo — a regra não foi recopiada para a tela");
  ok(quantas(/tentarSaidaNoFimDoTurno\(/g) === 3, `e a chama em exatamente três sítios: eu, o grupo e os inimigos (${quantas(/tentarSaidaNoFimDoTurno\(/g)})`);

  /* Um recorte por sítio, apertado: da abertura do `try` até a etiqueta do
     `calou`. `achou` é a condição de TODA asserção — presença e ausência. */
  const recortar = (ancora, etiqueta) => {
    const i = APP.indexOf(ancora);
    const iTry = i > 0 ? APP.lastIndexOf("try {", i) : -1;
    const iFim = APP.indexOf(etiqueta);
    const achou = i > 0 && iTry > 0 && iFim > i;
    return { i, iTry, iFim, achou, bloco: achou ? APP.slice(iTry, iFim) : "" };
  };
  const eu = recortar("tentarSaidaNoFimDoTurno(pers, {", 'calou("salvaguarda-do-fim-do-turno", e)');
  const grupo = recortar("tentarSaidaNoFimDoTurno(g, {", 'calou("salvaguarda-do-fim-do-turno-do-grupo", e)');
  const inimigo = recortar("tentarSaidaNoFimDoTurno({ ...e, condicoes: t.condicoes }", 'calou("salvaguarda-do-fim-do-turno-do-inimigo", err)');
  ok(eu.achou && grupo.achou && inimigo.achou, `os três sítios existem e recortam (eu ${eu.i}, grupo ${grupo.i}, inimigos ${inimigo.i})`);
  /* Recorte que engorda é recorte que mente: um bloco do tamanho do App
     passaria nas provas de presença e derrubaria as de ausência pelo motivo
     errado. Nenhum dos três passa de dois mil caracteres. */
  ok(eu.bloco.length < 2000 && grupo.bloco.length < 2000 && inimigo.bloco.length < 2000,
    `e nenhum recorte virou "o App inteiro" (${eu.bloco.length}, ${grupo.bloco.length}, ${inimigo.bloco.length} chars)`);

  /* A ORDEM É CONTRATO, e é a mesma dos três: SEMPRE DEPOIS do tique. Se
     algum dia um deles subir para antes do `tickCondicoes` do próprio
     portador, passar na salvaguarda apagaria o dano de um turno já vivido
     — a seção [T3 · a ordem é contrato] mede o efeito, esta mede o sítio. */
  const iTickEu = APP.indexOf("const t = tickCondicoes(pers.condicoes)");
  const iTickGrupo = APP.indexOf("const t = tickCondicoes(g.condicoes)");
  const iTickInimigo = APP.indexOf("const t = tickCondicoes(e.condicoes)");
  ok(iTickEu > 0 && iTickEu < eu.i, `a minha chance vem DEPOIS do meu relógio (tique ${iTickEu} → chance ${eu.i})`);
  ok(iTickGrupo > 0 && iTickGrupo < grupo.i, `a do companheiro depois do relógio do grupo (tique ${iTickGrupo} → chance ${grupo.i})`);
  ok(iTickInimigo > 0 && iTickInimigo < inimigo.i, `e a do inimigo depois do relógio dele (tique ${iTickInimigo} → chance ${inimigo.i})`);
  ok(eu.i < grupo.i && grupo.i < inimigo.i, "e os três seguem a ordem do turno: eu → grupo → inimigos");

  /* NUNCA PODE CUSTAR O TURNO. Os três sítios do relógio nunca estiveram em
     `try/catch`; os três pedaços novos estão. Um estouro aqui tem de deixar
     a cena seguir com a condição de pé — que é o comportamento de antes. */
  for (const [nome, s, etiqueta] of [["eu", eu, "salvaguarda-do-fim-do-turno"], ["grupo", grupo, "salvaguarda-do-fim-do-turno-do-grupo"], ["inimigos", inimigo, "salvaguarda-do-fim-do-turno-do-inimigo"]]) {
    ok(quantas(new RegExp(`calou\\("${etiqueta}",`, "g")) === 1, `o sítio de ${nome} cala em vez de custar o turno, uma vez só`);
    /* "Perto de um catch" não é "dentro de um try": a prova é que o try mais
       próximo ABRE antes da chamada e não se fecha no meio do caminho. */
    ok(s.achou && !/catch/.test(APP.slice(s.iTry, s.i)), `…e a chamada de ${nome} está DENTRO desse try, não ao lado dele`);
  }

  /* --------- O SÍTIO DO HERÓI: o único com ficha de atributo --------- */
  ok(eu.achou && /modDe: \(a\) => atributoEfetivo\(pers, a\)/.test(eu.bloco), "só eu passo `modDe`, e quem soma é `atributoEfetivo` — a conta não foi recopiada para o App");
  ok(eu.achou && /pers = \{ \.\.\.pers, condicoes: saida\.condicoes \}/.test(eu.bloco), "a lista sem a condição é ESCRITA de volta na ficha — a porta não roda em cópia");
  ok(eu.achou && /msgs\.push\(\.\.\.saida\.linhas\)/.test(eu.bloco), "e a frase que nasceu no módulo é empurrada para a tela, palavra por palavra");
  ok(eu.achou && /if \(saida\.mudou\)/.test(eu.bloco), "só mexe na ficha quando alguma coisa saiu — sem re-render de graça");
  /* NÃO FILTRA POR VIDA, ao contrário do irmão dos inimigos: quem cai aqui
     fica em cena (`morrendo`) e o tempo passa para ele também. */
  ok(eu.achou && !/vida/.test(eu.bloco), "e NÃO filtra por vida: o corpo caído em cena ainda pode expulsar o veneno");

  /* --------- O SÍTIO DO GRUPO: passagem à parte, e de propósito --------- */
  ok(grupo.achou && /\(pers\.grupo \|\| \[\]\)\.map\(/.test(grupo.bloco), "a chance do companheiro corre sobre `pers.grupo`, a lista deles");
  ok(grupo.achou && /quem: g\.nome/.test(grupo.bloco), "…com o nome dele na frase, que é o que o jogador lê");
  ok(grupo.achou && /return \{ \.\.\.g, condicoes: saida\.condicoes \}/.test(grupo.bloco), "…e a lista nova volta para a ficha do companheiro");
  ok(grupo.achou && !/modDe/.test(grupo.bloco), "SEM `modDe`: o companheiro não traz `atributos`, e derivar um número de nível seria regra invisível");
  /* A PASSAGEM É SEPARADA DO `map` DE T1, E ISSO É ASSERÇÃO, NÃO ESTILO.
     Embutida lá dentro, ela teria de renomear a linha que escreve o prazo de
     volta — a linha exata que a seção [T1 · ligado ao jogo] guarda — e um
     estouro seu levaria junto o tique que já tinha rodado. */
  ok(grupo.achou && !/tickCondicoes/.test(grupo.bloco), "e a passagem é SEPARADA do `map` do relógio: um estouro aqui não leva junto o prazo que já correu");
  ok(grupo.achou && grupo.iTry > APP.indexOf('calou("prazo-da-condicao-do-grupo", e)'), "…e vem logo depois dele, não dentro dele");

  /* --------- O SÍTIO DOS INIMIGOS: o único que filtra por vida --------- */
  /* O FILTRO FICA FORA DO `try` — por isso não está no recorte, e a prova é
     de vizinhança: a guarda tem de ABRIR imediatamente antes do `try`, sem
     nada entre os dois. Um `if` distante seria outra condição, não esta. */
  const iVida = APP.lastIndexOf("if (vida > 0) {", inimigo.iTry);
  ok(inimigo.achou && iVida > 0 && inimigo.iTry - iVida < 40 && !/[;}]/.test(APP.slice(iVida + 15, inimigo.iTry)),
    "o inimigo só rola SE ESTIVER DE PÉ — corpo que o dano da condição acabou de derrubar não se sacode de veneno");
  ok(inimigo.achou && /quem: e\.nome/.test(inimigo.bloco), "…com o nome dele na frase");
  ok(inimigo.achou && /condicoes: t\.condicoes/.test(inimigo.bloco), "…e recebe a lista JÁ tiquetaqueada, não a antiga");
  ok(inimigo.achou && !/modDe/.test(inimigo.bloco), "e sem `modDe`: o bestiário não traz atributos e o inimigo não declara classe — zero puro");

  /* O QUE NENHUM DOS TRÊS FAZ: escrever regra. Nem CD, nem atributo, nem
     frase. Se um número de dificuldade aparecer no App, existem duas
     verdades sobre a mesma regra — a doença que esta casa mais produziu. */
  for (const [nome, s] of [["eu", eu], ["grupo", grupo], ["inimigos", inimigo]]) {
    ok(s.achou && !/\bcd\b|dificuldade|salvaguardaDeSaida|linhaDaSaidaDeCondicao|rolarSalvaguarda/i.test(s.bloco),
      `o sítio de ${nome} não escreve uma sílaba de regra: sem CD, sem atributo, sem montar frase`);
  }
}

/* ============================================================
   T4 · LIGADO AO JOGO — a porta declarada no despachante das magias

   NO MOLDE DAS DUAS SEÇÕES ACIMA, e pela mesma lição de R4: definição *E*
   sítio. A metade de cima deste arquivo prova que a porta abre; se ninguém
   a chamar, ela fica verde para sempre com o órgão desligado — que foi
   exatamente o estado de `curar_condicao` desde que o grimório existe:
   `resolvidaPeloSistema` dizia sim, `magiaDeFuncaoNaAcao` entregava a magia
   ao despachante, e lá não havia ramo nenhum. Promessa morta.

   E COM A ARMADILHA QUE T1 REGISTROU NO CARO: recorte de âncora mal feito
   vira "o App inteiro", e as provas de AUSÊNCIA passam a acender por
   encontrarem a palavra em qualquer outro lugar do arquivo. Por isso o
   recorte vai do próprio `if` até a etiqueta do `calou`, tem teto de
   tamanho, e TODA asserção exige o `achou`.
   ============================================================ */
console.log("\n[T4 · ligado ao jogo] a porta declarada no App.jsx:");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const quantas = (rx) => (APP.match(rx) || []).length;

  ok(/import \{[^}]*portaDeSaida[^}]*\} from "\.\/condicoes\.js"/.test(APP) && /import \{[^}]*removerPelaPorta[^}]*\} from "\.\/condicoes\.js"/.test(APP),
    "o App importa as duas portas do catálogo — a regra não foi recopiada para a tela");
  const i = APP.indexOf('if (m.funcao === "curar_condicao") {');
  const iFim = APP.indexOf('calou("porta-de-saida-da-magia", e)');
  const achou = i > 0 && iFim > i;
  const bloco = achou ? APP.slice(i, iFim) : "";
  ok(achou, `o ramo de \`curar_condicao\` existe no despachante (${i})`);
  ok(quantas(/if \(m\.funcao === "curar_condicao"\) \{/g) === 1, "e é um ramo só — não há duas verdades sobre a mesma função de magia");
  ok(bloco.length > 0 && bloco.length < 2500, `e o recorte não virou "o App inteiro" (${bloco.length} chars)`);

  /* NUNCA PODE CUSTAR O TURNO: fiação nova em `try/catch`, e o `try` tem de
     ABRIR antes da chamada sem se fechar no meio do caminho. */
  ok(quantas(/calou\("porta-de-saida-da-magia",\s*e\)/g) === 1, "a fiação nova cala em vez de custar o turno (`calou`), uma vez só");
  const iTry = achou ? APP.lastIndexOf("try {", i + 60) : -1;
  ok(achou && iTry > i && !/catch/.test(APP.slice(iTry, APP.indexOf("portaDeSaida(m.nome)", i))), "…e a chamada está DENTRO desse try, não ao lado dele");

  /* O NOME DA MAGIA É A CHAVE, e é o que faz uma condição nova ser alcançada
     amanhã sem este arquivo mudar uma linha: o App pergunta pelo nome e
     recebe a lista já resolvida (com a herança da Maior somada). */
  ok(achou && /const porta = portaDeSaida\(m\.nome\);/.test(bloco), "o App pergunta pelo NOME da magia — não escolhe a lista, e não sabe que a herança existe");
  ok(achou && /removerPelaPorta\(quem, porta, \{ quem: nome \}\)/.test(bloco), "…e a remoção é a do módulo, com o nome de quem recebe o toque");
  /* A LISTA NOVA VOLTA PARA A FICHA, nos dois lados da mesa. Porta que roda
     em cópia é porta que não abriu: o save guardaria a condição de pé. */
  ok(achou && /grupo: \(p0\.grupo \|\| \[\]\)\.map\(\(g\) => \(g === escolhido\.alvo \? \{ \.\.\.g, condicoes: r\.condicoes \} : g\)\)/.test(bloco), "a lista sem a condição é escrita de volta na ficha do companheiro…");
  ok(achou && /\{ \.\.\.p0, condicoes: r\.condicoes \}/.test(bloco), "…e na minha, quando o toque é em mim");
  /* A FRASE ENTRA INTEIRA, sem sufixo: ela nasceu no módulo, em voz de mundo. */
  ok(achou && /texto: r\.linha \}/.test(bloco), "e a frase que nasceu no módulo é empurrada para a tela, palavra por palavra");

  /* O VEREDITO ANTES DO CLIQUE, na versão desta casa: NÃO COBRA O QUE NÃO
     ENTREGA. Sem nada ao alcance, os PM ficam e o turno não vai ao Mestre —
     o espelho do `gastou: false` do antídoto. A prova é de ORDEM: a recusa
     tem de vir ANTES do `cobrar`, senão o preço sai mesmo assim. */
  const iRecusa = bloco.indexOf("if (!r.mudou)");
  const iCobrar = bloco.indexOf("cobrar(");
  ok(achou && iRecusa > 0 && iCobrar > iRecusa, `a recusa vem ANTES da cobrança (recusa ${iRecusa} → cobra ${iCobrar}) — gastar para nada é desperdício, não decisão`);
  ok(achou && /os \$\{m\.custo\} PM ficam com você/.test(bloco), "…e o jogador lê que o preço ficou com ele");

  /* O QUE O SÍTIO NÃO FAZ: escrever regra. Nem id de condição, nem lista de
     alcance, nem frase montada à mão. Se um id do catálogo aparecer aqui,
     existem duas verdades sobre a mesma porta — a doença que esta casa mais
     produziu, e a razão de `remove` morar em `condicoes.js`. */
  const idsNoApp = listaCondicoes().map((c) => c.id).filter((id) => new RegExp(`["']${id}["']`).test(bloco));
  ok(achou && idsNoApp.length === 0, `o sítio não nomeia uma única condição: ${idsNoApp.join(", ") || "nenhuma"}`);
  ok(achou && !/\bremove\b|saiCom|restauracao|quantasPorVez|PORTAS_DE_SAIDA/.test(bloco), "…nem copia o alcance, o canal ou o teto: tudo isso mora na tabela");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
