/* gerar-envelopes-dourado.mjs (Fase T2, trilha A, 28/10/2026) — os envelopes do turno no App de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `envelopes-dourado.json`. Lê o App de ANTES de cada grupo de envelopes
   sair para src/motor/envelopes-do-turno.js — `git show <commit>:src/App.jsx`
   —, recorta o sítio à letra e corre-o em Node sobre os casos de
   `envelopes-bloco.mjs`, com os refs trocados por objetos simples.

   Cada grupo tem o seu commit de antes (`ANTES`): o dourado de um grupo que
   já saiu não muda quando o seguinte sai.

   uso: node testes/gerar-envelopes-dourado.mjs  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDosEnvelopes, blocoComoFuncao, correrOBloco, fotoDoEnvelope, fotoGuardada, douradoGuardado, douradoLido, casosDosEnvelopes, BLOCOS } from "./envelopes-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const ANTES = { rodape: "2137ae7", masmorraArmadilha: "d3d6f60", masmorraContornada: "d3d6f60", masmorraAVista: "d3d6f60", masmorraTesouro: "d3d6f60", masmorraSantuario: "d3d6f60", masmorraBusca: "d3d6f60", masmorraFuga: "d3d6f60", correioDecreto: "df6e36b", correioCarta: "df6e36b", correioPeticao: "df6e36b",
  acampSemDescanso: "640c39f", acampDescansado: "640c39f", fogoSentar: "640c39f", fogoDecisao: "640c39f", fogoFicar: "640c39f", coracaoResposta: "640c39f", coracaoDecisao: "640c39f",
  aberturaCampanha: "548a91a", aberturaCapitulo: "548a91a", aberturaCapituloNovo: "548a91a", aberturaRetomada: "548a91a",
  viagemPartidaMapa: "21f2857", viagemPartidaEscolha: "21f2857", viagemTrecho: "21f2857", viagemPassarOTempo: "21f2857", viagemErmos: "21f2857", viagemEmboscada: "21f2857",
  fioMarco: "fc27e4f", fioRumores: "fc27e4f", fioMundo: "fc27e4f", fioVirada: "fc27e4f", fioInterludio: "fc27e4f", fioLutaDaChave: "fc27e4f",
  fichaNivel: "920bff6", fichaPericias: "920bff6", fichaAtributo: "920bff6", fichaHabilidade: "920bff6", fichaSubclasse: "920bff6", fichaEspecializacao: "920bff6", fichaRefazer: "920bff6",
  fichaCombate: "8611243", fichaSucesso: "8611243", fichaVolta: "8611243", fichaRecrutamento: "8611243",
  infoDescarteItem: "9f45d0f", infoDescarteEquip: "9f45d0f", infoEquipou: "9f45d0f", infoForjou: "9f45d0f", infoContrato: "9f45d0f", infoDecreto: "9f45d0f", infoAgoraE: "9f45d0f", infoSaiu: "9f45d0f", infoGuilda: "9f45d0f", infoRecalFicha: "9f45d0f", infoRecalMundo: "9f45d0f", infoTransferiu: "9f45d0f",
  mundoFestival: "a81a438", mundoRumor: "a81a438", mundoRumorDeLonge: "a81a438", mundoReino: "a81a438", mundoGlobalNovo: "a81a438", mundoGlobalAvancou: "a81a438", mundoLocalNovo: "a81a438", mundoLocalExpirado: "a81a438", mundoQuest: "a81a438", mundoDivindade: "a81a438", mundoEventoDivino: "a81a438",
  poderInvocacao: "964832c", poderSacrificio: "964832c", poderMetamagia: "964832c", poderEfeito: "964832c", poderMilagreComo: "964832c", poderMilagre: "964832c", poderDespertar: "964832c", poderIdentificarNota: "964832c", poderIdentificar: "964832c", poderLocalizarSem: "964832c", poderLocalizarNota: "964832c", poderLocalizar: "964832c", poderHabilidades: "964832c", poderHabilidade: "964832c", poderEncerradasAoVencer: "964832c", poderEncerradasNaFuga: "964832c", poderEncerradaNoRevide: "964832c",
  mercadoEquipou: "48ce543", mercadoConsumivel: "48ce543", mercadoMapa: "48ce543", mercadoCompra: "48ce543", mercadoPechincha: "48ce543", mercadoVenda: "48ce543",
  dominioDecretoAceito: "f5d5940", dominioDizimado: "f5d5940", dominioFracasso: "f5d5940", dominioCumprido: "f5d5940", dominioObraPronta: "f5d5940", dominioRevolta: "f5d5940", dominioImposto: "f5d5940", dominioObraIniciada: "f5d5940", dominioGovernador: "f5d5940", dominioReivindicacao: "f5d5940", dominioTratado: "f5d5940",
  tempoClimaAoPassar: "b5e935e", tempoClimaDaNoite: "b5e935e", tempoSonho: "b5e935e", tempoOndeAcordo: "b5e935e",
  feGuilda: "9a79d2e", feGuildaFundada: "9a79d2e", feNaGeografia: "9a79d2e", feTemplo: "9a79d2e", feAscensao: "9a79d2e",
  caminhoMovRegistrado: "63dda7f", caminhoMovResolvido: "63dda7f", caminhoChegada: "63dda7f", caminhoDestino: "63dda7f",
  entradaDaMasmorra: "63dda7f", armadilhaSofridaNaMasmorra: "63dda7f",
  genteCompanheiro: "f496d78", genteMissaoPerdida: "f496d78", genteRelacaoFormal: "f496d78", genteNovoArco: "f496d78", genteRelacaoMudada: "f496d78",
  vezPergunta: "12cce5e", vezEscrevi: "12cce5e", vezRolagem: "12cce5e",
  funcaoReviver: "9cf8d4d", funcaoCura: "9cf8d4d", funcaoCondicao: "9cf8d4d", funcaoAtiva: "9cf8d4d",
  corpoRevide: "029385d", corpoFogoAmigo: "029385d", corpoRitual: "029385d", corpoDadiva: "029385d", corpoQuedaSegurada: "029385d", corpoFuria: "029385d", corpoAguentei: "029385d", corpoRaid: "029385d", corpoOportunidade: "029385d", corpoVitoria: "029385d", corpoFuga: "029385d", corpoQuedaAltura: "029385d" };
const apps = {};
/* O CONSERTO DECLARADO DO «nA» (29/10/2026, trilha A): os nomes do mundo nascem com artigo, e
   o molde dava "Fui aceito nA Mão Cinzenta", "forte em o Vau", "dentro de a praça". O motor
   passou a encaixar a preposição pela peça de lugar.js (`contrair`); o dourado faz a mesma troca
   no código de antes, e só ela — o resto é à letra. São os seis sítios em que os casos trazem
   nome com artigo: 806 dos 275 × 6 casos mudam (a carta 92, a petição 92, passar o tempo 163, a
   divindade 92, a guilda 92, o deslocamento 275). Os outros catorze sítios do conserto (ver
   o diário de 29/10) não têm caso com artigo, e a secção 27 da suíte prova-os direto. */
