/* teste-hud-da-mesa.mjs — AAA · 4, o HUD B «a mesa do Mestre» (formas.md §AAA §13)
   A tabela HUD_DA_MESA tem de dizer de si o que a peça lê dela: as áreas
   batem com as colunas e as linhas, a vela conhece todas as fases do
   relógio, as gemas são as pedras que a §13 nomeou, e nenhuma porta do
   trilho antigo ficou sem casa. */
import { readFileSync } from "node:fs";
import { HUD_DA_MESA, VELA, GEMA_DA_SUBCLASSE, BORDA_DA_MESA, T } from "../src/estilo.js";
import { FASES_DO_DIA } from "../src/mapa-vivo.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const ler = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const APP = ler("../src/App.jsx");
const MESA = ler("../src/painel-mesa-do-mestre.jsx");
const H = HUD_DA_MESA;

sec("1. o leiaute é coerente consigo");
t("na mesa, cada linha de áreas tem tantas células quantas colunas", H.mesa.areas.every((l) => l.split(" ").length === H.mesa.colunas.length));
t("e tantas linhas de áreas quantas alturas", H.mesa.areas.length === H.mesa.linhas.length);
t("no telefone também", H.telefone.areas.length === H.telefone.linhas.length);
/* MOVIDA em 07/11 (TL 8, a tela limpa): a barra do topo e o ecrã do Mestre
   passaram a ser uma faixa só, a `barra` — a intenção fica: a primeira linha
   do leiaute tem a altura que a tabela da peça diz, nas duas larguras */
t("a barra é a primeira linha, com a altura da tabela (telefone e mesa)", H.telefone.areas[0] === "barra" && parseInt(H.telefone.linhas[0], 10) === H.telefone.barra.alto
  && H.mesa.areas[0].split(" ").every((a) => a === "barra") && parseInt(H.mesa.linhas[0], 10) === H.mesa.barra.alto);
t("a borda é a da mesa (uma só verdade)", H.mesa.borda === BORDA_DA_MESA.mesa && H.telefone.borda === BORDA_DA_MESA.telefone);
t("o passo dos objetos cabe o alvo deles (90 × 115 da §13)", H.mesa.objetos.passo >= H.mesa.objetos.alvo.alto && H.mesa.objetos.alvo.largura >= 90);
t("a carta do herói é maior que a do companheiro, nas duas larguras", H.mesa.cartas.heroi > H.mesa.cartas.companheiro && H.telefone.cartas.heroi > H.telefone.cartas.companheiro);

sec("2. a vela é o relógio");
t("a vela conhece todas as fases do relógio", FASES_DO_DIA.every((f) => !!VELA.porFase[f.id]));
t("acesa ao entardecer, à noite e de madrugada; apagada de dia; fumo ao amanhecer",
  ["entardecer", "noite", "madrugada"].every((f) => VELA.porFase[f].estado === "acesa")
  && ["manha", "tarde"].every((f) => VELA.porFase[f].estado === "apagada") && VELA.porFase.amanhecer.estado === "fumo");
t("a cera encurta pela noite fora", VELA.porFase.entardecer.altura > VELA.porFase.noite.altura && VELA.porFase.noite.altura > VELA.porFase.madrugada.altura);
t("a peça lê a fase pela régua do mapa vivo, sem copiar as horas", /FASES_DO_DIA\.find/.test(MESA) && !/\b(360|480|720|1020|1260)\b/.test(MESA));
t("e toda animação da vela tem saída no reduced motion", /prefers-reduced-motion: reduce\) \{ \.tv-vela-chama, \.tv-vela-luz \{ animation: none; \} \.tv-vela-fumo \{ display: none; \}/.test(MESA));

