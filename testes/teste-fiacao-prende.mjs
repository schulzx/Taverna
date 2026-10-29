/* A FIAÇÃO DA CAMPANHA QUE PRENDE (Fase MM, 11/10, v9.393) — as promessas
   cobradas, o fecho variado, os fios das viagens, a espinha por batidas, o
   relógio do antagonista e a trama amarrada, ligados no App.jsx

   Dois `backend` fecharam o motor em sete versões (v9.386–v9.392) e
   deixaram no diário o mapa de chamada. Sem a fiação, nada disto chegava ao
   jogador: `prometido.js`, `fecho.js` e `fios-da-estrada.js` não tinham
   leitor no jogo, a espinha nascia sem antecedente nem dia, o momento do fio
   nunca subia à pauta e a trama nascia solta. Esta suíte lê cada ponto de
   fiação no App (falha em HEAD antes da v9.393) e corre, em Node, as
   chamadas com a forma de argumento que o App passa. */
import fs from "node:fs";

const RAIZ = "../src/";
const PR = await import(RAIZ + "prometido.js");
const FE = await import(RAIZ + "fecho.js");
const FI = await import(RAIZ + "fios-da-estrada.js");
const PA = await import(RAIZ + "pauta.js");
const CT = await import(RAIZ + "motor/cronista-do-turno.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const pos = (frag) => APP.indexOf(frag);
const quantas = (frag) => APP.split(frag).length - 1;
/* o corpo de uma função do componente, da âncora até à próxima `const x = (` no mesmo recuo */
const corpo = (ancora) => {
  const i = pos(ancora);
  if (i < 0) return "";
  const j = APP.indexOf("\n  const ", i + ancora.length);
  return APP.slice(i, j < 0 ? undefined : j);
};
const importDe = (arq) => { const m = APP.match(new RegExp("import \\{([^}]*)\\} from \"\\./" + arq.replace(/\./g, "\\.") + "\";")); return m ? m[1] : ""; };

sec("1. os três módulos novos têm leitor no jogo");
{
  const p = importDe("prometido.js");
  /* (trilha A, 29/10) cinco: a pauta do turno mudou-se para src/motor/pauta-do-turno.js e levou consigo o `cobrarNoTurno` (o leitor dele é a peça; o export morto prova-o teste-ligacao) */
  t("prometido.js entra com as cinco peças do mapa que ficam no App", ["garantirPrometido", "guardarSementes", "pagarSementes", "abertasParaOCronista", "SECAO_DO_CRONISTA"].every((x) => new RegExp("\\b" + x + "\\b").test(p)), p ? "" : "sem import");
  const f = importDe("fecho.js");
  /* (trilha A, 29/10) só o fechoDaNarrativa: a pauta do turno mudou-se para src/motor/pauta-do-turno.js e levou consigo o `escolherFecho` */
  t("fecho.js entra com fechoDaNarrativa", /\bfechoDaNarrativa\b/.test(f));
  const e = importDe("fios-da-estrada.js");
  t("fios-da-estrada.js entra com as três portas", /\bencontroComFio\b/.test(e) && /\blinhaDoAcampamento\b/.test(e) && /\bfiosNovosNaEstrada\b/.test(e));
  // retirada (trilha A, 29/10): «saga.js entrega marcoAtual e momentoDoFio» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js e levou consigo as duas; quem as lê é a peça, e o export morto prova-o teste-ligacao
  const lig = fs.readFileSync(new URL("./teste-ligacao.mjs", import.meta.url), "utf8");
  const ag = (lig.match(/const AGUARDANDO = \{([\s\S]*?)\n  \};/) || [])[1] || "";
  t("e saíram da lista de espera da catraca", !!ag && !/"prometido\.js":|"fecho\.js":|"fios-da-estrada\.js":/.test(ag));
}

sec("2. o prometido: um campo novo do save, ignorado pela versão antiga");
{
  t("o ref nasce do garantir", quantas("const prometidoRef = useRef(garantirPrometido(null));") === 1);
  t("vai no retrato que o save grava", /escuta: escutaRef\.current, prometido: prometidoRef\.current,/.test(APP));
  t("volta no load pelo garantir (save sem o campo começa vazio)", /prometidoRef\.current = garantirPrometido\(sv\.prometido\)/.test(APP));
  t("a campanha nova e a Noite nascem sem promessas", quantas("prometidoRef.current = garantirPrometido(null);") >= 2);
  t("o fecho e o tema da estrada não vão ao save", !/fecho: fechoRef\.current|ultimoTema: ultimoTemaRef\.current,\s*postura/.test(APP) && quantas("const fechoRef = useRef(\"\");") === 1 && quantas("const ultimoTemaRef = useRef(\"\");") === 1);
  const vazio = PR.garantirPrometido(undefined);
  t("save antigo (sem o campo) dá caderno vazio", vazio.sementes.length === 0 && vazio.ultima === -1);
}

sec("3. o Cronista guarda e paga");
{
  /* onda 1 do custo (13/10): o Cronista ganhou o terceiro argumento (a frase e os envelopes do turno, para o gatilho) — a âncora segue a assinatura */
  const C = corpo("const cronistaDoTurno = async (pers, narrativa, doTurno) => {");
  /* 28/10 (T1-A, 9.ª fatia), MUDADA E O MOTIVO: o pedido ao Cronista e a secção das promessas saiu do
     cronistaDoTurno do App para src/motor/cronista-do-turno.js (o pedido em
     PEDIDO_DO_CRONISTA e oPedidoAoCronista, as secções em oAceitoDoCronista).
     O motor não se lê pelo texto (a catraca de teste-assercoes-de-texto):
     prova-se pelo valor exportado ou jogando a peça. */
  const PED = String(CT.PEDIDO_DO_CRONISTA || "");
  t("a secção entra no sistema do Cronista, antes da REGRA GERAL", PED.indexOf(PR.SECAO_DO_CRONISTA) > 0 && PED.indexOf(PR.SECAO_DO_CRONISTA) < PED.indexOf("REGRA GERAL"));
  const molde = PED.split("\n")[1] || "";
  let mo = null; try { mo = JSON.parse(molde); } catch { mo = null; }
  t("o molde JSON continua JSON e ganha promessas e promessas_pagas", !!mo && Array.isArray(mo.promessas) && Array.isArray(mo.promessas_pagas), molde.slice(0, 60));
  const comAberta = PR.guardarSementes(PR.garantirPrometido(null), [{ tipo: "objeto", texto: "as cinco chaves pretas de Noé", quem: "Noé" }]).estado;
  const blocoAberto = PR.abertasParaOCronista(comAberta);
  const userComAberta = CT.oPedidoAoCronista({ npcs: {}, missoes: [], canone: {}, prometido: comAberta }, { narrativa: "x", fila: "" }).user;
  t("as abertas vão no pedido, depois do CÂNONE ATUAL", !!blocoAberto && userComAberta.indexOf(blocoAberto) > userComAberta.indexOf("CÂNONE ATUAL") && userComAberta.indexOf(blocoAberto) < userComAberta.indexOf("ELENCO (pessoas"));
  /* T1-A, 2.ª fatia (27/10): as promessas passam pelo juízo do motor
     (motor/cronista.js) e o App lê o `aceito` (`ac`), não a proposta crua
     (`r`) — a ordem que esta asserção guarda é a mesma, e o juízo vem
     entre o parse e o paga */
  /* 28/10 (T1-A, 9.ª fatia): no App fica a ordem parse, juízo, aceito; o paga-antes-de-guardar joga-se no motor (pagar o 2, que só nasce ao guardar, não fecha nada) */
  const jogarProm = (aceito, ler) => { const efs = []; CT.oAceitoDoCronista(aceito, [], {}, { pers: { nome: "Vera", grupo: [] }, narrativa: "x", ler: ler || (() => ({ prometido: comAberta })), aplicar: (x) => efs.push(...x) }); return efs; };
  const depoisDoPago = (jogarProm({ promessas_pagas: [2], promessas: [{ tipo: "frase", texto: "hei de voltar com o barco da Inês", quem: "Inês" }] }).find((e) => e.tipo === "prometido") || {}).prometido;
  t("paga primeiro, guarda depois, depois do parse", C.indexOf("parseObjetoTolerante(txt)") > 0 && C.indexOf("julgarOCronista(") > C.indexOf("parseObjetoTolerante(txt)") && C.indexOf("oAceitoDoCronista(") > C.indexOf("julgarOCronista(")
    && !!depoisDoPago && depoisDoPago.sementes.length === 2 && depoisDoPago.sementes.every((x) => x.estado === "aberta"));
  t("e calado: um Cronista torto não custa o turno", jogarProm({ get promessas_pagas() { throw new Error("torto"); } }).some((e) => e.tipo === "calou" && e.onde === "as promessas do Cronista"));
  /* o caminho que o App faz, com a resposta que um Cronista daria */
  let e = PR.garantirPrometido(null);
  e = PR.guardarSementes(PR.pagarSementes(e, []).estado, [{ tipo: "objeto", texto: "as cinco chaves pretas de Noé", quem: "Noé" }]).estado;
  t("uma semente oferecida fica aberta", e.sementes.length === 1 && e.sementes[0].estado === "aberta");
  t("e aparece ao Cronista com o número", PR.abertasParaOCronista(e).includes(e.sementes[0].id + " — as cinco chaves"));
  e = PR.guardarSementes(PR.pagarSementes(e, [e.sementes[0].id]).estado, []).estado;
  t("paga, sai das abertas", PR.abertasParaOCronista(e) === "");
}

sec("4. a pauta: o momento do fio, O QUE VOLTA e O FECHO");
{
  const P = corpo("const pautaDoTurno = (acaoDoTurno = \"\") => {");
  const iEsp = P.indexOf("envelopeDaEspinha(espinhaRef.current");
  const iMom = P.indexOf("momentoDoFio(espinhaRef.current, historiaRef.current.etapa, { dia: diaRef.current, vilao: nemesisRef.current })");
  // retirada (trilha A, 29/10): «o momento do fio entra logo depois do envelope da espinha» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  const iRumo = P.indexOf("porNaPauta(p, \"rumo\", rumo)");
  const iVolta = P.indexOf("cobrarNoTurno(prometidoRef.current");
  const iFecho = P.indexOf("escolherFecho({");
  const iCede = P.indexOf("p = cederNaCena(");
  // retirada (trilha A, 29/10): «O QUE VOLTA depois do RUMO, antes de cederNaCena» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «O FECHO depois do RUMO, antes de cederNaCena» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «cobrarNoTurno uma vez só (anda o relógio)» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «a volta fica fora da Noite» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «o fim do ato sai da batida do marco atual» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «a sorte do fecho é semeada (mundo + turno)» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «e cada órgão calado no seu try» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  /* os ids existem na tabela da pauta: porNaPauta com id que não existe não entra */
  const ids = (PA.SECOES || []).map((x) => x.id);
  t("as secções volta, fecho e momento existem na pauta", ["volta", "fecho", "momento"].every((x) => ids.includes(x)), ids.join(","));
  const fx = FE.escolherFecho({ pedido: { doJogador: true, pergunta: false }, luta: false, fimDeAto: true, gente: true, ultimo: "", sorte: () => 0.5 });
  t("no fim do ato o fecho é o do fim do ato", fx.momento === "fimDeAto" && fx.linha.startsWith("termine em"));
  let pp = PA.garantirPauta(null);
  pp = PA.porNaPauta(pp, "fecho", fx.linha);
  t("e chega ao texto da pauta como O FECHO", /O FECHO/.test(PA.textoDaPauta(pp, { turno: 1 })));
}

sec("5. depois da resposta, o fecho lido");
{
  const iNar = pos("const narrativaFinal = (portaoRef.current || []).length");
  const iLido = pos("fechoDaNarrativa(narrativaFinal)");
  /* onda 1 do custo (13/10): o histórico guarda a memória do turno (a frase),
     não o corpo com a pauta — a âncora segue a linha que o grava */
  const iHist = pos("const histFinal = [...base, { role: \"user\", content: memoriaDoJogador }");
  t("lido depois de a narrativa existir e antes do histórico", iNar > 0 && iLido > iNar && iLido < iHist);
  t("só pergunta e corte trocam o anterior", /if \(lido === "pergunta" \|\| lido === "corte"\) fechoRef\.current = lido;/.test(APP));
  t("fechoDaNarrativa lê uma pergunta", FE.fechoDaNarrativa("Ela olha-te. — E tu, o que trazes?") === "pergunta");
}

sec("6. os fios das viagens");
{
  const iEnc = pos("const enc = rolarEncontro(");
  const iV = pos("encontroComFio(enc, {");
  t("o encontro da viagem passa por encontroComFio, logo depois de rolado", iEnc > 0 && iV > iEnc && iV - iEnc < 800);
  /* MOVIDA (28/10, T2-A, a viagem): o texto do trecho saiu do App para
     src/motor/envelopes-do-turno.js. A intenção é a mesma — o tipo vem da
     tabela (enc) e o detalhe é o que passou pelo fio (encV) —, lida no que o
     App passa ao motor, e o motor põe os dois na linha do encontro. */
  const { oEnvelopeDaViagem } = await import(RAIZ + "motor/envelopes-do-turno.js");
  t("o envelope do trecho usa o detalhe com fio, e o tipo continua o da tabela", APP.includes("encontro: { tipo: enc.tipo, detalhe: encV.detalhe }")
    && oEnvelopeDaViagem("trecho", { local: "x", clima: { rotulo: "r", nota: "n" }, encontro: { tipo: "perigo", detalhe: "com fio" }, ritmo: { nome: "N", desc: "d" }, destino: "", paraCidade: "" }).includes("ENCONTRO DO TRECHO (perigo): com fio"));
  t("o tema usado fica lembrado para não se repetir", /if \(encV\.tema\) ultimoTemaRef\.current = encV\.tema\.texto;/.test(APP));
  const iLa = pos("linhaDoAcampamento({");
  const iSit = pos("enviar(envSitio, personagem);");
  t("a noite do acampamento vai junta ao envelope do sítio", iLa > 0 && iSit > iLa && /let envSitio = envelopeDoSitio\(sitio\);/.test(APP));
  t("o fim do acampamento filtra as partes", /const fe = fiosNovosNaEstrada\(partes, \{\n\s*naEstrada: true,/.test(APP) && /if \(partesFicam\.length\) eventosMsg = "\\n" \+ partesFicam\.join\("\\n"\);/.test(APP));
  /* em enviar: antes da escuta, e o que fica seguro volta à nota */
  const iFio = pos("const fe = fiosNovosNaEstrada([oficina, ...separarEnvelopes(daNota)");
  const iEsc = pos("const rEsc = escutarOTurno({");
  t("em enviar, o fio novo é filtrado antes da escuta", iFio > 0 && iEsc > iFio);
  t("na estrada = em viagem ou acampado", /const naEstrada = !!jornadaRef\.current \|\| !!acampadoRef\.current;/.test(APP));
  const iZera = pos("notaRef.current = \"\";\n    if (adiadosEsc)");
  const iVolta = pos("if (seguraEstrada.length) notaRef.current =");
  t("o que fica seguro volta à nota depois de ela ser zerada", iZera > 0 && iVolta > iZera);
  /* a forma do argumento que o App passa */
  const prom = PR.guardarSementes(PR.garantirPrometido(null), [{ tipo: "volta", texto: "a mulher de capa verde volta pelo óleo de mirra", quem: "a mulher de capa verde" }]).estado;
  const fe = FI.fiosNovosNaEstrada(["[TRABALHO PREGADO NO MURAL] o torneio das coroas", "[QUEST GERADA PELO SISTEMA] a mulher de capa verde pede o óleo de mirra", "[CLIMA] chove"], { naEstrada: true, fio: [], prometido: prom, nomes: [] });
  t("na estrada: o solto fica seguro, o amarrado entra com a amarra, o resto passa", fe.seguram.length === 1 && fe.ficam.length === 2 && /Isto amarra-se a/.test(fe.ficam[0]));
  t("fora da estrada tudo passa", FI.fiosNovosNaEstrada(["[TRABALHO PREGADO NO MURAL] x"], { naEstrada: false }).ficam.length === 1);
  t("sozinho, a noite do acampamento cala", FI.linhaDoAcampamento({ fio: [], prometido: prom, grupo: [] }) === "");
}

sec("7. a espinha enxuta, o relógio do antagonista e a trama amarrada");
{
  const iE = pos("espinhaRef.current = estenderEspinha({");
  const bloco = iE > 0 ? APP.slice(iE, APP.indexOf("});", iE)) : "";
  t("a espinha nasce com o antecedente do herói", /antecedente: \(pers && pers\.antecedente\) \|\| "",/.test(bloco));
  t("e com o dia de hoje (o relógio conta daqui)", /dia: diaRef\.current,/.test(bloco));
  /* MOVIDA (T1-A, 5.ª fatia, 28/10): o vilaoDoFio é chamado em
     src/motor/combate-do-turno.js (surgirANemesis), e o App entrega-lhe a
     espinha, quem caiu e o dia. A intenção é a mesma — a nêmesis que a fama
     faz nascer herda o relógio do fio —, lida no que o App entrega (o motor
     prova-se jogando: teste-nemesis-do-fio, teste-motor-combate). */
  {
    const iS = pos("const tentarSurgirNemesis = () => {");
    const surgir = iS > 0 ? APP.slice(iS, APP.indexOf("\n  };", iS)) : "";
    t("a nêmesis que a fama faz nascer herda o relógio", /surgirANemesis\(\{/.test(surgir) && /dia: diaRef\.current, espinha: espinhaRef\.current,/.test(surgir) && /derrotados: \(\) => mundoDasMissoes\(\)\.derrotados/.test(surgir));
  }
  const T = corpo("const talvezDarUmaTrama = ({ forcar = false } = {}) => {");
  t("a trama passa a amarra a montarTrama", /montarTrama\(\{ situacao: situacaoDaTrama\(\), material: materialDaTrama\(\), amarra \}\)/.test(T));
  t("a abertura forçada passa sem porta", /let amarra = null;\n\s*if \(!forcar\) \{/.test(T));
  t("a amarra tem o fio, o prometido e o nome da nêmesis", /amarra = \{ fio: fioDaHistoria\(\{ abertura: aberturaMundoRef\.current, missoes: missoesRef\.current \}\), prometido: prometidoRef\.current, nomes: \[\(nemesisRef\.current \|\| \{\}\)\.nome\]\.filter\(Boolean\) \}/.test(T));
}

sec("8. o rumo leva o mundo (MM19, v9.394): o degrau do encalhe vira cena com nome e lugar");
{
  const iR = pos("const rumo = linhaDoRumo({");
  const bloco = iR > 0 ? APP.slice(iR, APP.indexOf("});", iR)) : "";
  // retirada (trilha A, 29/10): «linhaDoRumo recebe `mundo: { aqui:` — o lugar de agora, da primeira linha do ONDE» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  /* 19/10 (a 12.ª sessão): o mundo do rumo ganhou, DEPOIS da nêmesis, o
     \`mostrado\` (quem o Mestre já nomeou não se apresenta de novo) — a
     âncora deixa de exigir o fecho da chaveta logo a seguir; os quatro
     campos continuam presos na mesma ordem. */
  // retirada (trilha A, 29/10): «e a espinha, o ato, o dia e a nêmesis» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «dentro do try/calou do rumo» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
}

sec("9. o laço da história chega ao App (v9.396 e v9.401 do backend, ligados na v9.406)");
{
  /* o fio é um só: a missão fecha pelo marco que a espinha já fechou —
     "O rasto de Edric" (sessão 5) ficava em 0/2 sem este campo */
  const M = corpo("const mundoDasMissoes = (persAtual) => {");
  t("mundoDasMissoes leva a espinha", /espinha: espinhaRef\.current,/.test(M));
  /* um vilão só: as duas leituras dos chefes (o prompt e o /chefes) passam a
     espinha, e caem na lista de antes se a leitura nova estourar */
  /* ONDA 2 DO CUSTO (13/10): chefesDoFio ganhou o `soOAntagonista` (sem
     chefe em jogo no turno, só o antagonista e o +N) e o passa no mesmo
     sexto argumento, junto da espinha. O /chefes chama sem ele: a lista
     inteira, como antes. */
  const C = corpo("const chefesDoFio = (soOAntagonista = false) => {");
  t("chefesDoFio passa { espinha } como sexto argumento, em try/calou",
    /^const chefesDoFio = \(soOAntagonista = false\) => \{\s*try \{ return resumoChefesPrompt\(/.test(C)
      && C.includes("(mundoAtual() || {}).lexico, { espinha: espinhaRef.current, soOAntagonista }); }")
      && C.includes('catch (e) { calou("os chefes do fio", e); return resumoChefesPrompt('));
  t("o prompt e o /chefes leem por ela", /const chefes = chefesDoFio\(!\(sinaisDoTurnoRef\.current \|\| SINAIS_ABERTOS\)\.chefeEmJogo\);/.test(APP) && /const t = chefesDoFio\(\);\s*godLinha\(t \|\| "⚡ Nenhum chefe vivo neste mundo\."\)/.test(APP));
  t("e nenhuma chamada a resumoChefesPrompt fica sem a espinha fora do recuo", (APP.match(/resumoChefesPrompt\(/g) || []).length === 2);
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
