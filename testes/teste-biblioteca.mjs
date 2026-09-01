/* teste-biblioteca.mjs (v9.86) — o repertório de formas.

   Quatro metades, e a última é a que importa: o CATÁLOGO (toda entrada é
   completa e nenhuma mente sobre si), a CONSULTA (os vetos cortam, a
   memória não deixa repetir, o holofote pesa), a CENA COMUM (a forma
   chega ao turno que se repete) e a GARANTIA DE LEITOR — todo campo que
   um `quando` lê tem de ser produzido por `garantirSituacao` E entregue
   pelo App.

   Essa última é a prova que teria pego o `m.ativa` da v9.71 e o
   `npcs[cidade].gente` da v9.73 sem ninguém precisar jogar: as duas
   eram regras lendo um campo que o chamador nunca mandou. */
import {
  ESCOLAS, JOGADAS, VETOS, NAO_REPETIR, escolaPorId, jogadaPorId,
  garantirSituacao, garantirEstante, marcarJogada, consultarBiblioteca,
  trechoDaJogada, linhaDaJogada,
  CADENCIA_DA_CENA, exigenciaDe, EXIGENCIAS, podeFormaDeCena, contarTurnoDeCena, zerarCadenciaDaCena, envelopeDaCena,
} from "../src/biblioteca.js";
import { PILARES } from "../src/mestria.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const dado = (v) => () => v;
/* o histórico ligado é o estado NORMAL de uma campanha em curso; as travas
   por falta dele têm seção própria, e sem isto toda cena aqui perderia as
   formas de colheita por um motivo que não é o que a seção mede */
const viva = (sit) => ({ temGenteConhecida: true, temPassado: true, ...sit });

sec("1. O CATÁLOGO — toda entrada é completa");
{
  /* Com trinta e sete formas e uma janela de seis, a nona cena já era uma
     repetição inevitável: repertório pequeno repete por aritmética, não
     por descuido. */
  t(`há repertório de verdade (${JOGADAS.length} formas)`, JOGADAS.length >= 150);
  const ids = JOGADAS.map((j) => j.id);
  t("nenhum id repetido", new Set(ids).size === ids.length);
  const pilares = new Set(PILARES.map((p) => p.id));
  let completas = 0, escolaOk = 0, serveOk = 0, curtas = 0;
  for (const j of JOGADAS) {
    if (j.id && j.forma && j.evite && Number(j.peso) > 0 && typeof j.quando === "function") completas++;
    if (escolaPorId(j.escola)) escolaOk++;
    if (pilares.has(j.serve)) serveOk++;
    /* a forma é uma INSTRUÇÃO, não um parágrafo: ela viaja dentro de um
       envelope que já é longo, e uma forma de mil caracteres devolve pelo
       envelope o token que este arquivo economiza por não estar no prompt */
    if (j.forma.length <= 240 && j.evite.length <= 160) curtas++;
  }
  t("todas têm os cinco campos", completas === JOGADAS.length);
  t("todas apontam para uma escola que existe", escolaOk === JOGADAS.length);
  t("todas servem a um pilar do jogo", serveOk === JOGADAS.length);
  t("todas cabem num envelope", curtas === JOGADAS.length);
  t("jogadaPorId acha e não inventa", jogadaPorId(ids[0]) !== null && jogadaPorId("nao_existe") === null);
  t(`as escolas são muitas (${ESCOLAS.length})`, ESCOLAS.length >= 8);
  t("e cada uma diz de onde vem", ESCOLAS.every((e) => e.id && e.nome && e.da));

  const comSozinha = JOGADAS.filter((j) => j.sozinha).length;
  t(`há formas que funcionam sem fio atrás (${comSozinha})`, comSozinha >= 30);
  const comPrecisa = JOGADAS.filter((j) => j.precisa).length;
  t(`e formas que o sistema tranca por falta de histórico (${comPrecisa})`, comPrecisa >= 8);
  /* os valores nao ficam cravados aqui: a v9.87 partiu "passado" em tres
     memorias distintas, e um teste que lista os valores a mao reprova toda
     exigencia nova em vez de cobrar a linha dela na tabela. Quem cobra a
     tabela e teste-gesto.mjs, que e o lugar certo. */
  t("todo `precisa` tem linha na tabela de exigências", JOGADAS.every((j) => !j.precisa || !!exigenciaDe(j.precisa)));

  /* O `evite` é metade do valor de cada entrada: toda forma tem UM jeito
     característico de sair errada, e é sempre o mesmo. Um `evite` que só
     repete a forma ao contrário não ensina nada. */
  const proibem = JOGADAS.filter((j) => /^n[ãa]o /i.test(j.evite)).length;
  t("todo `evite` é uma proibição concreta", proibem === JOGADAS.length);

  /* e nenhuma forma pode mandar a IA INVENTAR o que o jogo guarda: item,
     moeda, nome de gente nova e trama são de outros donos */
  const inventa = JOGADAS.filter((j) => /(invente|crie) (um|uma) (npc|personagem|trama|miss)/i.test(j.forma));
  t("nenhuma forma manda inventar o que é do sistema", inventa.length === 0);

  /* AS QUE DEPENDEM DE HISTÓRICO não delegam mais a pergunta. Até a v9.85
     o `evite` mandava a IA "escolher outra forma se não houver" — e
     delegar a ela a pergunta "existe passado nesta campanha?" é exatamente
     o que esta casa não faz: quem sabe é o sistema, porque o registro de
     pessoas e os feitos do arco estão do lado de cá. */
  for (const id of ["rosto_conhecido", "espelho", "eco"]) {
    const j = jogadaPorId(id);
    t(`${id}: é trancada pelo sistema, não pela IA`, !!j.precisa);
    t(`${id}: e não delega mais a pergunta`, !/escolha outra forma/i.test(j.evite + j.forma));
  }

  /* variedade de verdade: uma família que domina o acervo faz o
     Bibliotecário repetir por dentro mesmo tendo muitas entradas */
  const porEscola = {};
  for (const j of JOGADAS) porEscola[j.escola] = (porEscola[j.escola] || 0) + 1;
  const maior = Math.max(...Object.values(porEscola));
  t(`nenhuma escola domina (maior: ${maior} de ${JOGADAS.length})`, maior < JOGADAS.length * 0.35);
  const porPilar = {};
  for (const j of JOGADAS) porPilar[j.serve] = (porPilar[j.serve] || 0) + 1;
  t("os três pilares têm repertório", PILARES.every((p) => (porPilar[p.id] || 0) >= 15));
}

