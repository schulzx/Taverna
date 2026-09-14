/* check-cura-nao-limpa.mjs (v9.239 — T2) — a cura devolve PV, e só

   A LEI, ditada para esta etapa e tirada de D&D 5e: CURA NORMAL APENAS
   RECUPERA PV, NÃO REMOVE A CONDIÇÃO. Daí é que vêm as magias, as
   habilidades de classe, os itens e os testes de resistência — porque
   se a poção limpasse veneno, nenhum deles teria razão de existir.

   POR QUE UM VARREDOR E NÃO SÓ UMA SUÍTE. T2 mediu o jogo inteiro e
   achou 45 portas que SOBEM PV — poção, dado de vida, descanso, magia
   de cura, milagre, relíquia, dádiva, profissão, santuário de masmorra,
   arena, companheiro, vínculo, drenagem, "aguentar", o chefe que se
   reergue. Nenhuma suíte mede esse acervo: cada uma prova o seu módulo,
   e a lei é sobre a CLASSE INTEIRA. Uma porta nova nasce a cada duas ou
   três versões, e ela nasce escrevendo `{ ...p, vida: ..., }` — se
   alguém puser um `condicoes: []` ao lado, nenhuma prova de hoje fica
   vermelha. Este arquivo é o dente que morde AMANHÃ.

   O QUE ELE FAZ. Percorre `src/` inteiro procurando toda linha que sobe
   `vida`, e falha se houver escrita em `condicoes` na vizinhança dela.
   Os poucos sítios legítimos estão na tabela abaixo, cada um com o
   motivo escrito — e a catraca anda nos dois sentidos: exemplo que para
   de casar fica vermelho, para a tabela não virar decoração.

   Nada aqui sorteia nem importa React: é leitura de texto-fonte e três
   funções puras. Duas rodadas dão a mesma saída, em qualquer máquina. */

import fs from "node:fs";
import path from "node:path";
import { CONDICOES, CANAIS_DE_SAIDA, criarCondicao, limparPorDescanso, listaCondicoes } from "../src/condicoes.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   A RÉGUA, em tabela
   ============================================================ */
const MEDIDA = {
  /* O PISO DO ACERVO. T2 mediu 45 portas de cura em `src/`. O piso é 35
     e não 45 de propósito: ele guarda o ALCANCE da varredura (um regex
     que pare de casar devolve lista vazia e fica vermelho aqui, em vez
     de passar verde sem ter medido nada), não o tamanho do acervo, que
     cresce quando alguém escreve cura nova. */
  pisoDePortas: 35,
  /* O PISO DE ARQUIVOS. As 45 portas moram em 13 arquivos distintos. Se
     a leitura quebrar e só o App sobrar, o piso de portas ainda passaria
     (o App sozinho tem mais de 35). Este é o segundo dente do alcance. */
  pisoDeArquivos: 8,
  /* A JANELA. Quantas linhas para cada lado contam como "a mesma porta".
     Seis porque é o tamanho de um objeto-ficha escrito à mão: a cura que
     também limpasse condição o faria no MESMO literal ou logo ao lado —
     foi exatamente assim que o `/curar` do console criativo o fez, na
     mesma linha. Janela maior começaria a pegar o descanso (que limpa
     oito linhas acima da cura de profissão) e a ficha nova, e aí a
     tabela de exceções cresceria até calar a prova. */
  janela: 6,
  /* O TETO DA ETAPA, cravado: nenhuma porta de cura fora da tabela pode
     escrever em `condicoes`. Hoje são 0, e 0 é a lei. */
  tetoDePortasQueLimpam: 0,
};

/* ============================================================
   OS SÍTIOS LEGÍTIMOS — cada um com o porquê

   Uma lista de perdão sem motivo escrito vira o lugar onde os bugs vão
   morar: bastaria acrescentar um nome para calar a catraca. Cada entrada
   aqui é `arquivo` + uma ÂNCORA de texto-fonte que a identifica, e a
   âncora tem de continuar existindo (o dente inverso, lá embaixo).
   ============================================================ */
