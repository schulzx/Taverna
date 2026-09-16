/* teste-marca.mjs (v9.276 · H4) — a marca, e as duas línguas do dano

   O QUE ESTA ETAPA DESCOBRIU, E É MAIOR QUE A HABILIDADE QUE A PEDIU.
   O catálogo de condições declara desde a v9.0 que `danoExtra` e
   `danoReduzido` falam do dano que quem carrega a condição CAUSA — e as
   descrições dizem-no por extenso: `fortalecido` é "+2 no dano causado",
   `enfraquecido` é "−2 no dano causado". A conta do golpe lia
   `modAtk.danoExtra` do lado certo e `modAlvo.danoReduzido` do lado
   errado, descontando do dano RECEBIDO um número que fala do dano
   causado; e `modAtk.danoReduzido` não era lido por ninguém.

   Um campo a responder duas perguntas opostas não é economia, é um
   defeito à espera de um caso — e o caso estava vivo e tem nome: a
   **Maldição do Patrono** aplica `enfraquecido` e, por aquela linha,
   deixava o inimigo amaldiçoado DOIS MAIS DURO por golpe. O avesso
   exacto da promessa dela.

   ESTA SUÍTE COBRA OS DOIS SENTIDOS, que é a lei da casa para bug com
   teste que prova: a seção 2 refaz a fórmula velha e mostra o que ela
   produzia, e depois mostra que a de hoje produz o contrário. Não basta
   provar que a conta de agora está certa — é preciso provar que a de
   antes estava errada, senão a asserção passaria verde nas duas.

   E A MARCA É O QUE SÓ SE PODE CONSTRUIR DEPOIS DISSO. Separadas as duas
   línguas, sobra um lado do alvo em que nada estava escrito: quanto ele
   RECEBE a mais. É lá que a condição `marcado` mora, e é por isso que
   ela não podia nascer antes do conserto — teria empilhado a segunda
   confusão em cima da primeira.

   O QUE ESTA SUÍTE **NÃO** PROVA, e fica dito para ninguém ler demais:
   a metade "dano extra SEU" (Marca do Caçador, Maldição do Patrono)
   continua por pagar. A seção 8 mede o que ela custaria e tranca a
   medição, para a próxima etapa não a refazer.

   DETERMINISMO: a única sorte desta suíte entra por semente escrita, pelo
   mesmo gerador da arena e da régua (`comSorteTravada`, reusado de
   `regua-combate.mjs` em vez de reescrito). Duas rodadas dão a mesma
   saída, em qualquer máquina.

   NENHUM NÚMERO DE REGRA APARECE AQUI COMO LITERAL: o `+2` da marca e o
   `−2` do enfraquecido saem do catálogo, e a suíte fica vermelha se
   alguém mexer na tabela sem mexer na prosa. Os literais que sobram são
   PV a atravessar um golpe, e esses são o que a suíte existe para fixar. */

import { readFileSync } from "node:fs";
import { resolverAtaque, modificadoresDeCondicao, turnoDosCompanheiros } from "../src/combate.js";
import {
  CONDICOES, listaCondicoes, condicaoPorId, criarCondicao, mecanicaDe,
  salvaguardaDeSaida, limparPorDescanso, SALVAGUARDA_DO_FIM_DO_TURNO,
} from "../src/condicoes.js";
import { aflicaoDe, rolarAflicao, PORTADORES } from "../src/aflicoes.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { AGUARDAM } from "../src/poder-de-classe.js";
import { comSorteTravada } from "./regua-combate.mjs";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const MARCA = CONDICOES.marcado;
const ENFRAQUECIDO = CONDICOES.enfraquecido;
const FORTALECIDO = CONDICOES.fortalecido;

/* O alvo mais nu que este motor aceita: defesa 1 para que o d20 nunca
   decida se acerta — o que se mede aqui é o DANO, não o acerto. Sem
   `atributos` e sem `equipados`, `defesaDe` devolve a base do corpo. */
const alvoNu = (condicoes = []) => ({ nome: "Boneco", defesa: 1, vida: 999, vidaMax: 999, condicoes, atributos: {} });

/* um golpe que sempre encontra o corpo: `bonusAtaque` alto de propósito,
   porque o que esta suíte mede é o DANO e não o acerto. O d20 continua a
   sair de `Math.random`, e é a semente que o fixa. */
const golpe = (danoBase, condAtacante, condAlvo, extra = {}) => resolverAtaque({
  atacante: "Quem bate", alvo: alvoNu(condAlvo), ehAtacanteInimigo: true,
  bonusAtaque: 50, danoBase, condAtacante, condAlvo, ...extra,
});

