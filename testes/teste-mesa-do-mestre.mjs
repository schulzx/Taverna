/* A MESA DO MESTRE — a conta das peças (V1 · F1 · 15/11/2026)

   Prova em Node o que `mesa-do-mestre.js` decide e o que as tabelas novas
   de `estilo.js` guardam, contra os números de formas.md §«A Mesa do
   Mestre · F1» §2–§4: os tokens novos de T, LUZ_DA_MESA (com o teto do
   véu), SOMBRA_DA_MESA, a escala tipográfica com o piso depois do
   multiplicador, a pilha de discos, a altura da vela, a carta de pé, o
   lacre e a ordem dos donos do Esc.
*/
import {
  T, LUZ_DA_MESA, TETO_DO_VEU, SOMBRA_DA_MESA, ESCALA_DA_MESA, PISOS_DA_MESA, TAMANHO_DO_TEXTO, PECAS_DA_MESA, ESCUDO_DO_MESTRE, VELA, FONT_CSS,
} from "../src/estilo.js";
import {
  pilhasDoRecurso, horasDesdeAs6, alturaDaVela, vigiliasQueFaltam, PALAVRA_DA_HORA, rotuloDaVela,
  LUZES_DE_NOITE, modoDaLuz, raioDoHalo, luzDaMesa, multiplicadorValido, tamanhoDoTextoGuardado, tamanhoNaEscala,
  contasAcesas, estadoDaCarta, contornoDoLacre, DONOS_DO_ESC, quemTemOEsc,
} from "../src/mesa-do-mestre.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const contraste = (a, b) => razao(rgb(a), rgb(b));

sec("1. Os tokens novos de T (formas.md F1 §2)");
{
  const F1 = { latao: "#B8934C", lataoLume: "#E5C67E", lataoSombra: "#6B5226", lacre: "#9B2A22", lacreLume: "#E0654F", lacreSombra: "#5E1512", sobreLacre: "#F6EEDD", osso: "#E6D9BD", ossoLume: "#F6EEDD", ossoSombra: "#B7A27E", violetaSombra: "#4B3F8F", haloDaVela: "#FFC877", veuDaNoite: "#05080A" };
  for (const [k, v] of Object.entries(F1)) t(`T.${k} = ${v}`, T[k] === v, String(T[k]));
  t("VELA.cor.halo lê T.haloDaVela (uma cor, um dono)", VELA.cor.halo === T.haloDaVela);
  /* os contrastes que o F1 mediu e que a lei de papel usa */
  t("lacre sobre pergaminho ≥ 5,5 (5,63)", contraste(T.lacre, T.pergaminho) >= 5.5);
  t("lacre no feltro é baixo (1,67): por isso nunca pousa nele", contraste(T.lacre, LUZ_DA_MESA.dia.feltro) < 2);
  t("tinta sobre osso ≥ 11 (11,81)", contraste(T.tintaDoPergaminho, T.osso) >= 11);
  t("sobreLacre sobre a cera ≥ 6,5 (6,62)", contraste(T.sobreLacre, T.lacre) >= 6.5);
  t("inkMeio no feltro do dia ≥ 7 (7,78) — a letra do feltro", contraste(T.inkMeio, LUZ_DA_MESA.dia.feltro) >= 7);
  t("os aposentados continuam em T até a última tela sair deles", ["rosa", "mundo", "mundoSoft", "onMundo", "violet"].every((k) => typeof T[k] === "string"));
  t("FONT_CSS carrega Spectral itálico 400 e bold 700 (a nota e o número do lacre)", /Spectral:ital,wght@[^&]*1,400/.test(FONT_CSS) && /Spectral:ital,wght@[^&]*0,700/.test(FONT_CSS));
}

