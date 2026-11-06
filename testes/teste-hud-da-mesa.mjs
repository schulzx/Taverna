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
t("o ecrã do telefone é a primeira linha, com a altura da tabela", H.telefone.areas[0] === "ecra" && parseInt(H.telefone.linhas[0], 10) === H.telefone.ecra.alto);
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
t("a Gestão vai para dentro da ficha: a carta do herói abre a porta de sempre", /aoAbrirFicha=\{abrirAPorta\}/.test(APP) && /\.filter\(\(a\) => a\.id !== "gestao"\)/.test(APP));
t("o Códex e a Ascensão continuam na coluna da mesa (o resto das abas)", /const resto = telefone \? \[\] : abas\.filter/.test(APP));
t("o toque num objeto abre a mesma gaveta (setAba)", /aoTocar=\{\(\) => \{ try \{ setAba\(aba === a\.id \? null : a\.id\); \}/.test(APP));
t("o painel HORA abre O TEMPO", /aoAbrirTempo=\{\(\) => setTempoAberto\(\(v\) => !v\)\}/.test(APP));
t("as moedas continuam à vista, na legenda da Bolsa", /a\.id === "inv" \? \(\(personagem && personagem\.moedas\) \|\| 0\) \+ " moedas"/.test(APP));
t("e toda a fiação nova está em try/catch", /calou\("os objetos da mesa", e\)/.test(APP) && /calou\("o lugar no ecrã do Mestre", err\)/.test(APP) && /calou\("o destino na carta", e\)/.test(APP));

sec("5. os defeitos da v9.605 (a pessoa jogou a 1905 × 860, 05/11)");
/* a página ficava com ~355 px: a mesa baixa encolhe as cartas e estreita o horizonte */
t("a mesa baixa tem cartas menores, e o herói continua maior que o companheiro",
  H.mesa.baixa.abaixoDe > 0 && H.mesa.baixa.cartas.heroi < H.mesa.cartas.heroi && H.mesa.baixa.cartas.heroi > H.mesa.baixa.cartas.companheiro);
t("a fila das cartas mede as cartas na mesa (nenhum vão por baixo do campo)", H.mesa.linhas[4] === "auto" && /height: telefone \? parseInt\(H\.telefone\.linhas\[5\], 10\) : undefined/.test(MESA));
t("o App lê a mesa baixa da tabela, com a altura da janela", /alturaDaJanela < HUD_DA_MESA\.mesa\.baixa\.abaixoDe/.test(APP) && /baixa=\{mesaBaixa\}/.test(APP) && /telefone=\{!trilhoAVista \|\| mesaBaixa\}/.test(APP));
/* os objetos iam parar à borda da tela: as margens automáticas saem da página e ficam por fora */
t("os objetos encostam na página (as margens automáticas ficam por fora)", /width: parseInt\(HUD_DA_MESA\.mesa\.colunas\[2\], 10\), marginLeft: "auto"/.test(APP) && /width: parseInt\(HUD_DA_MESA\.mesa\.colunas\[2\], 10\), marginRight: "auto"/.test(APP));
/* a Bolsa abria a gaveta antiga; o Fechar da carta só tirava a camada de cima */
t("a Bolsa abre a carta do herói na aba do equipamento", /aba === "inv" \|\| \(heroiNaMesa && aba === "gestao"/.test(APP) && /aba=\{daBolsa \? "equipamento" : "ficha"\}/.test(APP));
t("e o que a gaveta antiga tinha continua a uma porta («Mais da bolsa», «O inventário»)", /daBolsa \? "Mais da bolsa" : "Mais detalhes"/.test(APP) && />O inventário<\/Botao>/.test(APP));
t("o Fechar da carta fecha tudo e devolve à mesa", /aoFechar=\{fecharTudo\}/.test(APP) && !/aoFechar=\{\(\) => setHeroiDispensado\(true\)\}/.test(APP) && /calou\("fechar a carta do herói", e\)/.test(APP));

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