/* ---------------- O PAR, E POR QUE ELE É OBRIGATÓRIO AQUI ----------------
   `comSorteTravada` repõe o gerador no início de CADA bloco. Dois golpes
   seguidos dentro do mesmo bloco consomem dados diferentes, e a diferença
   entre eles mediria a sorte, não a regra — foi assim que a primeira
   versão desta suíte "provou" que a marca tirava 8 de dano.

   O par corre os dois lados com a MESMA semente: o d20 é o mesmo nos dois,
   e a única coisa que muda é a condição que se quer medir. Toda comparação
   desta suíte passa por aqui, e toda uma confere que os dois dados bateram
   antes de acreditar na diferença. */
const par = (semente, a, b) => [comSorteTravada(semente, a), comSorteTravada(semente, b)];
const mesmoDado = (x, y) => x.d20 === y.d20 && x.critico === y.critico;

/* O que um bônus de QUEM BATE vale neste golpe: dobra no crítico, porque
   entra em `danoBase` antes da multiplicação. A regra sai daqui e não de um
   número escrito à mão em cada asserção. */
const doLadoDeQuemBate = (r, n) => (r.critico ? n * 2 : n);

/* ============================================================
   1. AS DUAS LÍNGUAS, DECLARADAS NO CATÁLOGO
   ============================================================ */
sec("1. as duas línguas: o que se CAUSA e o que se RECEBE");
{
  t("a marca existe no catálogo e é condição RUIM", !!MARCA && MARCA.tipo === "ruim");
  t("…e é a única do catálogo com `danoRecebidoExtra`",
    listaCondicoes().filter((c) => c.danoRecebidoExtra).length === 1,
    listaCondicoes().filter((c) => c.danoRecebidoExtra).map((c) => c.id).join(", "));

  /* O ESPELHO QUE NÃO EXISTE, E A SUÍTE COBRA QUE CONTINUE A NÃO EXISTIR.
     "Apanhar menos" já tem dono nesta casa e tem DOIS — `amortecerDano`
     (a família `amortece`, F1) e `absorverDano` (o abrigo, P3) —, os dois
     na fila do dano, com régua e prazo próprios. Um `danoRecebidoReduzido`
     aqui seria a mesma regra em três cabeças com uma paga só. Se alguém o
     escrever, esta linha acende e manda ler o ponteiro do catálogo. */
  const bag = mecanicaDe([criarCondicao("marcado")]);
  t("a mecânica não tem espelho de redução do recebido — quem reduz é a fila do dano",
    !("danoRecebidoReduzido" in bag),
    "nasceu `danoRecebidoReduzido`: leia o ponteiro em condicoes.js antes de o manter");

  /* a prosa do catálogo tem de bater com o campo: uma descrição que diga
     "no dano causado" num campo que fala do recebido é o defeito de H4 a
     voltar pela porta do texto */
  t("quem tem `danoReduzido` diz 'dano causado' na própria descrição",
    listaCondicoes().filter((c) => c.danoReduzido).every((c) => /dano causado/i.test(c.desc || "")),
    listaCondicoes().filter((c) => c.danoReduzido && !/dano causado/i.test(c.desc || "")).map((c) => c.id).join(", "));
  t("…e quem tem `danoExtra` diz o mesmo",
    listaCondicoes().filter((c) => c.danoExtra).every((c) => /dano causad|no dano/i.test(c.desc || "")),
    listaCondicoes().filter((c) => c.danoExtra).map((c) => `${c.id}:${c.desc}`).join(" · "));
  t("…e a marca NÃO diz 'causado': ela fala do golpe que o alvo LEVA",
    !/causad/i.test(MARCA.desc) && /contra ele/i.test(MARCA.desc), MARCA.desc);

  /* o mensageiro entre o catálogo e a conta */
  const m = modificadoresDeCondicao([criarCondicao("marcado")]);
  t("`modificadoresDeCondicao` leva o campo novo até a conta do golpe",
    m.danoRecebidoExtra === MARCA.danoRecebidoExtra, JSON.stringify(m));
  t("…e não confunde o campo com nenhum dos dois de quem causa",
    m.danoExtra === 0 && m.danoReduzido === 0);
}

/* ============================================================
   2. O DEFEITO QUE MORREU — a Maldição do Patrono, nos dois sentidos
   ============================================================ */