sec("2. A SITUAÇÃO — normaliza lixo sem quebrar");
{
  const s = garantirSituacao(null);
  t("sem vilão a fase é -1", s.ordemDaFase === -1);
  t("o momento começa em zero", s.momento === 0);
  t("a mesa começa morna", s.temperatura === "morna");
  t("o nível mínimo é 1", s.nivel === 1);
  t("e sem histórico até dizerem o contrário", s.temPassado === false && s.temGenteConhecida === false);
  const sujo = garantirSituacao({ momento: 99, nivel: "abc", temperatura: 7, ordemDaFase: "3" });
  t("momento acima de 1 é aparado", sujo.momento === 1);
  t("nível não-numérico vira 1", sujo.nivel === 1);
  t("temperatura não-texto vira morna", sujo.temperatura === "morna");
  t("mas número em texto é aceito", sujo.ordemDaFase === 3);
  t("momento negativo é aparado", garantirSituacao({ momento: -5 }).momento === 0);
}

sec("3. OS VETOS — onde uma forma boa é a forma errada");
{
  const abertas = (sit) => {
    const s = garantirSituacao(viva(sit));
    const vetos = VETOS.filter((v) => v.quando(s));
    return JOGADAS.filter((j) => j.quando(s) && !vetos.some((v) => v.corta(j, s)));
  };
  /* SEM VILÃO NÃO HÁ OUTRO LADO. Pedir a forma do inimigo quando não
     existe inimigo é pedir à IA que invente um — que é exatamente o que o
     sistema de vilão veio impedir. */
  const semVilao = abertas({ emCidade: true, ordemDaFase: -1 }).map((j) => j.id);
  for (const id of ["cortesia", "oferta_justa", "espelho", "nao_esta_errado", "poupar", "presente", "elogio"]) {
    t(`sem vilão, "${id}" não abre`, !semVilao.includes(id));
  }
  /* ANTES DO ROSTO ele não aparece: quem apareceu foi a mão dele */
  const antes = abertas({ emCidade: true, ordemDaFase: 4, vilaoConhecido: false }).map((j) => j.id);
  t("antes da revelação, sem espelho", !antes.includes("espelho"));
  t("antes da revelação, sem poupar", !antes.includes("poupar"));
  t("antes da revelação, sem porta aberta", !antes.includes("porta_aberta"));
  const depois = abertas({ emCidade: true, ordemDaFase: 4, vilaoConhecido: true, momento: 0.6 }).map((j) => j.id);
  t("depois da revelação, o espelho abre", depois.includes("espelho"));

  /* NO MEIO DA BRASA não se respira e não se planta */
  const brasa = abertas({ temperatura: "brasa", emCombate: true, emCidade: true, momento: 0.5 }).map((j) => j.id);
  t("em brasa, sem cena calma", !brasa.includes("calmaria_com_dente"));
  t("em brasa, sem riso", !brasa.includes("riso_verdadeiro"));
  t("em brasa, sem silêncio confortável", !brasa.includes("silencio_bom"));
  t("em combate, sem plantio", !brasa.includes("detalhe_solto") && !brasa.includes("nome_repetido"));
  t("em combate, sem mundo de fundo", !brasa.includes("vida_que_continua"));
  t("mas em combate a saída visível abre", brasa.includes("saida_visivel"));

  /* e a fama tem de estar na régua CERTA: fama vai a 100 nesta casa, e a
     primeira versão desta jogada pedia 3 — um desconhecido no dia 1 teria
     a própria lenda contada torta antes de ter feito qualquer coisa */
  const cru = abertas({ emCidade: true, fama: 4, nivel: 1 }).map((j) => j.id);
  t("fama 4 não faz o nome chegar antes", !cru.includes("fama_chega_antes"));
  t("fama 25 faz", abertas({ emCidade: true, fama: 25, nivel: 1 }).map((j) => j.id).includes("fama_chega_antes"));
}

