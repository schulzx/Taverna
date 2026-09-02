/* AS SESSÕES (v9.149)

   O jogo era um rolo infinito. Quem voltasse depois de dez dias caía no
   meio de uma cena sem saber o que estava fazendo ali.

   Existia meio caminho — um botão "Continuar com resumo" — e ele tinha
   dois defeitos, sendo o segundo o grave:

   1) ERA MANUAL. Quem esteve fora dez dias é exatamente quem não sabe
      que precisa de um resumo.

   2) ERA A IA QUE LEMBRAVA. O resumo saía de uma leitura do histórico
      bruto, custava uma chamada de rede, e podia contradizer o cânone.
      Um recap que erra o que aconteceu é pior do que recap nenhum: ele
      reescreve a memória do jogador.

   O QUE ESTA SUÍTE PROTEGE: que o recap continue sendo FATO. Ele sai do
   registro — o mesmo lugar de onde o Arquivista tira o que o Narrador
   lembra — e por isso não pode errar o que aconteceu: ele É o que
   aconteceu. No dia em que alguém quiser "melhorar" o texto pedindo à
   IA que o escreva, é aqui que isso trava. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const X = await import(S + "sessoes.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const HORA = 3600 * 1000;
const AGORA = Date.parse("2026-09-02T20:00:00Z");

const REGISTRO = [
  { t: 1, dia: 3, onde: "Ponte das Velas", quem: ["Ume"], oQue: "aceitou o contrato do porto", peso: 1 },
  { t: 4, dia: 5, onde: "o Poço", quem: [], oQue: "desceu ao poço e achou a chave de bronze", peso: 2 },
  { t: 9, dia: 8, onde: "Forte Rasa", quem: ["Nicolau"], oQue: "matou o capitão da guarda em duelo aberto", peso: 3 },
  { t: 12, dia: 9, onde: "a estrada", quem: [], oQue: "comprou pão", peso: 0 },
  { t: 15, dia: 11, onde: "Monte clara", quem: ["Ume", "Nicolau"], oQue: "queimou o celeiro dos Corvos", peso: 3 },
];

sec("1. CINCO HORAS SEPARAM UMA PAUSA DE OUTRA SESSÃO");
{
  t("meia hora não é outra sessão", !X.houveIntervalo(AGORA - HORA / 2, AGORA).sim);
  t("quatro horas ainda não", !X.houveIntervalo(AGORA - 4 * HORA, AGORA).sim);
  t("seis horas já são", X.houveIntervalo(AGORA - 6 * HORA, AGORA).sim);
  t("dez dias, claro", X.houveIntervalo(AGORA - 240 * HORA, AGORA).sim);
  /* ABAIXO DE CINCO HORAS O RECAP É PIOR QUE INÚTIL: ele explica ao
     jogador uma cena que ele acabou de ler, e isso ensina a pular o
     recap — aí ele não serve nem quando importa. */
  t("e o intervalo curto não vira recap", !X.houveIntervalo(AGORA - HORA, AGORA).sim);
  /* save sem carimbo é save antigo: afirmar intervalo sem saber seria
     mostrar um "anteriormente" a quem nunca saiu */
  t("save sem carimbo não afirma nada", !X.houveIntervalo(0, AGORA).sim);
  t("nem carimbo do futuro", !X.houveIntervalo(AGORA + HORA, AGORA).sim);
  t("lixo não derruba", !X.houveIntervalo("ontem", AGORA).sim && !X.houveIntervalo(null).sim);
}

sec("2. O QUANDO SE LÊ COMO GENTE FALA");
{
  const q = (h) => X.houveIntervalo(AGORA - h * HORA, AGORA).quando;
  t("horas", /^há \d+ horas$/.test(q(7)));
  t("ontem", q(30) === "ontem");
  t("dias", /^há \d dias$/.test(q(72)));
  t("uma semana", q(24 * 8) === "há uma semana");
  t("semanas", /semanas$/.test(q(24 * 20)));
  t("meses", /meses$/.test(q(24 * 90)));
}