const NAO_E_CURA = [
  {
    arquivo: "App.jsx", ancora: "atributos: attrFinais, vida: vidaMax + (antObj.pv || 0)",
    porque: "NASCIMENTO DE FICHA: a criação do personagem monta um corpo novo. Ficha que nasce não tem condição para limpar — a lista começa vazia porque nunca houve nada nela.",
  },
  {
    arquivo: "App.jsx", ancora: "|herdeiro|",
    porque: "NASCIMENTO DE FICHA: o herdeiro pega o fio com corpo próprio — a semente nova é a prova de que é outra pessoa. Mesmo motivo do de cima: é um personagem novo, não o antigo curado.",
  },
  {
    arquivo: "arena.js", ancora: "f.condicoes = []; f.efeitos = []; f.guardas = [];",
    porque: "MONTAGEM DA MESA: a arena constrói a ficha do duelo do zero, para que ninguém entre na luta carregando o estado de outra cena. É setup, não cura — o PV cheio ao lado é o começo do combate, não um curativo.",
  },
  {
    arquivo: "uma-noite.js", ancora: "f.condicoes = []; f.efeitos = []; f.grupo = [];",
    porque: "MONTAGEM DA MESA: idem para a Partida Rápida. A ficha da Noite nasce limpa porque é uma ficha nova, não porque alguém a curou.",
  },
  {
    arquivo: "App.jsx", ancora: 'case "curar": {',
    porque: "CONSOLE CRIATIVO, NÃO CURA NORMAL: é o comando /curar do modo criativo (godmode.js, `{ cmd: \"curar\" }`), digitado pelo desenvolvedor no campo de ação e interceptado antes do Mestre. Está DECLARADO na tabela de comandos como \"PV e PM cheios, condições e exaustão limpas\" — é a chave do mundo, como o modo criativo do Minecraft, e não uma porta que o jogo abra sozinho. T2 mediu-o e deixou-o de pé por isso; se um dia ele deixar de ser console, esta entrada tem de sair.",
  },
];

/* ============================================================
   1. O ALCANCE — a varredura chegou ao acervo inteiro
   ============================================================ */
const DIR = "../src";
const arqs = fs.readdirSync(DIR).filter((f) => /\.(js|jsx)$/.test(f));
const fonte = Object.fromEntries(arqs.map((f) => [f, fs.readFileSync(path.join(DIR, f), "utf8").split("\n")]));

/* SOBE PV? A linha atribui a `vida`, cita `vidaMax` (o teto — quem só
   subtrai dano não precisa dele) e ou soma alguma coisa, ou crava o
   máximo, ou calcula uma fração dele. É o molde das 45 medidas. */
const RX_ATRIBUI_VIDA = /\bvida\s*[:=](?!=)/;
const sobePV = (L) =>
  RX_ATRIBUI_VIDA.test(L) && /vidaMax/.test(L) &&
  (/\+/.test(L) || /\bvida\s*[:=]\s*[\w.$]*\.?vidaMax\s*[,;)}\s]/.test(L) || /Math\.round\(/.test(L));

/* ESCREVE EM CONDICOES? Atribuição a `condicoes` — chave de literal ou
   `x.condicoes =`. Leitura (`(p.condicoes || [])` num argumento) não
   conta: ler o estado é o que todo mundo faz. */
const RX_ESCREVE_COND = /\bcondicoes\s*[:=](?!=)/;

const portas = [];
for (const f of arqs) {
  const linhas = fonte[f];
  for (let i = 0; i < linhas.length; i++) {
    if (!sobePV(linhas[i])) continue;
    const de = Math.max(0, i - MEDIDA.janela);
    const ate = Math.min(linhas.length, i + MEDIDA.janela + 1);
    const bloco = linhas.slice(de, ate).join("\n");
    portas.push({ arquivo: f, linha: i + 1, texto: linhas[i].trim(), bloco, limpa: RX_ESCREVE_COND.test(bloco) });
  }
}
const arquivosComPorta = [...new Set(portas.map((p) => p.arquivo))];

sec("1. o alcance — a varredura chegou ao acervo inteiro");
console.log(`  ··  ${portas.length} portas de cura em ${arquivosComPorta.length} arquivos: ${arquivosComPorta.join(", ")}`);
t(`a varredura alcança pelo menos ${MEDIDA.pisoDePortas} portas de cura`,
  portas.length >= MEDIDA.pisoDePortas, `varreu ${portas.length}`);
t(`e elas estão espalhadas por pelo menos ${MEDIDA.pisoDeArquivos} arquivos`,
  arquivosComPorta.length >= MEDIDA.pisoDeArquivos, `achou ${arquivosComPorta.length}`);

/* ============================================================
   2. O DENTE — nenhuma porta de cura escreve em `condicoes`
   ============================================================ */