sec("4. A CONSULTA — sempre uma, nunca uma lista");
{
  const sit = viva({ emCidade: true, momento: 0.4, temperatura: "morna", nivel: 3 });
  const j = consultarBiblioteca(sit, { sorte: dado(0.5) });
  t("devolve uma jogada", !!j && !!j.forma);
  t("com o modo de falhar junto", !!j.evite);
  t("e nunca uma lista", !Array.isArray(j));

  /* COBERTURA: uma situação sem forma nenhuma aberta volta ao
     comportamento de antes, que é aceitável — mas não pode ser o caso
     comum, senão o arquivo inteiro não faz nada */
  const cenarios = [
    { rot: "nível 1, cidade, sem vilão", sit: { emCidade: true, nivel: 1 } },
    { rot: "estrada", sit: { emViagem: true, momento: 0.3 } },
    { rot: "masmorra", sit: { emMasmorra: true, momento: 0.5 } },
    { rot: "combate", sit: { emCombate: true, temperatura: "brasa", momento: 0.6 } },
    { rot: "fim de arco com vilão", sit: { emCidade: true, ordemDaFase: 5, vilaoConhecido: true, momento: 1 } },
    { rot: "mesa fria em cidade", sit: { emCidade: true, temperatura: "fria", pessoaNaCena: true } },
    { rot: "noite na estrada", sit: { emViagem: true, noite: true, temGrupo: true } },
    { rot: "o nada: sem cidade, sem vilão, começo", sit: {} },
    { rot: "campanha de dois dias, sem histórico", sit: { emCidade: true, temGenteConhecida: false, temPassado: false } },
  ];
  for (const c of cenarios) {
    const r = consultarBiblioteca(viva(c.sit), { sorte: dado(0.5) });
    t(`${c.rot}: há forma disponível`, !!r);
  }

  /* A MEMÓRIA DA ESTANTE: uma forma repetida vira tique, e tique é pior
     que a monotonia que ele veio curar. */
  let est = garantirEstante(null);
  const saiu = [];
  let i = 0;
  for (let k = 0; k < 20; k++) {
    const r = consultarBiblioteca(sit, { sorte: () => ((i++ * 0.137) % 1), estante: est });
    if (!r) break;
    saiu.push(r.id);
    est = marcarJogada(est, r.id);
  }
  t("vinte consultas seguidas devolvem vinte formas", saiu.length === 20);
  let repetiuPerto = false;
  for (let k = 1; k < saiu.length; k++) {
    if (saiu.slice(Math.max(0, k - NAO_REPETIR), k).includes(saiu[k])) repetiuPerto = true;
  }
  t("nenhuma se repete dentro da janela", !repetiuPerto);
  t(`e houve variedade de verdade (${new Set(saiu).size} de 20)`, new Set(saiu).size >= 17);
  t("a estante não cresce sem fim", garantirEstante({ usadas: new Array(50).fill("x") }).usadas.length === 16);

  /* O HOLOFOTE pesa, e pesa sem obrigar: forçar o pilar faminto todo
     turno faria o holofote girar por dever, e girar por dever aparece. */
  const conta = (pref) => {
    let n = 0;
    for (let k = 0; k < 400; k++) {
      /* SEM `pessoaNaCena`: com ele a afinidade "onde_eu_estou" já favorece
         fala e vínculo, o social sai perto de 60% sem preferência nenhuma,
         e dobrar um peso não dobra um resultado que já está no teto. A
         medida com ele media saturação, não o holofote — e reprovaria a
         tabela de afinidades por um efeito que é dela. */
      const r = consultarBiblioteca(sit, { sorte: () => (k * 0.0173) % 1, preferir: pref });
      if (r && r.serve === "social") n++;
    }
    return n;
  };
  const semPref = conta(null), comPref = conta("social");
  t(`preferir social sobe o social (${semPref} → ${comPref})`, comPref > semPref * 1.3);
  t("mas não zera o resto", comPref < 400);
}