const CONSERTOS = {
  correioCarta: [["Enviei a ${para}:", "Enviei ${contrair(\"a \" + para)}:"], ["a reação de ${para} agora.", "a reação ${contrair(\"de \" + para)} agora."]],
  correioPeticao: [["Narre a reação de ${p.de} e", "Narre a reação ${contrair(\"de \" + p.de)} e"]],
  viagemPassarOTempo: [["EU CONTINUO EM ${lugarRef.current.nome.toUpperCase()}", "EU CONTINUO ${contrair(\"em \" + lugarRef.current.nome).toUpperCase()}"]],
  mundoDivindade: [[", forte em ${nova.lugar}", ", forte ${contrair(\"em \" + nova.lugar)}"]],
  feGuilda: [["Fui aceito n${nova.nome.startsWith(\"A \") ? \"\" : \"a \"}${nova.nome} como", "Fui aceito ${contrair(\"em \" + (/^(o|a|os|as)\\s/i.test(nova.nome) ? nova.nome : \"a \" + nova.nome))} como"]],
  caminhoMovResolvido: [["`dentro de ${nomePara}`", "`dentro ${contrair(\"de \" + nomePara)}`"], ["`de ${nomeDe} para", "`${contrair(\"de \" + nomeDe)} para"]],
};
const consertado = (bloco, r) => {
  let orgaos = r.orgaos;
  for (const [de, para] of CONSERTOS[bloco] || []) {
    if (orgaos.split(de).length !== 2) throw new Error("o conserto declarado não bate uma vez em " + bloco + ": " + de.slice(0, 60));
    orgaos = orgaos.replace(de, () => para);
  }
  return { ...r, orgaos };
};
const appDe = (c) => (apps[c] ||= execSync(`git show ${c}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n"));
const casos = casosDosEnvelopes(N_CASOS);
const saida = { antes: ANTES, casos: N_CASOS, blocos: {} };
for (const bloco of BLOCOS) {
  const fn = blocoComoFuncao(consertado(bloco, recorteDosEnvelopes(appDe(ANTES[bloco]), { novo: false, so: bloco })[bloco]));
  /* o hash e o comprimento por caso; o texto inteiro só na amostra (ver fotoGuardada) */
  const fotos = casos.map((k, i) => fotoGuardada(fotoDoEnvelope(correrOBloco(fn, k, { novo: false, bloco })), i));
  /* o dicionário (ver douradoGuardado): a volta tem de ser a ida, byte a byte */
  saida.blocos[bloco] = douradoGuardado(fotos);
  if (JSON.stringify(douradoLido(saida.blocos[bloco])) !== JSON.stringify(fotos)) throw new Error(bloco + ": o dicionário não devolve as fotos");
  const erros = fotos.filter((f) => f.erro).length;
  const faltas = [...new Set(fotos.flatMap((f) => f.faltas))];
  const maior = Math.max(...fotos.map((f) => f.n));
  console.log(`${bloco} (de ${ANTES[bloco]}): ${N_CASOS} fotos (${saida.blocos[bloco].fotos.length} distintas), ${erros} estouram, o maior ${maior} chars, faltas: ${faltas.join(", ") || "nenhuma"}`);
}
fs.writeFileSync(path.join(AQUI, "envelopes-dourado.json"), JSON.stringify(saida));
console.log("envelopes-dourado.json:", fs.statSync(path.join(AQUI, "envelopes-dourado.json")).size, "bytes");