sec("3. as gemas são as pedras nomeadas");
t("PV é a granada do Bárbaro", H.gemasDaCarta.PV === GEMA_DA_SUBCLASSE["Bárbaro"].corpo);
t("PM é a ametista do Arcanista", H.gemasDaCarta.PM === GEMA_DA_SUBCLASSE.Arcanista.corpo);
t("Destino é o âmbar", H.gemasDaCarta.Destino === T.amber);
t("a AMEAÇA tem três pontos, e sem número do sistema o painel não nasce", H.ameaca.pontos === 3 && /const comAmeaca = ameaca != null/.test(MESA));
t("e o App não inventa a ameaça (não a passa enquanto o sistema não a der)", !/ameaca=\{/.test(APP));

sec("4. muda a porta, não a sala — nenhuma porta do trilho ficou sem casa");
const ABAS = (APP.match(/const ABAS = (\[[^\n]*\]);/) || [])[1] || "";
const ids = [...ABAS.matchAll(/id: "(\w+)"/g)].map((m) => m[1]);
t("as abas de hoje lêem-se do App", ids.length >= 5 && ids.includes("gestao"));
t("os objetos da §13 são abas que existem (bolsa = inv)", H.mesa.objetos.ordem.every((o) => ids.includes(o === "bolsa" ? "inv" : o)));
/* movida (AR1, 06/11): a carta do herói abre a casa do herói (abrirOHeroi), não a porta da novidade */
t("a Gestão vai para dentro da ficha: a carta do herói abre a casa do herói", /aoAbrirFicha=\{abrirOHeroi\}/.test(APP) && /\.filter\(\(a\) => a\.id !== "gestao"\)/.test(APP));
t("o Códex e a Ascensão continuam na coluna da mesa (o resto das abas)", /const resto = telefone \? \[\] : abas\.filter/.test(APP));
t("o toque num objeto abre a mesma gaveta (setAba)", /aoTocar=\{\(\) => \{ try \{ setAba\(aba === a\.id \? null : a\.id\); \}/.test(APP));
t("o painel HORA abre O TEMPO", /aoAbrirTempo=\{\(\) => setTempoAberto\(\(v\) => !v\)\}/.test(APP));
/* MOVIDA em 06/11 (o «Bolsa, 1 moedas» que o oficial achou ao vivo): a legenda
   ganhou o singular; a intenção fica — as moedas continuam à vista, na Bolsa */
t("as moedas continuam à vista, na legenda da Bolsa", /a\.id === "inv" \? \(\(\) => \{ const n = \(personagem && personagem\.moedas\) \|\| 0; return n \+ \(n === 1 \? " moeda" : " moedas"\); \}\)\(\)/.test(APP));
/* MOVIDA em 08/11 (TL 9, o oficial): o ecrã do Mestre passou a ser a Barra do
   Mestre, e o calou do lugar mudou de nome com ela. A intenção fica: o lugar da
   barra, os objetos e o destino da carta continuam em try/catch. */
t("e toda a fiação nova está em try/catch", /calou\("os objetos da mesa", e\)/.test(APP) && /calou\("o lugar na barra do Mestre", err\)/.test(APP) && /calou\("o destino na carta", e\)/.test(APP));

sec("5. os defeitos da v9.605 (a pessoa jogou a 1905 × 860, 05/11)");
/* a página ficava com ~355 px: a mesa baixa encolhe as cartas e estreita o horizonte */
/* MOVIDA em 07/11 (TL 8): a fila de baixo saiu e as cartas subiram para a
   coluna do grupo; a mesa baixa é agora abaixo de 800, e as cartas do grupo
   vão a 0,8 em vez de 0,9 (as duas sobre a carta da mesa, onde o herói é
   maior). A fila de baixo, enquanto o App a desenhar, guarda a escala dela em
   `cartas.baixa`. A intenção fica: na mesa baixa as cartas encolhem, e o
   herói continua maior que o companheiro. */
t("a mesa baixa tem cartas menores, e o herói continua maior que o companheiro",
  H.mesa.baixa.abaixoDe > 0 && H.mesa.baixa.cartas.heroi < H.mesa.grupo.cartas.heroi && H.mesa.baixa.cartas.companheiro < H.mesa.grupo.cartas.companheiro
  && H.mesa.baixa.cartas.heroi * H.mesa.cartas.heroi > H.mesa.baixa.cartas.companheiro * H.mesa.cartas.companheiro
  && H.mesa.cartas.baixa.heroi < H.mesa.cartas.heroi && H.mesa.cartas.baixa.heroi > H.mesa.cartas.baixa.companheiro);
/* MOVIDA em 07/11 (TL 8): a fila das cartas saiu do leiaute da mesa (o que
   roubava 165 px à página em todas as alturas). A intenção fica, e ficou mais
   forte: nenhum vão por baixo do campo — o campo é a última linha da mesa —,
   e a fila velha, enquanto o App a desenhar, mede o que a tabela diz. */
t("a fila das cartas saiu da mesa (o campo é a última linha) e a velha mede a tabela", H.mesa.linhas.length === 4 && H.mesa.linhas[3] === "48px" && !H.mesa.areas.join(" ").includes("cartas")
  && /height: telefone \? H\.telefone\.cartas\.alto : undefined/.test(MESA));
/* MOVIDA em 08/11 (TL 9, o oficial): a fila de baixo saiu da mesa; na mesa baixa
   as cartas do GRUPO vão à escala de HUD_DA_MESA.mesa.baixa.cartas (não à
   `baixa` da fila velha), e o horizonte estreito vale para a mesa do telefone
   (abaixo da mesa larga) ou baixa. A intenção fica: a altura da janela, lida da
   tabela, encolhe as cartas e estreita o horizonte. */
t("o App lê a mesa baixa da tabela, com a altura da janela", /alturaDaJanela < HUD_DA_MESA\.mesa\.baixa\.abaixoDe/.test(APP) && /\(mesaBaixa \? HUD_DA_MESA\.mesa\.baixa\.cartas : HUD_DA_MESA\.mesa\.grupo\.cartas\)\.heroi/.test(APP) && /telefone=\{!mesaLarga \|\| mesaBaixa\}/.test(APP));
/* os objetos iam parar à borda da tela: as margens automáticas saem da página e ficam por fora */
/* MOVIDA em 08/11 (TL 9, o oficial): o contrapeso de 120 à esquerda deu lugar à
   coluna do grupo (236), que leva a margem automática da esquerda; os objetos
   levam a da direita. A intenção fica: as margens automáticas ficam POR FORA das
   três colunas, e os objetos encostam na página. */
t("os objetos encostam na página (as margens automáticas ficam por fora)", /width: HUD_DA_MESA\.mesa\.grupo\.largura, marginLeft: "auto"/.test(APP) && /width: parseInt\(HUD_DA_MESA\.mesa\.colunas\[2\], 10\), marginRight: "auto"/.test(APP));
/* a Bolsa abria a gaveta antiga; o Fechar da carta só tirava a camada de cima */
/* movida (AR1, 06/11): a casa abre-se nas DUAS larguras (antes o heroiNaMesa
   separava o telefone, onde a carta vivia dentro da sub-aba da Gestão) — a pessoa
   via duas telas para a mesma coisa */
t("a Bolsa abre a carta do herói na aba do equipamento", /const porCima = aba === "inv" \|\| \(aba === "gestao" && subGestao === "ficha"\);/.test(APP) && /aba=\{daBolsa \? "equipamento" : "ficha"\}/.test(APP));
/* movida (AR1, 06/11): a gaveta antiga já não fica a uma porta («Mais da bolsa»,
   «Mais detalhes», «O inventário» abriam a tela velha). O que só ela fazia mora
   agora na casa nova — cada ação com o seu leitor —, e as gavetas antigas saem
   da vista por uma tabela, sem apagar o código («sai a porta, não o código») */
t("as gavetas antigas saem da vista, por tabela", /const GAVETAS_ANTIGAS = \{ ficha: false, bolsa: false \};/.test(APP) && /aba === "inv" && GAVETAS_ANTIGAS\.bolsa &&/.test(APP) && /subGestao === "ficha" && GAVETAS_ANTIGAS\.ficha &&/.test(APP) && !/"Mais da bolsa"/.test(APP));
t("o que a bolsa antiga fazia mora na casa nova: usar, o verbo, dar, desmontar, soltar, a bancada, a forja",
  /<BolsaDaCarta itens=\{linhas\}/.test(APP) && /onUsarConsumivel\(it\.nome\)\) \}\]/.test(APP) && /onAcaoDeItem\(it\.nome, acao\.verbo\)/.test(APP)
  && /transferirItem\("eu", d, origem, nome\)/.test(APP) && /desmontarEquip\("eu", it\.nome\)/.test(APP) && /descartarEquip\(it\.nome\)\)/.test(APP)
  && /descartarItem\(it\.nome\)\)/.test(APP) && /<PainelBancada bancada=\{bancada\}[^\n]*\/>\s*\{forjaDoHeroi\}/.test(APP) && /detalhes=\{detalhes\} bolsa=\{bolsaAqui\}/.test(APP));