sec("4b. O HISTÓRICO É DO SISTEMA, NÃO DA IA");
{
  const ids = (sit) => {
    const s = garantirSituacao(sit);
    const vetos = VETOS.filter((v) => v.quando(s));
    return JOGADAS.filter((j) => j.quando(s) && !vetos.some((v) => v.corta(j, s))).map((j) => j.id);
  };
  const base = { emCidade: true, pessoaNaCena: true, momento: 0.6, ordemDaFase: 4, vilaoConhecido: true, temCicatriz: true };
  const cru = ids(base);
  t("campanha sem gente registrada: sem rosto conhecido", !cru.includes("rosto_conhecido"));
  t("e sem colheita nenhuma", !cru.includes("retorno_torto") && !cru.includes("eco"));
  const cheia = ids({ ...base, temGenteConhecida: true, temPassado: true });
  t("com gente registrada, o rosto conhecido abre", cheia.includes("rosto_conhecido"));
  t("com passado, a colheita abre", cheia.includes("retorno_torto"));
  t("e o espelho abre", cheia.includes("espelho"));
  /* as duas travas são separadas: ter conhecido gente não é ter vivido */
  const soGente = ids({ ...base, temGenteConhecida: true });
  t("gente e passado são travas independentes", soGente.includes("rosto_conhecido") && !soGente.includes("retorno_torto"));
}

sec("4c. A CENA COMUM — a forma chega ao turno que se repete");
{
  /* O Bibliotecário nascia falando só nos três envelopes de iniciativa, e
     eles são raros de propósito: a forma chegava a um turno em cada dez, e
     os outros nove — a maior parte do jogo — continuavam como antes. E é
     neles que a repetição aparece, porque são eles que se repetem. */
  const sit = viva({ emCidade: true, momento: 0.4, temperatura: "morna", nivel: 3, pessoaNaCena: true });
  let est = garantirEstante(null);
  t("no primeiro turno ainda não", podeFormaDeCena(sit, est).pode === false);
  for (let i = 0; i < CADENCIA_DA_CENA; i++) est = contarTurnoDeCena(est);
  t(`depois de ${CADENCIA_DA_CENA} turnos, pode`, podeFormaDeCena(sit, est).pode === true);
  t("e o motivo da espera é dito", /faltam \d+ turnos/.test(podeFormaDeCena(sit, garantirEstante(null)).porque));
  t("zerar reinicia a contagem", podeFormaDeCena(sit, zerarCadenciaDaCena(est)).pode === false);

  /* em luta o turno já vem cheio de voz de sistema: dizer à IA como compor
     a cena enquanto o sistema resolve iniciativa, dano e posição é
     atropelar a única parte que ainda era dela */
  t("em combate, nunca", podeFormaDeCena({ ...sit, emCombate: true }, est).pode === false);
  t("em brasa, nunca", podeFormaDeCena({ ...sit, temperatura: "brasa" }, est).pode === false);

  /* SÓ AS `sozinha`: "termine com duas portas abertas" funciona sem fio
     nenhum atrás; "faça isto chegar por um mensageiro" não funciona sem o
     isto — e pedi-la num turno vazio é pedir à IA que invente o isto */
  let e2 = garantirEstante(null);
  const so = [];
  for (let i = 0; i < 12; i++) {
    const j = consultarBiblioteca(sit, { sorte: () => (i * 0.191) % 1, estante: e2, soSozinhas: true });
    if (!j) break;
    so.push(j); e2 = marcarJogada(e2, j.id);
  }
  t("o canal da cena devolve doze formas", so.length === 12);
  t("e todas funcionam sem fio atrás", so.every((j) => j.sozinha));
  t("sem repetir", new Set(so.map((j) => j.id)).size === 12);
  t("o canal aberto é menor que o acervo", JOGADAS.filter((j) => j.sozinha).length < JOGADAS.length);

  const env = envelopeDaCena(so[0]);
  t("o envelope da cena traz a forma", env.includes(so[0].forma));
  /* ele é mais leve que os de iniciativa de propósito: aqueles carregam um
     FATO e por isso podem mandar; este não carrega fato nenhum, só molda */
  t("e diz que não é acontecimento", /NÃO é um acontecimento/.test(env));
  t("proíbe abrir trama", /NÃO abra trama nova/.test(env));
  t("proíbe inventar o que é do sistema", /NÃO invente missão, item, moeda/.test(env));
  t("e proíbe mencionar a escolha", /NÃO mencione que houve uma escolha de forma/.test(env));
  t("sem jogada, sem envelope", envelopeDaCena(null) === "");
}

