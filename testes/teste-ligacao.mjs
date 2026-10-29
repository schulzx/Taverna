/* teste-ligacao.mjs (v9.85) — o mestre está ligado a tudo?

   "Temos que ter certeza que todos os sistemas estão ligados ao mestre,
   pois para ele tocar o mundo ele tem que ter controle sobre o mundo."

   Ter certeza uma vez não serve: o que esta casa precisa é de uma
   CATRACA. A varredura vira asserção, com a lista do que já se sabe
   morto congelada aqui dentro — e qualquer regra NOVA que nasça sem
   leitor quebra a suíte no dia em que for escrita, em vez de esperar
   alguém topar com ela jogando.

   É a resposta mecânica para a classe de bug que esta casa mais repete.
   O `m.ativa` viveu da v9.61 à v9.71; o `npcs[cidade].gente` viveu duas
   versões; "Comando: Atacar" era comprável e inerte desde que a árvore
   de invocação existe. Nenhum deles quebrava nada — só não acontecia. */
import fs from "node:fs";
import path from "node:path";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const DIR = "../src";
const SP = ".";
const arqs = fs.readdirSync(DIR).filter((f) => /\.(js|jsx)$/.test(f));
const fonte = Object.fromEntries(arqs.map((f) => [f, fs.readFileSync(path.join(DIR, f), "utf8")]));
const provas = fs.readdirSync(SP).filter((f) => /^teste-.+[.]mjs$/.test(f) && f !== "teste-ligacao.mjs");
const txtProvas = provas.map((f) => fs.readFileSync(path.join(SP, f), "utf8")).join("\n");
const MOTOR_FONTES = fs.existsSync(path.join(DIR, "motor")) ? fs.readdirSync(path.join(DIR, "motor")).filter((f) => /\.js$/.test(f)).map((f) => fs.readFileSync(path.join(DIR, "motor", f), "utf8")) : [];

/* ============================================================
   O QUE JÁ SE SABE MORTO, e por quê.

   Toda entrada precisa de uma razão. Uma lista de perdão sem motivo
   escrito vira o lugar onde os bugs vão morar — bastaria acrescentar um
   nome para calar a catraca, e aí ela não protege mais nada.
   ============================================================ */
const PERDOADAS = {
  /* As duas SUPERSEDIDAS que moravam aqui — o gerador de nemese antigo em
     fama.js e a duplicata da mingua da fe em divindades.js — foram
     REMOVIDAS na v9.86, com uma lapide no lugar explicando para onde a
     regra mudou. Perdao nao serve para codigo morto que da para apagar:
     serve para o que precisa continuar existindo sem leitor. */
  /* ATALHOS por id que nunca precisaram existir: quem lê essas tabelas
     lê a tabela inteira. Baratos e inofensivos. */
  "mestria.js": ["pilarPorId"],
  "reacoes.js": ["reacaoPorId"],
  "relogios.js": ["relogioPorId"],
  "social.js": ["alavancaPorId"],
  "emboscada.js": ["faixaPorId"],
  "classes.js": ["classeDaSubclasse"],
  "moldes.js": ["rotuloDoBioma"],
  "profissoes.js": ["beneficioDe"],
  "testes.js": ["atributoDoTeste"],
  "pocoes.js": ["ehConsumivel"],
  /* TEXTO E CONSTANTES que a interface acabou não usando */
  "chao.js": ["quantosPerto", "linhaDoAchado"],
  /* v9.125: ehEstorvo saiu da lista — a grade em SVG desenha o estorvo
     como vulto no chao, e para isso precisa perguntar onde ele esta. */
  "grid.js": ["ondeEstaEmPalavras"],
  /* 30/09 (MM13): `generosDisponiveis` saiu da lista — a suíte da abertura
     o lê para varrer os seis géneros, e perdão que sobra é dívida. */
  "nomes.js": ["sortearVarios"],
  "godmode.js": ["GODMODE_AVISO"],
  "itens.js": ["PROPS"],
  "movimento.js": ["DESLOCAMENTO_LIGEIRO"],
  /* v9.154: `xpParaNivel` saiu da lista — o Juiz lê a curva para saber o
     VÃO de cada nível, e todo XP do jogo passou a ser uma fração dele.
     A função esperou muitas versões por um leitor; perdão que sobra é
     dívida escondida, e este varredor existe para não deixar sobrar. */
};