sec("2. a inversão da Maldição do Patrono (o bug com teste que prova)");
{
  /* A FÓRMULA VELHA, refeita aqui à mão. Ela não vem de `src/` — vem do
     que `combate.js:127` fazia até a v9.275, e está escrita para que a
     asserção seja sobre um COMPORTAMENTO e não sobre um texto. Se alguém
     a repuser no motor, a seção inteira fica vermelha. */
  const antes = (danoBase, modAtk, modAlvo) => Math.max(0, Math.round(danoBase + modAtk.danoExtra - modAlvo.danoReduzido));
  const DANO = 10;

  /* quem a Maldição do Patrono aplica, e é o catálogo que o diz — não
     este arquivo: `aflicaoDe` lê a frase da habilidade e devolve o
     portador, e o portador nomeia a condição */
  const maldicao = (CLASSES.flatMap((c) => c.habilidades || [])).find((h) => h.nome === "Maldição do Patrono");
  t("a Maldição do Patrono existe no acervo, e é do Bruxo", !!maldicao);
  const portMaldicao = aflicaoDe(`${maldicao.nome} ${maldicao.descricao || ""}`);
  t("…e a porta que ela atravessa continua a ser a mesma (`drenagem` → enfraquecido)",
    !!portMaldicao && portMaldicao.cond === "enfraquecido", portMaldicao ? portMaldicao.id : "nenhuma");

  const cond = [criarCondicao("enfraquecido")];
  const modZero = modificadoresDeCondicao([]);
  const modEnf = modificadoresDeCondicao(cond);

  /* ---- O SENTIDO QUE ESTAVA ERRADO ---- */
  const velhoSemMaldicao = antes(DANO, modZero, modZero);
  const velhoComMaldicao = antes(DANO, modZero, modEnf);
  console.log(`  ··  a fórmula de até a v9.275, sobre um golpe de ${DANO}: sem a maldição ${velhoSemMaldicao}, com ela ${velhoComMaldicao}`);
  t("ANTES: amaldiçoar o inimigo deixava-o MAIS DURO — o avesso da promessa",
    velhoComMaldicao < velhoSemMaldicao
    && velhoSemMaldicao - velhoComMaldicao === ENFRAQUECIDO.danoReduzido,
    `${velhoSemMaldicao} → ${velhoComMaldicao}`);

  /* ---- O SENTIDO QUE PASSOU A VALER ---- */
  const [semMaldicao, comMaldicao] = par("marca|maldicao",
    () => golpe(DANO, [], []), () => golpe(DANO, [], cond));
  t("o par rolou o mesmo dado dos dois lados", mesmoDado(semMaldicao, comMaldicao),
    `${semMaldicao.d20} vs ${comMaldicao.d20}`);
  console.log(`  ··  a fórmula de hoje, no mesmo golpe: sem a maldição ${semMaldicao.dano}, com ela ${comMaldicao.dano}`);
  t("DEPOIS: a maldição no alvo não mexe UM ponto no dano que ele apanha",
    comMaldicao.dano === semMaldicao.dano, `${semMaldicao.dano} vs ${comMaldicao.dano}`);

  /* e o outro lado da mesma moeda: a promessa que `enfraquecido` escreve
     na própria descrição e que nunca saía de lugar nenhum.

     `vantagem: true` NOS DOIS LADOS, e é o que torna o par honesto:
     `enfraquecido` também dá DESVANTAGEM a quem o carrega, e desvantagem
     rola DOIS dados — o par consumiria sortes diferentes e a diferença
     mediria o dado em vez da regra. Com vantagem declarada dos dois
     lados, o enfraquecido cai na regra do 5e que o próprio motor aplica
     (vantagem e desvantagem se cancelam) e os dois golpes voltam a rolar
     um dado só. O que se isola aqui é o DANO; a desvantagem tem a sua
     própria prova, em `teste-cond`. */
  const [inteiro, fraco] = par("marca|enfraquece",
    () => golpe(DANO, [], [], { vantagem: true }), () => golpe(DANO, cond, [], { vantagem: true }));
  t("o par rolou o mesmo dado dos dois lados", mesmoDado(inteiro, fraco),
    `${inteiro.d20}/${inteiro.modo} vs ${fraco.d20}/${fraco.modo}`);
  t("…e o dado não foi um desastre, que zeraria os dois e não provaria nada",
    !inteiro.desastre && !fraco.desastre, `d20 ${inteiro.d20}`);
  console.log(`  ··  o amaldiçoado a bater: ${inteiro.dano} inteiro, ${fraco.dano} enfraquecido${inteiro.critico ? " (crítico)" : ""}`);
  t("…e o amaldiçoado passa a bater MAIS FRACO, que é o que a condição promete por escrito",
    inteiro.dano - fraco.dano === doLadoDeQuemBate(inteiro, ENFRAQUECIDO.danoReduzido),
    `${inteiro.dano} → ${fraco.dano}, e a tabela diz −${ENFRAQUECIDO.danoReduzido}`);

  /* A LINHA DA DÍVIDA ACOMPANHOU O CONSERTO. `AGUARDAM` é contabilidade
     pública desta casa: uma inversão paga que continuasse a ser descrita
     como inversão viva seria a casa a mentir para si mesma. */
  const linha = AGUARDAM.find((a) => a.nome === "Maldição do Patrono");
  t("a linha dela em AGUARDAM registou o conserto e trocou de dívida",
    !!linha && /invers/i.test(linha.motivo) && /H4/.test(linha.motivo));
  t("…e ela CONTINUA em AGUARDAM: a metade 'dano extra SEU' não foi paga",
    !!linha, "saiu da lista sem que a segunda metade existisse");
}

