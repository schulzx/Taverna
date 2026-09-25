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
  /* V5a (25/09): as duas asserções sobre O COMPONENTE (`CabecalhoDaCena` não
     desenha o nulo; some com a linha vazia) saíram com ele. O cartão de
     v9.157 deixou a tela — sem a gravura, seria a segunda peça a dizer o
     lugar (a lei da aposentadoria, `formas.md` §20), e às 22:00 dizia
     `noite · ensolarado`. A regra que elas guardavam — NADA SABIDO É NADA
     MOSTRADO — continua de pé duas vezes: na conta, logo acima, e nas
     etiquetas do cabeçalho da página (`teste-v5a-cabecalho.mjs`). */
  t("o cartão de v9.157 não voltou à tela", !/function CabecalhoDaCena\(/.test(APP) && !/<CabecalhoDaCena /.test(APP));
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
  /* R15 — A ÂNCORA DA ÁREA QUE ROLA DEIXA DE INCLUIR A LISTA DE CLASSES, e o
     motivo tem de ficar escrito porque o modo como isto falhou é instrutivo:
     a região ganhou `tv-esbate-topo` entre `tv-scroll` e `flex-1`, e este
     `indexOf` passou a devolver **-1**. Com -1, `iCab > iArea` ficou VERDE
     por acidente — uma asserção a passar por não achar nada é pior do que
     uma asserção vermelha. `flex-1 overflow-y-auto overflow-x-hidden` é
     único no `App.jsx` e não se move quando a região ganha classes. */
  const iArea = APP.indexOf("flex-1 overflow-y-auto overflow-x-hidden");
  /* V5a: o lugar deixou de estar DENTRO da área que rola (o cartão de v9.157)
     e passou a estar ACIMA dela, no cabeçalho da página, que não rola. A lei
     que as duas asserções seguintes guardavam — o lugar vem antes da primeira
     palavra do Narrador — fica mais forte, não mais fraca: agora vem antes
     por construção, em todos os turnos, e não só no topo da conversa. */
  const iCab = APP.indexOf("<CabecalhoDaPagina {...etiquetasDaPagina(");
  t("fica ACIMA da área que rola, e não rola com ela", iCab > 0 && iCab < iArea);
  /* v9.170 (mesa-jogo-v2): o selo "MESTRE ATIVO" passou a abrir o painel da
     narrativa, então o cabeçalho da cena virou a SEGUNDA coisa. A folga
     sobe de 400 para 900 caracteres para caber o selo — o que a lei
     protege é que o lugar venha antes da primeira palavra do Narrador, e
     isso continua valendo. */
  /* R3: 900 -> 1100. `A voz` (R2) entrou no lugar do selo escrito à mão, e
     trouxe o comentário que explica por que a peça leva a espera do Mestre.
     A ORDEM NÃO MUDOU: vinheta, timbre da página, cabeçalho da cena, e só
     depois a primeira mensagem. O que cresceu foi o texto ENTRE eles.

     E fica dito o que isto expõe, porque é a SEGUNDA vez que este número
     sobe por causa de comentário (400 -> 900 na v9.170, 900 -> 1100 agora):
     contar CARACTERES é um procurador fraco de "vem antes". O que a lei
     protege é que o cabeçalho da cena venha antes da PRIMEIRA MENSAGEM, e
     isso mede-se contra `agruparMensagens(mensagens)`, não contra uma
     folga de texto. Deixo a observação para o `testes` em vez de mudar a
     asserção de outra mesa por minha conta. */
  t("e vem antes da primeira palavra do Narrador", iCab < APP.indexOf("agruparMensagens(mensagens).map("));
  /* V5a: as três asserções do VÉU (a cor do bioma como véu, a barra na
     borda, a força da luz) saíram com o cartão que o pintava. O tom do bioma
     (`TONS`) continua pintando o cartão da chegada, e é `teste-momentos` que
     o guarda. */
}


