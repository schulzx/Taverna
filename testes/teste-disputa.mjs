/* A DISPUTA (Fase Y · Y1) — Empurrar e Derrubar ganham motor

   O QUE ESTA SUÍTE IMPEDE DE ACONTECER:

   · Que o empurrão VENÇA e o alvo atravesse a parede. Os três casos que
     quebram foram nomeados antes de existir código — parede, borda do
     mapa e corpo no caminho — e a seção 5 prova os três pela mesma
     tripla: a disputa é GANHA (`rolagem.venceu`), o alvo NÃO se move, e
     o `bloqueio` diz QUAL dos três barrou. Uma vitória que desloca o
     alvo através da pedra é o pior defeito possível neste órgão: mostra
     na tela uma coisa que o tabuleiro não aceita.
   · Que a parede volte a cobrar dano. Bater alguém contra pedra é
     mecânica NOVA e não foi aprovada (`disputa.js` escreve isso no
     cabeçalho, "NÃO INVENTA DANO"); a seção 5 cobra que nenhum dos três
     bloqueios traga número de dano. Se um dia a pessoa aprovar, é aqui
     que a asserção muda — com o motivo escrito, como manda a casa.
   · Que o empurrão passe a ter um segundo conceito de "casa livre".
     Quem é dono da posição é `grid.js`: a borda é a de `dentro`, a
     parede é a de `ehParede`, o corpo no caminho é o de `ocupacaoDe` —
     e essa última já sabe que quem caiu não ocupa. Duas classificações
     do mesmo chão é a doença desta casa, e aqui ela seria visível.
   · Que a disputa role `Math.random` por dentro. A `sorte` entra por
     parâmetro, e a seção 6 varre a FONTE: toda linha que nomeia
     `Math.random` tem de ser a linha que estabelece o valor por omissão
     do parâmetro. O molde é `teste-queda.mjs:353`, que prova que
     `queda.js` não rola dado nenhum. Determinismo por semente é o único
     árbitro que um sistema sem servidor tem.
   · Que o empate passe a favorecer quem ataca. A tabela declara
     `empateFavorece: "quemResiste"` e a comparação do módulo é `>` e
     não `>=`; um dia alguém vai achar que é engano. A seção 6 prova o
     empate pelos DOIS lados da fronteira: gémeos → o alvo resiste; +1
     de Força no atacante → o alvo cede; +1 no defensor → resiste na
     mesma. Assim a asserção não passa por acaso.
   · Que o portão de tamanho vire uma lista à parte. O degrau sai da
     `ESCADA` REAL de `grid.js`, varrida nos 36 pares — uma cópia da
     escada dentro da suíte provaria o que eu escrevi, não o que o
     módulo faz.
   · Que `Derrubar` invente uma condição. `caido` JÁ EXISTE
     (`condicoes.js:120`) com ícone, turnos e desvantagem declarados; um
     `prono` novo ao lado dele seria a terceira classificação do mesmo
     estado. A seção 7 cobra o id do catálogo, cobra que a instância seja
     a de `criarCondicao` (turnos incluídos) e prova que não empilha em
     quem já está no chão.
   · Que alguém funda este `caido` com o `GOLPE_NO_CAIDO` de `queda.js`.
     São HOMÓNIMOS e não são a mesma coisa: lá "caído" é inconsciente a
     0 PV (Q1), aqui é prono, de pé no sítio errado, e o corpo continua a
     agir. A seção 8 proíbe o import — é a asserção que impede a próxima
     pessoa de fundir as duas mecânicas por causa da palavra.

   E ela fecha a catraca de `teste-ligacao`: é o segundo leitor de TODO
   export de `disputa.js` e dos três nomes que Y1 acrescentou a `grid.js`.

   O QUE ELA NÃO FAZ: medir. Empurrar muda distância, e o tamanho desse
   efeito está em `testes/sonda-empurrao.mjs`, que imprime e não falha.
   Medir não é travar. */