sec("3. O RECAP É FATO, E SÓ O QUE PESOU");
{
  const r = X.recapitular({
    registro: REGISTRO, dia: 12, lugar: "Monte clara", grupo: [{ nome: "Ume" }, { nome: "Nicolau" }],
    missoes: [{ titulo: "Achar o irmão de Ume", status: "aberta" }, { titulo: "Pagar a dívida", status: "aberta" }],
    relogios: [{ nome: "A vingança dos Corvos", cheios: 3, segmentos: 6 }, { nome: "Fechado", cheios: 6, segmentos: 6 }],
    nomeCampanha: "A Maré de Ferro", quando: "há 3 dias",
  });
  const txt = r.linhas.join("\n");
  /* ONDE EU PAREI é a pergunta que vem antes das outras, e a única que o
     jogador não responde olhando a tela: a última narrativa fala do que
     aconteceu, não de onde ele está. */
  t("diz onde parou", /Estava em Monte clara/.test(txt) && /no dia 12/.test(txt));
  t("e com quem", /com Ume, Nicolau/.test(txt));
  /* PESO 2 E 3 SÓ. Um recap não precisa saber que o herói comprou pão —
     e se souber, enterra o que importa no meio do que não importa. */
  t("traz a marca", /matou o capitão/.test(txt));
  t("e a virada", /achou a chave/.test(txt));
  t("NÃO traz o pão", !/pão/.test(txt));
  t("nem o contrato de peso 1", !/contrato do porto/.test(txt));
  /* o que continua correndo enquanto o jogador não está é o que ele mais
     esquece */
  t("lista o que ficou em aberto", /Achar o irmão de Ume/.test(txt));
  t("e o relógio andando", /A vingança dos Corvos \(3\/6\)/.test(txt));
  t("mas não o relógio já cheio", !/Fechado/.test(txt));
  t("o título nomeia a campanha", /A Maré de Ferro/.test(r.titulo));
  t("e diz quando foi", /há 3 dias/.test(r.titulo));
}

sec("4. O QUE JÁ FOI CONTADO NÃO SE CONTA DE NOVO");
{
  /* sem isto, a segunda sessão repetiria a primeira e a décima seria
     ilegível */
  const tudo = X.recapitular({ registro: REGISTRO, desdeODia: 0, dia: 12 });
  const so = X.recapitular({ registro: REGISTRO, desdeODia: 10, dia: 12 });
  t("do começo, traz as três de peso", tudo.linhas.join(" ").match(/Dia \d/g).length === 3);
  t("do dia 10 em diante, só a última", so.linhas.filter((l) => /^Dia /.test(l)).length === 1);
  t("e é a certa", /celeiro dos Corvos/.test(so.linhas.join(" ")));
}

sec("5. RECAP VAZIO NÃO INTERROMPE NINGUÉM");
{
  /* melhor não mostrar nada do que mostrar um "anteriormente" que não
     conta nada — um recap só com a linha do lugar não vale a interrupção */
  const nada = X.recapitular({ registro: [], dia: 1, lugar: "Ponte das Velas" });
  t("campanha nova não vale recap", nada.vale === false);
  t("e o texto sai vazio", X.textoDoRecap(nada) === "");
  t("e o envelope também", X.envelopeDaRetomada(nada, "ontem") === "");
  const so1 = X.recapitular({ registro: REGISTRO, dia: 12, lugar: "x" });
  t("com o que pesou, vale", so1.vale === true);
  t("lixo não derruba", X.recapitular().vale === false && X.recapitular(null).vale === false);
  t("nem registro estragado", X.recapitular({ registro: [null, 3, "x"] }).vale === false);
}