sec("O MEIO NÃO ANDA PARA OS LADOS (v9.196)");
{
  /* Queixa de quem jogou no telefone: o painel do Mestre — a narrativa, os
     botões de modo e a caixa de texto — arrastava para os lados ao rolar.

     A causa não era o rolamento: era um filho largo demais mais uma regra de
     CSS pouco conhecida. Quando um eixo de `overflow` não é `visible`, o
     outro deixa de ser também — então `overflow-y-auto` sozinho entrega um
     rolamento lateral de brinde, e basta um filho estourar para o painel
     inteiro derivar. */
  /* v9.197: a reserva da barra saiu daqui — ela agora vale uma vez, no
     convés, que é quem encosta na barra. A trava do eixo lateral fica. */
  /* R15: tolera classes entre `tv-scroll` e `flex-1` — o que esta asserção
     prende é o `overflow-x-hidden`, não a lista de classes. */
  t("o painel da narrativa tranca o eixo lateral", /tv-scroll[^"]*flex-1 overflow-y-auto overflow-x-hidden/.test(APP));

  /* ============================================================
     V5a · O CABEÇALHO DA PÁGINA — a fiação, e só ela

     Era a fiação do rosto da cena (R13-B): a faixa no topo do papel e fora
     do que rola, a conta vinda da biblioteca, a largura medida por quem
     monta, e o mesmo lugar na semente e na legenda. A gravura saiu em V5a e
     as asserções mudaram de objeto, uma a uma, guardando a mesma coisa onde
     a coisa ainda existe. A PEÇA e a CONTA provam-se em
     `teste-v5a-cabecalho.mjs`; aqui fica só o que esta tela pode errar.
     ============================================================ */
  {
    const iPapel = APP.indexOf("O PAPEL TEM DUAS FAIXAS (R13-B → V5a)");
    const iCabecalho = APP.indexOf("<CabecalhoDaPagina {...etiquetasDaPagina(");
    const iRola = APP.indexOf("flex-1 overflow-y-auto overflow-x-hidden");
    /* NO TOPO DO PAPEL e FORA do que rola — como a gravura estava: o
       cabeçalho é o topo da folha, não um cartaz que sobe com a prosa. */
    t("o papel continua a ser moldura de duas faixas", iPapel > 0 && iPapel < iCabecalho);
    t("e o cabeçalho vem ANTES da área que rola — ele não rola com a prosa", iCabecalho > 0 && iCabecalho < iRola);
    /* A CONTA NÃO MORA NA TELA: o que as etiquetas dizem é `etiquetasDaPagina`
       (glifos.js, provada em Node). Uma cópia dela aqui seria a segunda
       verdade — e a regra de quem cede primeiro divergiria no primeiro ajuste. */
    t("a peça vem da biblioteca e a conta das etiquetas não foi copiada para cá",
      /, CabecalhoDaPagina, FimDaPagina } from "\.\/ui\.jsx"/.test(APP)
      && /import \{ assuntoDaLinha, retornoDaSoleira, etiquetasDaPagina \} from "\.\/glifos\.js"/.test(APP)
      && !/function etiquetasDaPagina|const etiquetasDaPagina/.test(APP) && !/\/tocha\/\.test/.test(APP) &&!/RostoDaCena|OTopoDoPapel\(|gravuraDaCena\(/.test(APP.replace(/\/\*[\s\S]*?\*\//g, "")),
      "se a regra das etiquetas for copiada para o App.jsx, o telefone e a mesa passam a dizer coisas diferentes");
    /* UM LUGAR, NÃO DOIS: o mesmo `lugarDaCena()` que a gravura escrevia é o
       que a etiqueta escreve; a mesma `luzDaHora` d'O TEMPO; o mesmo `clima`. */
    t("o mesmo lugar, a mesma luz e o mesmo clima alimentam a etiqueta",
      /const lugarDaCena = \(\) => \{/.test(APP)
      && /etiquetasDaPagina\(\{ lugar: lugarDaCena\(\), cena: cenaDoPalco\(\),\s*luz: luzDaHora\(Math\.floor\(\(minuto \|\| 0\) \/ 60\)\), clima \}\)/.test(APP));
    /* E O `📍 lugar` NÃO VOLTOU AO PAINEL DO TEMPO: a morada dele mudou de
       casa (da legenda da gravura para a etiqueta), nunca para duas. */
    t("e o empréstimo do lugar ao painel do tempo terminou",
      !/📍 \{lugar\.nome\}/.test(APP) && /pagou o empréstimo/.test(APP));
  }

  /* ---------------- A FILEIRA DE MODO NÃO EXISTE MAIS (R4b) ----------------
     MOTIVO DA ASSERÇÃO INVERTIDA, e ele é de medida. A v9.197 tinha razão
     no problema que resolvia (a fileira estourava 375 px e fazia a prosa
     derivar de lado) e a grade de quatro tijolos foi o conserto certo
     PARA A FILEIRA QUE HAVIA. R4b tirou a fileira: `Ações` morreu com o
     painel dela, `Examinar` e `Tempo` foram para a soleira — eram ofertas
     a fingir de aba, e o `title` do primeiro confessava-o ("Nada caído por
     perto") — e `Habilidades` desceu para dentro da linha do turno, como
     a gaveta `✦` que W1 já fechou no tabuleiro.

     São 56 px de convés (48 do tijolo + 8 de margem) devolvidos à prosa em
     TODA cena, e é esse o pagamento que R4b devia: R3 entrou a soleira
     como adição pura e a página caiu de 58,1 % para 27,3 % do ecrã na mesa.

     A asserção continua a guardar a mesma coisa — que a tela do telefone
     não volte a ter uma fileira de modos a estourar a largura —, só que
     agora pelo lado de fora: se a grade renascer, esta linha morde. */
  t("a fileira de quatro modos não voltou ao convés", !/className="grid grid-cols-4 gap-1\.5 mb-2 md:flex md:items-center md:flex-wrap"/.test(APP));
  /* V3b (25/09) · a asserção pedia o nome literal "Habilidades"; o nome passou a
     dizer também quantas estão armadas ("Habilidades, 2 armadas"), porque o número
     que se vê ao lado do glifo não chegava a quem não vê. O que ela guarda fica:
     a gaveta vive na linha do turno, com estado e nome. */
  t("e a gaveta das habilidades vive na linha do turno, com a forma de W1",
    /aria-pressed=\{habAbertas\} aria-label=\{habsSel\.length > 0 \? `Habilidades, /.test(APP));
  t("e a fileira do combate continua quebrando a linha", /className="flex items-center gap-1.5 mb-2 flex-wrap"/.test(APP));
  /* O SELO DO HEROÍSMO SAIU da fileira de modos: ele é recurso do HERÓI, e
     pendurado ali ficava órfão numa linha própria no telefone.

     R13 LEVA-O MAIS UM DEGRAU, E COM O NÚMERO À FRENTE: em 20 turnos jogados
     (`mente/r6-jogo.md`) o selo foi tocado **zero** vezes na tela principal.
     A régua desta etapa é *fica sempre na tela o que o jogador usa ENQUANTO
     decide*, e o heroísmo não é isso — é recurso que se gasta NUM INSTANTE
     nomeado, e nesse instante ele continua a ser oferecido onde sempre foi,
     dentro do véu do dado. Mora agora no pé da ficha, que é onde se lê o
     herói. A asserção não afrouxa: passa a guardar que ele tem UMA casa e
     que ela é a ficha — se voltar à moldura da cena, esta linha morde. */
  t("o heroísmo mora na ficha, e só lá",
    /<SeloHeroismo pontos=\{heroismoPontos\} aceso=\{heroAberto\} aoAbrir=\{aoAbrirHeroismo\} \/>/.test(APP)
    && (APP.match(/<SeloHeroismo/g) || []).length === 1);
  t("e o painel dele abre no mesmo sítio em que o selo vive",
    APP.indexOf("<PainelHeroismo pontos={heroismoPontos}") > APP.indexOf("<SeloHeroismo pontos={heroismoPontos}")
    && (APP.match(/<PainelHeroismo/g) || []).length === 1);
  t("e não sobrou selo pendurado na direita", !/<div className="ml-auto">s*<SeloHeroismo/.test(APP));

  /* A BARRA DO HERÓI: v9.197 fê-la tomar a linha no telefone e empilhar as
     duas medidas, porque lado a lado em 375 px cada uma ficava com 94 —
     curta demais para se ler como barra, e a vida do herói virava um traço
     ao lado do relógio.

     R13 RESOLVE O MESMO PROBLEMA POR CIMA, E O NÚMERO É OUTRO: a barra de PV
     passa a ter **56 px fixos** dentro de `A cinta`, e as 94 de que a v9.197
     se queixava deixaram de existir porque deixou de haver uma fileira a
     dividir. O que pagou a conta foi o PM RECOLHER — em 20 turnos ele
     decidiu zero vezes e volta sozinho a quem tem caderno de magias ou gasta
     o primeiro ponto —, e com uma medida só não há nada que empilhar.

     A asserção muda de forma e guarda a mesma lei, que é a de `formas.md`:
     **a barra tem comprimento de barra e o comprimento é o canal primário.**
     56 px saem da tabela (`CINTA_DESENHA.trilho`), e um número escrito à mão
     no meio de um `style` volta a ser o defeito que esta linha caça. */
  t("a barra do herói tem comprimento de barra, e ele sai da tabela",
    /width: CINTA_DESENHA\.trilho, height: CINTA_DESENHA\.fio/.test(APP));
  t("e o PM só aparece quando conta", /\{comPM && \(/.test(APP) && /function oPMConta\(pers\)/.test(APP));
  t("a barra do PM não rouba a folga do telefone", /<BarraDeRecurso className="hidden md:inline-block"/.test(APP));
  t("não sobrou barra de largura fixa sem escape", !/flex flex-col gap-1 w-\[110px\] md:w-\[140px\]/.test(APP));
}
console.log(`\npalco v9.157: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
