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
  t("prometido.js entra com as seis peças do mapa", ["garantirPrometido", "guardarSementes", "pagarSementes", "cobrarNoTurno", "abertasParaOCronista", "SECAO_DO_CRONISTA"].every((x) => new RegExp("\\b" + x + "\\b").test(p)), p ? "" : "sem import");
  const f = importDe("fecho.js");
  t("fecho.js entra com escolherFecho e fechoDaNarrativa", /\bescolherFecho\b/.test(f) && /\bfechoDaNarrativa\b/.test(f));
  const e = importDe("fios-da-estrada.js");
  t("fios-da-estrada.js entra com as três portas", /\bencontroComFio\b/.test(e) && /\blinhaDoAcampamento\b/.test(e) && /\bfiosNovosNaEstrada\b/.test(e));
  const s = importDe("saga.js");
  t("saga.js entrega marcoAtual e momentoDoFio", /\bmarcoAtual\b/.test(s) && /\bmomentoDoFio\b/.test(s));
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
  const C = corpo("const cronistaDoTurno = async (pers, narrativa) => {");
  t("a secção entra no sistema do Cronista, antes da REGRA GERAL", C.indexOf("SECAO_DO_CRONISTA,") > 0 && C.indexOf("SECAO_DO_CRONISTA,") < C.indexOf("REGRA GERAL"));
  const molde = (C.match(/"(\{\\"lugar\\".*?)",\n/) || [])[1] || "";
  let mo = null; try { mo = JSON.parse(molde.replace(/\\"/g, "\"")); } catch { mo = null; }
  t("o molde JSON continua JSON e ganha promessas e promessas_pagas", !!mo && Array.isArray(mo.promessas) && Array.isArray(mo.promessas_pagas), molde.slice(0, 60));
  t("as abertas vão no pedido, depois do CÂNONE ATUAL", C.indexOf("abertasParaOCronista(prometidoRef.current)") > C.indexOf("CÂNONE ATUAL") && C.indexOf("abertasParaOCronista(prometidoRef.current)") < C.indexOf("ELENCO (pessoas"));
  const iPaga = C.indexOf("pagarSementes(prometidoRef.current, r.promessas_pagas)");
  const iGuarda = C.indexOf("guardarSementes(pg, r.promessas)");
  t("paga primeiro, guarda depois, depois do parse", iPaga > C.indexOf("parseObjetoTolerante(txt)") && iGuarda > iPaga);
  t("e calado: um Cronista torto não custa o turno", /calou\("as promessas do Cronista", e\)/.test(C));
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
  t("o momento do fio entra logo depois do envelope da espinha", iEsp > 0 && iMom > iEsp && iMom - iEsp < 600);
  const iRumo = P.indexOf("porNaPauta(p, \"rumo\", rumo)");
  const iVolta = P.indexOf("cobrarNoTurno(prometidoRef.current");
  const iFecho = P.indexOf("escolherFecho({");
  const iCede = P.indexOf("p = cederNaCena(");
  t("O QUE VOLTA depois do RUMO, antes de cederNaCena", iRumo > 0 && iVolta > iRumo && iVolta < iCede);
  t("O FECHO depois do RUMO, antes de cederNaCena", iFecho > iRumo && iFecho < iCede);
  t("cobrarNoTurno uma vez só (anda o relógio)", quantas("cobrarNoTurno(") === 1 && quantas("pautaDoTurno(conteudo)") === 1);
  t("a volta fica fora da Noite", /if \(modoRef\.current !== "rapida"\) \{\n\s*const rv = cobrarNoTurno/.test(P));
  t("o fim do ato sai da batida do marco atual", /fimDeAto = !!\(\(marcoAtual\(espinhaRef\.current, historiaRef\.current\.etapa\) \|\| \{\}\)\.batida \|\| \{\}\)\.fecho/.test(P));
  t("a sorte do fecho é semeada (mundo + turno)", /sorte: rng\(hashSemente\(sementeMundo\(\) \+ "\|fecho\|" \+ turnoDeRegistroRef\.current\)\)/.test(P));
  t("e cada órgão calado no seu try", ["o momento do fio", "o que volta na pauta", "o fecho na pauta"].every((x) => P.includes("calou(\"" + x + "\"")));
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
  const iHist = pos("const histFinal = [...base, { role: \"user\", content: corpo }");
  t("lido depois de a narrativa existir e antes do histórico", iNar > 0 && iLido > iNar && iLido < iHist);
  t("só pergunta e corte trocam o anterior", /if \(lido === "pergunta" \|\| lido === "corte"\) fechoRef\.current = lido;/.test(APP));
  t("fechoDaNarrativa lê uma pergunta", FE.fechoDaNarrativa("Ela olha-te. — E tu, o que trazes?") === "pergunta");
}

sec("6. os fios das viagens");
{
  const iEnc = pos("const enc = rolarEncontro(");
  const iV = pos("encontroComFio(enc, {");
  t("o encontro da viagem passa por encontroComFio, logo depois de rolado", iEnc > 0 && iV > iEnc && iV - iEnc < 800);
  t("o envelope do trecho usa o detalhe com fio, e o tipo continua o da tabela", APP.includes("ENCONTRO DO TRECHO (${enc.tipo}): ${encV.detalhe}"));
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
  t("a nêmesis que a fama faz nascer herda o relógio", /vilaoDoFio\(n0, espinhaRef\.current, \{ derrotados: mundoDasMissoes\(\)\.derrotados, dia: diaRef\.current \}\)/.test(APP));
  const T = corpo("const talvezDarUmaTrama = ({ forcar = false } = {}) => {");
  t("a trama passa a amarra a montarTrama", /montarTrama\(\{ situacao: situacaoDaTrama\(\), material: materialDaTrama\(\), amarra \}\)/.test(T));
  t("a abertura forçada passa sem porta", /let amarra = null;\n\s*if \(!forcar\) \{/.test(T));
  t("a amarra tem o fio, o prometido e o nome da nêmesis", /amarra = \{ fio: fioDaHistoria\(\{ abertura: aberturaMundoRef\.current, missoes: missoesRef\.current \}\), prometido: prometidoRef\.current, nomes: \[\(nemesisRef\.current \|\| \{\}\)\.nome\]\.filter\(Boolean\) \}/.test(T));
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