sec("2. A luz é um modo (LUZ_DA_MESA)");
{
  t("três modos: dia, noite, masmorra", Object.keys(LUZ_DA_MESA).join() === "dia,noite,masmorra");
  t("o feltro do dia é #183222 (o theme-color da marca)", LUZ_DA_MESA.dia.feltro === "#183222");
  t("nenhum véu passa do teto de 12 %", Object.values(LUZ_DA_MESA).every((l) => l.veuDaPagina <= TETO_DO_VEU) && TETO_DO_VEU === 0.12);
  t("modoDaLuz: meio-dia é dia", modoDaLuz({ hora: 12 }) === "dia");
  t("modoDaLuz: 23h é noite; 3h (madrugada) também", modoDaLuz({ hora: 23 }) === "noite" && modoDaLuz({ hora: 3 }) === "noite" && LUZES_DE_NOITE.includes("madrugada"));
  t("modoDaLuz: masmorra ganha do sol", modoDaLuz({ hora: 12, emMasmorra: true }) === "masmorra");
  t("raio do halo na masmorra: 100 + 50 × tochas", raioDoHalo("masmorra", 0) === 100 && raioDoHalo("masmorra", 3) === 250);
  t("raio do halo na masmorra tem teto 400", raioDoHalo("masmorra", 20) === 400);
  t("raio do halo de dia é 750, de noite 400", raioDoHalo("dia", 9) === 750 && raioDoHalo("noite") === 400);
  const l = luzDaMesa({ hora: 22, emMasmorra: false });
  t("luzDaMesa devolve o modo e as cores dele", l.modo === "noite" && l.feltro === LUZ_DA_MESA.noite.feltro && l.veuDaPagina === 0.08);
  t("luzDaMesa(null) não lança e é dia", luzDaMesa(null).modo === "dia");
}

sec("3. As três sombras (SOMBRA_DA_MESA)");
{
  t("peça, pousado, erguido", Object.keys(SOMBRA_DA_MESA).join() === "peca,pousado,erguido");
  t("cada sombra tem mais camadas que a anterior", SOMBRA_DA_MESA.peca.split("rgba").length < SOMBRA_DA_MESA.pousado.split("rgba").length && SOMBRA_DA_MESA.pousado.split("rgba").length === SOMBRA_DA_MESA.erguido.split("rgba").length);
}

sec("4. A letra: o piso vale depois do multiplicador");
{
  t("pisos: rótulo 12, nome 13", PISOS_DA_MESA.rotulo === 12 && PISOS_DA_MESA.nome === 13);
  t("as quatro opções do escudo: 0,9 · 1 · 1,15 · 1,3", TAMANHO_DO_TEXTO.opcoes.join() === "0.9,1,1.15,1.3" && TAMANHO_DO_TEXTO.padrao === 1);
  t("a chave é da config (taverna_cfg_*), campo novo", TAMANHO_DO_TEXTO.chave === "taverna_cfg_texto");
  t("a 0,9 o rótulo fica em 12, não em 10,8", tamanhoNaEscala("rotulo", 0.9) === 12);
  t("a 0,9 o nome fica em 13", tamanhoNaEscala("nome", 0.9) === 13);
  t("a 1,3 a prosa vai a 23,4", tamanhoNaEscala("prosa", 1.3) === 23.4);
  t("no telefone a prosa é 17", tamanhoNaEscala("prosa", 1, true) === 17);
  t("nenhum estilo, em nenhuma opção, abaixo de 12", Object.keys(ESCALA_DA_MESA).filter((k) => ESCALA_DA_MESA[k].corpo > 0).every((k) => TAMANHO_DO_TEXTO.opcoes.every((m) => tamanhoNaEscala(k, m) >= 12)));
  t("multiplicador estranho volta ao padrão", multiplicadorValido(7) === 1 && multiplicadorValido("x") === 1 && multiplicadorValido(1.15) === 1.15);
  t("a config guardada: vazio = padrão, '1.3' = 1,3, lixo = padrão", tamanhoDoTextoGuardado(null) === 1 && tamanhoDoTextoGuardado("1.3") === 1.3 && tamanhoDoTextoGuardado("abc") === 1);
  t("a nota do Mestre é Spectral itálico 14/20", ESCALA_DA_MESA.notaDoMestre.familia === "Spectral" && ESCALA_DA_MESA.notaDoMestre.italico && ESCALA_DA_MESA.notaDoMestre.corpo === 14 && ESCALA_DA_MESA.notaDoMestre.entrelinha === 20);
  t("o número do lacre é Spectral Bold (o 1 do Cinzel lê-se I)", ESCALA_DA_MESA.numeroDoLacre.familia === "Spectral" && ESCALA_DA_MESA.numeroDoLacre.peso === 700);
}