sec("5. O QUE SOBE AO PROMPT — a forma, nunca a etiqueta");
{
  const j = consultarBiblioteca(viva({ emCidade: true, momento: 0.5 }), { sorte: dado(0.5) });
  const tr = trechoDaJogada(j);
  t("o trecho traz a forma", tr.includes(j.forma));
  t("e o que evitar", tr.includes(j.evite));
  /* uma IA que sabe que está fazendo "o mensageiro" escreve o mensageiro
     genérico que ela já viu mil vezes. É a mesma razão pela qual o nome da
     etapa do arco parou de subir na v9.84. */
  t("o id da jogada NÃO viaja", !tr.includes(j.id));
  t("nem o nome da escola", !ESCOLAS.some((e) => tr.includes(e.nome)));
  t("a forma é obrigatória, não sugestão", /obrigat[óo]ria/i.test(tr));
  t("sem jogada, sem trecho", trechoDaJogada(null) === "");
  t("o jogador não vê nada", linhaDaJogada() === "");

  /* e nenhuma forma pode nomear mecânica: a régua da casa é que o sistema
     não fala de si mesmo dentro da ficção */
  const vaza = JOGADAS.filter((x) => /\b(PV|PM|d20|rolagem|CD \d|teste de)\b/i.test(x.forma + x.evite));
  t("nenhuma forma nomeia mecânica", vaza.length === 0);
  /* nem pode mexer na ficha: item, moeda, dano e inventário são do sistema,
     e uma forma que manda a IA tirar equipamento reabre o buraco que a
     cobrança fechou */
  const mexe = JOGADAS.filter((x) => /(tire|remova|quebre) (meu|minha|o meu)/i.test(x.forma));
  t("nenhuma forma mexe na minha ficha", mexe.length === 0);
}