sec("1. NENHUM MÓDULO MUDO");
{
  const FOLHAS = /^(main\.jsx|painel-.*\.jsx|planta-cidade\.jsx|ui\.jsx)$/;
  /* v9.214: A LISTA DE ESPERA — módulo nascendo numa leva encadeada pode
     esperar o consumidor da PRÓPRIA leva, com o credor nomeado. Não é
     perdão permanente: cada entrada aqui é removida na etapa que liga o
     módulo, e a leva termina com a lista VAZIA (M6 confere). Perdão que
     sobra é dívida escondida — por isso o valor diz quem vem buscar. */
  /* v9.218: A LISTA NASCEU E MORREU NA MESMA LEVA — como prometido. O App
     ligou torneio.js e uma-noite.js no M6; nenhum credor ficou esperando.
     A lista fica VAZIA de proposito: se uma leva futura precisar dela, a
     regra esta escrita acima e o precedente aqui. */
  /* v9.255 (Fase X, X2): A DIVIDA DE `golpe.js` FOI PAGA, e antes do
     prazo. A entrada dizia "o frontend, em X3" porque se supunha que a
     fiacao viria so depois; ela veio em X2 — `resolverAtaqueJogador` le
     `alcanceDoGolpe`/`vereditoDoGolpe` no lugar dos literais 36 e
     `+ METROS_POR_QUADRADO`, e o botao `Atacar` entra pela mesma porta.
     Com importador de verdade, o modulo nao pode ficar na lista de
     espera: a secao 1 passa a mede-lo como mede todos os outros.
     A lista volta a ficar VAZIA, como a regra acima pede. */
  /* v9.269 (Fase K, K3): A DIVIDA DE `ritmo-da-reacao.js` FOI PAGA, pelo
     credor que a entrada nomeava. O `oficial` ligou a janela ao `App.jsx`
     — `ritmoDaRodada` decide se ela abre, `reacaoDoSilencio` resolve quem
     nao respondeu e `fecharAJanela` e o portao de uma via —, e com
     importador de verdade o modulo nao pode continuar dispensado: a secao
     1 passa a mede-lo como mede todos os outros.
     A lista volta a ficar VAZIA, como a regra acima pede. Ela nasceu em
     v9.214, esvaziou-se em v9.218, encheu-se de novo em v9.258 e esta
     vazia outra vez — tres levas, tres credores, zero perdao sobrando. */
  /* 29/09 (Fase MM, MM12): `cidade-por-dentro.js` pagou o próprio crédito
     no mesmo dia em que nasceu — `fichaParaPauta` está ligado dentro de
     `pautaDoTurno` (App.jsx), e os dez casos da sonda que dependiam dela já
     passam a `chega`. A lista volta a ficar VAZIA, como a regra pede. */
  /* 29/09 (Fase MM, MM8a): `gente-por-dentro.js` pagou o próprio crédito no
     mesmo dia em que nasceu — `genteParaPauta` está ligado dentro de
     `pautaDoTurno` (App.jsx). A lista volta a ficar VAZIA. */
  /* 30/09 (Fase MM, MM13): `abertura.js` nasce no backend e espera a
     fiação da MESMA leva — a abertura, o mural, o sino e o próximo passo
     entram no App.jsx pela mão da tela. A entrada sai quando o App o
     importar, e a lista volta a ficar VAZIA. */
  /* 30/09 (Fase MM, MM13): a dívida foi paga no mesmo dia — o App.jsx
     importa `abertura.js` (a abertura, o mural, a menção que não é
     presença, o sino, o fio e o próximo passo), e `teste-mm13-abertura.mjs`
     prova a fiação por texto. A lista volta a ficar VAZIA, como a regra
     pede. */
  /* 30/09 (Fase MM, MM10): a dívida foi paga no mesmo dia — o App.jsx
     importa `crime.js` (a agressão, a pauta, o save, o mercado e a
     guarda), e `teste-mm10-crime.mjs` prova a fiação por texto. A lista
     volta a ficar VAZIA, como a regra pede. */
  /* 30/09 (Fase MM, MM14 · os canais): a dívida foi paga no mesmo dia — o
     App.jsx importa `tarefas-antigas.js` (a migração no load, o fio do
     descanso longo nascendo missão, e a fé e o heroísmo no fecho pela mão
     de `pagaDoFecho`), junto da remoção dos dois canais que fechavam a
     lista antiga só pelo título (`quest_atualizar` no Narrador,
     `missoes.concluidas` no Cronista). `teste-mm14-canais.mjs` prova a
     fiação por texto. A lista volta a ficar VAZIA, como a regra pede. */
  /* 30/09 (Fase MM, MM14 · nº 8, as histórias em série): `palavra-dada.js`
     nasce no backend e espera a fiação da MESMA leva — o App.jsx passa a
     ler `promessaEmAberto` onde lia "a primeira missão ativa" (o fio da
     memória, ~19440, e a situação da trama, ~16708). A entrada sai quando
     o App o importar, e a lista volta a ficar VAZIA. */
  /* e paga no mesmo dia: o App.jsx importa `promessaEmAberto`. A lista volta a ficar VAZIA. */
  /* 06/10 (Fase MM, MM17 · a região delimitada, etapa A): `regiao.js` nasce
     no backend (o mapa de uma região, a amarração da espinha) e espera a
     fiação da MESMA fase — a etapa B liga `gerarRegiao` à criação do mundo
     de uma campanha nova, no App.jsx. A entrada sai quando o App o importar,
     e a lista volta a ficar VAZIA. `mundo-base.js` já o serve (o ramo da
     região em `masmorrasDoMundo`) sem o importar. */
  /* e paga na etapa seguinte da MESMA fase (MM17 B, 06/10): o App.jsx importa
     `regiao.js` — `mapaDaCriacao` escolhe a região na criação de uma
     campanha nova de Uma Vida, e `mapaDaCampanhaNova` monta o mapaRef.
     `teste-regiao.mjs` (secção 11) prova a fiação. A lista volta a ficar VAZIA. */
  /* 06/10 (Fase MM, MM17 · etapa D, os dados do mapa vivo): `mapa-vivo.js`
     nasce no backend — `dadosDoMapaVivo`, o que a tela do mapa em tempo
     real lê (o quadro, os nós com a neblina, as arestas, o herói, o
     horizonte, o relógio) — e espera a TELA, que a pessoa está a desenhar
     no Figma e o desenho/oficial liga no App.jsx (`mente/mm17-regiao.md`,
     secção D, tem o mapa de chamada). É dívida datada, não esquecimento: a
     entrada sai quando o App (ou um painel) o importar, e a lista volta a
     ficar VAZIA. `teste-mapa-vivo.mjs` é o primeiro leitor. */
  /* 10/10 (P2, o pedido do mapa): `partida.js` nasce no backend —
     `vereditoDaPartida`, o preço inteiro de partir (as horas, a chegada,
     as noites, o perigo, a volta, a rota e os prazos que vencem pelo
     caminho) — e espera o MESMO credor do mapa vivo: o botão "Partir para
     X" do cartão do lugar, que a tela do mapa (oficial) liga no App.jsx ou
     num painel. `teste-veredito-da-partida.mjs` é o primeiro leitor. A
     entrada sai quando a tela o importar, junto da do mapa vivo. */
  /* e pagas as duas no MESMO dia (12/10, v9.443, oficial): o App.jsx importa
     `mapa-vivo.js` (`dadosDoMapaVivo`, memorizado e em `calou`) e o painel
     `painel-mapa-vivo.jsx` (a faixa do rumo no topo do papel e a tela
     grande); `partida.js` é lido pelo painel (`vereditoDaPartida`, o preço
     no cartão) e o verbo parte pelas portas de viagem que já existem. As
     duas entradas saíram. */
  const AGUARDANDO = {
    /* 11/10 (Fase MM-C, C2): `subtramas.js` nasce no backend — os arcos de
       três batidas, as pistas e a revelação do elo, a linha QUEM CARREGA, o
       campo `coracao` escrito, e as peças do motor da fogueira — e espera a
       fiação do App.jsx pela mão do frontend na MESMA fase (a pauta, o
       save, as escolhas na forma `A escolha`, o descanso longo). A entrada
       sai quando o App o importar. `teste-subtramas.mjs` é o primeiro leitor. */
    /* e paga na MESMA fase (C2, 11/10, frontend): o App.jsx importa
       `subtramas.js` — avancarCoracao na pauta (QUEM CARREGA), confirmada
       só quando a linha chega ao texto; a decisão e o pedido na tela
       (escolhasAbertas/escolherLado, opcoesDoPedido/responderPedido); as
       pistas do elo no Livro (sementesDoElo). As peças da fogueira têm o
       leitor da suíte e esperam a etapa seguinte (o oficial). A entrada saiu. */
    /* 11/10 (Fase MM, MM18): `escuta.js` esperou aqui a fiação em `enviar`
       e `pautaDoTurno`; o App passou a importá-lo no mesmo dia (frontend),
       e a entrada saiu. */
    /* 11/10 (Fase MM, a campanha que prende): `prometido.js`, `fecho.js` e
       `fios-da-estrada.js` nasceram no backend (v9.386–v9.388) e esperaram
       aqui a fiação do App.jsx; o frontend ligou-os na v9.393 (o Cronista,
       a pauta, a resposta, a viagem, o acampamento e `enviar`), e as três
       entradas saíram. */
    /* 12/10 (Fase F2, F2a · EM CENA): `em-cena.js` nasce no backend — a
       lista do que está em cena (`montarEmCena`), a linha da pauta que
       engole os NOMES À MÃO (`pautaComEmCena`) e a frase lida contra a
       lista (`quemNaFrase`) — e espera a fiação do App.jsx pela mão do
       frontend na MESMA fase (pautaDoTurno, depois de cederNaCena; o ref da
       lista de antes). `teste-em-cena.mjs` é o primeiro leitor. A entrada
       sai quando o App o importar. — 12/10: o frontend ligou-o (pautaDoTurno,
       depois de cederNaCena; o ref da lista de antes; declararAgressao lê a
       frase contra a lista), e a entrada saiu. */
    /* 12/10 (Fase F2, F2b · F2c · F2d): `fichas.js` nasce no backend — a
       ficha e o cartão de cada coisa em cena (fichaParaTela, fichasDaCena),
       o id da ficha tocada no envio (quemNoEnvio, bancasDoToque) e a memória
       com rosto (o campo de save `memoria`, a página do Códice, a procura
       fora de cena) — e espera a fiação do App.jsx pelo `oficial` na MESMA
       fase, depois do painel do `aprendiz`. `teste-fichas.mjs` é o primeiro
       leitor. A entrada sai quando o App o importar. — 12/10: o oficial
       ligou-o (as fichas no pé da página, por cima da soleira; o id da ficha
       tocada no golpe, na compra à banca e na procura; o campo `memoria` no
       save e no load; as páginas no Códice), e a entrada saiu. */
    /* 12/10 (Retratos §12): `retratos.js` nasce no backend — o manifesto
       das 18 feras e dos 164 heróis pintados (RETRATOS), quem recebe qual
       pintura (retratoDe) e a conta do disco (recorteDoRetrato) — e espera
       `rosto.jsx`, que o `aprendiz` troca na MESMA leva (a PinturaDoRetrato
       no topo de `Rosto`, com os arquivos de public/retratos). A entrada
       sai quando o rosto o importar. `teste-retratos.mjs` é o primeiro leitor.
       — 12/10: o aprendiz ligou-o na MESMA leva (`0bd4866`: a pintura no
       topo de `Rosto`, com `retratoDe`, `recorteDoRetrato` e `RETRATO`),
       e a entrada saiu. */
    /* 13/10 (MM11 · 10.ª sessão, S10b): `kit-inicial.js` nasce no backend —
       a arma da classe na mão da ficha nova (KIT_INICIAL, armaInicial,
       equiparKitInicial) — e espera a fiação da tela de criação do App.jsx
       pela mão do `oficial`/`frontend` na MESMA leva: `concluir(
       equiparKitInicial(comDom({...})))`, SÓ na criação, nunca no load.
       `teste-kit-inicial.mjs` é o primeiro leitor. A entrada sai quando o
       App o importar. — 13/10: o oficial ligou-o na MESMA leva (a tela de
       criação: `concluir(equiparKitInicial(comDom({...})))`, e só ali), e a
       entrada saiu. */
    /* 28/10 (Fase T, T3-B · o Juiz de fidelidade, 1.ª fatia): `juiz-de-
       fidelidade.js` nasce no backend — a prosa do Narrador contra o que o
       sistema sabia naquele turno (julgarAProsa, oQueAPautaSabe) — e o plano
       manda que primeiro SÓ MEÇA (mente/plano-motor.md, Fase 3: "uma linha
       no custo"). Espera a fiação da trilha A (o `oficial`, que tem o App e
       src/motor/): ler o veredito depois de `aplicar` e escrevê-lo no custo
       do turno. A entrada sai quando o App ou o motor o importar, e a lista
       volta a ficar VAZIA. `teste-juiz-de-fidelidade.mjs` é o primeiro leitor.
       — 28/10 (T1-A, 5.ª fatia): o oficial ligou-o — `src/motor/juiz-do-turno.js`
       importa `julgarAProsa` e monta a entrada com a foto de antes de
       aplicar; o App grava o veredito no save (`fidelidade`, ao lado do
       custo) e na consola. A entrada saiu, e a lista voltou a ficar VAZIA. */
    /* 28/10 (Fase T, T3-B · a sessão como arquivo): `sessao.js` nasce no
       backend — o formato do arquivo de uma sessão, o gravador puro da linha
       de cada turno (gravarOTurno), o validador e o replay. Quem GRAVA não é
       ele: é a fiação no App, da trilha A, numa fatia futura (o cabeçalho de
       sessao.js diz o que ela tem de entregar por turno). Até lá os leitores
       são as suítes (`teste-sessao.mjs`, `jogar-em-node.mjs`) e o executável
       `replay.mjs`. A entrada sai quando o App o importar, e a lista volta a
       ficar VAZIA.
       — 28/10 (T1-A, 7.ª fatia): o oficial ligou-o — o App importa
       `abrirASessao` e `gravarOTurno`, abre a sessão no primeiro envio de
       cada sentada e grava uma linha no fim de cada turno, depois do
       Cronista; onde ela mora (a chave, o teto) diz `sessao-guardada.js`.
       A entrada saiu, e a lista voltou a ficar VAZIA. */
  };
  const mudos = [];
  for (const f of arqs) {
    if (FOLHAS.test(f)) continue;
    if (AGUARDANDO[f]) continue;
    const base = f.replace(/\.jsx?$/, "");
    const quem = arqs.filter((g) => g !== f && (fonte[g].includes(`from "./${f}"`) || fonte[g].includes(`from "./${base}"`)));
    /* T1-A, 5.ª fatia (28/10): o motor (src/motor/) também é leitor — o
       Juiz de fidelidade é o primeiro módulo da raiz que só o motor importa
       (juiz-do-turno.js), e a catraca, que só lia a raiz, acusava-o de mudo */
    const doMotor = MOTOR_FONTES.some((g) => g.includes("from \"../" + f + "\"") || g.includes("from \"../" + base + "\""));
    if (!quem.length && !doMotor) mudos.push(f);
  }
  t(`todo módulo de src/ está ligado a alguém${mudos.length ? " — mudos: " + mudos.join(", ") : ""}`, mudos.length === 0);
}