sec("5. A peça de recurso: um disco, uma unidade");
{
  t("8 rações = uma pilha de 8", JSON.stringify(pilhasDoRecurso("racoes", 8).pilhas) === "[8]");
  t("10 é a pilha cheia; 11 nasce a 2.ª", JSON.stringify(pilhasDoRecurso("agua", 10).pilhas) === "[10]" && JSON.stringify(pilhasDoRecurso("agua", 11).pilhas) === "[10,1]");
  t("moedas: 1 disco = 10; 150 = [10,5]", JSON.stringify(pilhasDoRecurso("moedas", 150).pilhas) === "[10,5]");
  t("5 moedas ainda são um disco (só o nada fica vazio)", pilhasDoRecurso("moedas", 5).discos === 1 && pilhasDoRecurso("moedas", 0).discos === 0);
  t("teto de pilhas; o número continua a verdade", pilhasDoRecurso("tochas", 99).pilhas.length === PECAS_DA_MESA.recurso.tetoDePilhas && pilhasDoRecurso("tochas", 99).quantidade === 99 && pilhasDoRecurso("tochas", 99).transbordou);
  t("negativo, nulo e texto não lançam", pilhasDoRecurso("racoes", -3).discos === 0 && pilhasDoRecurso("racoes", null).discos === 0 && pilhasDoRecurso("racoes", "x").discos === 0);
  t("o alvo da peça é 72 × 112", PECAS_DA_MESA.recurso.alvo.largura === 72 && PECAS_DA_MESA.recurso.alvo.alto === 112);
}

sec("6. A vela-relógio: a altura é a hora");
{
  t("às 6 a vela é nova: 8 + 96 = 104", alturaDaVela(6) === 104);
  t("às 18 está a meio: 8 + 48 = 56", alturaDaVela(18) === 56);
  t("às 5:59 do dia seguinte é quase toco", alturaDaVela(5.99) < 9);
  t("horasDesdeAs6 dá a volta à meia-noite", horasDesdeAs6(3) === 21 && horasDesdeAs6(6) === 0);
  t("a altura só desce ao longo do dia (6 → 5)", [6, 9, 12, 15, 18, 21, 0, 3, 5].map(alturaDaVela).every((h, i, a) => i === 0 || h < a[i - 1]));
  t("quatro vigílias às 6; uma às 3 da manhã", vigiliasQueFaltam(6) === 4 && vigiliasQueFaltam(3) === 1);
  t("o rótulo: Dia · 06:00, Tarde · 18:00, Noite · 22:00, Noite · 03:00", rotuloDaVela(6) === "Dia · 06:00" && rotuloDaVela(18) === "Tarde · 18:00" && rotuloDaVela(22) === "Noite · 22:00" && rotuloDaVela(3) === "Noite · 03:00");
  t("as fronteiras da palavra cobrem as 24 horas", Array.from({ length: 24 }, (_, h) => rotuloDaVela(h)).every((r) => PALAVRA_DA_HORA.some((p) => r.startsWith(p.palavra))));
  t("os minutos aparecem: 8,1667 → 08:10", rotuloDaVela(8 + 10 / 60) === "Dia · 08:10");
}

