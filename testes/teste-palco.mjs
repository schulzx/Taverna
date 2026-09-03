/* O PALCO (v9.157) — a cena ganha corpo

   O jogo sabia onde o herói está com uma precisão que nenhum concorrente
   tem: cidade, local dentro dela, bioma, hora, clima, andar da masmorra,
   trecho de estrada. E a tela não dizia nada disso. O lugar vivia só
   dentro da prosa, e quem entrasse numa sessão pelo meio precisava ler
   três parágrafos para trás para saber onde estava.

   A mesma informação existia na barra de baixo, em letra mono de dez
   pixels, ao lado de PV e XP — do jeito que se mostra um número de
   versão, e não um cenário.

   O QUE ESTA SUÍTE PROTEGE é a regra que separa cabeçalho de enfeite:
   NADA SABIDO É NADA MOSTRADO. Um cabeçalho que preenche buraco com
   adjetivo ("algum lugar", "em algum momento") ensina o jogador que a
   linha não quer dizer nada — e a partir daí ninguém a lê mais, nem
   quando ela está certa. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const P = await import(S + "palco.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. OS SEIS MOMENTOS — a luz, e não o relógio");
{
  /* Não são as vinte e quatro horas: são os seis estados em que a luz
     muda o que um lugar É. O relógio já está na barra de baixo. */
  t("são seis", P.MOMENTOS.length === 6);
  t("cobrem o dia inteiro", P.MOMENTOS[0].de === 0 && P.MOMENTOS[P.MOMENTOS.length - 1].ate === 24);
  t("sem buraco entre eles", P.MOMENTOS.every((m, i) => i === 0 || m.de === P.MOMENTOS[i - 1].ate));
  t("3h é madrugada", P.momentoDoDia(180).id === "madrugada");
  t("10h é manhã", P.momentoDoDia(600).id === "manha");
  t("19h é entardecer", P.momentoDoDia(1150).id === "entardecer");
  t("22h é noite", P.momentoDoDia(1320).id === "noite");
  /* o relógio do jogo passa de 1440 quando o dia vira */
  t("dá a volta no dia", P.momentoDoDia(1440 + 600).id === "manha");
  t("lixo não quebra", !!P.momentoDoDia(null) && !!P.momentoDoDia("tarde"));
  /* a luz é o que faz a mesma cripta ser outra às três da manhã */
  t("a madrugada é escura", P.momentoDoDia(180).luz < 0.3);
  t("e o meio-dia não", P.momentoDoDia(720).luz === 1);
}

sec("2. UMA FAMÍLIA DE COR SÓ — o jogo não pode parecer sete jogos");
{
  /* Nada aqui é verde-floresta nem azul-mar: um cabeçalho que troca de
     paleta a cada bioma faria o jogo parecer sete jogos diferentes. O que
     muda é o DESVIO, pequeno e reconhecível. */
  t("todo bioma tem tom", Object.keys(P.TONS).length === 8);
  t("e todo tom se explica", Object.values(P.TONS).every((x) => x.diz && x.cor));
  const cores = Object.values(P.TONS).map((x) => x.cor);
  t("as cores são diferentes entre si", new Set(cores).size === cores.length);
  /* todas escuras e dessaturadas: é a paleta da casa, não um arco-íris */
  const claro = cores.filter((c) => parseInt(c.slice(1, 3), 16) > 0xB0);
  t("nenhuma é clara demais para o fundo", claro.length === 0);
  t("bioma desconhecido cai no padrão", P.tomDaCena({ bioma: "vulcao" }).cor === P.TOM_PADRAO.cor);
  /* SUBTERRÂNEO NÃO TEM HORA: lá embaixo é sempre a mesma escuridão, e
     fingir que o sol chega seria mentir sobre o único lugar do jogo em
     que a tocha é um recurso. */
  const meioDiaLaEmbaixo = P.tomDaCena({ bioma: "floresta", minuto: 720, subterraneo: true });
  const madrugadaLaEmbaixo = P.tomDaCena({ bioma: "floresta", minuto: 180, subterraneo: true });
  t("na masmorra, o sol não entra", meioDiaLaEmbaixo.luz === madrugadaLaEmbaixo.luz);
  t("e a cor é a da terra", meioDiaLaEmbaixo.cor === P.TOM_SUBTERRANEO.cor);
  /* na superfície, a mesma floresta muda com a hora */
  t("na superfície, a hora muda tudo",
    P.tomDaCena({ bioma: "floresta", minuto: 720 }).luz > P.tomDaCena({ bioma: "floresta", minuto: 180 }).luz);
}