/* ============================================================
   3. A MARCA NA CONTA DO GOLPE
   ============================================================ */
sec("3. onde a marca entra na conta, e o que ela faz no crítico");
{
  const DANO = 10;
  const MARCADO = () => [criarCondicao("marcado")];
  const FORTE = () => [criarCondicao("fortalecido")];

  const [limpo, marcado] = par("marca|conta", () => golpe(DANO, [], []), () => golpe(DANO, [], MARCADO()));
  t("o par rolou o mesmo dado dos dois lados", mesmoDado(limpo, marcado));
  console.log(`  ··  golpe de ${DANO}: ${limpo.dano} no alvo limpo, ${marcado.dano} no marcado${limpo.critico ? " (crítico)" : ""}`);
  t("a marca soma no golpe que o alvo LEVA, e soma o que a tabela diz",
    marcado.dano - limpo.dano === MARCA.danoRecebidoExtra, `${limpo.dano} → ${marcado.dano}`);

  /* OS DOIS LADOS AO MESMO TEMPO — é aqui que as duas línguas se provam
     independentes: quem bate fortalecido contra quem está marcado soma os
     dois, cada um pelo seu campo e cada um pela sua regra de crítico. */
  const [base, dosDoisLados] = par("marca|conta", () => golpe(DANO, [], []), () => golpe(DANO, FORTE(), MARCADO()));
  t("…e soma-se ao bônus de quem bate sem se confundir com ele",
    dosDoisLados.dano - base.dano === MARCA.danoRecebidoExtra + doLadoDeQuemBate(base, FORTALECIDO.danoExtra),
    `${base.dano} → ${dosDoisLados.dano}${base.critico ? " (crítico)" : ""}`);

  /* O CRÍTICO, E A CONVENÇÃO QUE ELE GUARDA. O que é do atacante entra em
     `danoBase` e dobra com ele; o que é do alvo é plano. A asserção é
     sobre os dois números ao mesmo tempo de propósito: provar só que a
     marca não dobra deixaria passar um crítico que parasse de dobrar o
     bônus do atacante, que é regressão de B2.

     `criticoEm: 2` força o crítico em qualquer dado — é a única forma de
     olhar para este ramo sem esperar por um 20. */
  const critico = (condAlvo) => resolverAtaque({
    atacante: "Quem bate", alvo: alvoNu(condAlvo), ehAtacanteInimigo: true,
    bonusAtaque: 50, danoBase: DANO, condAtacante: FORTE(), condAlvo, criticoEm: 2,
  });
  const [critLimpo, critMarcado] = par("marca|critico", () => critico([]), () => critico(MARCADO()));
  console.log(`  ··  crítico de ${DANO} com +${FORTALECIDO.danoExtra} de quem bate: ${critLimpo.dano} no limpo, ${critMarcado.dano} no marcado`);
  t("o crítico dobra o bônus de QUEM BATE (a convenção de B2, intacta)",
    critLimpo.critico && critLimpo.dano === (DANO + FORTALECIDO.danoExtra) * 2, String(critLimpo.dano));
  t("…e a marca do ALVO é plana: soma uma vez, não duas",
    critMarcado.dano - critLimpo.dano === MARCA.danoRecebidoExtra,
    `${critLimpo.dano} → ${critMarcado.dano}`);

  /* O PISO CONTINUA EM ZERO: nenhuma condição sabe fazer um golpe devolver
     PV, nem quando quem bate está enfraquecido e o golpe é o menor que há. */
  const piso = comSorteTravada("marca|piso", () => golpe(1, [criarCondicao("enfraquecido")], []));
  t("o piso do dano continua em zero — condição nenhuma cura pelo golpe", piso.dano === 0, String(piso.dano));

  /* e o golpe que ERRA continua a não somar nada: a marca abre o alvo, não
     acerta por ele */
  const erra = comSorteTravada("marca|erra", () => resolverAtaque({
    atacante: "Quem bate", alvo: { nome: "Muro", defesa: 99, vida: 99, vidaMax: 99, condicoes: MARCADO(), atributos: {} },
    ehAtacanteInimigo: false, bonusAtaque: -50, danoBase: DANO, condAtacante: [], condAlvo: MARCADO(), criticoEm: 21,
  }));
  t("…e quem erra continua a não tirar nada de um alvo marcado", erra.dano === 0, `${erra.resultado}: ${erra.dano}`);
}

/* ============================================================
   4. A PORTA — e ela morde só o necessário
   ============================================================ */