sec("2. o dente — nenhuma porta de cura escreve em condicoes");
const suspeitas = portas.filter((p) => p.limpa);
const perdoadas = [], forasDaLei = [];
for (const s of suspeitas) {
  const perdao = NAO_E_CURA.find((n) => n.arquivo === s.arquivo && s.bloco.includes(n.ancora));
  if (perdao) perdoadas.push({ ...s, perdao });
  else forasDaLei.push(`${s.arquivo}:${s.linha} → ${s.texto.slice(0, 100)}`);
}
console.log(`  ··  ${suspeitas.length} portas têm escrita em condicoes a até ${MEDIDA.janela} linhas · ${perdoadas.length} são sítios declarados`);
for (const p of perdoadas) console.log(`  ··  ${p.arquivo}:${p.linha} — ${p.perdao.porque.split(":")[0]}`);
t(`nenhuma porta de cura fora da tabela apaga condição (teto ${MEDIDA.tetoDePortasQueLimpam})`,
  forasDaLei.length <= MEDIDA.tetoDePortasQueLimpam, forasDaLei.slice(0, 8).join(" | "));

/* O DENTE INVERSO: exceção que parou de casar tem de sair da tabela,
   senão a lista cresce e vira decoração. */
const mortas = NAO_E_CURA.filter((n) => !perdoadas.some((p) => p.perdao === n));
t(`nenhuma exceção sobrando — toda entrada da tabela ainda aponta para código vivo`,
  mortas.length === 0, mortas.map((m) => `${m.arquivo}:${m.ancora.slice(0, 40)}`).join(" | "));

/* ============================================================
   3. A CHAMADA — os módulos de cura, lidos à mão

   A seção 2 compara a varredura com ela mesma: quem decide "isto é uma
   porta de cura" é `sobePV`, e é ela que está sob suspeita. Um regex que
   parasse de casar deixaria a prova verde com o acervo em zero, e só o
   piso a seguraria. Esta é a leitura INDEPENDENTE: os arquivos
   escolhidos à mão, com o veredito escrito aqui.
   ============================================================ */
sec("3. a chamada — os módulos de cura, nomeados à mão");
const SO_DEVOLVEM_PV = [
  ["descanso.js", "o dado de vida, o curto e a noite inteira"],
  ["profissoes.js", "o Médico de Campo e o Cozinheiro no acampamento"],
  ["legado.js", "a volta da morte, com 25% do PV"],
  ["vinculos.js", "o marco de vínculo que engorda o companheiro"],
  ["habilidades.js", "reerguer caídos e Reescrever o Instante"],
  ["dadivas.js", "o Segundo Fôlego da Dádiva da Recuperação"],
];
for (const [arq, quem] of SO_DEVOLVEM_PV) {
  const txt = (fonte[arq] || []).join("\n");
  t(`${arq} (${quem}) devolve PV e não toca em condicoes`,
    txt.length > 0 && !RX_ESCREVE_COND.test(txt), arq in fonte ? "escreve em condicoes" : "arquivo não lido");
}

/* ============================================================
   4. AS PORTAS DECLARADAS — o antídoto continua antidotando

   O dente inverso do inverso. Uma leitura preguiçosa desta etapa seria
   apagar toda escrita em `condicoes` e declarar a lei cumprida: o
   antídoto pararia de cortar veneno, a atadura de estancar sangue, a
   relíquia de limpar o que promete na ficha. Estas TRÊS são antídoto
   DECLARADO — a tabela diz, por escrito, o que cada uma remove —, não
   cura normal. São material de T4, e é este bloco que impede alguém de
   as apagar de carona.
   ============================================================ */