sec("3. CADA ESTADO DO JOGO TEM O SEU CABEÇALHO");
{
  const cidade = P.cabecalhoDaCena({ cidade: "Forte Rasa", regiao: "Fronteiras", bioma: "montanha", minuto: 600, clima: { icone: "🌧", rotulo: "chuva" } });
  t("na cidade, o nome dela", cidade.titulo === "Forte Rasa");
  t("com região e bioma", /Fronteiras/.test(cidade.onde) && /altura e pedra/.test(cidade.onde));
  t("e a hora com o clima", /manhã/.test(cidade.quando) && /chuva/.test(cidade.quando));

  const fora = P.cabecalhoDaCena({ cidade: "Forte Rasa", lugar: { nome: "o abrigo de lenhador", cidade: "Forte Rasa" }, bioma: "floresta", minuto: 1150 });
  t("fora da cidade, o lugar manda", fora.titulo === "o abrigo de lenhador");
  t("e diz de qual cidade é arredor", /arredores de Forte Rasa/.test(fora.onde));

  /* A MASMORRA MANDA MAIS QUE TUDO: estar dentro dela é o estado mais
     forte do jogo, e a cidade lá fora deixa de importar. */
  const mm = P.cabecalhoDaCena({ cidade: "Forte Rasa", lugar: { nome: "x" }, masmorra: { nome: "Cripta dos Sussurros", atual: 3, tochas: 2, salas: [{ id: 3, camada: 2 }] }, minuto: 600 });
  t("na masmorra, ela manda", mm.titulo === "Cripta dos Sussurros");
  t("e a cidade some", !/Forte Rasa/.test(mm.onde));
  t("mostra a camada", /camada 2/.test(mm.onde));
  /* a tocha é o recurso daquele lugar: ela pertence ao cabeçalho */
  t("e as tochas", /2 tochas/.test(mm.onde));
  t("uma tocha no singular", /1 tocha$/.test(P.cabecalhoDaCena({ masmorra: { nome: "X", tochas: 1, salas: [] }, minuto: 0 }).onde));
  t("e é subterrânea", mm.subterraneo === true);

  const viagem = P.cabecalhoDaCena({ jornada: { destino: "Ponte das Velas", de: "Forte Rasa" }, bioma: "planicie", minuto: 420 });
  t("na estrada, o destino", /a caminho de Ponte das Velas/.test(viagem.titulo));
  t("e de onde saiu", /saiu de Forte Rasa/.test(viagem.onde));
}

sec("4. NADA SABIDO É NADA MOSTRADO");
{
  /* A regra que separa cabeçalho de enfeite. Um "algum lugar" ensina que
     a linha não quer dizer nada, e a partir daí ninguém a lê mais. */
  t("sem nada, não há cabeçalho", P.cabecalhoDaCena({}) === null);
  t("nem com argumento nenhum", P.cabecalhoDaCena() === null);
  t("nem com lixo", P.cabecalhoDaCena(null) === null);
  t("cidade vazia não vira cabeçalho", P.cabecalhoDaCena({ cidade: "" }) === null);
  /* e os campos somem um a um, sem inventar substituto */
  const so = P.cabecalhoDaCena({ cidade: "Vila", minuto: 600 });
  t("sem região nem bioma, a linha some", so.onde === "");
  t("mas o título fica", so.titulo === "Vila");
  t("sem clima, só o momento", !/·/.test(so.quando) && /manhã/.test(so.quando));
  /* o componente respeita isso */
  t("o componente não desenha o nulo", /function CabecalhoDaCena\(\{ cena \}\) \{\n  if \(!cena\) return null;/.test(APP));
  t("e some com a linha vazia", /\{cena\.onde && \(/.test(APP));
}

sec("5. A COSTURA — no topo, e sem inventar");
{
  t("o ajudante existe", /const cenaDoPalco = \(\) =>/.test(APP));
  /* sai dos MESMOS refs que o resto do turno lê: um segundo caminho para
     saber onde o herói está seria a segunda verdade de sempre */
  t("lê a cidade do ref", /cidade: cidadeAtualRef\.current/.test(APP));
  t("o lugar", /lugar: lugarRef\.current/.test(APP));
  t("a masmorra", /masmorra: masmorraRef\.current/.test(APP));
  t("a jornada", /jornada: jornadaRef\.current/.test(APP));
  t("o relógio", /minuto: minutoRef\.current/.test(APP));
  t("e o clima", /clima: climaRef\.current/.test(APP));
  /* ACIMA da narrativa, porque responde antes dela: a primeira palavra do
     Narrador já supõe o lugar */
  const iArea = APP.indexOf("tv-scroll tv-espaco-abas flex-1 overflow-y-auto");
  const iCab = APP.indexOf("<CabecalhoDaCena cena={cenaDoPalco()} />");
  t("fica dentro da área que rola", iCab > iArea);
  /* v9.170 (mesa-jogo-v2): o selo "MESTRE ATIVO" passou a abrir o painel da
     narrativa, então o cabeçalho da cena virou a SEGUNDA coisa. A folga
     sobe de 400 para 900 caracteres para caber o selo — o que a lei
     protege é que o lugar venha antes da primeira palavra do Narrador, e
     isso continua valendo. */
  t("e vem antes da primeira palavra do Narrador", iCab - iArea < 900);
  /* o tom entra como VÉU sobre o painel da casa, e não como fundo próprio */
  t("a cor é um véu, não um fundo", /linear-gradient\(100deg, \$\{tom\.cor\}\$\{veu/.test(APP));
  t("com a barra do bioma na borda", /borderLeft: `3px solid \$\{tom\.cor\}`/.test(APP));
  t("e a força do véu vem da luz", /const veu = Math\.round\(10 \+ tom\.luz \* 26\)/.test(APP));
}

console.log(`\npalco v9.157: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