sec("4. a porta da marca: frase inteira, nunca a palavra 'marca'");
{
  const port = PORTADORES.find((p) => p.id === "marca");
  t("o portador existe e cai no ALVO", !!port && port.alvo === "alvo");
  t("…e tenta sempre: a marca é o golpe inteiro, não o efeito colateral dele", port.chance === 1);
  t("…e leva à condição do catálogo, não a um id inventado", !!condicaoPorId(port.cond) && port.cond === "marcado");

  /* A VARREDURA — é ela que separa esta linha de um `/marca/` cru. O
     acervo inteiro passa por `aflicaoDe`, e só pode casar quem promete
     dano extra DE TODOS. A casa já pagou este preço duas vezes ("chama"
     a apanhar "Chamado da Chuva", "oração" a apanhar "Coração
     Tempestuoso"), e aqui o falso positivo seria pior: onze habilidades
     do acervo começam por "Marca um alvo" e prometem coisas diferentes
     umas das outras. */
  const frases = [];
  const colher = (v, prof = 0) => {
    if (!v || prof > 4) return;
    if (Array.isArray(v)) { for (const x of v) colher(x, prof + 1); return; }
    if (typeof v !== "object") return;
    if (typeof v.nome === "string") frases.push({ nome: v.nome, texto: `${v.nome} ${v.descricao || v.desc || ""}`.trim() });
    for (const k of Object.keys(v)) { if (k === "nome" || k === "descricao" || k === "desc") continue; colher(v[k], prof + 1); }
  };
  colher(CLASSES); colher(SUBCLASSES); colher(ESPECIALIZACOES); colher(MAGIAS);

  const casam = frases.filter((f) => { const p = aflicaoDe(f.texto); return p && p.id === "marca"; }).map((f) => f.nome);
  const comAPalavra = frases.filter((f) => /\bmarca\b/i.test(f.texto)).map((f) => f.nome);
  console.log(`  ··  ${frases.length} frases do acervo varridas · ${comAPalavra.length} contêm a palavra "marca" · ${casam.length} casam com o portador: ${casam.join(", ")}`);
  t("a amostra é grande de verdade (piso 400 frases) — uma varredura vazia passaria verde", frases.length >= 400, String(frases.length));
  t("…e há muito mais 'marca' no acervo do que marca de verdade (piso 6)",
    comAPalavra.length >= 6, `${comAPalavra.length}: ${comAPalavra.join(", ")}`);
  t("casam exatamente as duas que prometem dano extra DE TODOS",
    casam.length === 2 && casam.includes("Julgamento") && casam.includes("Marca Mortal"),
    casam.join(", ") || "nenhuma");

  /* A OUTRA METADE DA FAMÍLIA FICA DE FORA — e é a asserção que impede a
     próxima mão de "resolver" a segunda metade alargando este regex. */
  for (const nome of ["Marca do Caçador", "Maldição do Patrono"]) {
    const h = frases.find((f) => f.nome === nome);
    const p = h ? aflicaoDe(h.texto) : null;
    t(`"${nome}" NÃO casa com a marca: ela promete dano extra SEU, e isso pede dono`,
      !!h && (!p || p.id !== "marca"), p ? p.id : "sem frase no acervo");
  }
}

/* ============================================================
   5. A CADEIA INTEIRA — do acervo ao número do golpe
   ============================================================ */
