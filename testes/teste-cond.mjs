import {
  normalizarCondicao, criarCondicao, mecanicaDe, estadoDeRolagem, tickCondicoes,
  limparPorDescanso, resumoCondicoesPrompt, listaCondicoes, condicaoPorId, CANAIS_DE_SAIDA,
  SALVAGUARDA_DO_FIM_DO_TURNO, salvaguardaDeSaida, linhaDaSaidaDeCondicao,
  tentarSaidaNoFimDoTurno,
} from "../src/condicoes.js";
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

console.log("\n[T3 · o que a etapa NÃO fez, guardado como zero]:");
{
  /* GUARDAR O ZERO É O QUE IMPEDE T4 DE NASCER DE CARONA. As duas coisas
     abaixo estão MEDIDAS como ausentes hoje, de propósito, e o dia em que
     T4 acontecer estas asserções ficam vermelhas — que é o sinal certo:
     elas são a prova de que a porta de T4 ainda não foi aberta, e a etapa
     que a abrir tem de vir aqui trocar o zero por uma prova de leitura. */

  /* (a) O CANAL `restauracao` NASCE SEM LEITOR (T2 o criou assim; T4 o liga).
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
  ok(leitores.length === 0, `o canal "restauracao" segue sem leitor — é T4 quem o liga: ${leitores.join(", ") || "ninguém o lê"}`);
  ok(CANAIS_DE_SAIDA.find((c) => c.id === "restauracao").porDescanso === false, "…e ele continua declarado como porta que NÃO é descanso");
  /* A prova de comportamento, que é a que importa: `enfeiticado` é a única
     cuja ÚNICA saída declarada é esse canal, e ela não sai por lugar nenhum
     que não seja o próprio prazo. Dar-lhe salvaguarda aqui teria apagado a
     decisão de T2 em silêncio — este é o dente que guarda aquilo. */
  const enf = condicaoPorId("enfeiticado");
  ok(String(enf.saiCom || "") === "restauracao", "enfeitiçado continua com `restauracao` como única saída declarada");
  ok(tentarSaidaNoFimDoTurno(quemCarrega(["enfeiticado"]), { d20: 20 }).mudou === false, "…e nem um d20 20 a tira: a salvaguarda de saída não a alcança");
  ok(limparPorDescanso([criarCondicao("enfeiticado")], "longo").removidas.length === 0, "…nem a noite inteira, como T2 travou");

  /* (b) `concentrado` SEGUE SEM SAÍDA NENHUMA. É o caso que a catraca de T4
     ("toda condição tem ao menos uma saída") vai acender primeiro. T3 não o
     conserta e não finge que conserta: ele é `tipo: "bom"`, cai no teste 3
     do critério, e nada no `src/` o aplica — é armadilha latente, não bug
     vivo, e é por isso que ele pôde esperar. */
  const con = condicaoPorId("concentrado");
  ok(con.turnos === null, "concentrado segue sem prazo: o relógio não o vence");
  ok((con.saiCom || []).length === 0, "…sem canal de saída declarado");
  ok(salvaguardaDeSaida("concentrado").permite === false && salvaguardaDeSaida("concentrado").declarada === true,
    "…sem salvaguarda de saída, e com a posição declarada mesmo assim (a regra das boas o cobre)");
  ok(limparPorDescanso([criarCondicao("concentrado")], "longo").removidas.length === 0, "…e a noite inteira não o pega, porque a regra implícita só vale para as ruins");
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

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