const RAIZ = "../src/";
const D = await import(RAIZ + "disputa.js");
const G = await import(RAIZ + "grid.js");
const { CONDICOES, condicaoPorId, criarCondicao } = await import(RAIZ + "condicoes.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
/* imprime, não conta, não derruba — o lugar da dívida conhecida */
const pendente = (nome, motivo) => console.log("  ··  " + nome + " — " + motivo + "  (pendente, não travado)");

const { TABELA_DA_DISPUTA, DESFECHOS_DA_DISPUTA, podeDisputar, rolarDisputa, destinoDoEmpurrao, empurrar, derrubar } = D;
const { EMPURRAO_NO_TABULEIRO, direcaoDe, deslocarForcado } = G;
const { ESCADA, montarGrade, ocupacaoDe, distanciaM, q2m, METROS_POR_QUADRADO, garantirGrade } = G;

const FONTE = readFileSync(RAIZ + "disputa.js", "utf8");
/* as duas grafias da mesma tabela: o nome inteiro e o apelido `T` */
const daTabela = (campo) => new RegExp("(?:T|TABELA_DA_DISPUTA)\\." + campo + "\\b");
const FONTE_GRID = readFileSync(RAIZ + "grid.js", "utf8");
/* O CÓDIGO SEM OS COMENTÁRIOS. Esta casa comenta muito e comenta bem — o
   cabeçalho de `disputa.js` explica, com todas as letras, por que NÃO há
   dano de parede. Varrer o arquivo inteiro atrás da palavra acusaria a
   EXPLICAÇÃO em vez da mecânica; o que se varre é o que roda. */
const CODIGO = FONTE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* ---------------- OS DOIS LEITORES DO RESULTADO ----------------
   `empurrar` e `derrubar` devolvem `ok` a querer dizer "o alvo mudou de
   estado" — e a etapa inteira existe por causa do caso em que essas
   duas coisas se separam: a disputa é GANHA e o alvo não sai do lugar.
   Ler `r.ok` para saber quem venceu o teste oposto apagaria exatamente
   o caso que se quer provar, então a vitória lê-se onde ela mora, na
   `rolagem`. */
const ganhouADisputa = (r) => !!(r && r.venceu === true);
const mudouDeEstado = (r) => !!(r && r.ok === true);
/* onde o alvo FICOU: `para` quando andou, o sítio de origem quando não. */
const posDo = (r, alvo) => (r && r.para) || { x: alvo.x, y: alvo.y };

/* ---------------- AS FICHAS ----------------
   OS ATRIBUTOS DESTA CASA JÁ SÃO MODIFICADORES (a régua de B1 monta
   heróis com `forca: 3`), e `atributoEfetivo` soma-lhes proficiência e
   equipamento. `pericias` é `{treinadas, especialistas}` e não uma
   lista — é o que `garantirPericias` lê. Escrever as fichas na forma
   real é o que faz esta suíte exercitar o caminho de produção em vez de
   um caminho paralelo que só existe aqui.

   E o forte ganha SEMPRE com `sorte` constante: os dois lados tiram o
   mesmo d20, então decide o modificador — sem que a ORDEM das rolagens
   importe. É isso que torna as asserções de bloqueio independentes de
   quantas vezes o módulo chama `sorte()`. */
const FORTE = {
  nome: "Bram", classe: "Guerreiro", tamanho: "medio", nivel: 5, vida: 30, vidaMax: 30,
  atributos: { forca: 5, destreza: 1, vigor: 3 },
  pericias: { treinadas: ["atletismo"], especialistas: [] },
};
const FRACO = {
  nome: "Ladino", tamanho: "medio", nivel: 1, vida: 10, vidaMax: 10,
  atributos: { forca: 0, destreza: 0, vigor: 0 },
  pericias: { treinadas: [], especialistas: [] },
};
/* dois corpos exatamente iguais: o total empata por construção, e o
   empate é o que a seção 6 vai medir */
const GEMEO = {
  nome: "Gémeo", tamanho: "medio", nivel: 3, vida: 20, vidaMax: 20,
  atributos: { forca: 2, destreza: 2, vigor: 2 },
  pericias: { treinadas: ["atletismo", "acrobacia"], especialistas: [] },
};
const SEMPRE = (v) => () => v;
const sequencia = (...ns) => { let i = 0; return () => ns[i++ % ns.length]; };
const em = (ficha, x, y) => ({ ...ficha, x, y });

const TAVERNA = montarGrade({ local: "taverna" });

sec("1. OS NOMES — a catraca do segundo leitor");
{
  /* A CATRACA DE `teste-ligacao` EM PESSOA (o molde é `teste-queda.mjs:60-72`).
     A lista sai da FONTE e não de uma cópia à mão, para que um export
     novo de `disputa.js` apareça nesta asserção no dia em que nascer —
     e não na versão em que alguém reparar. */
  const exportados = [...FONTE.matchAll(/^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);
  const lidos = { TABELA_DA_DISPUTA, DESFECHOS_DA_DISPUTA, podeDisputar, rolarDisputa, destinoDoEmpurrao, empurrar, derrubar };
  const semLeitor = exportados.filter((n) => lidos[n] === undefined);
  t("esta suíte é o segundo leitor de TODO export de `disputa.js`", semLeitor.length === 0, semLeitor.join(", "));
  t("e não lê nome que o módulo não exporta",
    Object.keys(lidos).every((n) => exportados.includes(n)),
    Object.keys(lidos).filter((n) => !exportados.includes(n)).join(", "));
  console.log("      " + exportados.length + " exports: " + exportados.join(" · "));

  /* OS TRÊS NOMES QUE Y1 ACRESCENTOU A `grid.js`. A catraca aqui não
     pode pinar a contagem inteira do módulo (outras fases mexem em
     `grid.js`, e uma contagem pinada ficaria vermelha por ruído): ela
     morde a FAMÍLIA do empurrão. Todo export de `grid.js` que fale de
     empurrar, de forçar ou de direção tem de ter leitor nesta suíte. */
  const expGrid = [...FONTE_GRID.matchAll(/^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);
  const lidosGrid = { EMPURRAO_NO_TABULEIRO, direcaoDe, deslocarForcado };
  t("`grid.js` exporta os três nomes que Y1 prometeu",
    Object.keys(lidosGrid).every((n) => expGrid.includes(n)),
    Object.keys(lidosGrid).filter((n) => !expGrid.includes(n)).join(", "));
  t("e os três chegaram vivos ao import",
    typeof direcaoDe === "function" && typeof deslocarForcado === "function"
    && !!EMPURRAO_NO_TABULEIRO && typeof EMPURRAO_NO_TABULEIRO === "object");
  const daFamilia = expGrid.filter((n) => /empurr|forcad|direcao/i.test(n));
  const orfaos = daFamilia.filter((n) => lidosGrid[n] === undefined);
  t("nenhum export da família do empurrão fica sem leitor aqui", orfaos.length === 0, orfaos.join(", "));

  /* AS DUAS TABELAS EXISTEM E TÊM CONTEÚDO. Uma tabela vazia é um número
     cravado com uma tabela por cima. */
  t("`TABELA_DA_DISPUTA` é tabela com linhas", Object.keys(TABELA_DA_DISPUTA).length > 4);
  t("`DESFECHOS_DA_DISPUTA` declara os desfechos, e a chave bate com o valor",
    Object.entries(DESFECHOS_DA_DISPUTA).length > 1
    && Object.entries(DESFECHOS_DA_DISPUTA).every(([k, v]) => k === v),
    JSON.stringify(DESFECHOS_DA_DISPUTA));
  t("as cinco portas são função",
    [podeDisputar, rolarDisputa, destinoDoEmpurrao, empurrar, derrubar].every((f) => typeof f === "function"));
}

sec("2. O PORTÃO DE TAMANHO — um degrau, e ele sai da `ESCADA` real");
{
  /* A ESCADA É A DE `grid.js`, VARRIDA PAR A PAR. Recopiar os seis
     tamanhos aqui provaria o que eu escrevi; ler a escada real prova que
     o portão CONCORDA com ela — e que ele acompanha no dia em que a
     escada ganhar um degrau. */
  const degrau = TABELA_DA_DISPUTA.degrauMaximo;
  t("o degrau máximo sai da tabela, e é inteiro positivo", Number.isInteger(degrau) && degrau >= 1, String(degrau));
  t("e a regra decidida é UM degrau", degrau === 1, String(degrau));

  const divergem = [];
  for (const quem of ESCADA) for (const alvo of ESCADA) {
    const r = podeDisputar({ ...FORTE, tamanho: quem }, { ...FRACO, tamanho: alvo });
    const degraus = ESCADA.indexOf(alvo) - ESCADA.indexOf(quem);
    if (!r || typeof r.ok !== "boolean" || typeof r.motivo !== "string") { divergem.push(`${quem}→${alvo}: forma torta`); continue; }
    if (r.ok !== (degraus <= degrau)) divergem.push(`${quem}→${alvo}: ok=${r.ok}, escada diz ${degraus <= degrau}`);
    if (r.degraus !== degraus) divergem.push(`${quem}→${alvo}: degraus=${r.degraus}, escada diz ${degraus}`);
  }
  t(`o portão concorda com a \`ESCADA\` nos ${ESCADA.length ** 2} pares`, divergem.length === 0, divergem.slice(0, 4).join(" | "));

  /* e as duas linhas que a etapa nomeia, com todas as letras */
  t("um degrau acima PASSA — o médio empurra o grande",
    podeDisputar({ ...FORTE, tamanho: "medio" }, { ...FRACO, tamanho: "grande" }).ok === true);
  t("dois degraus NÃO — o médio não empurra o enorme",
    podeDisputar({ ...FORTE, tamanho: "medio" }, { ...FRACO, tamanho: "enorme" }).ok === false);
  t("empurrar para BAIXO na escada passa sempre",
    ESCADA.every((alvo, i) => ESCADA.slice(i).every((quem) => podeDisputar({ ...FORTE, tamanho: quem }, { ...FRACO, tamanho: alvo }).ok === true)));

  /* O VEREDITO ANTES DO CLIQUE: recusar sem dizer o porquê é o veredito
     mudo que a lei da casa proíbe. E o porquê é FRASE DE MESA — o
     sistema não fala de si mesmo, e "degrau" e "escada" são nomes do
     mecanismo, não do mundo. */
  const recusa = podeDisputar({ ...FORTE, tamanho: "medio" }, { ...FRACO, tamanho: "imenso" });
  t("quem é barrado ouve o porquê, escrito", typeof recusa.motivo === "string" && recusa.motivo.trim().length > 0, recusa.motivo);
  t("e o motivo não recita o mecanismo (nem `degrau`, nem `escada`, nem `tamanho`)",
    !/degrau|escada|tamanho|ESCADA|disputa/i.test(recusa.motivo), recusa.motivo);
  t("quem passa não recebe motivo nenhum — só o não precisa de explicação",
    podeDisputar({ ...FORTE }, { ...FRACO }).motivo === "");

  /* O TAMANHO SAI DE `tamanhoDe`, QUE JÁ SABE LER O NOME. Uma criatura
     sem campo `tamanho` mas chamada "Dragão" é enorme — se o portão só
     olhasse o campo, o herói empurraria dragões. */
  t("o portão lê o tamanho pelo NOME quando o campo não vem",
    podeDisputar({ ...FORTE, tamanho: "medio" }, { nome: "Dragão" }).ok === false);
  t("e o rato gigante continua empurrável (a espécie manda, o adjetivo empurra)",
    podeDisputar({ ...FORTE, tamanho: "medio" }, { nome: "Rato Gigante" }).ok === true);

  /* O LIXO NA PORTA. `= {}` no destructuring NÃO cobre `null` — lei da
     casa —, e quem chama isto chama do meio de um turno. */
  let explodiu = "";
  const forma = [];
  for (const par of [[null, null], [undefined, undefined], [{}, {}], [FORTE, null], [null, FRACO], [0, ""], [[], {}], ["texto", 7], [NaN, NaN]]) {
    try {
      const r = podeDisputar(par[0], par[1]);
      if (!r || typeof r.ok !== "boolean" || typeof r.motivo !== "string") forma.push(JSON.stringify(par));
    } catch (e) { explodiu += JSON.stringify(par) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode no portão — nem `null`, nem argumento ausente", explodiu === "", explodiu);
  t("e todo lixo devolve a forma completa, nunca `null`", forma.length === 0, forma.join(", "));
}

sec("3. `direcaoDe` — o vetor aparado a -1|0|1");
{
  /* O VETOR SE ESCREVE `{x,y}` — é um lugar relativo, e todo lugar deste
     arquivo se escreve assim. Duas grafias para a mesma ideia é como se
     importa um bug de tradução, e a tolerância de `deslocarForcado` a
     `{dx,dy}` é cortesia para quem fia, não uma segunda verdade. */
  const casos = [
    [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 1, y: 0 }],
    [{ x: 5, y: 0 }, { x: 0, y: 0 }, { x: -1, y: 0 }],
    [{ x: 0, y: 0 }, { x: 0, y: 9 }, { x: 0, y: 1 }],
    [{ x: 0, y: 9 }, { x: 0, y: 0 }, { x: 0, y: -1 }],
    [{ x: 0, y: 0 }, { x: 3, y: 3 }, { x: 1, y: 1 }],
    [{ x: 7, y: 7 }, { x: 1, y: 2 }, { x: -1, y: -1 }],
    [{ x: 4, y: 4 }, { x: 4, y: 4 }, { x: 0, y: 0 }],
  ];
  const tortos = casos.filter(([a, b, e]) => { const d = direcaoDe(a, b); return !d || d.x !== e.x || d.y !== e.y; });
  t("a direção é o sinal de cada eixo, e nada mais", tortos.length === 0,
    tortos.map(([a, b, e]) => `${JSON.stringify(a)}→${JSON.stringify(b)} deu ${JSON.stringify(direcaoDe(a, b))}, devia ${JSON.stringify(e)}`).join(" | "));

  /* A NORMALIZAÇÃO É A REGRA INTEIRA: nove casas de distância empurram
     igual a uma. Sem ela, o empurrão herdaria a distância do atacante —
     e um arqueiro a dez metros mandaria o alvo dez casas. */
  const foraDoDominio = [];
  for (let dx = -9; dx <= 9; dx += 3) for (let dy = -9; dy <= 9; dy += 3) {
    const d = direcaoDe({ x: 10, y: 10 }, { x: 10 + dx, y: 10 + dy });
    if (![-1, 0, 1].includes(d.x) || ![-1, 0, 1].includes(d.y)) foraDoDominio.push(`${dx},${dy}→${JSON.stringify(d)}`);
    if (d.x !== Math.sign(dx) || d.y !== Math.sign(dy)) foraDoDominio.push(`${dx},${dy} sinal errado`);
  }
  t("todo par cai no domínio fechado {-1,0,1} e guarda o sinal", foraDoDominio.length === 0, foraDoDominio.join(", "));

  /* SAI DOS CENTROS, e por isso um bicho GRANDE (2x2) é empurrado na
     direção de quem o empurra, e não na do canto de cima dele. O
     comentário de `grid.js` declara-o; esta é a prova. Um Grande em
     (4,4) ocupa até (5,5), e quem está em (6,4) — encostado ao lado
     direito — tem de o empurrar para a ESQUERDA, não na diagonal. */
  const grande = { nome: "Ogro", tamanho: "grande", x: 4, y: 4 };
  const doLado = { nome: "Bram", tamanho: "medio", x: 6, y: 4 };
  t("a direção contra um bicho grande sai dos centros, não dos cantos",
    JSON.stringify(direcaoDe(doLado, grande)) === JSON.stringify({ x: -1, y: 0 }),
    JSON.stringify(direcaoDe(doLado, grande)));

  let explodiu = "";
  const tortas = [];
  for (const par of [[null, null], [undefined, { x: 1, y: 1 }], [{}, {}], [{ x: 1 }, { y: 2 }], [0, ""], [[], {}], [{ x: "a", y: "b" }, { x: "c", y: "d" }]]) {
    try {
      const d = direcaoDe(par[0], par[1]);
      if (!d || ![-1, 0, 1].includes(d.x) || ![-1, 0, 1].includes(d.y)) tortas.push(JSON.stringify(par) + "→" + JSON.stringify(d));
    } catch (e) { explodiu += JSON.stringify(par) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode em `direcaoDe`", explodiu === "", explodiu);
  t("e o lixo cai no parado (0,0), nunca em NaN", tortas.length === 0, tortas.join(", "));
}

sec("4. `deslocarForcado` — o chão do empurrão, e a grade nula");
{
  const casas = EMPURRAO_NO_TABULEIRO.casas;
  t("a tabela do tabuleiro declara quantas casas o empurrão anda", Number.isInteger(casas) && casas >= 1, String(casas));
  t("e a regra decidida é UMA casa — que são os 1,5 m de `METROS_POR_QUADRADO`",
    casas === 1 && q2m(casas) === METROS_POR_QUADRADO, `${casas} casas = ${q2m(casas)} m`);

  /* O CASO LIMPO: chão livre, anda o que mandaram. */
  const alvo = em(FRACO, 5, 5);
  const r = deslocarForcado(TAVERNA, alvo, direcaoDe(em(FORTE, 5, 6), alvo), casas, {});
  t("no chão livre, anda a casa inteira",
    r.ok === true && r.x === 5 && r.y === 4 && r.casasAndadas === 1 && r.bloqueio === null, JSON.stringify(r));
  t("e a forma é sempre a mesma: ok, x, y, casasAndadas, bloqueio",
    typeof r.ok === "boolean" && Number.isFinite(r.x) && Number.isFinite(r.y)
    && Number.isInteger(r.casasAndadas) && (r.bloqueio === null || typeof r.bloqueio === "string"));
  /* aceita as duas grafias do vetor, e é de propósito: `direcaoDe`
     devolve `{dx,dy}` e quem fia escreve `{x,y}` à mão */
  t("um vetor `{x,y}` escrito à mão vale tanto quanto o `{dx,dy}` de `direcaoDe`",
    JSON.stringify(deslocarForcado(TAVERNA, alvo, { dx: 0, dy: -1 }, 1, {}))
    === JSON.stringify(deslocarForcado(TAVERNA, alvo, { x: 0, y: -1 }, 1, {})));

  /* IMUTABILIDADE (lei da casa): a entidade original não é tocada. */
  const antes = JSON.stringify(alvo);
  deslocarForcado(TAVERNA, alvo, { x: 0, y: -1 }, 1, {});
  deslocarForcado(TAVERNA, alvo, { x: 1, y: 1 }, 3, {});
  t("deslocar NÃO escreve dentro da entidade", JSON.stringify(alvo) === antes, JSON.stringify(alvo));

  /* A CONTA FECHA SEMPRE: a posição devolvida é o início mais a direção
     vezes as casas andadas, e o bloqueio é a outra metade do mesmo
     facto. Sem esta amarra, `casasAndadas` viraria um número decorativo
     ao lado de um `x,y` que ninguém confere. */
  const incoerentes = [];
  for (const dir of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 1 }, { x: -1, y: -1 }]) {
    for (const n of [1, 2, 3]) {
      for (const p of [[5, 5], [1, 1], [10, 7], [0, 0], [11, 8]]) {
        const e = em(FRACO, p[0], p[1]);
        const s = deslocarForcado(TAVERNA, e, dir, n, {});
        if (s.x !== e.x + dir.x * s.casasAndadas || s.y !== e.y + dir.y * s.casasAndadas) incoerentes.push(`${p}/${JSON.stringify(dir)}/${n}→${JSON.stringify(s)}`);
        if (s.casasAndadas > n || s.casasAndadas < 0) incoerentes.push(`${p}/${n}: andou ${s.casasAndadas}`);
        if ((s.casasAndadas < n) !== (s.bloqueio !== null)) incoerentes.push(`${p}/${n}: andou ${s.casasAndadas} de ${n} com bloqueio ${s.bloqueio}`);
        if (s.ok !== (s.casasAndadas > 0)) incoerentes.push(`${p}/${n}: ok=${s.ok} com ${s.casasAndadas} casas`);
      }
    }
  }
  t("posição, casas andadas, `ok` e bloqueio contam sempre a mesma história", incoerentes.length === 0, incoerentes.slice(0, 4).join(" | "));

  /* ANDA CASA A CASA E PARA NO PRIMEIRO OBSTÁCULO — é essa a diferença
     entre "foi empurrado duas casas e bateu na parede na segunda" e
     "não se mexeu", e é essa diferença que o jogador vê. O balcão da
     taverna é parede em y=1; de (5,3) para cima, duas casas passam e a
     terceira bate. */
  const tres = deslocarForcado(TAVERNA, em(FRACO, 5, 4), { x: 0, y: -1 }, 3, {});
  t("empurrado três casas contra a parede, anda as que dá e para com nome",
    tres.casasAndadas === 2 && tres.y === 2 && tres.bloqueio === "parede" && tres.ok === true, JSON.stringify(tres));

  /* O ESTORVO NÃO PARA — a tabela declara `estorvoPara: false`, e é
     coerência e não esquecimento: `livrePara` nunca olhou `ehEstorvo`, e
     `caminhar` atravessa barris desde a v9.34. Fazê-los bloquear só no
     empurrão daria ao tabuleiro duas verdades sobre o mesmo barril. */
  t("a tabela declara que o estorvo não para o empurrão", EMPURRAO_NO_TABULEIRO.estorvoPara === false);
  t("e a casa de destino é mesmo um estorvo da planta real", G.ehEstorvo(TAVERNA, 4, 4) === true);
  const porEstorvo = deslocarForcado(TAVERNA, em(FRACO, 4, 5), { x: 0, y: -1 }, 1, {});
  t("o barril não para o empurrão — ele vale cobertura, que é outra coisa",
    porEstorvo.ok === true && porEstorvo.y === 4 && porEstorvo.bloqueio === null, JSON.stringify(porEstorvo));

  /* A REGRA DE OURO DE `grid.js`, herdada intacta e escrita no topo do
     arquivo: "sem grade definida, tudo se comporta como antes". Uma luta
     sem terreno não pode barrar um empurrão por um chão que não existe. */
  let explodiu = "";
  const semGrade = [];
  for (const g of [null, undefined, {}, 0, "", [], { largura: 0, altura: 0 }]) {
    try {
      const s = deslocarForcado(g, em(FRACO, 3, 3), { x: 1, y: 0 }, 1, {});
      if (!s || s.ok !== true || s.bloqueio !== null || s.casasAndadas !== 1) semGrade.push(JSON.stringify(g) + "→" + JSON.stringify(s));
    } catch (e) { explodiu += JSON.stringify(g) + ":" + e.message + " "; }
  }
  t("grade nula não estoura — `= {}` no destructuring NÃO cobre `null`", explodiu === "", explodiu);
  t("e sem terreno definido o empurrão anda, como antes", semGrade.length === 0, semGrade.join(" | "));

  /* O LIXO NOS OUTROS TRÊS ARGUMENTOS. */
  let explodiu2 = "";
  const tortos = [];
  for (const args of [[TAVERNA, null, null, null, null], [TAVERNA, {}, {}, 0, {}], [TAVERNA, em(FRACO, 5, 5), null, 1, null],
    [TAVERNA, em(FRACO, 5, 5), { x: 0, y: 0 }, 1, {}], [TAVERNA, em(FRACO, 5, 5), { x: 1, y: 0 }, -3, {}],
    [TAVERNA, em(FRACO, 5, 5), { x: 1, y: 0 }, "duas", {}], [TAVERNA, em(FRACO, 5, 5), { x: 1, y: 0 }, NaN, {}],
    [TAVERNA, { nome: "sem lugar" }, { x: 1, y: 0 }, 1, {}]]) {
    try {
      const s = deslocarForcado(...args);
      if (!s || typeof s.ok !== "boolean" || !Number.isInteger(s.casasAndadas) || s.casasAndadas < 0) tortos.push(JSON.stringify(args.slice(1)) + "→" + JSON.stringify(s));
    } catch (e) { explodiu2 += e.message + " "; }
  }
  t("nem direção nula, nem casas negativas, nem entidade sem lugar estouram", explodiu2 === "", explodiu2);
  t("e nenhuma delas devolve forma torta", tortos.length === 0, tortos.join(" | "));
  t("direção parada não move ninguém, e não culpa parede nenhuma",
    (() => { const s = deslocarForcado(TAVERNA, em(FRACO, 5, 5), { x: 0, y: 0 }, 1, {}); return s.x === 5 && s.y === 5 && s.casasAndadas === 0 && s.bloqueio === null; })());
  /* quem chega à luta sem posição existe de verdade (o reforço que X3b/X4
     mediram); a resposta honesta é ficar parado, não estourar o turno */
  t("quem não está no tabuleiro fica parado e diz porquê",
    (() => { const s = deslocarForcado(TAVERNA, { nome: "reforço" }, { x: 1, y: 0 }, 1, {}); return s.ok === false && s.casasAndadas === 0 && String(s.motivo || "").trim().length > 0; })());
}

sec("5. OS TRÊS CASOS QUE QUEBRAM — a disputa é GANHA e o alvo NÃO se move");
{
  /* O CORAÇÃO DA ETAPA. A pessoa nomeou os três antes de existir código:
     parede, fora do mapa, em cima de outro. Em cada um a prova é a
     mesma tripla — a disputa foi ganha, o alvo ficou onde estava, e o
     `bloqueio` diz QUAL dos três barrou. */
  const forte = SEMPRE(0.95);

  /* (a) A PAREDE. O balcão da taverna é parede real (`muros: [[2,1,8,1]]`),
     e o alvo está colado a ela do lado de dentro. */
  const paredeAlvo = em(FRACO, 5, 2), paredeQuem = em(FORTE, 5, 3);
  t("[parede] a casa de destino é mesmo parede na planta real", G.ehParede(TAVERNA, 5, 1) === true);
  const antesParede = JSON.stringify(paredeAlvo);
  const rParede = empurrar({ grade: TAVERNA, quem: paredeQuem, alvo: paredeAlvo, entidades: [paredeQuem, paredeAlvo], sorte: forte });
  t("[parede] a disputa é GANHA", ganhouADisputa(rParede) === true, JSON.stringify(rParede));
  t("[parede] e mesmo assim o alvo NÃO se move",
    posDo(rParede, paredeAlvo).x === 5 && posDo(rParede, paredeAlvo).y === 2 && rParede.casas === 0 && mudouDeEstado(rParede) === false,
    JSON.stringify(rParede));
  t("[parede] e o resultado diz qual dos três barrou", rParede.bloqueio === "parede", String(rParede.bloqueio));
  t("[parede] a entidade original não foi mutada", JSON.stringify(paredeAlvo) === antesParede, JSON.stringify(paredeAlvo));

  /* (b) A BORDA DO MAPA. O alvo está na primeira linha e é empurrado
     para fora — que não é parede, é o fim do tabuleiro, e as duas coisas
     precisam de nomes diferentes porque a cena é outra. */
  const bordaAlvo = em(FRACO, 5, 0), bordaQuem = em(FORTE, 5, 1);
  t("[borda] a casa de destino fica mesmo fora do campo", G.dentro(TAVERNA, 5, -1) === false);
  const antesBorda = JSON.stringify(bordaAlvo);
  const rBorda = empurrar({ grade: TAVERNA, quem: bordaQuem, alvo: bordaAlvo, entidades: [bordaQuem, bordaAlvo], sorte: forte });
  t("[borda] a disputa é GANHA", ganhouADisputa(rBorda) === true, JSON.stringify(rBorda));
  t("[borda] e mesmo assim o alvo NÃO se move",
    posDo(rBorda, bordaAlvo).x === 5 && posDo(rBorda, bordaAlvo).y === 0 && rBorda.casas === 0 && mudouDeEstado(rBorda) === false,
    JSON.stringify(rBorda));
  t("[borda] e o resultado diz qual dos três barrou", rBorda.bloqueio === "borda", String(rBorda.bloqueio));
  t("[borda] a entidade original não foi mutada", JSON.stringify(bordaAlvo) === antesBorda, JSON.stringify(bordaAlvo));

  /* (c) EM CIMA DE OUTRO. Outra criatura VIVA ocupa o destino —
     `ocupacaoDe` é quem sabe isso, e é dela que o empurrão tem de
     perguntar, senão passam a existir dois conceitos de casa livre. */
  const ocupAlvo = em(FRACO, 5, 5), ocupQuem = em(FORTE, 5, 6);
  const terceiro = em({ ...FRACO, nome: "Capanga" }, 5, 4);
  t("[ocupado] a casa de destino está mesmo ocupada por quem está vivo", ocupacaoDe([terceiro]).has("5,4") === true);
  const antesOcup = JSON.stringify(ocupAlvo);
  const rOcup = empurrar({ grade: TAVERNA, quem: ocupQuem, alvo: ocupAlvo, entidades: [ocupQuem, ocupAlvo, terceiro], sorte: forte });
  t("[ocupado] a disputa é GANHA", ganhouADisputa(rOcup) === true, JSON.stringify(rOcup));
  t("[ocupado] e mesmo assim o alvo NÃO se move",
    posDo(rOcup, ocupAlvo).x === 5 && posDo(rOcup, ocupAlvo).y === 5 && rOcup.casas === 0 && mudouDeEstado(rOcup) === false,
    JSON.stringify(rOcup));
  t("[ocupado] e o resultado diz qual dos três barrou", rOcup.bloqueio === "ocupado", String(rOcup.bloqueio));
  t("[ocupado] a entidade original não foi mutada", JSON.stringify(ocupAlvo) === antesOcup, JSON.stringify(ocupAlvo));

  /* E O CORPO CAÍDO NÃO OCUPA. `ocupacaoDe` já ignora quem está
     derrotado ou a 0 PV; se o empurrão perguntasse a outra fonte, o
     cadáver viraria parede — e a etapa passaria a mudar o tabuleiro. */
  const morto = { ...em(FRACO, 5, 4), nome: "Tombado", vida: 0, derrotado: true };
  const vivoAlvo = em(FRACO, 5, 5), vivoQuem = em(FORTE, 5, 6);
  const rMorto = empurrar({ grade: TAVERNA, quem: vivoQuem, alvo: vivoAlvo, entidades: [vivoQuem, vivoAlvo, morto], sorte: forte });
  t("quem já caiu não barra o empurrão — é `ocupacaoDe` quem decide, e ela já sabe disso",
    rMorto.bloqueio === null && posDo(rMorto, vivoAlvo).y === 4, JSON.stringify(rMorto));

  /* O CASO LIMPO, para a prova acima não passar por acidente: o mesmo
     par, o mesmo dado, o chão vazio — e o alvo anda 1,5 m. */
  const limpoAlvo = em(FRACO, 5, 5), limpoQuem = em(FORTE, 5, 6);
  const rLimpo = empurrar({ grade: TAVERNA, quem: limpoQuem, alvo: limpoAlvo, entidades: [limpoQuem, limpoAlvo], sorte: forte });
  t("com o chão livre o MESMO empurrão move o alvo",
    ganhouADisputa(rLimpo) === true && mudouDeEstado(rLimpo) === true && rLimpo.bloqueio === null && posDo(rLimpo, limpoAlvo).y === 4,
    JSON.stringify(rLimpo));
  t("e move exatamente as casas e os metros que a tabela declara",
    rLimpo.casas === EMPURRAO_NO_TABULEIRO.casas && rLimpo.metros === q2m(EMPURRAO_NO_TABULEIRO.casas)
    && distanciaM(limpoAlvo, posDo(rLimpo, limpoAlvo)) === q2m(EMPURRAO_NO_TABULEIRO.casas),
    `${rLimpo.casas} casas · ${rLimpo.metros} m`);
  t("e o resultado diz de onde para onde, para a tela poder desenhar",
    JSON.stringify(rLimpo.de) === JSON.stringify({ x: 5, y: 5 }) && JSON.stringify(rLimpo.para) === JSON.stringify({ x: 5, y: 4 }),
    JSON.stringify([rLimpo.de, rLimpo.para]));

  /* NENHUM DANO DE PAREDE. Bater alguém contra pedra seria mecânica
     NOVA, e mecânica nova é decisão da pessoa — não foi aprovada, e o
     cabeçalho de `disputa.js` diz-o com todas as letras. Se um dia for
     aprovada, é esta asserção que muda, com o motivo escrito. */
  const comDano = [rParede, rBorda, rOcup].filter((r) => /"(dano|pv|ferimento|queda)"\s*:/.test(JSON.stringify(r)));
  t("nenhum dos três bloqueios cobra dano — a parede não machuca em Y1", comDano.length === 0, JSON.stringify(comDano));
  t("e o CÓDIGO não nomeia dano nenhum — só o comentário que explica a ausência",
    !/\bdano\b/i.test(CODIGO) && /NÃO INVENTA DANO/.test(FONTE),
    (CODIGO.match(/.*\bdano\b.*/gi) || []).slice(0, 2).join(" | "));

  /* E O BLOQUEIO SÓ TEM AS GRAFIAS DA TABELA. Um quarto valor inventado
     (um "estorvo", um "terreno") seria mecânica nova a entrar pela porta
     de um campo de diagnóstico — e a tela não saberia desenhá-lo. */
  t("o domínio do `bloqueio` é o que `EMPURRAO_NO_TABULEIRO.bloqueios` declara",
    [rParede, rBorda, rOcup, rLimpo, rMorto].every((r) => r.bloqueio === null || EMPURRAO_NO_TABULEIRO.bloqueios.includes(r.bloqueio)),
    [rParede, rBorda, rOcup, rLimpo, rMorto].map((r) => r.bloqueio).join(", "));
  t("e os três nomes da tabela são exatamente os três casos que a etapa nomeou",
    EMPURRAO_NO_TABULEIRO.bloqueios.slice().sort().join(",") === "borda,ocupado,parede",
    EMPURRAO_NO_TABULEIRO.bloqueios.join(","));

  /* `venceu` E `rolagem.venceu` SÃO O MESMO FACTO, e o resultado publica
     os dois: `ok` é "o alvo mudou de estado" e `venceu` é "a disputa foi
     ganha", e a etapa inteira existe por causa do caso em que se separam.
     Se os dois campos divergissem, o campo do topo seria uma segunda
     verdade sobre o mesmo dado — e quem fia leria a errada. */
  const incoerentes = [rParede, rBorda, rOcup, rLimpo, rMorto]
    .filter((r) => r.rolagem && r.venceu !== r.rolagem.venceu);
  t("`venceu` no topo diz o mesmo que `rolagem.venceu` — não são duas verdades",
    incoerentes.length === 0, JSON.stringify(incoerentes));
  t("e `ok` é a OUTRA pergunta: nos três bloqueios ele é falso com `venceu` verdadeiro",
    [rParede, rBorda, rOcup].every((r) => r.ok === false && r.venceu === true));
  t("e nos três o desfecho é o `bloqueado` da tabela, não o `resistiu`",
    [rParede, rBorda, rOcup].every((r) => r.desfecho === DESFECHOS_DA_DISPUTA.bloqueado),
    [rParede, rBorda, rOcup].map((r) => r.desfecho).join(", "));
  /* e o porquê que chega ao jogador é VOZ DE MUNDO: ele sente o muro nas
     costas do inimigo, nunca lê a palavra "bloqueio" nem "quadrado" */
  t("e o porquê é frase de mundo, não o nome do mecanismo",
    [rParede, rBorda, rOcup].every((r) => typeof r.motivo === "string" && r.motivo.trim().length > 0
      && !/bloqueio|grade|quadrado|coordenada|disputa/i.test(r.motivo)),
    [rParede, rBorda, rOcup].map((r) => r.motivo).join(" | "));
  /* e os três dizem coisas DIFERENTES: um só motivo para os três casos
     seria a tela a apagar a distinção que a tabela acabou de fazer */
  t("e os três motivos são três frases, não uma",
    new Set([rParede, rBorda, rOcup].map((r) => r.motivo)).size === 3,
    [rParede, rBorda, rOcup].map((r) => r.motivo).join(" | "));

  /* O VEREDITO ANTES DO CLIQUE. `destinoDoEmpurrao` não rola nada: é
     geometria, e existe para o jogador poder VER que o inimigo está
     encostado à parede antes de gastar a ação a descobri-lo. Ela tem de
     dizer exatamente o que o empurrão vai cobrar — se divergirem, o
     preço mostrado não é o preço pago, e "o veredito antes do clique"
     deixa de ser uma lei para ser uma decoração. */
  const divergem = [];
  for (const [nome, quem, alvo, ents] of [
    ["parede", paredeQuem, paredeAlvo, [paredeQuem, paredeAlvo]],
    ["borda", bordaQuem, bordaAlvo, [bordaQuem, bordaAlvo]],
    ["ocupado", ocupQuem, ocupAlvo, [ocupQuem, ocupAlvo, terceiro]],
    ["livre", limpoQuem, limpoAlvo, [limpoQuem, limpoAlvo]],
  ]) {
    const v = destinoDoEmpurrao({ grade: TAVERNA, quem, alvo, entidades: ents });
    const feito = empurrar({ grade: TAVERNA, quem, alvo, entidades: ents, sorte: forte });
    if (v.bloqueio !== feito.bloqueio) divergem.push(`${nome}: veredito ${v.bloqueio} vs feito ${feito.bloqueio}`);
    if (JSON.stringify(v.para) !== JSON.stringify(feito.para)) divergem.push(`${nome}: destino ${JSON.stringify(v.para)} vs ${JSON.stringify(feito.para)}`);
    if (v.casas !== feito.casas || v.metros !== feito.metros) divergem.push(`${nome}: ${v.casas}/${v.metros} vs ${feito.casas}/${feito.metros}`);
  }
  t("o veredito antes do clique diz o mesmo que o empurrão cobra", divergem.length === 0, divergem.join(" | "));
  t("e ele não rola dado nenhum — duas perguntas, uma resposta",
    JSON.stringify(destinoDoEmpurrao({ grade: TAVERNA, quem: limpoQuem, alvo: limpoAlvo, entidades: [] }))
    === JSON.stringify(destinoDoEmpurrao({ grade: TAVERNA, quem: limpoQuem, alvo: limpoAlvo, entidades: [] })));
  t("e ele não toca na `sorte` — mostrar o preço não pode gastar o dado",
    !/sorte/.test(String(destinoDoEmpurrao)), String(destinoDoEmpurrao).slice(0, 120));

  /* UM BICHO GRANDE (2x2) NÃO SE BLOQUEIA A SI PRÓPRIO. O destino dele
     sobrepõe o próprio corpo, e se `ocupacaoDe` não o excluísse ele
     nunca sairia do sítio — um Ogro imune a empurrão por acidente de
     implementação, que é o tipo de bug que ninguém descobre a ler. */
  const ogro = { nome: "Ogro", tamanho: "grande", nivel: 1, vida: 20, x: 5, y: 5, atributos: { forca: 0, destreza: 0 }, pericias: { treinadas: [], especialistas: [] } };
  const contraOgro = em(FORTE, 5, 7);
  const rOgro = empurrar({ grade: TAVERNA, quem: contraOgro, alvo: { ...ogro }, entidades: [contraOgro, { ...ogro }], sorte: forte });
  t("um bicho de 2x2 não se bloqueia com o próprio corpo",
    ganhouADisputa(rOgro) === true && mudouDeEstado(rOgro) === true && rOgro.bloqueio === null, JSON.stringify(rOgro));
}

sec("6. O TESTE OPOSTO — o empate, e o determinismo por semente");
{
  /* O EMPATE GANHA QUEM RESISTE, e a prova é pelos DOIS lados da
     fronteira. Com `sorte` constante os dois lados tiram o mesmo d20, e
     as duas fichas são gémeas: o total empata por construção, sem que a
     ordem das rolagens importe. Depois o atacante ganha +1 de Força e o
     mesmo dado passa a vencer; e o defensor ganha +1 e o mesmo dado
     volta a resistir. É esse par que prova que o empate é uma
     FRONTEIRA, e não um azar do módulo. */
  t("a tabela declara a quem o empate favorece", TABELA_DA_DISPUTA.empateFavorece === "quemResiste", String(TABELA_DA_DISPUTA.empateFavorece));
  const par = SEMPRE(0.5);
  const empate = rolarDisputa({ quem: { ...GEMEO, nome: "A" }, alvo: { ...GEMEO, nome: "B" }, sorte: par });
  t("os dois gémeos empatam mesmo — o total é idêntico",
    empate.empate === true && empate.quem.total === empate.alvo.total, empate.conta);
  t("e no empate quem resiste ganha", empate.venceu === false, empate.conta);
  const maior = rolarDisputa({ quem: { ...GEMEO, atributos: { ...GEMEO.atributos, forca: 3 } }, alvo: { ...GEMEO }, sorte: par });
  t("+1 de Força no atacante vira o mesmo dado a favor dele", maior.venceu === true, maior.conta);
  const menor = rolarDisputa({ quem: { ...GEMEO }, alvo: { ...GEMEO, atributos: { ...GEMEO.atributos, forca: 3 } }, sorte: par });
  t("e +1 no defensor mantém o chão dele", menor.venceu === false, menor.conta);

  /* O EMPATE ATRAVESSA OS DOIS VERBOS — é um motor só, com dois
     desfechos. Se um deles resolvesse o empate à sua maneira, a etapa
     teria produzido duas regras com a mesma cara. */
  const empateEmpurrao = empurrar({ grade: TAVERNA, quem: em(GEMEO, 5, 6), alvo: em(GEMEO, 5, 5), entidades: [], sorte: par });
  const empateQueda = derrubar({ quem: { ...GEMEO }, alvo: { ...GEMEO }, sorte: par });
  t("o empate vale igual nos dois verbos",
    ganhouADisputa(empateEmpurrao) === false && ganhouADisputa(empateQueda) === false
    && empateEmpurrao.desfecho === DESFECHOS_DA_DISPUTA.resistiu && empateQueda.desfecho === DESFECHOS_DA_DISPUTA.resistiu,
    `${empateEmpurrao.desfecho} · ${empateQueda.desfecho}`);
  t("e no empurrão empatado o alvo fica onde estava, sem bloqueio nenhum",
    posDo(empateEmpurrao, em(GEMEO, 5, 5)).y === 5 && empateEmpurrao.bloqueio === null, JSON.stringify(empateEmpurrao));

  /* A MELHOR DAS DUAS DEFESAS. Sem a segunda porta, um Ladino de
     Destreza alta e Força zero seria empurrado por qualquer um — metade
     das fichas desta casa sem defesa nenhuma contra um botão. */
  t("a tabela declara duas linhas de defesa, e o ataque só uma",
    Array.isArray(TABELA_DA_DISPUTA.defesa) && TABELA_DA_DISPUTA.defesa.length === 2
    && TABELA_DA_DISPUTA.ataque.attr === "forca" && TABELA_DA_DISPUTA.ataque.pericia === "atletismo",
    JSON.stringify(TABELA_DA_DISPUTA.defesa));
  const agil = { nome: "Ágil", tamanho: "medio", nivel: 3, atributos: { forca: 0, destreza: 4 }, pericias: { treinadas: ["acrobacia"], especialistas: [] } };
  const pesado = { nome: "Pesado", tamanho: "medio", nivel: 3, atributos: { forca: 0, destreza: 0 }, pericias: { treinadas: [], especialistas: [] } };
  const contraAgil = rolarDisputa({ quem: { ...GEMEO }, alvo: agil, sorte: par });
  const contraPesado = rolarDisputa({ quem: { ...GEMEO }, alvo: pesado, sorte: par });
  t("quem tem pé resiste melhor que quem não tem nada — a segunda porta existe",
    contraAgil.alvo.total > contraPesado.alvo.total, `${contraAgil.alvo.total} vs ${contraPesado.alvo.total}`);
  t("e a defesa escolhida é a que a tabela lista, não uma terceira",
    TABELA_DA_DISPUTA.defesa.some((l) => l.attr === contraAgil.alvo.attr), contraAgil.alvo.attr);

  /* QUEM NÃO TEM FICHA. `completarInimigo` não devolve `atributos`: o
     inimigo desta casa não tem Força para ler, e a régua dele sai da
     tabela (`semFicha`), não de uma linha escrita dentro da função. */
  const goblin = { nome: "Goblin", nivel: 8 };
  const contraGoblin = rolarDisputa({ quem: { ...GEMEO }, alvo: goblin, sorte: par });
  /* O BÔNUS LÊ-SE PELA CONTA, não por um campo: `totalQuem` é sempre
     `dado + bônus`, e é essa identidade — e não a grafia do resultado —
     que a regra promete. Recopiar o `nível/4` da tabela aqui provaria o
     que eu escrevi; tirar o dado da soma e comparar com a tabela prova
     que o módulo concorda com ela. */
  const bonusDo = (lado, soma) => soma - lado.dado;
  const esperado = TABELA_DA_DISPUTA.semFicha.base + Math.floor(8 / TABELA_DA_DISPUTA.semFicha.porNivel);
  const bonusDoAlvo = (r) => bonusDo(r.alvo, r.totalAlvo);
  t("o inimigo sem ficha entra pela régua da tabela, não por uma linha solta",
    contraGoblin.alvo.semFicha === true && bonusDoAlvo(contraGoblin) === esperado,
    `${bonusDoAlvo(contraGoblin)} vs ${esperado}`);
  t("e um bicho de nível 1 entra com o `base` declarado",
    bonusDoAlvo(rolarDisputa({ quem: { ...GEMEO }, alvo: { nome: "Goblin", nivel: 1 }, sorte: par })) === TABELA_DA_DISPUTA.semFicha.base);
  /* e a régua SOBE com o nível, senão o `porNivel` da tabela seria uma
     linha que não faz nada — o defeito preferido desta casa */
  t("e a régua do bicho sem ficha sobe com o nível dele",
    bonusDoAlvo(rolarDisputa({ quem: { ...GEMEO }, alvo: { nome: "Goblin", nivel: 20 }, sorte: par }))
    > bonusDoAlvo(rolarDisputa({ quem: { ...GEMEO }, alvo: { nome: "Goblin", nivel: 1 }, sorte: par })));
  t("e quem TEM ficha não passa por essa régua", contraGoblin.quem.semFicha === false);
  /* e as duas metades fecham: soma = dado + bônus, dos dois lados. Sem
     esta amarra, `total` e `totalQuem` seriam dois números ao lado um do
     outro sem ninguém a garantir que contam a mesma história. */
  /* O DADO ENTRA NA SOMA UMA VEZ SÓ, e o bônus não se mexe com ele: com
     as mesmas fichas e dois dados diferentes, a soma anda exatamente o
     que o dado andou. É a amarra que impede `totalQuem` e o bônus de
     virarem dois números ao lado um do outro sem ninguém a garantir que
     contam a mesma história. */
  const somaTorta = [];
  const base = rolarDisputa({ quem: { ...FORTE }, alvo: { ...GEMEO }, sorte: SEMPRE(0.05) });
  for (const v of [0.25, 0.5, 0.95]) {
    const r = rolarDisputa({ quem: { ...FORTE }, alvo: { ...GEMEO }, sorte: SEMPRE(v) });
    if (r.totalQuem - base.totalQuem !== r.quem.dado - base.quem.dado) somaTorta.push(`quem ${v}`);
    if (r.totalAlvo - base.totalAlvo !== r.alvo.dado - base.alvo.dado) somaTorta.push(`alvo ${v}`);
    if (bonusDo(r.quem, r.totalQuem) !== bonusDo(base.quem, base.totalQuem)) somaTorta.push(`bônus de quem mexeu com o dado em ${v}`);
    if (r.venceu !== (r.totalQuem > r.totalAlvo)) somaTorta.push(`veredito ${v}`);
    if (r.empate !== (r.totalQuem === r.totalAlvo)) somaTorta.push(`empate ${v}`);
  }
  t("o dado entra na soma uma vez só, e o bônus da ficha não depende dele", somaTorta.length === 0, somaTorta.join(", "));

  /* DETERMINISMO POR SEMENTE — lei da casa, e o único árbitro de um
     sistema sem servidor. A mesma sequência de números dá o mesmo
     resultado BYTE A BYTE; outra sequência dá outro. */
  const nums = [0.11, 0.87, 0.42, 0.66, 0.05, 0.93, 0.31, 0.78];
  const outros = [0.97, 0.02, 0.55, 0.19, 0.81, 0.37, 0.64, 0.08];
  const roda = (seq) => JSON.stringify(rolarDisputa({ quem: { ...FORTE }, alvo: { ...FRACO }, sorte: sequencia(...seq) }));
  t("mesma sequência = mesmo resultado, byte a byte", roda(nums) === roda(nums), roda(nums));
  t("e roda dez vezes sem derivar", Array.from({ length: 10 }, () => roda(nums)).every((s) => s === roda(nums)));
  const variam = new Set(Array.from({ length: 20 }, (_, i) => roda(nums.map((n) => (n + i / 20) % 1))));
  t("sequências diferentes mudam o resultado — a sorte é mesmo lida", variam.size > 1, `${variam.size} resultados distintos em 20 sementes`);
  const rodaEmpurrao = (seq) => JSON.stringify(empurrar({ grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: em(FRACO, 5, 5), entidades: [], sorte: sequencia(...seq) }));
  t("o empurrão inteiro também é determinístico", rodaEmpurrao(nums) === rodaEmpurrao(nums));
  t("e muda quando a sorte muda", rodaEmpurrao(nums) !== rodaEmpurrao(outros), rodaEmpurrao(nums));
  const rodaQueda = (seq) => JSON.stringify(derrubar({ quem: { ...FORTE }, alvo: { ...FRACO }, sorte: sequencia(...seq) }));
  t("e derrubar idem", rodaQueda(nums) === rodaQueda(nums));

  /* A ORDEM DOS DADOS É CONTRATO — o cabeçalho de `rolarDisputa` di-lo:
     primeiro quem empurra, depois quem resiste. Uma suíte que fixa a
     sorte numa lista depende disso, e trocar a ordem um dia trocaria o
     resultado de todos os testes de uma vez sem nenhum deles ficar
     vermelho por mérito próprio. Esta asserção é esse mérito. */
  const ordenada = rolarDisputa({ quem: { ...GEMEO }, alvo: { ...GEMEO }, sorte: sequencia(0.0, 0.95) });
  t("o primeiro número da sorte é o dado de quem empurra",
    ordenada.quem.dado === 1 && ordenada.alvo.dado === TABELA_DA_DISPUTA.faces,
    `${ordenada.quem.dado} · ${ordenada.alvo.dado}`);
  t("e o dado tem as faces que a tabela declara",
    new Set(Array.from({ length: 40 }, (_, i) => rolarDisputa({ quem: { ...GEMEO }, alvo: { ...GEMEO }, sorte: SEMPRE(i / 40) }).quem.dado)).size === TABELA_DA_DISPUTA.faces);

  /* E A SORTE NÃO É ROUBADA POR DENTRO. O molde é `teste-queda.mjs:353`,
     que prova que `queda.js` não rola dado nenhum: varrer a FONTE é a
     única forma de garantir que nenhum caminho lateral chama
     `Math.random` por baixo do parâmetro. Um só `Math.random` escondido
     no meio do módulo apaga o determinismo inteiro sem derrubar
     asserção nenhuma de comportamento. */
  const linhas = CODIGO.split("\n").filter((l) => /Math\.random/.test(l));
  t("`disputa.js` nomeia `Math.random` — o padrão existe e quem não passa `sorte` ainda joga", linhas.length > 0);
  t("e TODA linha que o nomeia fala de `sorte` — nenhuma é uma conta",
    linhas.every((l) => /\bsorte\b/.test(l)),
    linhas.map((l) => l.trim()).join(" | "));
  t("e cada uma é o PADRÃO do parâmetro, nunca uma rolagem no meio do código",
    linhas.every((l) => /sorte\s*=\s*Math\.random\b/.test(l) || /typeof\s+sorte[\s\S]*Math\.random/.test(l)),
    linhas.map((l) => l.trim()).join(" | "));
  /* e nenhuma delas é uma CHAMADA: `Math.random` passado como valor é o
     padrão; `Math.random()` no meio de uma conta é a sorte roubada */
  t("e nenhuma o CHAMA — `Math.random()` no meio de uma conta apagaria o determinismo",
    !/Math\.random\s*\(/.test(CODIGO),
    (CODIGO.match(/.*Math\.random\s*\(.*/g) || []).slice(0, 2).join(" | "));
  console.log("      " + linhas.length + " linhas de padrão: " + linhas.map((l) => l.trim().slice(0, 40)).join(" · "));
  t("nem `Date.now`, nem `performance.now`, nem `new Date` entram na conta",
    !/Date\.now|performance\.now|new Date\(/.test(FONTE));
  /* e o padrão é real e não decorativo: sem `sorte`, ainda se joga */
  let explodiuPadrao = "";
  try { rolarDisputa({ quem: { ...FORTE }, alvo: { ...FRACO } }); empurrar({ grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: em(FRACO, 5, 5), entidades: [] }); derrubar({ quem: { ...FORTE }, alvo: { ...FRACO } }); }
  catch (e) { explodiuPadrao = e.message; }
  t("as três portas rodam sem `sorte` explícita", explodiuPadrao === "", explodiuPadrao);
  /* e `sorte: null` também não estoura: `sorte = <padrão>` no destructuring
     só cobre `undefined`, e quem fia passa `null` de verdade (um ref que
     ainda não montou). É a mesma lei do `= {}` que não cobre `null`. */
  let explodiuTorta = "";
  for (const torta of [null, 0, "", 7, "dado", {}, [], NaN, true]) {
    try { rolarDisputa({ quem: { ...FORTE }, alvo: { ...FRACO }, sorte: torta }); }
    catch (e) { explodiuTorta += JSON.stringify(torta) + ":" + e.message + " "; }
  }
  t("e uma `sorte` que não é função cai no padrão em vez de estourar", explodiuTorta === "", explodiuTorta);

  /* O MODIFICADOR DECIDE, E DECIDE SEMPRE. Com o mesmo dado nos dois
     lados, o forte vence o fraco em toda a escala do d20 — se um
     `sorte` alto virasse o resultado, a rolagem estaria a somar no lado
     errado, e isso é um erro que nenhum caso isolado apanha. */
  const viradas = [];
  for (let i = 0; i < TABELA_DA_DISPUTA.faces; i++) {
    const s = SEMPRE((i + 0.5) / TABELA_DA_DISPUTA.faces);
    if (rolarDisputa({ quem: { ...FORTE }, alvo: { ...FRACO }, sorte: s }).venceu !== true) viradas.push(String(i));
    if (rolarDisputa({ quem: { ...FRACO }, alvo: { ...FORTE }, sorte: s }).venceu !== false) viradas.push("inv" + i);
  }
  t("com o mesmo dado dos dois lados, o modificador decide — nas 20 faces", viradas.length === 0, viradas.join(", "));
  /* e a conta é PUBLICADA, porque o veredito antes do clique precisa de
     mostrar os dois lados — não basta dizer "não deu" */
  const conta = rolarDisputa({ quem: { ...FORTE }, alvo: { ...FRACO }, sorte: SEMPRE(0.5) });
  t("a disputa publica os dois totais e a conta por extenso",
    Number.isFinite(conta.totalQuem) && Number.isFinite(conta.totalAlvo) && /\d+\s*vs\s*d/.test(conta.conta), conta.conta);
  /* e a conta é DIAGNÓSTICO, não frase de tela: ela diz "d20", que é o
     nome do mecanismo. Quem a mostra ao jogador é quem fia, e a lei do
     "sistema não fala de si mesmo" mora lá — aqui só se guarda que ela
     traz os dois lados, porque um veredito de um lado só não se confere. */
  t("e a conta traz os dois lados, não só o resultado",
    (conta.conta.match(/d\d+/g) || []).length === 2, conta.conta);
}

sec("7. DERRUBAR — o `caido` QUE JÁ EXISTE, e que não empilha");
{
  /* `caido` NASCEU EM `condicoes.js:120` com ícone, turnos e
     desvantagem declarados. Y1 não pode inventar um `prono` ao lado
     dele: seriam duas classificações do mesmo estado, que é a doença
     desta casa. A asserção lê o CATÁLOGO e cobra o id de lá. */
  t("o catálogo tem mesmo o `caido`, e ele é o que a etapa reusa",
    !!CONDICOES.caido && CONDICOES.caido.id === "caido" && condicaoPorId("caido") === CONDICOES.caido);
  t("e a condição vem da TABELA, pelo id — não de uma string no meio do código",
    TABELA_DA_DISPUTA.condicaoDeDerrubar === CONDICOES.caido.id, String(TABELA_DA_DISPUTA.condicaoDeDerrubar));

  const r = derrubar({ quem: { ...FORTE }, alvo: { ...FRACO }, sorte: SEMPRE(0.95) });
  t("o derrube vence contra quem é mais fraco", ganhouADisputa(r) === true && r.ok === true, JSON.stringify(r));
  t("e o desfecho é o que a tabela dos desfechos declara", r.desfecho === DESFECHOS_DA_DISPUTA.derrubou, String(r.desfecho));
  t("ele devolve UMA condição, e ela é o id `caido` do catálogo",
    !!r.condicao && r.condicao.id === CONDICOES.caido.id, JSON.stringify(r.condicao));
  t("e é uma condição que o catálogo conhece — nada inventado entra por esta porta",
    !!condicaoPorId(r.condicao.id));
  /* A INSTÂNCIA É A DE `criarCondicao`: os turnos, o ícone e o rótulo
     saem do catálogo, não de literais escritos em `disputa.js`. Repetir
     o `turnos: 1` de lá seria uma segunda verdade sobre a mesma
     condição, e no dia em que o catálogo mudasse a mesa veria as duas. */
  const modelo = criarCondicao("caido");
  t("a instância é a de `criarCondicao`, campo a campo",
    r.condicao.id === modelo.id && r.condicao.turnos === modelo.turnos
    && r.condicao.icone === modelo.icone && r.condicao.nome === modelo.nome && r.condicao.tipo === modelo.tipo,
    JSON.stringify(r.condicao));
  t("e os turnos não são escritos no código de `disputa.js` — vêm do catálogo",
    !/turnos\s*:/.test(CODIGO), (CODIGO.match(/.*turnos\s*:.*/g) || []).slice(0, 2).join(" | "));
  t("e ela guarda quem derrubou, para a cena saber de quem falar", r.condicao.origem === FORTE.nome, String(r.condicao.origem));

  /* E NÃO EMPILHA. Quem já está no chão não fica "mais no chão"; dois
     `caido` na lista dariam dois turnos de desvantagem por um derrube, e
     o `tickCondicoes` gastaria os dois separados. A verificação vem
     ANTES do dado — rolar para derrubar quem já caiu gastaria a ação do
     jogador num resultado que não podia mudar nada. */
  const oQueJaTinha = criarCondicao("caido", { origem: "a escada" });
  const jaCaido = { ...FRACO, condicoes: [oQueJaTinha] };
  const antes = JSON.stringify(jaCaido);
  const r2 = derrubar({ quem: { ...FORTE }, alvo: jaCaido, sorte: SEMPRE(0.95) });
  t("derrubar quem já está caído NÃO produz um segundo `caido`",
    r2.ok === false && r2.desfecho === DESFECHOS_DA_DISPUTA.jaCaido, JSON.stringify(r2));
  /* E NADA VOLTA EM `condicao`. Devolver a que ele já tinha faria quem
     fia acrescentá-la outra vez — e dois `caido` na lista dariam dois
     turnos de desvantagem por um derrube só, com o `tickCondicoes` a
     gastar os dois em separado. `null` aqui quer dizer "não há nada a
     escrever na ficha", e o desfecho diz o que houve. */
  t("e o que volta NUNCA é um `caido` novo: ou nada, ou o que ele já tinha",
    r2.condicao === null || JSON.stringify(r2.condicao) === JSON.stringify(oQueJaTinha),
    JSON.stringify(r2.condicao));
  t("e em nenhum caso ele nasce com a origem de quem acabou de tentar",
    !r2.condicao || r2.condicao.origem !== FORTE.nome, JSON.stringify(r2.condicao && r2.condicao.origem));
  t("e diz que ele já está no chão, em vez de fingir que derrubou",
    String(r2.motivo).trim().length > 0 && r2.venceu === false, JSON.stringify(r2.motivo));
  t("e não gasta dado nenhum a descobri-lo — a verificação vem antes da rolagem", r2.rolagem === null);
  t("e a ficha de quem já estava caído não é mutada", JSON.stringify(jaCaido) === antes, JSON.stringify(jaCaido));
  /* e a contagem fecha: a lista do alvo continua com UM `caido`, e o
     tombo antigo guarda a origem dele — nada foi sobrescrito */
  t("a lista do alvo continua com um `caido` só, e com a origem antiga",
    jaCaido.condicoes.filter((c) => c.id === CONDICOES.caido.id).length === 1
    && jaCaido.condicoes[0].origem === "a escada");
  /* e a que SE APLICA a quem não estava caído continua a ser nova e a
     dizer quem o derrubou — senão a asserção de cima passaria por um
     módulo que nunca aplica nada */
  t("e quem NÃO estava caído continua a receber um `caido` novo, com a origem certa",
    !!r.condicao && r.condicao.id === CONDICOES.caido.id && r.condicao.origem === FORTE.nome,
    JSON.stringify(r.condicao));

  /* A DERROTA NÃO APLICA NADA. Um derrube perdido que ainda pusesse a
     condição seria o pior tipo de bug: silencioso e a favor de quem
     ataca. */
  const perdeu = derrubar({ quem: { ...FRACO }, alvo: { ...FORTE }, sorte: SEMPRE(0.5) });
  t("o derrube perdido não aplica condição nenhuma",
    ganhouADisputa(perdeu) === false && perdeu.condicao === null && perdeu.desfecho === DESFECHOS_DA_DISPUTA.resistiu,
    JSON.stringify(perdeu));

  /* O PORTÃO DE TAMANHO VALE PARA OS DOIS VERBOS — é um motor só. */
  const grandeDemais = derrubar({ quem: { ...FORTE, tamanho: "medio" }, alvo: { ...FRACO, tamanho: "imenso" }, sorte: SEMPRE(0.99) });
  t("derrubar respeita o mesmo portão de tamanho que empurrar",
    grandeDemais.ok === false && grandeDemais.condicao === null && grandeDemais.desfecho === DESFECHOS_DA_DISPUTA.impedido,
    JSON.stringify(grandeDemais));
  const empurraoGrande = empurrar({ grade: TAVERNA, quem: em({ ...FORTE, tamanho: "medio" }, 5, 6), alvo: em({ ...FRACO, tamanho: "imenso" }, 5, 5), entidades: [], sorte: SEMPRE(0.99) });
  t("e o empurrão barrado pelo tamanho não move ninguém",
    empurraoGrande.ok === false && empurraoGrande.desfecho === DESFECHOS_DA_DISPUTA.impedido && empurraoGrande.para === null,
    JSON.stringify(empurraoGrande));
  t("e a recusa por tamanho diz o porquê, em frase",
    String(empurraoGrande.motivo || "").trim().length > 0 && String(grandeDemais.motivo || "").trim().length > 0,
    `${empurraoGrande.motivo} | ${grandeDemais.motivo}`);

  /* OS DESFECHOS SÃO OS DA TABELA. Um desfecho escrito à mão dentro da
     função seria um estado que a tela não sabe desenhar. */
  const declarados = Object.values(DESFECHOS_DA_DISPUTA);
  const vistos = [r, r2, perdeu, grandeDemais, empurraoGrande].map((x) => x.desfecho);
  t("todo desfecho devolvido está declarado em `DESFECHOS_DA_DISPUTA`",
    vistos.every((v) => declarados.includes(v)),
    `vistos: ${vistos.join(", ")} · declarados: ${declarados.join(", ")}`);
  /* e todo desfecho declarado é ALCANÇÁVEL: uma linha que nenhuma porta
     produz é uma regra escrita sem código atrás, que é o que os
     varredores desta casa existem para acusar */
  const semCaminho = declarados.filter((d) => !vistos.includes(d) && d !== DESFECHOS_DA_DISPUTA.empurrou && d !== DESFECHOS_DA_DISPUTA.bloqueado);
  t("e nenhum desfecho declarado fica sem caminho (os dois do empurrão estão na seção 5)",
    semCaminho.length === 0, semCaminho.join(", "));
}

sec("8. NÃO CONFUNDIR COM O HOMÓNIMO — `caido` prono não é `caido` a 0 PV");
{
  /* `src/queda.js` tem `GOLPE_NO_CAIDO` e ali "caído" quer dizer
     INCONSCIENTE A 0 PV (a fase Q). Aqui quer dizer prono, de pé no
     lugar errado, e o corpo continua a agir. São duas mecânicas com a
     mesma palavra, e esta seção existe para que a próxima pessoa não as
     funda por causa disso. Proibir o import é a forma mais barata de o
     dizer: no dia em que alguém quiser juntá-las, tem de passar por
     aqui e escrever o porquê. */
  t("`disputa.js` NÃO importa `queda.js`", !/from\s+["']\.\/queda\.js["']/.test(FONTE));
  t("e não nomeia `GOLPE_NO_CAIDO` nem `quedaAoChegarAZero`",
    !/GOLPE_NO_CAIDO|quedaAoChegarAZero|falhasDoGolpeNoCaido/.test(FONTE));
  /* a prova positiva do mesmo facto: o `caido` do derrube vem do
     CATÁLOGO de condições, que é outra coisa de outro arquivo */
  t("o `caido` que Y1 aplica vem de `condicoes.js`, e o import está lá",
    /from\s+["']\.\/condicoes\.js["']/.test(FONTE));
  /* e o módulo importa o tabuleiro, porque empurrar é mover alguém que
     não quer — e quem é dono da posição é o grid */
  t("e importa `grid.js`, porque empurrar é mover alguém que não quer",
    /from\s+["']\.\/grid\.js["']/.test(FONTE));
  /* nem o caminho inverso: `queda.js` continua tabela pura e sem saber
     que a disputa existe. Um ciclo entre os dois deixaria a ordem de
     avaliação decidir quem nasce primeiro — a bomba silenciosa de
     `degraus.js`. */
  t("`queda.js` não ganhou uma seta de volta para a disputa",
    !/disputa/i.test(readFileSync(RAIZ + "queda.js", "utf8")));
  /* e `grid.js` não importa `disputa.js`: a seta aponta num sentido só */
  t("e `grid.js` não importa `disputa.js` — a seta aponta num sentido só",
    !/from\s+["']\.\/disputa\.js["']/.test(FONTE_GRID));
}

sec("9. OS NÚMEROS SAEM DE TABELA — e as funções leem de lá");
{
  /* "SE É NÚMERO, É TABELA" vale para o teste também: a asserção lê a
     tabela de volta e compara com o COMPORTAMENTO, em vez de recopiar o
     1 e o 1,5. Uma suíte que recopiasse continuaria verde no dia em que
     a tabela mudasse sem ninguém querer. */
  const numeros = Object.entries(TABELA_DA_DISPUTA).filter(([, v]) => typeof v === "number");
  t("todo número da tabela da disputa é finito", numeros.every(([, v]) => Number.isFinite(v)), JSON.stringify(numeros));
  t("e os da tabela do tabuleiro também",
    Object.values(EMPURRAO_NO_TABULEIRO).filter((v) => typeof v === "number").every((v) => Number.isFinite(v) && v >= 0),
    JSON.stringify(EMPURRAO_NO_TABULEIRO));

  /* AS FUNÇÕES LEEM A TABELA — a prova é o TEXTO delas. Uma função que
     acerta o número sem citar a tabela acertou por coincidência, e a
     coincidência quebra na primeira mudança de linha. O módulo usa o
     apelido `T`, declarado uma vez no topo; por isso a asserção cobra o
     apelido E a declaração dele. */
  t("se há apelido de tabela no módulo, ele é mesmo a tabela",
    !/^const T = /m.test(CODIGO) || /^const T = TABELA_DA_DISPUTA;$/m.test(FONTE));
  t("`podeDisputar` lê o degrau da tabela",
    daTabela("degrauMaximo").test(String(podeDisputar)), String(podeDisputar).slice(0, 160));
  t("`rolarDisputa` lê as faces e a linha do ataque na tabela",
    daTabela("faces").test(String(rolarDisputa)) && daTabela("ataque").test(String(rolarDisputa)),
    String(rolarDisputa).slice(0, 160));
  t("`derrubar` lê o id da condição da tabela",
    daTabela("condicaoDeDerrubar").test(String(derrubar)), String(derrubar).slice(0, 160));
  t("`deslocarForcado` lê as casas E a ordem dos bloqueios de `EMPURRAO_NO_TABULEIRO`",
    /EMPURRAO_NO_TABULEIRO\.casas/.test(String(deslocarForcado))
    && /EMPURRAO_NO_TABULEIRO\.bloqueios/.test(String(deslocarForcado)), String(deslocarForcado).slice(0, 200));
  /* e o empurrão do módulo não crava o número: sem `casas`, `deslocarForcado`
     anda o do tabuleiro, e é da tabela que ele o vai buscar */
  t("sem `casas`, o deslocamento forçado anda o que a tabela do tabuleiro declara",
    deslocarForcado(TAVERNA, em(FRACO, 5, 5), { x: 0, y: -1 }, null, {}).casasAndadas === EMPURRAO_NO_TABULEIRO.casas);
  t("e o portão sai da `ESCADA` de `grid.js`, não de uma lista própria",
    /\bESCADA\b/.test(FONTE) && !/miudo|pequeno.*medio.*grande/i.test(FONTE.replace(/\/\*[\s\S]*?\*\//g, "")));

  /* O 1,5 M NÃO É ESCRITO EM LADO NENHUM: ele é `q2m(casas)`, e
     `METROS_POR_QUADRADO` é quem o declara. Se a casa passar a valer
     outra coisa, o empurrão acompanha sozinho. */
  const semComentarios = FONTE.replace(/\/\*[\s\S]*?\*\//g, "");
  t("o metro do empurrão é derivado, não cravado — nenhum `1,5` no código",
    !/\b1[.,]5\b/.test(semComentarios), (semComentarios.match(/.*\b1[.,]5\b.*/g) || []).slice(0, 2).join(" | "));
  /* O `20` MORA NA TABELA — é exatamente onde ele deve estar, na linha
     `faces`. O que não pode é aparecer uma SEGUNDA vez, cravado numa
     conta: aí haveria duas verdades sobre o mesmo dado, e mudar o d20
     um dia mudaria metade das rolagens. */
  const vintes = semComentarios.split("\n").filter((l) => /\b20\b/.test(l));
  t("o `20` aparece uma vez só, e na linha `faces` da tabela",
    vintes.length === 1 && /faces\s*:/.test(vintes[0]), vintes.map((l) => l.trim()).join(" | "));
  t("e o dado é rolado pelas faces da tabela, não por um literal",
    /sorte\(\)\s*\*\s*(?:T|TABELA_DA_DISPUTA)\.faces/.test(semComentarios),
    (semComentarios.match(/.*sorte\(\).*/g) || []).slice(0, 2).join(" | "));

  /* E OS DOIS VERBOS CONCORDAM COM A DISPUTA QUE OS MOVE. A etapa
     inteira existe para que sejam UM motor com dois desfechos; se as
     três portas divergissem com a mesma sorte, haveria três regras. */
  const divergem = [];
  for (const v of [0.05, 0.25, 0.5, 0.75, 0.95]) {
    const a = rolarDisputa({ quem: { ...FORTE }, alvo: { ...GEMEO }, sorte: SEMPRE(v) });
    const b = empurrar({ grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: em(GEMEO, 5, 5), entidades: [], sorte: SEMPRE(v) });
    const c = derrubar({ quem: { ...FORTE }, alvo: { ...GEMEO }, sorte: SEMPRE(v) });
    if (a.venceu !== ganhouADisputa(b) || a.venceu !== ganhouADisputa(c)) divergem.push(`${v}: ${a.venceu}/${ganhouADisputa(b)}/${ganhouADisputa(c)}`);
  }
  t("com a mesma sorte, os dois verbos concordam com a disputa que os move", divergem.length === 0, divergem.join(" | "));
}

sec("10. LIXO E IMUTABILIDADE — nada disto pode custar o turno");
{
  /* Quem chama isto chama do meio de uma rodada, com o que a mesa, o
     save e o envelope da IA mandarem. Um órgão que estoura no turno é
     exatamente o que a casa proíbe — e `= {}` no destructuring NÃO cobre
     `null`, por isso `null` entra na lista ao lado de `{}`. */
  const LIXO = [undefined, null, {}, 0, [], "", "texto", 7, true, NaN,
    { quem: null, alvo: null }, { quem: FORTE }, { alvo: FRACO },
    { quem: FORTE, alvo: FRACO, sorte: null }, { quem: FORTE, alvo: FRACO, sorte: 7 },
    { quem: FORTE, alvo: FRACO, sorte: "dado" }, { quem: {}, alvo: {} }, { quem: [], alvo: [] }];
  for (const [nome, fn] of [["rolarDisputa", rolarDisputa], ["derrubar", derrubar]]) {
    let explodiu = "";
    const forma = [];
    for (const l of LIXO) {
      try { const r = fn(l); if (!r || typeof r !== "object" || typeof r.ok !== "boolean") forma.push(JSON.stringify(l)); }
      catch (e) { explodiu += JSON.stringify(l) + ":" + e.message + " "; }
    }
    t(`nenhum lixo explode em \`${nome}\``, explodiu === "", explodiu);
    t(`e \`${nome}\` devolve sempre a forma, nunca \`null\``, forma.length === 0, forma.join(", "));
  }
  let explodiuE = "";
  const formaE = [];
  for (const l of [...LIXO, { grade: null, quem: FORTE, alvo: FRACO, entidades: null },
    { grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: em(FRACO, 5, 5), entidades: null },
    { grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: FRACO, entidades: [] },
    { grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: em(FRACO, 5, 5), entidades: "nao é lista" },
    { grade: {}, quem: em(FORTE, 5, 6), alvo: em(FRACO, 5, 5), entidades: [null, undefined, {}] }]) {
    try { const r = empurrar(l); if (!r || typeof r.ok !== "boolean" || typeof r.desfecho !== "string") formaE.push(JSON.stringify(l)); }
    catch (e) { explodiuE += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode em `empurrar` — nem grade nula, nem entidades nulas", explodiuE === "", explodiuE);
  t("e `empurrar` devolve sempre o desfecho, nunca `null`", formaE.length === 0, formaE.join(", "));
  /* quem chega à luta sem `x`/`y` existe de verdade — X3b/X4 mediram-no,
     e não é este módulo que o conserta; aqui ele só não pode custar o turno */
  const semLugar = empurrar({ grade: TAVERNA, quem: em(FORTE, 5, 6), alvo: { ...FRACO }, entidades: [], sorte: SEMPRE(0.95) });
  t("quem não está no tabuleiro não é empurrado, e não derruba a cena",
    semLugar.ok === false && semLugar.para === null && String(semLugar.motivo || "").trim().length > 0, JSON.stringify(semLugar));

  /* IMUTABILIDADE: estado é substituído, nunca mutado. E um motor que
     muta o alvo não pode ser chamado duas vezes para mostrar o preço
     antes do clique — que é lei desta casa. */
  const quem = em(FORTE, 5, 6), alvo = em(FRACO, 5, 5), extra = em({ ...FRACO, nome: "Outro" }, 1, 1);
  const lista = [quem, alvo, extra];
  const antes = JSON.stringify(lista);
  empurrar({ grade: TAVERNA, quem, alvo, entidades: lista, sorte: SEMPRE(0.95) });
  derrubar({ quem, alvo, sorte: SEMPRE(0.95) });
  rolarDisputa({ quem, alvo, sorte: SEMPRE(0.95) });
  podeDisputar(quem, alvo);
  t("nenhuma das quatro portas escreve dentro das fichas", JSON.stringify(lista) === antes, JSON.stringify(lista));
  t("e a lista de entidades também não é tocada", lista.length === 3);
  t("a mesma pergunta com a mesma sorte dá a mesma resposta",
    JSON.stringify(empurrar({ grade: TAVERNA, quem, alvo, entidades: lista, sorte: SEMPRE(0.95) }))
    === JSON.stringify(empurrar({ grade: TAVERNA, quem, alvo, entidades: lista, sorte: SEMPRE(0.95) })));

  /* SEM TERRENO, TUDO SE COMPORTA COMO ANTES — a regra de ouro de
     `grid.js`, que o empurrão herda por ser movimento. */
  const semGrade = empurrar({ grade: null, quem, alvo, entidades: lista, sorte: SEMPRE(0.95) });
  t("sem grade, o empurrão resolve a disputa e move — sem parede nem borda a culpar",
    semGrade.ok === true && semGrade.bloqueio === null && semGrade.casas === EMPURRAO_NO_TABULEIRO.casas,
    JSON.stringify(semGrade));

  /* E A GRADE NÃO É MUTADA: `montarGrade` devolve arrays, e um empurrão
     que escrevesse neles mudaria o terreno da luta a cada empurrão. */
  const antesGrade = JSON.stringify(TAVERNA);
  empurrar({ grade: TAVERNA, quem, alvo, entidades: lista, sorte: SEMPRE(0.95) });
  t("e o terreno da luta sai intacto do empurrão", JSON.stringify(TAVERNA) === antesGrade);
  t("a grade continua a ser a planta real (e `garantirGrade` a aceita)", !!garantirGrade(TAVERNA));

  /* A DÍVIDA CONHECIDA, escrita e não escondida: Y1 é módulo puro, e
     nada disto chega à tela ainda. A fiação no `App.jsx` (e o botão que
     deixa de escrever uma frase e passa a chamar a porta) é a etapa
     seguinte — enquanto ela não existir, `ACOES_PRONTAS` continua a
     mandar "Empurro com força" para a IA como ficção. */
  const APP = readFileSync(RAIZ + "App.jsx", "utf8");
  if (!/from\s+["']\.\/disputa\.js["']/.test(APP)) {
    pendente("o App ainda não importa `disputa.js`", "Y1 é o motor; a fiação e o botão são a etapa seguinte da Fase Y");
  } else {
    t("o App já importa `disputa.js` — e então a fiação precisa da sua própria suíte", true);
  }
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