sec("5. a cadeia inteira: Julgamento → condição → dano");
{
  const julgamento = CLASSES.flatMap((c) => c.habilidades || []).find((h) => h.nome === "Julgamento");
  t("o Julgamento é do acervo e continua a prometer o que prometia",
    !!julgamento && /dano extra de todos/i.test(julgamento.descricao || ""), julgamento ? julgamento.descricao : "");

  const port = aflicaoDe(`${julgamento.nome} ${julgamento.descricao || ""}`);
  t("…a frase dele atravessa a porta", !!port && port.id === "marca");

  const inimigo = { nome: "Ogro", nivel: 3, vida: 40, vidaMax: 40, condicoes: [], atributos: {} };
  const res = rolarAflicao({ fonte: port, nomeFonte: julgamento.nome, atacante: "Vera", alvo: inimigo, alvoNome: "Ogro", sempre: true, critico: true });
  t("…e a condição nasce no INIMIGO, com o nome da habilidade na origem",
    !!res && res.cond.id === "marcado" && res.cond.origem === julgamento.nome,
    res ? JSON.stringify(res.cond) : "nada");
  t("…com o prazo da tabela, nunca um número solto", res.cond.turnos === MARCA.turnos);

  /* DE TODOS É LITERAL, e é o que esta parte prova: a conta lê o campo do
     lado de QUEM APANHA, então quem bate não precisa de saber de nada. O
     herói, o companheiro e a invocação somam o mesmo +2 sem se conhecerem.
     Aqui o segundo atacante é o motor dos companheiros, que é outro
     caminho de código inteiro até `resolverAtaque`. */
  const comp = { nome: "Ilse", classe: "Guerreiro", nivel: 5, vida: 44, vidaMax: 44, condicoes: [], atributos: {} };
  const N = 400;
  const soma = (condAlvo) => {
    let total = 0, conectou = 0;
    for (let i = 0; i < N; i++) {
      const acoes = turnoDosCompanheiros({ grupo: [comp], inimigos: [{ ...inimigo, condicoes: condAlvo, defesa: 1, vida: 9999, vidaMax: 9999 }], rodada: 1 });
      for (const a of acoes) if (a.r && a.r.dano > 0) { total += a.r.dano; conectou++; }
    }
    return { total, conectou };
  };
  const [semMarca, comMarca] = par("marca|detodos", () => soma([]), () => soma([res.cond]));
  const ganho = comMarca.total - semMarca.total;
  console.log(`  ··  ${N} turnos de companheiro contra o mesmo Ogro: ${semMarca.total} de dano no limpo, ${comMarca.total} no marcado (+${ganho} em ${comMarca.conectou} golpes que conectaram)`);
  t("os dois lados do par conectaram os mesmos golpes", semMarca.conectou === comMarca.conectou && comMarca.conectou > N / 2,
    `${semMarca.conectou} vs ${comMarca.conectou}`);
  t("o companheiro soma a marca sem nunca ter ouvido falar dela", ganho > 0, `${semMarca.total} vs ${comMarca.total}`);
  t("…e soma-a UMA vez por golpe que conecta, nunca duas",
    ganho === comMarca.conectou * MARCA.danoRecebidoExtra,
    `${ganho} contra ${comMarca.conectou} × ${MARCA.danoRecebidoExtra}`);

  /* A DÍVIDA SAIU DA LISTA — e este é o único item da leva que sai. */
  t("o Julgamento saiu de AGUARDAM: a promessa dele corre inteira",
    !AGUARDAM.some((a) => a.nome === "Julgamento"),
    "continua declarado como dívida depois de a etapa a pagar");
}

/* ============================================================
   6. A MARCA TEM SAÍDA, COMO TODA CONDIÇÃO DESTA CASA
   ============================================================ */
sec("6. a saída da marca (a catraca de T4 aplicada a uma condição nova)");
{
  const porta = salvaguardaDeSaida("marcado");
  t("a posição dela na segunda chance está DECLARADA, não caída na regra geral", porta.declarada === true);
  t("…e é 'não permite', com o motivo escrito", porta.permite === false && porta.porque.trim().length > 20);
  t("…e o motivo cita o teste do critério que a corta", /teste 2/i.test(porta.porque), porta.porque.slice(0, 60));
  t("…e ela está na lista de quem não permite, não a escorregar pela regra das boas",
    SALVAGUARDA_DO_FIM_DO_TURNO.naoPermitem.some((x) => x.id === "marcado"));

  t("tem prazo: o relógio é a primeira saída", Number(MARCA.turnos) > 0);
  const curto = limparPorDescanso([criarCondicao("marcado")], "curto");
  const longo = limparPorDescanso([criarCondicao("marcado")], "longo");
  t("…e o descanso é a segunda, nos dois canais", curto.removidas.length === 1 && longo.removidas.length === 1);

  /* NORMALIZAÇÃO: o nome tem de voltar ao id, e não pode roubar o de
     ninguém. `caido` é o vizinho perigoso (a raiz dele tem quatro letras
     e o catálogo é varrido por ordem). */
  t("o rótulo, o id e o nome da ficção voltam todos a `marcado`",
    ["marcado", "Marcado", "marcada", "o alvo está marcado"].every((n) => {
      const c = criarCondicao(n); return c && c.id === "marcado";
    }));
  t("…e a marca não rouba o id de nenhuma condição que já existia",
    ["caido", "atordoado", "enfraquecido", "agarrado"].every((id) => criarCondicao(id).id === id));
}

/* ============================================================
   7. O EFEITO MEDIDO — e a causa do zero, trancada
   ============================================================ */