t("a ficha antiga (perícias, condições) desce para dentro da carta", /<div className="p-2">\{fichaAntiga\}<\/div>/.test(APP) && /Perícias e detalhes/.test(APP));
t("as outras salas da Gestão abrem de dentro da casa", /const portas = abertasAqui\.filter\(\(x\) => x\.id !== "ficha"\)/.test(APP) && /portas=\{portas\} aoAbrirPorta=\{abrirPorta\}/.test(APP) && /al\.aoEscolher\("gestao"\)/.test(APP));
t("a casa de cada companheiro: o boneco e a mochila DELE, e a troca pelo «passar»",
  /equiparComp\(comp\.nome, item\)/.test(APP) && /desequiparComp\(comp\.nome, slot\)/.test(APP) && /companheiro=\{!!comp\}/.test(APP)
  && /transferirItem\(comp\.nome, "eu", "inventario", it\.nome\)/.test(APP) && /pessoas=\{pessoas\} quem=/.test(APP));
t("fechada, a casa volta ao herói e à Ficha", /setAbaVista\(null\); setInvDe\("eu"\); setSubGestao\("ficha"\);/.test(APP));
t("o Fechar da carta fecha tudo e devolve à mesa", /aoFechar=\{fecharTudo\}/.test(APP) && !/aoFechar=\{\(\) => setHeroiDispensado\(true\)\}/.test(APP) && /calou\("fechar a carta do herói", e\)/.test(APP));