sec("2. A CATRACA — nenhuma regra NOVA sem leitor");
{
  const RX = /^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm;
  const achadas = {};
  let tot = 0;
  for (const f of arqs) {
    for (const m of fonte[f].matchAll(RX)) {
      const nome = m[1];
      tot++;
      const rx = new RegExp("\\b" + nome + "\\b", "g");
      let c = 0;
      for (const g of arqs) c += (fonte[g].match(rx) || []).length;
      c += (txtProvas.match(rx) || []).length;
      /* T1-A, 5.ª fatia (28/10): e o motor lê também — o poder único foi do
         App para motor/combate-do-turno.js, e chanceUnica passou a ter só o
         motor como leitor fora de unicas.js */
      for (const g of MOTOR_FONTES) c += (g.match(rx) || []).length;
      if (c <= 1) (achadas[f] = achadas[f] || []).push(nome);
    }
  }
  const novas = [];
  for (const f of Object.keys(achadas)) {
    for (const nome of achadas[f]) if (!(PERDOADAS[f] || []).includes(nome)) novas.push(`${f}:${nome}`);
  }
  t(`${tot} regras varridas, nenhuma nova sem leitor${novas.length ? " — " + novas.join(", ") : ""}`, novas.length === 0);

  /* E A CATRACA ANDA NOS DOIS SENTIDOS: uma regra que foi LIGADA tem de
     sair da lista de perdão, senão a lista cresce e vira decoração. */
  const ressuscitadas = [];
  for (const f of Object.keys(PERDOADAS)) {
    for (const nome of PERDOADAS[f]) if (!(achadas[f] || []).includes(nome)) ressuscitadas.push(`${f}:${nome}`);
  }
  t(`nenhum perdão sobrando${ressuscitadas.length ? " — já tem leitor: " + ressuscitadas.join(", ") : ""}`, ressuscitadas.length === 0);
}