sec("6. A GARANTIA DE LEITOR — todo campo lido é um campo entregue");
{
  /* Esta seção é a razão de o arquivo existir do jeito que existe. O
     `m.ativa` da v9.71 e o `npcs[cidade].gente` da v9.73 eram a MESMA
     coisa: uma regra lendo um campo que o chamador nunca mandou. Não
     quebram nada, não aparecem em teste de módulo, só nunca acontecem. */
  const est = fs.readFileSync("../src/estante.js", "utf8");
  const bib = fs.readFileSync("../src/biblioteca.js", "utf8");
  const app = fs.readFileSync("../src/App.jsx", "utf8");

  /* 1) o que os `quando` leem */
  const corpo = est.split("export const JOGADAS")[1];
  const lidos = new Set([...corpo.matchAll(/\bs\.([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]));
  t(`os \`quando\` leem ${lidos.size} campos`, lidos.size >= 15);

  /* 2) o que `garantirSituacao` produz */
  const gs = bib.split("export function garantirSituacao")[1].split("\n}")[0];
  const produzidos = new Set([...gs.matchAll(/^\s{4}([a-zA-Z][a-zA-Z0-9]*):/gm)].map((m) => m[1]));
  const orfaos = [...lidos].filter((c) => !produzidos.has(c));
  t(`nenhum campo lido sem ser normalizado${orfaos.length ? " — " + orfaos.join(", ") : ""}`, orfaos.length === 0);

  /* 3) o que o App realmente entrega — a ponta que faltava nas duas vezes */
  /* A ENTREGA VEM DE DOIS MONTADORES desde a v9.93: `situacaoDaMesa`
     monta a mesa e o arco, e `lugarDaMesa` monta a geografia, entrando
     por spread. Um varredor que só lê o primeiro acusa de mudo justamente
     o campo que o segundo entrega — e a resposta certa não é abrir
     exceção, é ler os dois. */
  const chamada = app.split("const situacaoDaMesa")[1].split("\n  };")[0]
    + app.split("const lugarDaMesa")[1].split("\n  };")[0];
  /* e o spread tem de estar lá: sem ele os dois montadores existem e só um
     chega, que é o defeito que este teste procura */
  t("a geografia entra por spread", /\.\.\.lugarDaMesa\(\)/.test(app));
  /* `[:,]` e não só `:` — o campo `fio` entra por atalho de objeto (`fio,`),
     e um teste que só enxerga `chave: valor` acusa de mudo justamente o
     campo que está sendo entregue da forma mais curta que existe */
  const entregues = new Set([...chamada.matchAll(/^\s+([a-zA-Z][a-zA-Z0-9]*)[:,]\s*$|^\s+([a-zA-Z][a-zA-Z0-9]*):/gm)].map((m) => m[1] || m[2]));
  const mudos = [...produzidos].filter((c) => !entregues.has(c));
  t(`o App entrega todos os campos${mudos.length ? " — mudos: " + mudos.join(", ") : ""}`, mudos.length === 0);

  /* 4) e nenhum campo entregue é ignorado por todo mundo: um campo que o
        App calcula e ninguém lê é trabalho por turno pago à toa */
  const soVeto = new Set([...bib.split("export const VETOS")[1].matchAll(/\bs\.([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]));
  /* a tabela de EXIGENCIAS também é leitora, e lê por NOME (`s[x.campo]`).
     Um varredor que só enxerga `s.campo` escrito à mão acusa de inútil
     justamente o campo que uma tabela consome — e a resposta certa não é
     abrir exceção, é ensinar o varredor a ler a tabela. */
  const porTabela = new Set(EXIGENCIAS.map((x) => x.campo));
  /* e ASSUNTOS.js também é leitor: o compasso recebe a MESMA situação
     que o Bibliotecário, e é lá que a geografia é consultada (um cerco
     precisa de portão, um reencontro precisa de alguém que não esteja
     aqui). Contar só as JOGADAS acusaria de inútil o campo que o outro
     consumidor usa. */
  const ass = fs.readFileSync("../src/assuntos.js", "utf8");
  const porAssunto = new Set([...ass.matchAll(/\bs\.([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]));
  const inuteis = [...entregues].filter((c) => !lidos.has(c) && !soVeto.has(c) && !porTabela.has(c) && !porAssunto.has(c) && c !== "fio");
  t(`nada é calculado à toa${inuteis.length ? " — " + inuteis.join(", ") : ""}`, inuteis.length === 0);

  /* 5) a mesma prova nos DOIS catálogos antigos, que é onde os dois bugs
        moraram de verdade */
  for (const [arq, cat, corte, fn] of [
    ["oraculo.js", "MOVIMENTOS_DO_MUNDO", "export const RITMO_DO_MUNDO", "iniciativaDoMundo({"],
    ["mestria.js", "FIOS_DA_MEMORIA", "export function fioDaMemoria", "fioDaMemoria({"],
  ]) {
    const s2 = fs.readFileSync("../src/" + arq, "utf8");
    const c2 = s2.split("export const " + cat)[1].split(corte)[0];
    const l2 = new Set([...c2.matchAll(/\bc\.([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]));
    const ch2 = app.split(fn)[1].split("\n      }")[0].split("}, {")[0];
    const e2 = new Set([...ch2.matchAll(/^\s+([a-zA-Z][a-zA-Z0-9]*):/gm)].map((m) => m[1]));
    const m2 = [...l2].filter((c) => !e2.has(c));
    t(`${cat}: nenhum fio mudo${m2.length ? " — " + m2.join(", ") : ""}`, m2.length === 0);
  }
}

sec("7. A LIGAÇÃO — o mestre consulta nas quatro portas");
{
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  /* `[^)]*` não serve aqui: a chamada é `envelopeDoFio(mv,
     pilarFaminto(mesaRef.current))` e tem parêntese dentro do parêntese —
     um teste que não vê isso reprova a linha que está certa. */
  t("o fio da memória sai com forma", /envelopeDoFio\(mv,[\s\S]{0,60}?\}\$\{formaDoMestre/.test(app));
  t("a iniciativa do mundo sai com forma", /envelopeDaIniciativa\(mv\)\}\$\{formaDoMestre/.test(app));
  /* v9.89: o passo do vilão sai com forma SALVO na revelação e na queda —
     esses dois envelopes já vêm compostos (dizem a cena inteira), e entre
     as 140 formas possíveis havia oito que mandam o oposto de "dê a ele a
     melhor fala da campanha". Quem cobra a trava é teste-harmonia.mjs. */
  t("o passo do vilão sai com forma", /envelopeDoAvanco\(r\)\}\$\{levaForma\(r\) \? formaDoMestre/.test(app));
  t("a estante é salva", /estante: estanteRef\.current/.test(app));
  t("e recarregada", /estanteRef\.current = garantirEstante\(sv\.estante\)/.test(app));
  const f = app.split("const formaDoMestre")[1].split("\n  };")[0];
  /* a consulta nunca pode custar o turno: ela é enfeite de envelope, e um
     enfeite que derruba o turno é pior que nenhum enfeite */
  t("a consulta é protegida por try", /try \{/.test(f) && /catch \{ return ""/.test(f));

  /* a situação virou função própria porque agora tem dois chamadores, e
     duplicá-la seria criar o segundo lugar onde esquecer de um campo novo */
  t("a situação é montada num lugar só", (app.match(/const situacaoDaMesa = /g) || []).length === 1);
  t("e os dois canais a usam", /consultarBiblioteca\(situacaoDaMesa\(/.test(app) && /const sit = situacaoDaMesa\(\);/.test(app));
  /* v9.91: a forma da cena CEDE A VEZ ao compasso. Não por hierarquia: o
     envelope do compasso já diz do que a cena trata e em que tempo da onda
     ela está, e uma forma por cima disso seria o sistema dando duas
     instruções de composição para a mesma cena. */
  t("a cena comum entra no ponto único do turno", /const formaDaCena = doCompasso \? "" : talvezDarFormaACena\(conteudo\);/.test(app));
  /* v9.104: a PAUTA entrou na frente da nota, e casar com a lista inteira
     quebra a cada sistema que se muda para dentro dela. O que importa
     afirmar é que a peça continua na nota e que a Pauta vem primeiro. */
  /* v9.115: e ela prendia o FIM da lista — `…doCompasso, formaDaCena]` —,
     que é exatamente o que o comentário acima manda não fazer. A raid
     entrou depois da forma da cena e o teste caiu sem que nada tivesse
     piorado. Agora afirma-se o que importa: a Pauta abre, a peça está
     dentro, e o compasso vem antes da forma. */
  const listaDaNota = (app.match(/const nota = \[([^\]]*)\]/) || [])[1] || "";
  const pecas = listaDaNota.split(",").map((x) => x.trim());
  t("e vai junto da nota", pecas.includes("formaDaCena"), listaDaNota);
  t("com a Pauta na frente", pecas[0] === "pauta", listaDaNota);
  t("e o compasso antes da forma", pecas.indexOf("doCompasso") >= 0 && pecas.indexOf("doCompasso") < pecas.indexOf("formaDaCena"), listaDaNota);
  const g = app.split("const talvezDarFormaACena")[1].split("\n  };")[0];
  /* duas formas no mesmo turno é o sistema falando por cima de si mesmo */
  t("não dá forma se já houver uma", /includes\("A FORMA"\)/.test(g));
  /* dar forma a um envelope de sistema seria moldar a resposta a mim mesmo */
  t("nem a turno que não é do jogador", /startsWith\("\["\)/.test(g));
  t("e conta o turno sempre", /contarTurnoDeCena\(estanteRef\.current\)/.test(g));
  t("também protegida por try", /try \{/.test(g) && /catch \{ return ""; \}/.test(g));
}

console.log(`\nbiblioteca v9.86: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