/* 07/11 (formas.md §AR 12): a prateleira dos mantimentos pousa na mesa */
t("a prateleira dos mantimentos: na mesa debaixo da Bolsa, no telefone debaixo dos objetos",
  /<PrateleiraDosMantimentos dados=\{u\.dados\} contagens=\{u\.contagens\} telefone=\{telefone\} aoAbrir=\{abrirOsMantimentos\} \/>/.test(APP)
  && /if \(telefone \|\| a\.id !== "inv" \|\| !prateleira\) return obj;/.test(APP)
  && /<span className="flex items-start gap-1">\{lista\}<\/span>\{prateleira\}/.test(APP));
t("a face e o «×N» saem de uma regra só (mantimentosDeUso), com as tochas da masmorra lá dentro",
  /function mantimentosDeUso\(personagem, masmorra\)/.test(APP)
  && /const tochas = masmorra && !masmorra\.encerrada \? Math\.max\(0, Number\(masmorra\.tochas\) \|\| 0\) : sup\.tochas;/.test(APP)
  && /dados: mantimentosDeUso\(personagem, masmorra\)\.dados/.test(APP)
  && (APP.match(/faceDoDadoDeUso\("tochas"/g) || []).length === 1);
t("o toque abre a Bolsa e procura «Mantimentos»; a prateleira que estoura cala-se",
  /const abrirOsMantimentos = \(\) => \{\s*try \{\s*setAba\("inv"\);/.test(APP)
  && /section\[aria-label="Mantimentos"\]/.test(APP)
  && /calou\("a prateleira dos mantimentos", e\)/.test(APP) && /calou\("abrir os mantimentos", e\)/.test(APP));

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