sec("7. o efeito medido nas duas réguas, e por que ele é zero nelas");
{
  /* A LEI DA CASA: medir e NÃO reequilibrar. As duas réguas desta casa
     saíram desta etapa idênticas número a número, e isso não é sorte —
     é estrutura, e é a estrutura que esta seção tranca. Se um dia uma
     delas passar a carregar condição de dano, estas linhas acendem e
     quem mexer sabe que a catraca do equilíbrio passou a ver a marca. */
  const COM_DANO_CAUSADO = listaCondicoes().filter((c) => c.danoExtra || c.danoReduzido).map((c) => c.id);
  const COM_DANO_RECEBIDO = listaCondicoes().filter((c) => c.danoRecebidoExtra).map((c) => c.id);
  console.log(`  ··  condições que mexem no dano: causam ${COM_DANO_CAUSADO.join(", ")} · recebem ${COM_DANO_RECEBIDO.join(", ")}`);

  /* A ARENA nunca carrega condição nenhuma: `prepararDuelista` zera a
     lista e nada na arena escreve nela. É por isso que a catraca do
     equilíbrio dos oito prontos saiu idêntica. */
  const ARENA = readFileSync(new URL("../src/arena.js", import.meta.url), "utf8");
  t("a arena zera as condições ao preparar o duelista e nada lá volta a escrevê-las",
    /f\.condicoes = \[\]/.test(ARENA) && !/condicoes:\s*\[\.\.\./.test(ARENA),
    "a arena passou a portar condição: a catraca do equilíbrio vê a marca agora");

  /* A RÉGUA DE UMA VIDA só aplica aflição de BUFF (`port.alvo !== "alvo"`),
     nunca debuff em ninguém — é o que a torna cega às duas famílias acima. */
  const REGUA = readFileSync(new URL("./regua-combate.mjs", import.meta.url), "utf8");
  t("a régua de Uma Vida só aplica aflição que NÃO cai no alvo — logo, nenhuma destas",
    /port\.alvo === "alvo"\) return \{ heroi, grupo \}/.test(REGUA),
    "a régua passou a aplicar debuff: o retrato dela deixa de ser comparável ao de antes de H4");

  /* E O QUE A ETAPA COMPRA, MEDIDO ONDE ELA MORDE DE VERDADE: uma amostra
     de golpes contra o mesmo alvo, com e sem a marca. Não é retrato de
     equilíbrio — é a prova de que o campo não nasceu inerte. */
  const N = 600, DANO = 12;
  const amostra = (condAlvo) => {
    let total = 0, conectou = 0;
    for (let i = 0; i < N; i++) { const r = golpe(DANO, [], condAlvo); total += r.dano; if (r.dano > 0) conectou++; }
    return { total, conectou };
  };
  const [semMarca, comMarca] = par("marca|amostra", () => amostra([]), () => amostra([criarCondicao("marcado")]));
  const ganho = comMarca.total - semMarca.total;
  const pct = (ganho / semMarca.total) * 100;
  console.log(`  ··  ${N} golpes de ${DANO} contra o mesmo alvo: ${semMarca.total} de dano sem a marca, ${comMarca.total} com ela — +${ganho} (${pct.toFixed(1)}%)`);
  t("a amostra conectou (piso 500 golpes): um alvo intocável mediria zero", comMarca.conectou >= 500, String(comMarca.conectou));
  t("…e a marca cobra em TODOS os golpes que conectam, não em alguns",
    ganho === comMarca.conectou * MARCA.danoRecebidoExtra,
    `${ganho} contra ${comMarca.conectou} × ${MARCA.danoRecebidoExtra}`);

  /* ---- O QUE AS RÉGUAS NÃO VEEM, E FICA MEDIDO AQUI ----
     Dizer "as duas réguas saíram idênticas" e parar seria meia verdade.
     Elas são cegas às duas famílias por construção (as duas linhas acima),
     e no JOGO `enfraquecido` chega a alguém por sete portas do acervo. Em
     mesa, o conserto de H4 é uma virada de sinal: quem estava enfraquecido
     APANHAVA 2 a menos por golpe recebido (a condição RUIM a ajudar) e
     batia com força inteira; agora apanha inteiro e bate 2 a menos, que é
     o que a descrição dela promete desde a v9.0. A conta está impressa
     para a próxima etapa não a refazer. */
  const frasesDoAcervo = [];
  const colherTudo = (v, prof = 0) => {
    if (!v || prof > 4) return;
    if (Array.isArray(v)) { for (const x of v) colherTudo(x, prof + 1); return; }
    if (typeof v !== "object") return;
    if (typeof v.nome === "string") frasesDoAcervo.push({ nome: v.nome, texto: `${v.nome} ${v.descricao || v.desc || ""}`.trim() });
    for (const k of Object.keys(v)) { if (k === "nome" || k === "descricao" || k === "desc") continue; colherTudo(v[k], prof + 1); }
  };
  colherTudo(CLASSES); colherTudo(SUBCLASSES); colherTudo(ESPECIALIZACOES); colherTudo(MAGIAS);
  const porDrenagem = frasesDoAcervo.filter((f) => { const p = aflicaoDe(f.texto); return p && p.cond === "enfraquecido"; }).map((f) => f.nome);
  const viradaDeSinal = ENFRAQUECIDO.danoReduzido * 2;
  console.log(`  ··  \`enfraquecido\` chega ao jogo por ${porDrenagem.length} frase(s) do acervo: ${porDrenagem.join(", ")}`);
  console.log(`  ··  em mesa o conserto vira o sinal: quem o carrega apanhava −${ENFRAQUECIDO.danoReduzido} e passa a bater −${ENFRAQUECIDO.danoReduzido} — ${viradaDeSinal} pontos de troca por golpe, e nenhuma das duas réguas o vê`);
  t("a família tem portas vivas de verdade no acervo (piso 3) — não é conserto sobre coisa nenhuma",
    porDrenagem.length >= 3, porDrenagem.join(", "));

  /* O MESMO DETERMINISMO, provado: duas passagens com a mesma semente dão
     o mesmo número. É a única lei que um sistema sem servidor tem. */
  const uma = comSorteTravada("marca|det", () => golpe(12, [], [criarCondicao("marcado")]).dano);
  const outra = comSorteTravada("marca|det", () => golpe(12, [], [criarCondicao("marcado")]).dano);
  t("mesma semente, mesmo golpe", uma === outra, `${uma} vs ${outra}`);
}