sec("6. O NARRADOR RECEBE O RECAP PRONTO — ELE NÃO LEMBRA MAIS");
{
  const r = X.recapitular({ registro: REGISTRO, dia: 12, lugar: "Monte clara", nomeCampanha: "A Maré de Ferro" });
  const e = X.envelopeDaRetomada(r, "há 3 dias");
  t("diz que o sistema recapitulou", /RECAPITULADA PELO SISTEMA/.test(e));
  /* A LINHA QUE FECHA O DEFEITO ANTIGO: ele não escreve o resumo, ele é
     proibido de repeti-lo. Quem lembra é o registro. */
  t("e proíbe recapitular de novo", /NÃO recapitule/.test(e));
  t("manda só reabrir a cena", /Reabra a cena onde eu parei/.test(e));
  t("e não deixa mexer no mundo", /não faça o tempo passar/i.test(e));
  /* o prompt antigo pedia 120 palavras em tom de série a partir do
     histórico bruto — é essa a frase que não pode voltar */
  t("o App não pede mais o resumo à IA", !/recapitule os principais acontecimentos em até 120 palavras/.test(APP));
}

sec("7. O LUGAR BOM DE PARAR — uma vez, e não antes de a sessão existir");
{
  t("depois do chefe, com sessão andada", !!X.ehHoraDeParar("chefe", { turnosNaSessao: 20 }));
  t("e na virada de capítulo", !!X.ehHoraDeParar("capitulo", { turnosNaSessao: 20 }));
  /* QUEM ACABOU DE SENTAR NÃO QUER OUVIR QUE É HORA DE LEVANTAR — e é
     justamente o caso de quem retomou logo depois de um chefe: o clímax
     é do jogo anterior, não deste. */
  t("mas não no terceiro turno", !X.ehHoraDeParar("chefe", { turnosNaSessao: 3 }));
  /* O SEGUNDO "QUE BOM LUGAR PARA PARAR" NA MESMA NOITE É UM TIQUE, e
     ensina a ignorar o primeiro. */
  t("e nunca duas vezes na mesma sessão", !X.ehHoraDeParar("capitulo", { turnosNaSessao: 30, jaSugeriu: true }));
  t("momento desconhecido não inventa", !X.ehHoraDeParar("comprou pão", { turnosNaSessao: 30 }));
  t("nem vazio", !X.ehHoraDeParar("", { turnosNaSessao: 30 }) && !X.ehHoraDeParar(null, {}));
  const f = X.ehHoraDeParar("chefe", { turnosNaSessao: 20 });
  t("a fala nomeia o momento", /o chefe caiu/i.test(X.falaDoFim(f, { dia: 12 })));
  t("e diz que dá para voltar daqui", /retoma daqui/.test(X.falaDoFim(f, {})));
  t("sem fim, sem fala", X.falaDoFim(null) === "");
  /* SEM BOTÃO: isto não pede ao jogador que vá embora, nomeia o momento
     e some. Quem quiser continuar não precisa recusar nada. */
  t("e não há botão de encerrar", !/encerrar sess|Encerrar sess/.test(APP));
}

sec("8. A COSTURA NO APP");
{
  t("o recap aparece sozinho ao voltar", /const volta = houveIntervalo\(sv\.salvoEm\)/.test(APP));
  t("e sai do registro", /registro: registroRef\.current, dia: diaRef\.current/.test(APP));
  /* o "Continuar aventura" simples não fazia chamada nenhuma e continua
     não fazendo: o recap é de graça */
  const bloco = APP.slice(APP.indexOf("const volta = houveIntervalo"), APP.indexOf("const volta = houveIntervalo") + 1800);
  t("mostrar o recap não custa chamada", bloco.indexOf("pushMsgs([{ autor: \"sistema\", texto: textoDoRecap") < bloco.indexOf("if (comResumo"));
  t("só reabrir a cena custa", /if \(comResumo && !sv\.rolagem\)/.test(bloco));
  t("o que já foi contado fica marcado", /ateODia: diaRef\.current/.test(APP));
  t("e atravessa a recarga", /sessao: sessaoRef\.current,/.test(APP));
  t("os turnos da sessão são contados", /turnos: \(sessaoRef\.current\.turnos \|\| 0\) \+ 1/.test(APP));
  t("o chefe da masmorra fecha a sessão", /talvezFecharSessao\("chefe"\)/.test(APP));
  t("e a virada de capítulo também", /talvezFecharSessao\("capitulo"\)/.test(APP));
}

console.log(`\nsessões v9.149: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