sec("2b. O MOTOR (src/motor/) — a mesma catraca, uma pasta abaixo");
{
  /* T1 (27/10): o motor do turno nasce em src/motor/ (o `aplicar` do
     oficial, o Cronista do backend), e as secções 1 e 2 só leem a raiz de
     src/ — um export morto lá dentro passaria calado. A régua é a mesma:
     todo módulo do motor tem quem o importe em src/, e todo export tem
     leitor além da própria definição (teste conta). A LISTA DE ESPERA tem
     a mesma lei da de cima: credor nomeado, e esvazia quando o App liga. */
  const DIRM = path.join(DIR, "motor");
  const motor = fs.existsSync(DIRM) ? fs.readdirSync(DIRM).filter((f) => /\.js$/.test(f)) : [];
  const fonteM = Object.fromEntries(motor.map((f) => [f, fs.readFileSync(path.join(DIRM, f), "utf8")]));
  /* o Cronista que só propõe (cronista.js) foi pago no mesmo dia: a T1-A
     (2.ª fatia, oficial) liga `julgarOCronista` em `cronistaDoTurno`. A
     lista volta a ficar VAZIA. */
  /* 28/10 (Fase T, trilha B): duas peças nascem no backend para a T2-A as
     ligar no App, na mesma leva — `carimbo-da-luta.js` (o `naLuta` de
     `pushMsgs`) e `golpe-no-corpo.js` (`passarPeloAbrigo`,
     `segurarOuPerder`, a quebra do herói e a fila do golpe). Credor: o
     `oficial` da trilha A, que tem o bastão do App. A troca está descrita
     no diário (a âncora, a chamada nova, o que sai); as entradas saem
     quando o App as importar. */
  const ESPERA_DO_MOTOR = {
    "carimbo-da-luta.js": "trilha A (oficial): pushMsgs chama carimbarALuta",
    "golpe-no-corpo.js": "trilha A (oficial): passarPeloAbrigo, segurarOuPerder, a quebra e a fila do herói chamam a peça",
  };
  const todos = [...Object.values(fonte), ...Object.values(fonteM)];
  const mudosM = motor.filter((f) => !ESPERA_DO_MOTOR[f] && !todos.some((g) => g.includes(`/motor/${f}"`)));
  t(`todo módulo de src/motor/ está ligado a alguém${mudosM.length ? " — mudos: " + mudosM.join(", ") : ""}`, mudosM.length === 0);
  const pagos = Object.keys(ESPERA_DO_MOTOR).filter((f) => !motor.includes(f) || todos.some((g) => g.includes(`/motor/${f}"`)));
  t(`e a espera do motor não guarda quem já foi ligado${pagos.length ? " — já ligados: " + pagos.join(", ") : ""}`, pagos.length === 0);
  const RX = /^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm;
  const mortos = [];
  let tot = 0;
  for (const f of motor) {
    for (const m of fonteM[f].matchAll(RX)) {
      tot++;
      const rx = new RegExp("\\b" + m[1] + "\\b", "g");
      let c = (txtProvas.match(rx) || []).length;
      for (const g of todos) c += (g.match(rx) || []).length;
      if (c <= 1) mortos.push(`motor/${f}:${m[1]}`);
    }
  }
  t(`${tot} regras do motor varridas, nenhuma sem leitor${mortos.length ? " — " + mortos.join(", ") : ""}`, mortos.length === 0);
}