/* ============================================================
   8. A METADE QUE FICOU — medida, não construída
   ============================================================ */
sec("8. a segunda metade ('dano extra SEU'), medida e escrita");
{
  /* O QUE FALTA, EM UMA FRASE: a marca sabe QUANTO, e não sabe DE QUEM.
     Estas asserções são a medição trancada — no dia em que alguém puser
     dono na instância, elas acendem e mandam ler esta seção antes de
     escrever a terceira. */
  const inst = criarCondicao("marcado", { origem: "Marca do Caçador" });
  t("a instância de condição não tem campo de DONO — só `origem`, e origem é a HABILIDADE",
    !("dono" in inst) && inst.origem === "Marca do Caçador",
    JSON.stringify(inst));

  /* `rolarAflicao` conhece o atacante e deita-o fora: é ele que passaria a
     ser o dono, e é a primeira das cinco assinaturas do caminho. */
  const AFL = readFileSync(new URL("../src/aflicoes.js", import.meta.url), "utf8");
  t("…e quem a cria SABE quem bateu (`atacante`) e não o guarda",
    /atacante = ""/.test(AFL) && /origem: nomeFonte \|\| atacante/.test(AFL),
    "a origem mudou de forma: refaça a medição desta seção antes de a citar");

  /* `mecanicaDe` decide pelo CATÁLOGO e não recebe quem está a bater — é a
     segunda ponta do caminho, e a que obrigaria as duas leituras
     (`modificadoresDeCondicao`) a mudar de assinatura junto. A prova é a
     ASSINATURA no disco, e não `Function.length`: um parâmetro com valor
     padrão não conta para `length`, e as duas nascem com `= []`. */
  const COND_SRC = readFileSync(new URL("../src/condicoes.js", import.meta.url), "utf8");
  const COMB_SRC = readFileSync(new URL("../src/combate.js", import.meta.url), "utf8");
  t("`mecanicaDe` decide só pelo catálogo: não há por onde lhe dizer quem ataca",
    /export function mecanicaDe\(condicoes = \[\]\) \{/.test(COND_SRC),
    "a assinatura mudou — se ganhou quem ataca, a segunda metade começou: refaça esta medição");
  t("…e `modificadoresDeCondicao` também não",
    /export function modificadoresDeCondicao\(condicoes = \[\]\) \{/.test(COMB_SRC));
  t("…e `resolverAtaque` JÁ tem o nome de quem bate em mãos — é por aí que o dono entraria",
    /export function resolverAtaque\(\{ atacante,/.test(COMB_SRC));

  /* AS DUAS LINHAS QUE FICARAM, com a dívida trocada e escrita. */
  for (const nome of ["Marca do Caçador", "Maldição do Patrono"]) {
    const linha = AGUARDAM.find((a) => a.nome === nome);
    t(`"${nome}" continua em AGUARDAM, com a dívida reescrita em H4`,
      !!linha && /H4/.test(linha.motivo) && /dono/i.test(linha.motivo),
      linha ? linha.motivo.slice(0, 70) : "saiu da lista");
  }

  /* A FIAÇÃO DO APP, MEDIDA E NÃO TOCADA — o bastão do `App.jsx` esteve
     com a outra mente o ciclo inteiro. O canal já lá estava: é isto que
     fez a etapa caber em zero linhas daquele arquivo. */
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const canais = (APP.match(/condAlvo:/g) || []).length;
  const portas = (APP.match(/port\.alvo === "alvo"/g) || []).length;
  console.log(`  ··  App.jsx: ${canais} chamadas passam \`condAlvo\` a \`resolverAtaque\` · ${portas} porta(s) aplicam aflição que cai no alvo — a etapa não escreveu uma linha lá`);
  t("o canal do alvo já chegava à conta antes de H4 (piso 3)", canais >= 3, String(canais));
  t("…e a porta que põe a condição no inimigo já existia", portas >= 1, String(portas));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