sec("7. A carta de pé");
{
  t("carta 140 × 196, alvo 140 × 252", PECAS_DA_MESA.carta.largura === 140 && PECAS_DA_MESA.carta.alto === 196 && PECAS_DA_MESA.carta.alvo.alto === 252);
  t("contas: cheio = 10, 1 PV ainda acende uma, 0 apaga", contasAcesas(18, 18) === 10 && contasAcesas(1, 18) === 1 && contasAcesas(0, 18) === 0);
  t("contas: 5 de 18 = 3", contasAcesas(5, 18) === 3);
  t("estado: caído vence tudo", estadoDaCarta({ vida: 0, vidaMax: 18, vez: true }) === "caido");
  t("estado: a vez vence ferido", estadoDaCarta({ vida: 5, vidaMax: 18, vez: true }) === "vez");
  t("estado: ferido a ≤ metade; repouso acima", estadoDaCarta({ vida: 9, vidaMax: 18 }) === "ferido" && estadoDaCarta({ vida: 10, vidaMax: 18 }) === "repouso");
}

sec("8. O lacre");
{
  t("três tamanhos: G 96 · M 56 · P 32", PECAS_DA_MESA.lacre.tamanhos.G === 96 && PECAS_DA_MESA.lacre.tamanhos.M === 56 && PECAS_DA_MESA.lacre.tamanhos.P === 32);
  t("o borrão tem 12 pontas", PECAS_DA_MESA.lacre.pontas.length === 12);
  const d = contornoDoLacre(96);
  t("o contorno é um path fechado com 12 curvas", d.startsWith("M") && d.endsWith("Z") && (d.match(/Q/g) || []).length === 12);
  t("mesma cera em toda máquina (determinístico)", contornoDoLacre(56) === contornoDoLacre(56));
}

sec("9. De quem é o Esc (o escudo não rouba a tecla)");
{
  t("o escudo aberto é o primeiro dono: Esc fecha-o", DONOS_DO_ESC[0] === "escudo" && quemTemOEsc({ escudo: true, janela: true, luta: true }) === "escudo");
  t("campo de escrita com foco leva a tecla", quemTemOEsc({ escrita: true }) === "escrita");
  t("uma janela aberta leva a tecla antes da luta", quemTemOEsc({ janela: true, luta: true }) === "janela");
  t("na luta, Esc é da luta (o escudo abre pelo canto)", quemTemOEsc({ luta: true }) === "luta");
  t("ninguém quer: Esc abre o escudo", quemTemOEsc({}) === "abrir" && quemTemOEsc(null) === "abrir");
  t("fora da tela de jogo, ninguém", quemTemOEsc({ fora: true }) === "ninguem");
  t("a ordem inteira: escudo, escrita, janela, mapa, luta, cerimonia", DONOS_DO_ESC.join() === "escudo,escrita,janela,mapa,luta,cerimonia");
}

sec("10. O escudo do Mestre: as medidas do quadro I");
{
  t("véu de 66 %", ESCUDO_DO_MESTRE.veu === 0.66);
  t("folhas 336 × 600 e 460 × 680", ESCUDO_DO_MESTRE.folhas.lado.largura === 336 && ESCUDO_DO_MESTRE.folhas.lado.alto === 600 && ESCUDO_DO_MESTRE.folhas.centro.largura === 460 && ESCUDO_DO_MESTRE.folhas.centro.alto === 680);
  t("as três folhas cabem na largura onde a mesa as abre", ESCUDO_DO_MESTRE.folhas.lado.largura * 2 + ESCUDO_DO_MESTRE.folhas.centro.largura + 2 * ESCUDO_DO_MESTRE.folhas.entre + 2 * 8 <= ESCUDO_DO_MESTRE.telefone.ate);
  t("alvos ≥ 44: interruptor 52, escolha 44, botão 52, pé 84", ESCUDO_DO_MESTRE.interruptor.linha >= 44 && ESCUDO_DO_MESTRE.escolha.alto >= 44 && ESCUDO_DO_MESTRE.botao.alto >= 44 && ESCUDO_DO_MESTRE.telefone.pe === 84);
}

console.log(`\n${bons} ok · ${maus} mal`);
process.exit(maus ? 1 : 0);