sec("3. AS DUAS QUE ESTA VARREDURA ACHOU");
{
  /* "Comando: Atacar" custa um ponto no rank 2 e promete "sua invocação
     ataca com fúria redobrada". O leitor dela existia em invocacoes.js,
     ao lado de três irmãos ligados, e ninguém o chamava. É a pior
     versão do bug: o jogador PAGA por ela. */
  const app = fonte["App.jsx"];
  t("a árvore ainda oferece Comando: Atacar", /HAB\("Comando: Atacar"/.test(fonte["classes.js"]));
  t("e agora ela é lida", /temComandoAtacar\(persAtual\)/.test(app));
  t("dando vantagem às invocações", /comFuria = temComandoAtacar\(persAtual\) \? invocacoesDe/.test(app));
  t("sem virar uma segunda Voz de Comando", !/comFuria[\s\S]{0,400}?turnoDosCompanheiros\([\s\S]{0,200}?turnoDosCompanheiros\(/.test(app));
  const comb = fonte["combate.js"];
  t("o motor distingue quem tem fúria", /const furioso = \(nome\) => provocado \|\| \(comFuria \|\| \[\]\)\.includes\(nome\)/.test(comb));
  t("e ninguém ficou com o `provocado` cru", !/vantagem: provocado/.test(comb));

  /* TIPOS_DE_ALVO era uma tabela escrita e nunca lida — e com ela o
     `comoDoi`, que diz QUE ESPÉCIE DE FERIDA o alvo é. O envelope do
     vilão mandava um nome cru: "ele pôs a mão em Marta" e "ele pôs a mão
     em Vale Torto" chegavam à IA com o mesmo peso. */
  const vil = fonte["vilao.js"];
  t("escolherAlvo lê a tabela", /const t = tipoDoAlvo\(custa\)/.test(vil));
  t("e não repete a ordem à mão", !/custa === "gente" \? \["pessoas"/.test(vil));
  t("o alvo volta com o tipo de ferida", /comoDoi: t2 \? t2\.comoDoi : ""/.test(vil));
  t("e o envelope o usa", /r\.alvo\.comoDoi \? r\.alvo\.comoDoi \+ ": " : ""/.test(vil));
}

sec("4. E O COMPORTAMENTO NÃO MUDOU");
{
  const { escolherAlvo, TIPOS_DE_ALVO, tipoDoAlvo } = await import("../src/vilao.js");
  const ctx = { pessoas: ["Marta"], lugares: ["Vale Torto"], promessas: ["a dívida do moleiro"] };
  t("gente escolhe gente", escolherAlvo("gente", ctx, () => 0).campo === "pessoas");
  t("lugar escolhe lugar", escolherAlvo("lugar", ctx, () => 0).campo === "lugares");
  t("voz escolhe promessa", escolherAlvo("voz", ctx, () => 0).campo === "promessas");
  /* a ordem de recuo é a mesma de antes, e é por isso que cada linha da
     tabela carrega a SUA ordem em vez de o código derivá-la: "gente" caía
     em promessas antes de lugares, e derivar teria trocado isso em
     silêncio */
  t("gente sem gente cai em promessa", escolherAlvo("gente", { lugares: ["X"], promessas: ["Y"] }, () => 0).campo === "promessas");
  t("e o tipo de ferida vem junto", escolherAlvo("gente", ctx, () => 0).comoDoi === "alguém que você conhece");
  t("sem nada, sem alvo", escolherAlvo("gente", {}, () => 0) === null);
  t("tipoDoAlvo acha e não inventa", !!tipoDoAlvo("voz") && tipoDoAlvo("nada") === null);
  t("toda linha da tabela diz como dói", TIPOS_DE_ALVO.every((x) => x.comoDoi && x.ordem.length === 3));
}

console.log(`\nligação v9.85: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