sec("4. as portas declaradas — antídoto não é cura normal");
{
  const pocoes = fonte["pocoes.js"].join("\n");
  const relicas = fonte["relicas.js"].join("\n");
  t('o consumível `tipo: "limpa"` ainda declara o que remove', /tipo: "limpa", remove: \[/.test(pocoes));
  t("…e ainda tira do que declarou", /p\.condicoes = \(p\.condicoes \|\| \[\]\)\.filter\(\(x\) => !c\.remove\.includes\(x\.id\)\)/.test(pocoes));
  t("a poção de CURA, ao lado, só mexe em vida", /if \(c\.tipo === "cura"\) \{[\s\S]{0,420}?p\.vida = Math\.min/.test(pocoes)
    && !/if \(c\.tipo === "cura"\) \{[\s\S]{0,420}?condicoes\s*[:=](?!=)/.test(pocoes));
  t("a relíquia com `limpa` ainda limpa o que declarou", /Array\.isArray\(e\.limpa\)[\s\S]{0,200}?p\.condicoes = /.test(relicas));
  t("e a `curaFracao` dela, ao lado, só mexe em vida", /if \(e\.curaFracao\) \{[\s\S]{0,360}?p\.vida = Math\.min/.test(relicas)
    && !/if \(e\.curaFracao\) \{[\s\S]{0,360}?condicoes\s*[:=](?!=)/.test(relicas));
}

/* ============================================================
   5. O CATÁLOGO NÃO PROMETE MAIS O QUE A LEI PROÍBE
   ============================================================ */
sec("5. o catálogo não promete mais que cura limpa");
{
  const ids = CANAIS_DE_SAIDA.map((c) => c.id);
  const prometemCura = listaCondicoes().filter((c) => (c.saiCom || []).some((s) => /^cura/i.test(s)));
  t("nenhuma condição declara sair com `cura`", prometemCura.length === 0,
    prometemCura.map((c) => c.id).join(", "));
  const foraDaTabela = listaCondicoes().flatMap((c) => (c.saiCom || []).filter((s) => !ids.includes(s)).map((s) => `${c.id}:${s}`));
  t("todo canal declarado no catálogo existe em CANAIS_DE_SAIDA", foraDaTabela.length === 0, foraDaTabela.join(", "));
  /* Toda linha da tabela tem de pegar alguma coisa OU estar declarada
     como porta futura — canal que ninguém declara é canal morto. */
  const semCaso = ids.filter((id) => !listaCondicoes().some((c) => (c.saiCom || []).includes(id)));
  t("todo canal da tabela é declarado por alguma condição", semCaso.length === 0, semCaso.join(", "));

  /* AS QUATRO QUE PERDERAM O CANAL "cura" continuam com saída: as quatro
     têm `turnos`, então vencem no relógio mesmo sem porta nenhuma. Sem
     esta prova, a etapa poderia ter deixado alguém preso para sempre. */
  const AS_QUATRO = ["envenenado", "sangrando", "cego", "enfeiticado"];
  for (const id of AS_QUATRO) {
    const c = CONDICOES[id];
    t(`${id} perdeu o canal "cura" mas vence no relógio (${c && c.turnos} turnos)`,
      !!c && Number(c.turnos) > 0, c ? `turnos ${c.turnos}` : "não existe");
  }
  /* E o comportamento do descanso NÃO mudou com a renomeação: se
     `enfeiticado` tivesse ficado com `saiCom` VAZIO, a regra implícita
     ("longo limpa toda condição ruim sem canal") passaria a quebrar
     encantamento — o jogador veria a diferença. Renomear guardou isso. */
  const so = limparPorDescanso([criarCondicao("enfeiticado")], "longo");
  t("a noite inteira continua NÃO quebrando encantamento (como antes de T2)",
    so.removidas.length === 0 && so.condicoes.length === 1, `removeu ${so.removidas.length}`);
}

/* ============================================================
   6. A PORTA DO DESCANSO SÓ ABRE PARA CANAL DE DESCANSO

   O buraco que T2 fechou no próprio módulo: antes, qualquer string
   servia de canal, e `limparPorDescanso(c, "cura")` teria sido a maneira
   mais fácil de uma cura apagar condição sem parecer que apagava.
   ============================================================ */
sec("6. a porta do descanso recusa canal que não é de descanso");
{
  const tres = [criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("exausto")];
  for (const canal of ["cura", "restauracao", "poção", "", null, "LONGO"]) {
    const r = limparPorDescanso(tres, canal);
    t(`canal ${JSON.stringify(canal)} não tira nada`, r.removidas.length === 0 && r.condicoes.length === 3,
      `removeu ${r.removidas.length}`);
  }
  /* `undefined` é o ÚNICO que não cai na recusa, e de propósito: é o que
     dispara o parâmetro-padrão `tipo = "curto"`, que todo chamador antigo
     usa ao chamar com um argumento só. `null` NÃO dispara o padrão (lei da
     casa: `= {}` não cobre `null`) e por isso cai na recusa, acima. */
  t("canal undefined cai no padrão `curto`, como todo chamador de um argumento só",
    limparPorDescanso(tres, undefined).removidas.length === limparPorDescanso(tres, "curto").removidas.length);
  /* e o dente inverso: os dois canais de verdade continuam funcionando */
  t("curto continua estancando sangramento", limparPorDescanso(tres, "curto").removidas.length === 1);
  t("longo continua levando veneno, sangramento e exaustão", limparPorDescanso(tres, "longo").removidas.length === 3);
  t("e a lista devolvida é nova, nunca a recebida (imutabilidade)",
    limparPorDescanso(tres, "cura").condicoes !== tres);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
