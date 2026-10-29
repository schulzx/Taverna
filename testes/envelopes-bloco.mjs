/* envelopes-bloco.mjs (Fase T2, trilha A, 28/10/2026) — os envelopes do turno, corridos em Node

   Não é suíte: é a ferramenta que as duas pontas da prova usam.

   - `gerar-envelopes-dourado.mjs` recorta do App de ANTES (o último em que
     o envelope morava inteiro no App) o sítio que monta o texto, à letra,
     e corre-o sobre os casos.
   - `teste-motor-envelopes-do-turno.mjs` recorta do App de HOJE o MESMO
     sítio (as âncoras são as mesmas; muda o que está entre elas) e corre-o,
     com as peças de src/motor/envelopes-do-turno.js, sobre os mesmos casos.

   O que se compara é o texto que vai ao Narrador, byte a byte, e a ordem em
   que o sítio chamou as peças do App. As peças que NÃO saíram do App (os
   resumos de cada órgão) são dublês declarados que devolvem uma etiqueta
   tirada dos argumentos — vazia em parte dos casos, para que a regra "peça
   vazia não ocupa linha" seja percorrida — e as que decidem a forma do
   texto que saiu (o calendário, a forma da cidade, o "aqui" da masmorra)
   são as de verdade. O escopo é um Proxy: um nome que nenhum dublê dá e que
   não é do JavaScript fica em `faltas` (a suíte exige-o vazio), em vez de
   cair calado. */
import { createHash } from "node:crypto";
import * as calendario from "../src/calendario.js";
import * as geografia from "../src/geografia.js";
import * as semCidade from "../src/masmorra-sem-cidade.js";
import * as prompt from "../src/prompt.js";
import * as chao from "../src/chao.js";
import * as motorEnvelopes from "../src/motor/envelopes-do-turno.js";
import * as decretos from "../src/decretos.js";
import { TIPOS_CARTA } from "../src/correio.js";
import * as subtramas from "../src/subtramas.js";
import * as arquivo from "../src/arquivo.js";
import * as lugar from "../src/lugar.js";
import * as divindades from "../src/divindades.js";

const NOMES = {
  calendario: ["dataTxt", "horaTxt", "ehNoite", "estacaoDe"],
  geografia: ["formaDaCidade"],
  semCidade: ["aquiDoTurno", "calaNaMasmorra"],
  prompt: ["SINAIS_ABERTOS"],
  chao: ["RAIO_EXAME"],
  decretos: ["tipoDecreto"],
  subtramas: ["fraseDaManha"],
  arquivo: ["nomeDaCampanha"],
  lugar: ["comDe"],
  divindades: ["tituloDe"],
  motorEnvelopes: ["oRodapeDoTurno", "aFormaDaqui", "SO_ISSO", "oEnvelopeDaMasmorra", "oEnvelopeDoCorreio", "oEnvelopeDoAcampamento", "oEnvelopeDaAbertura", "oEnvelopeDaViagem", "oEnvelopeDoFio", "oEnvelopeDaFicha", "oEnvelopeDoMundo", "oEnvelopeDosPoderes", "oEnvelopeDoMercado", "oEnvelopeDoDominio", "oEnvelopeDoTempo", "oEnvelopeDaFe", "oEnvelopeDoCaminho", "oEnvelopeDaGente", "oEnvelopeDoJogador"],
};
const MODULOS = { calendario, geografia, semCidade, prompt, chao, decretos, subtramas, arquivo, lugar, divindades, motorEnvelopes };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    /* o App de antes do correio já importava o SO_ISSO do motor (saiu com a masmorra); o
       da masmorra de antes declara-o no recorte (antesDe), e essa declaração sombreia esta */
    for (const n of !novo && mod === "motorEnvelopes" ? ["SO_ISSO"] : lista) {
      if (!(n in MODULOS[mod])) throw new Error(`${mod} não exporta ${n}`);
      o[n] = MODULOS[mod][n];
    }
  }
  return o;
}

/* ---------------- O RECORTE ---------------- */
const corteDe = (app) => (de, ate) => {
  const i0 = app.indexOf(de);
  if (i0 < 0) throw new Error("não está onde estava: " + de.slice(0, 70));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 70));
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i1 < 0) throw new Error("o fim não está onde estava: " + ate.slice(0, 70));
  return app.slice(i0, i1);
};
/* Cada grupo diz onde o sítio começa e acaba no App de ANTES e no de HOJE.
   No rodapé as âncoras são as mesmas (os nomes que ficaram); num envelope
   de uma linha, o sítio é a própria linha do `enviar`, que muda de texto
   para chamada: as duas pontas cortam-na até ao fim da linha. `antesDe`
   são as linhas de fora do sítio que o App de antes lia (o SO_ISSO no topo). */
export const BLOCOS = ["rodape", "masmorraArmadilha", "masmorraContornada", "masmorraAVista", "masmorraTesouro", "masmorraSantuario", "masmorraBusca", "masmorraFuga", "correioDecreto", "correioCarta", "correioPeticao",
  "acampSemDescanso", "acampDescansado", "fogoSentar", "fogoDecisao", "fogoFicar", "coracaoResposta", "coracaoDecisao",
  "aberturaCampanha", "aberturaCapitulo", "aberturaCapituloNovo", "aberturaRetomada",
  "viagemPartidaMapa", "viagemPartidaEscolha", "viagemTrecho", "viagemPassarOTempo", "viagemErmos", "viagemEmboscada",
  "fioMarco", "fioRumores", "fioMundo", "fioVirada", "fioInterludio", "fioLutaDaChave",
  "fichaNivel", "fichaPericias", "fichaAtributo", "fichaHabilidade", "fichaSubclasse", "fichaEspecializacao", "fichaRefazer",
  "fichaCombate", "fichaSucesso", "fichaVolta", "fichaRecrutamento",
  "infoDescarteItem", "infoDescarteEquip", "infoEquipou", "infoForjou", "infoContrato", "infoDecreto", "infoAgoraE", "infoSaiu", "infoGuilda", "infoRecalFicha", "infoRecalMundo", "infoTransferiu",
  "mundoFestival", "mundoRumor", "mundoRumorDeLonge", "mundoReino", "mundoGlobalNovo", "mundoGlobalAvancou", "mundoLocalNovo", "mundoLocalExpirado", "mundoQuest", "mundoDivindade", "mundoEventoDivino",
  "poderInvocacao", "poderSacrificio", "poderMetamagia", "poderEfeito", "poderMilagreComo", "poderMilagre", "poderDespertar", "poderIdentificarNota", "poderIdentificar", "poderLocalizarSem", "poderLocalizarNota", "poderLocalizar", "poderHabilidades", "poderHabilidade", "poderEncerradasAoVencer", "poderEncerradasNaFuga", "poderEncerradaNoRevide",
  "mercadoEquipou", "mercadoConsumivel", "mercadoMapa", "mercadoCompra", "mercadoPechincha", "mercadoVenda",
  "dominioDecretoAceito", "dominioDizimado", "dominioFracasso", "dominioCumprido", "dominioObraPronta", "dominioRevolta", "dominioImposto", "dominioObraIniciada", "dominioGovernador", "dominioReivindicacao", "dominioTratado",
  "tempoClimaAoPassar", "tempoClimaDaNoite", "tempoSonho", "tempoOndeAcordo",
  "feGuilda", "feGuildaFundada", "feNaGeografia", "feTemplo", "feAscensao",
  "caminhoMovRegistrado", "caminhoMovResolvido", "caminhoChegada", "caminhoDestino",
  "entradaDaMasmorra", "armadilhaSofridaNaMasmorra",
  "genteCompanheiro", "genteMissaoPerdida", "genteRelacaoFormal", "genteNovoArco", "genteRelacaoMudada",
  "vezPergunta", "vezEscrevi", "vezRolagem",
  "funcaoReviver", "funcaoCura", "funcaoCondicao", "funcaoAtiva"];
/* o grupo de cada bloco: é ele que diz que dados o caso dá ao sítio */
const GRUPO = (b) => (b === "rodape" ? "rodape" : /^masmorra/.test(b) ? "masmorra" : /^correio/.test(b) ? "correio" : /^(acamp|fogo|coracao)/.test(b) ? "acampamento" : /^abertura/.test(b) ? "abertura" : /^viagem/.test(b) ? "viagem" : /^fio/.test(b) ? "fio" : /^(ficha|info)/.test(b) ? "ficha" : /^mundo/.test(b) ? "mundo" : /^poder/.test(b) ? "poderes" : /^mercado/.test(b) ? "mercado" : /^dominio/.test(b) ? "dominio" : /^tempo/.test(b) ? "tempo" : /^fe[A-Z]/.test(b) ? "fe" : /^caminho/.test(b) ? "caminho" : /^(entradaDaMasmorra|armadilhaSofridaNaMasmorra)$/.test(b) ? "masmorraNova" : /^gente/.test(b) ? "gente" : /^vez[A-Z]/.test(b) ? "vez" : /^funcao[A-Z]/.test(b) ? "funcao" : null);
const FIM = "\n";
const ANCORAS = {
  rodape: { antes: ["    const rodape = ", "    const base = histBase ?? historico;"], hoje: ["    const rodape = ", "    const base = histBase ?? historico;"] },
  masmorraArmadilha: { antes: ["      enviar(`[MASMORRA — ${pos} · ARMADILHA RESOLVIDA PELO SISTEMA]", FIM], hoje: ['      enviar(oEnvelopeDaMasmorra("armadilhaResolvida", ', FIM] },
  masmorraContornada: { antes: ['        enviar("[MASMORRA — " + posDaMasmorra(r.mm, sala) + " · ARMADILHA CONTORNADA PELO SISTEMA]', FIM], hoje: ['        enviar(oEnvelopeDaMasmorra("armadilhaContornada", ', FIM] },
  masmorraAVista: { antes: ['        enviar("[MASMORRA — " + pos + " · ARMADILHA À VISTA, AINDA ARMADA]', FIM], hoje: ['        enviar(oEnvelopeDaMasmorra("armadilhaAVista", ', FIM] },
  masmorraTesouro: { antes: ["      enviar(`[MASMORRA — ${pos} · TESOURO RESOLVIDO PELO SISTEMA]", FIM], hoje: ['      enviar(oEnvelopeDaMasmorra("tesouro", ', FIM] },
  masmorraSantuario: { antes: ["      enviar(`[MASMORRA — ${pos} · SANTUÁRIO RESOLVIDO PELO SISTEMA]", FIM], hoje: ['      enviar(oEnvelopeDaMasmorra("santuario", ', FIM] },
  masmorraBusca: { antes: ["    enviar(`[MASMORRA — BUSCA ATIVA · ${mm.nome}]", FIM], hoje: ['    enviar(oEnvelopeDaMasmorra("buscaAtiva", ', FIM], antesDe: ["const SO_ISSO = ", FIM] },
  masmorraFuga: { antes: ["    enviar(`[MASMORRA — FUGA]", FIM], hoje: ['    enviar(oEnvelopeDaMasmorra("fuga", ', FIM] },
  correioDecreto: { antes: ["    enviar(`[DECRETO PREGADO — ", FIM], hoje: ['    enviar(oEnvelopeDoCorreio("decreto", ', FIM] },
  correioCarta: { antes: ["    enviar(`[CORREIO — CARTA ENVIADA]", FIM], hoje: ['    enviar(oEnvelopeDoCorreio("carta", ', FIM] },
  acampSemDescanso: { antes: ["    enviar(`[FIM DO ACAMPAMENTO — SEM DESCANSO]", FIM], hoje: ['    enviar(oEnvelopeDoAcampamento("levantarSemDescanso", ', FIM] },
  acampDescansado: { antes: ['    enviar(((extra && extra.antes) ? extra.antes + "\\n" : "") + `[FIM DO ACAMPAMENTO — DESCANSO ', FIM], hoje: ['    enviar(oEnvelopeDoAcampamento("levantarDescansado", ', FIM] },
  fogoSentar: { antes: ['      enviar("[À FOGUEIRA — SENTO-ME AO LADO DE "', FIM], hoje: ['      enviar(oEnvelopeDoAcampamento("sentarAoFogo", ', FIM] },
  /* as duas da fogueira que fecham a noite: o sítio é a chamada inteira de fecharANoite (o envelope é o 2.º argumento, na linha de baixo) */
  fogoDecisao: { antes: ['      fecharANoite({ frase: fraseDaManha({ tipo: "lado"', '\n    } catch (e) { calou("decidir à fogueira"'], hoje: ['      fecharANoite({ frase: fraseDaManha({ tipo: "lado"', '\n    } catch (e) { calou("decidir à fogueira"'] },
  fogoFicar: { antes: ['      fecharANoite({ frase: fraseDaManha({ tipo: "porta"', '\n    } catch (e) { calou("ficar à fogueira"'], hoje: ['      fecharANoite({ frase: fraseDaManha({ tipo: "porta"', '\n    } catch (e) { calou("ficar à fogueira"'] },
  /* a resposta ao coração: no App de antes a frase vinha de uma tabela na linha de cima, que saiu junto */
  coracaoResposta: { antes: ['      const frase = { aceitou: ', '\n    } catch (e) { calou("responder ao coração"'], hoje: ['      enviar(oEnvelopeDoAcampamento("respostaAoCoracao", ', FIM] },
  coracaoDecisao: { antes: ['      enviar("[A DECISÃO SOBRE " + nome + " — TOMADA POR MIM] "', FIM], hoje: ['      enviar(oEnvelopeDoAcampamento("decisaoDoCoracao", ', FIM] },
  correioPeticao: { antes: ["    enviar(`[CORREIO — PETIÇÃO ${aceite", FIM], hoje: ['    enviar(oEnvelopeDoCorreio("peticao", ', FIM] },
  /* a abertura: a da campanha é a função inteira (o sítio devolve o pedido, não o envia); as duas do
     capítulo, a linha do enviar; a retomada, a chamada do enviar com o ternário do recap */
  aberturaCampanha: { antes: ["  const abrirACampanha = (pers) => {", "\n  const continuar = "], hoje: ["  const abrirACampanha = (pers) => {", "\n  const continuar = "] },
  aberturaCapitulo: { antes: ['enviar("[ABERTURA DE CAPÍTULO] Abra o capítulo conforme o envelope acima.", personagemRef.current', FIM], hoje: ['enviar(oEnvelopeDaAbertura("capitulo"), personagemRef.current', FIM] },
  aberturaCapituloNovo: { antes: ['enviar("[ABERTURA DE CAPÍTULO] Abra o capítulo conforme o envelope acima.", pers, []);', FIM], hoje: ['enviar(oEnvelopeDaAbertura("capitulo"), pers, []);', FIM] },
  aberturaRetomada: { antes: ["        enviar(recap && recap.vale", "\n      }\n    } catch (e) {"], hoje: ["        enviar(recap && recap.vale", "\n      }\n    } catch (e) {"] },
  /* a viagem: as partidas, o forrageamento e a emboscada são uma linha; o trecho é a const do texto (o sítio
     devolve-o: o App envia-o ou guarda-o na nota); passar o tempo leva junto o "onde espero" de antes */
  viagemPartidaMapa: { antes: ["    enviar(`[PARTIDA — REGISTRADA PELO SISTEMA] Escolhi ${nome} no mapa", FIM], hoje: ['    enviar(oEnvelopeDaViagem("partidaMapa", ', FIM] },
  viagemPartidaEscolha: { antes: ["        enviar(`[PARTIDA — REGISTRADA PELO SISTEMA] Escolhi ${escolhida.nome}", FIM], hoje: ['        enviar(oEnvelopeDaViagem("partidaEscolha", ', FIM] },
  viagemTrecho: { antes: ["    const textoDaViagem = (", "\n    if (qr.chamadas) enviar(textoDaViagem, persV);"], hoje: ["    const textoDaViagem = oEnvelopeDaViagem(", "\n    if (qr.chamadas) enviar(textoDaViagem, persV);"] },
  viagemPassarOTempo: { antes: ["    const ondeEspero = lugarRef.current", "\n  };"], hoje: ['    enviar(oEnvelopeDaViagem("passarOTempo", ', "\n  };"] },
  viagemErmos: { antes: ["    enviar(`[ERMOS — FORRAGEAMENTO]", FIM], hoje: ['    enviar(oEnvelopeDaViagem("forrageamento", ', FIM] },
  viagemEmboscada: { antes: ["    return `[FUGA — TERRITÓRIO DO SISTEMA]", FIM], hoje: ['    return oEnvelopeDaViagem("emboscadaDaFuga", ', FIM] },
  /* o fio da história: quatro notas de uma linha (o sítio devolve a nota do turno), o interlúdio
     dentro da pauta (devolve a pauta) e a luta da chave, que se envia */
  fioMarco: { antes: ['          notaRef.current = (notaRef.current ? notaRef.current + "\\n" : "") + "[O MARCO EMPURRA]', FIM], hoje: ['          notaRef.current = (notaRef.current ? notaRef.current + "\\n" : "") + oEnvelopeDoFio("marcoEmpurra")', FIM] },
  fioRumores: { antes: ["          if (fora.rumores.length) notaRef.current = ", FIM], hoje: ["          if (fora.rumores.length) notaRef.current = ", FIM] },
  fioMundo: { antes: ['        notaRef.current = (notaRef.current ? notaRef.current + "\\n" : "") + "[O MUNDO VAI BUSCAR', FIM], hoje: ['        notaRef.current = (notaRef.current ? notaRef.current + "\\n" : "") + oEnvelopeDoFio("oMundoVaiBuscar"', FIM] },
  fioVirada: { antes: ['    notaRef.current = (notaRef.current ? notaRef.current + "\\n" : "") + "[A VIRADA — "', FIM], hoje: ['    notaRef.current = (notaRef.current ? notaRef.current + "\\n" : "") + oEnvelopeDoFio("virada"', FIM] },
  fioInterludio: { antes: ['      p = porNaPauta(p, "momento", envelopeDaChave(torneioRef.current)', FIM], hoje: ['      p = porNaPauta(p, "momento", envelopeDaChave(torneioRef.current)', FIM] },
  fioLutaDaChave: { antes: ["                  enviar(`[A LUTA DA CHAVE COMECA]", FIM], hoje: ['                  enviar(oEnvelopeDoFio("lutaDaChave", ', FIM] },
  /* a ficha (a formação): sete notas de uma linha; o sítio devolve a nota do turno */
  fichaNivel: { antes: ["    notaRef.current = `[FICHA — REGISTRO DO SISTEMA] Subi para o nível", FIM], hoje: ["    notaRef.current = oEnvelopeDaFicha(\"subiDeNivel\"", FIM] },
  fichaPericias: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[FICHA — REGISTRO DO SISTEMA] Ajustei meus treinos", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"pericias\"", FIM] },
  fichaAtributo: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[FICHA — REGISTRO DO SISTEMA] Fortaleci", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"atributo\"", FIM] },
  fichaHabilidade: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[FICHA — REGISTRO DO SISTEMA] Aprendi a habilidade", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"habilidade\"", FIM] },
  fichaSubclasse: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[MARCO DE CAMINHO — REGISTRO DO SISTEMA] Escolhi a especialização \"${subNome}\"", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"subclasse\"", FIM] },
  fichaEspecializacao: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[MARCO DE CAMINHO — REGISTRO DO SISTEMA] Escolhi a especialização \"${espNome}\"", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"especializacao\"", FIM] },
  fichaRefazer: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Passei por um treinamento longo e REFIZ meu caminho", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"refazerCaminho\"", FIM] },
  /* a ficha (o que o sistema resolveu): três linhas do enviar e a função da nota do recrutamento
     (o sítio devolve-a, como a da campanha) */
  fichaCombate: { antes: ["      enviar(`[COMBATE — RESOLVIDO PELO SISTEMA]", FIM], hoje: ["      enviar(oEnvelopeDaFicha(\"combateResolvido\", ", FIM] },
  fichaSucesso: { antes: ["      enviar(`[TESTE — SUCESSO AUTOMÁTICO]", FIM], hoje: ["      enviar(oEnvelopeDaFicha(\"sucessoAutomatico\", ", FIM] },
  fichaVolta: { antes: ["    enviar(`[VOLTA DOS MORTOS — RESOLVIDA PELO SISTEMA]", FIM], hoje: ["    enviar(oEnvelopeDaFicha(\"voltaDosMortos\", ", FIM] },
  fichaRecrutamento: { antes: ["  const notaDoRecrutamento = (comp) =>", "\n\n  const porNoGrupo"], hoje: ["  const notaDoRecrutamento = (comp) =>", "\n\n  const porNoGrupo"] },
  /* a ficha (as notas [INFO] do inventário, do grupo e do save): doze notas de uma linha; o sítio devolve a nota */
  infoDescarteItem: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Descartei o item:", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"descarteItem\"", FIM] },
  infoDescarteEquip: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Descartei o equipamento:", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"descarteEquipamento\"", FIM] },
  infoEquipou: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] ${nomeComp} agora usa", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"equipouCompanheiro\"", FIM] },
  infoForjou: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Forjei um item na forja:", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"forjou\"", FIM] },
  infoContrato: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Abandonei o contrato", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"abandonouContrato\"", FIM] },
  infoDecreto: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Retirei o decreto sobre", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"retirouDecreto\"", FIM] },
  infoAgoraE: { antes: ["    notaRef.current = `[INFO] ${quem} agora é ", FIM], hoje: ["    notaRef.current = oEnvelopeDaFicha(\"agoraE\"", FIM] },
  infoSaiu: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] ${nome} saiu do meu grupo", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"saiuDoGrupo\"", FIM] },
  infoGuilda: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Minha guilda (", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"guildaCresceu\"", FIM] },
  infoRecalFicha: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Recalibração de save: meus números", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"recalibrouAFicha\"", FIM] },
  infoRecalMundo: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Recalibração de save: o estado do mundo", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"recalibrouOMundo\"", FIM] },
  infoTransferiu: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INFO] Transferi \"", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFicha(\"transferiu\"", FIM] },
  /* o mundo que anda: o festival e os eventos de reino ao virar o dia, os dois boatos, e o que o descanso
     longo acorda (global, local, quest, divindade); o reino é a função inteira (devolve o envelope) */
  mundoFestival: { antes: ["        extras.push(`[FESTIVAL — ", FIM], hoje: ["        extras.push(oEnvelopeDoMundo(\"festival\", ", FIM] },
  mundoRumor: { antes: ["        notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[RUMOR] Um boato chegou aos meus ouvidos: \"${boato}\"", FIM], hoje: ["        notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMundo(\"rumor\"", FIM] },
  mundoRumorDeLonge: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[RUMOR] Um boato chegou aos meus ouvidos: \"${boatoDoMundo}\"", " } } catch (e) { calou(\"agirForaDeCena\""], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMundo(\"rumorDeLonge\"", " } } catch (e) { calou(\"agirForaDeCena\""] },
  mundoReino: { antes: ["  const envelopeEventosReino = (evs) => {", "\n\n  /* CORREIO (v7.0)"], hoje: ["  const envelopeEventosReino = (evs) => {", "\n\n  /* CORREIO (v7.0)"] },
  mundoGlobalNovo: { antes: ["        partes.push(`[EVENTO GLOBAL — NOVO ARCO MAIOR: ", FIM], hoje: ["        partes.push(oEnvelopeDoMundo(\"globalNovo\", ", FIM] },
  mundoGlobalAvancou: { antes: ["        partes.push(`[EVENTO GLOBAL — ${g.nome", FIM], hoje: ["        partes.push(oEnvelopeDoMundo(\"globalAvancou\", ", FIM] },
  mundoLocalNovo: { antes: ["        partes.push(`[EVENTO LOCAL — FIO DO MUNDO]", FIM], hoje: ["        partes.push(oEnvelopeDoMundo(\"localNovo\", ", FIM] },
  mundoLocalExpirado: { antes: ["      r.expirados.forEach((l) => partes.push(`[EVENTO LOCAL — EXPIRADO]", FIM], hoje: ["      r.expirados.forEach((l) => partes.push(oEnvelopeDoMundo(\"localExpirado\", ", FIM] },
  mundoQuest: { antes: ["        partes.push(`[QUEST GERADA PELO SISTEMA — fase", FIM], hoje: ["        partes.push(oEnvelopeDoMundo(\"questGerada\", ", FIM] },
  mundoDivindade: { antes: ["          partes.push(`[DIVINDADE SE REVELA", FIM], hoje: ["          partes.push(oEnvelopeDoMundo(\"divindadeSeRevela\", ", FIM] },
  mundoEventoDivino: { antes: ["            partes.push(`[EVENTO DIVINO", FIM], hoje: ["            partes.push(oEnvelopeDoMundo(\"eventoDivino\", ", FIM] },
  /* os poderes: quatro notas de um objeto devolvido (o sítio é a linha dentro de { }, `envolve`),
     o milagre, o despertar, as magias de função, as habilidades do turno (o enviar inteiro, com o
     ternário) e as invocações que se desfazem */
  poderInvocacao: { antes: ["      nota: `[INVOCAÇÃO — POSTA EM CAMPO", FIM], hoje: ["      nota: oEnvelopeDosPoderes(\"invocacaoEmCampo\"", FIM], envolve: ["const o = {","};"] },
  poderSacrificio: { antes: ["      nota: `[SACRIFÍCIO ARCANO —", FIM], hoje: ["      nota: oEnvelopeDosPoderes(\"sacrificioArcano\"", FIM], envolve: ["const o = {","};"] },
  poderMetamagia: { antes: ["      nota: `[METAMAGIA ARMADA", FIM], hoje: ["      nota: oEnvelopeDosPoderes(\"metamagiaArmada\"", FIM], envolve: ["const o = {","};"] },
  poderEfeito: { antes: ["      nota: `[EFEITO APLICADO PELO SISTEMA]", FIM], hoje: ["      nota: oEnvelopeDosPoderes(\"efeitoAplicado\"", FIM], envolve: ["const o = {","};"] },
  poderMilagreComo: { antes: ["    notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[COMO O MILAGRE SE MANIFESTA", FIM], hoje: ["    notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"milagreComoSeManifesta\"", FIM] },
  poderMilagre: { antes: ["    enviar(`[MILAGRE — EFEITO JÁ APLICADO", FIM], hoje: ["    enviar(oEnvelopeDosPoderes(\"milagre\"", FIM] },
  poderDespertar: { antes: ["    enviar(`[DESPERTAR DIVINO —", FIM], hoje: ["    enviar(oEnvelopeDosPoderes(\"despertarDivino\"", FIM] },
  poderIdentificarNota: { antes: ["      notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[IDENTIFICAR — RESOLVIDO", FIM], hoje: ["      notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"identificarResolvido\"", FIM] },
  poderIdentificar: { antes: ["      enviar(`[IDENTIFICAR] Usei", FIM], hoje: ["      enviar(oEnvelopeDosPoderes(\"identificar\"", FIM] },
  poderLocalizarSem: { antes: ["        enviar(`[LOCALIZAR — SEM RESPOSTA]", FIM], hoje: ["        enviar(oEnvelopeDosPoderes(\"localizarSemResposta\"", FIM] },
  poderLocalizarNota: { antes: ["      notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[LOCALIZAR — RESOLVIDO", FIM], hoje: ["      notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"localizarResolvido\"", FIM] },
  poderLocalizar: { antes: ["      enviar(`[LOCALIZAR] Usei", FIM], hoje: ["      enviar(oEnvelopeDosPoderes(\"localizar\"", FIM] },
  poderHabilidades: { antes: ["      enviar(desfechos.length\n", "\n      };\n      if (fechouHab)"], hoje: ["      enviar(desfechos.length\n", "\n      };\n      if (fechouHab)"] },
  poderHabilidade: { antes: ["      enviar(desfechoC\n", "\n      };\n      if (fechouCit)"], hoje: ["      enviar(desfechoC\n", "\n      };\n      if (fechouCit)"] },
  poderEncerradasAoVencer: { antes: ["\n        notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INVOCAÇÕES ENCERRADAS", FIM], hoje: ["\n        notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"invocacoesEncerradas\"", FIM] },
  poderEncerradasNaFuga: { antes: ["          notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INVOCAÇÕES ENCERRADAS", FIM], hoje: ["          notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"invocacoesEncerradas\"", FIM] },
  poderEncerradaNoRevide: { antes: ["          notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[INVOCAÇÃO ENCERRADA", FIM], hoje: ["          notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"invocacaoEncerrada\"", FIM] },
  /* o mercado e a bolsa: seis notas de uma linha; o sítio devolve a nota */
  mercadoEquipou: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[EQUIPAMENTO — REGISTRO DO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMercado(\"equipouSemTreino\"", FIM] },
  mercadoConsumivel: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[CONSUMÍVEL — JÁ APLICADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMercado(\"consumivel\"", FIM] },
  mercadoMapa: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[MAPA COMPRADO — JÁ APLICADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMercado(\"mapaComprado\"", FIM] },
  mercadoCompra: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[COMPRA — JÁ REGISTRADA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMercado(\"compra\"", FIM] },
  mercadoPechincha: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[PECHINCHA — JÁ RESOLVIDA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMercado(\"pechincha\"", FIM] },
  mercadoVenda: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[VENDA — JÁ REGISTRADA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoMercado(\"venda\"", FIM] },
  /* o domínio: onze notas de uma linha (o decreto e os seus desfechos, o governo das cidades, o tratado); o sítio devolve a nota */
  dominioDecretoAceito: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[DECRETO ACEITO — ${d.alvo}]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"decretoAceito\"", FIM] },
  dominioDizimado: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[DECRETO — DESFECHO: DIZIMADO]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"decretoDizimado\"", FIM] },
  dominioFracasso: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[DECRETO — DESFECHO: FRACASSO]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"decretoFracasso\"", FIM] },
  dominioCumprido: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[DECRETO — DESFECHO: CUMPRIDO", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"decretoCumprido\"", FIM] },
  dominioObraPronta: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[OBRA CONCLUÍDA — JÁ APLICADA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"obraConcluida\"", FIM] },
  dominioRevolta: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[REVOLTA — JÁ RESOLVIDA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"revolta\"", FIM] },
  dominioImposto: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[IMPOSTO — JÁ APLICADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"imposto\"", FIM] },
  dominioObraIniciada: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[OBRA INICIADA — JÁ PAGA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"obraIniciada\"", FIM] },
  dominioGovernador: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[GOVERNADOR — JÁ NOMEADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"governador\"", FIM] },
  dominioReivindicacao: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[REIVINDICAÇÃO — JÁ PAGA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"reivindicacao\"", FIM] },
  dominioTratado: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[TRATADO — JÁ FIRMADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoDominio(\"tratado\"", FIM] },
  /* o tempo e a noite: três linhas de uma linha (o clima ao passar e na noite, o sonho) e o ternário do onde acordo, até ao envio do descanso; o sítio devolve a linha */
  tempoClimaAoPassar: { antes: ["const climaMsg = climaNovo ? `\\n[CLIMA] O tempo virou: agora", FIM], hoje: ["const climaMsg = climaNovo ? oEnvelopeDoTempo(\"climaAoPassar\"", FIM] },
  tempoClimaDaNoite: { antes: ["const climaMsg = climaNovo ? `\\n[CLIMA] O tempo virou durante a noite", FIM], hoje: ["const climaMsg = climaNovo ? oEnvelopeDoTempo(\"climaDaNoite\"", FIM] },
  tempoSonho: { antes: ["sonhoMsg = `\\n[SONHO]", FIM], hoje: ["sonhoMsg = oEnvelopeDoTempo(\"sonho\"", FIM] },
  tempoOndeAcordo: { antes: ["    const localMsg = (jornadaRef.current && !acordoCala)", "\n    enviar(oEnvelopeDoAcampamento(\"levantarDescansado\""], hoje: ["    const localMsg = (jornadaRef.current && !acordoCala)", "\n    enviar(oEnvelopeDoAcampamento(\"levantarDescansado\""] },
  /* a fé e as casas: cinco notas de uma linha (a guilda e a fundada, a fé na geografia, o templo, a ascensão); o sítio devolve a nota */
  feGuilda: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[GUILDA — RESOLVIDO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFe(\"guilda\"", FIM] },
  feGuildaFundada: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[GUILDA FUNDADA — RESOLVIDO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFe(\"guildaFundada\"", FIM] },
  feNaGeografia: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[FÉ NA GEOGRAFIA — REGISTRO DO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFe(\"feNaGeografia\"", FIM] },
  feTemplo: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[TEMPLO ERGUIDO — REGISTRO DO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFe(\"templo\"", FIM] },
  feAscensao: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[ASCENSÃO — RECALIBRAÇÃO DO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaFe(\"ascensao\"", FIM] },
  /* o caminho: quatro notas (o movimento registrado e o resolvido, a chegada; o destino não reconhecido tem duas linhas, até ao return); o sítio devolve a nota */
  caminhoMovRegistrado: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[MOVIMENTO — REGISTRADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoCaminho(\"movimentoRegistrado\"", FIM] },
  caminhoMovResolvido: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[MOVIMENTO — RESOLVIDO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoCaminho(\"movimentoResolvido\"", FIM] },
  caminhoChegada: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[CHEGADA — REGISTRADA PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoCaminho(\"chegada\"", FIM] },
  caminhoDestino: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[DESTINO NÃO RECONHECIDO — AVISO DO SISTEMA]", "\n              return false;"], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoCaminho(\"destinoNaoReconhecido\"", "\n              return false;"] },
  /* a masmorra, o que faltava (17.º grupo): a entrada (uma linha, o sítio devolve o envelope) e a armadilha que se sofreu (duas linhas, até ao fim da função; o sítio devolve o que enviou) */
  entradaDaMasmorra: { antes: ["    const envelopeDaEntrada = (`${vestido", FIM], hoje: ["    const envelopeDaEntrada = (oEnvelopeDaMasmorra(\"entrada\"", FIM] },
  armadilhaSofridaNaMasmorra: { antes: ["      enviar(`${envelopeDaSalvaguarda(sv, { oQue: `A armadilha", "\n    }\n  };\n  const posDaMasmorra"], hoje: ["      enviar(oEnvelopeDaMasmorra(\"armadilhaSofrida\"", "\n    }\n  };\n  const posDaMasmorra"] },
  /* a gente e a história (18.º grupo): quatro notas de uma linha (o companheiro que foi embora, a missão perdida, a relação formal, o novo arco) e a cauda do env da perícia (a relação mudada; o sítio devolve o env) */
  genteCompanheiro: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[O COMPANHEIRO FOI EMBORA — CANON]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaGente(\"companheiroFoiEmbora\"", FIM] },
  genteMissaoPerdida: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[MISSAO PERDIDA — RESOLVIDO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaGente(\"missaoPerdida\"", FIM] },
  genteRelacaoFormal: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[RELAÇÃO FORMAL — CANON ABSOLUTO]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaGente(\"relacaoFormal\"", FIM] },
  genteNovoArco: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[NOVO ARCO ESCOLHIDO PELO JOGADOR: ", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDaGente(\"novoArco\"", FIM] },
  genteRelacaoMudada: { antes: ["env = `${env}\\n[RELAÇÃO — MUDADA PELO SISTEMA]", FIM], hoje: ["env = env + \"\\n\" + oEnvelopeDaGente(\"relacaoMudada\"", FIM] },
  /* o turno do jogador (19.º grupo): a pergunta ao Mestre na luta (o enviar), o que eu escrevi dentro do descanso (a nota) e a rolagem (o enviar; o App de antes lia o notaVant de um const ~300 linhas acima, que saiu: a forma diz a vantagem) */
  vezPergunta: { antes: ["enviar(`${acao} [PERGUNTA AO MESTRE", FIM], hoje: ["enviar(oEnvelopeDoJogador(\"perguntaAoMestre\"", FIM] },
  vezEscrevi: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[O QUE EU ESCREVI]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDoJogador(\"oQueEuEscrevi\"", FIM] },
  vezRolagem: { antes: ["    enviar(`${preRefazer}[ROLAGEM]", FIM], hoje: ["    enviar(preRefazer + oEnvelopeDoJogador(\"rolagem\"", FIM], antesDe: ["    const notaVant = r.vantagem", FIM] },
  /* as magias de função (20.º grupo, na tabela dos poderes): reviver e a magia ativa são notas de uma linha; a cura e a condição desfeita são o enviar (o sítio devolve o que enviou) */
  funcaoReviver: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[${m.nome.toUpperCase()} — APLICADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"reviverAplicado\"", FIM] },
  funcaoCura: { antes: ["      enviar(`[${m.nome} — CURA APLICADA PELO SISTEMA]", FIM], hoje: ["      enviar(oEnvelopeDosPoderes(\"curaAplicada\"", FIM] },
  funcaoCondicao: { antes: ["        enviar(`[${m.nome} — JÁ APLICADA PELO SISTEMA]", FIM], hoje: ["        enviar(oEnvelopeDosPoderes(\"condicaoDesfeita\"", FIM] },
  funcaoAtiva: { antes: ["notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}[${m.nome.toUpperCase()} — ATIVO, CONTADO PELO SISTEMA]", FIM], hoje: ["notaRef.current = (notaRef.current ? notaRef.current + \"\\n\" : \"\") + oEnvelopeDosPoderes(\"magiaAtiva\"", FIM] },
};
const DEVOLVE = { rodape: "rodape", aberturaCampanha: "abrirACampanha(pers)", viagemTrecho: "textoDaViagem",
  fioMarco: "notaRef.current", fioRumores: "notaRef.current", fioMundo: "notaRef.current", fioVirada: "notaRef.current", fioInterludio: "p",
  fichaNivel: "notaRef.current", fichaPericias: "notaRef.current", fichaAtributo: "notaRef.current", fichaHabilidade: "notaRef.current", fichaSubclasse: "notaRef.current", fichaEspecializacao: "notaRef.current", fichaRefazer: "notaRef.current", fichaRecrutamento: "notaDoRecrutamento(comp)",
  infoDescarteItem: "notaRef.current", infoDescarteEquip: "notaRef.current", infoEquipou: "notaRef.current", infoForjou: "notaRef.current", infoContrato: "notaRef.current", infoDecreto: "notaRef.current", infoAgoraE: "notaRef.current", infoSaiu: "notaRef.current", infoGuilda: "notaRef.current", infoRecalFicha: "notaRef.current", infoRecalMundo: "notaRef.current", infoTransferiu: "notaRef.current",
  mundoFestival: "extras", mundoRumor: "notaRef.current", mundoRumorDeLonge: "notaRef.current", mundoReino: "envelopeEventosReino(evs)", mundoGlobalNovo: "partes", mundoGlobalAvancou: "partes", mundoLocalNovo: "partes", mundoLocalExpirado: "partes", mundoQuest: "partes", mundoDivindade: "partes", mundoEventoDivino: "partes",
  poderInvocacao: "o.nota", poderSacrificio: "o.nota", poderMetamagia: "o.nota", poderEfeito: "o.nota", poderMilagreComo: "notaRef.current", poderMilagre: "enviados", poderDespertar: "enviados", poderIdentificarNota: "notaRef.current", poderIdentificar: "enviados", poderLocalizarSem: "enviados", poderLocalizarNota: "notaRef.current", poderLocalizar: "enviados", poderHabilidades: "enviados", poderHabilidade: "enviados", poderEncerradasAoVencer: "notaRef.current", poderEncerradasNaFuga: "notaRef.current", poderEncerradaNoRevide: "notaRef.current",
  mercadoEquipou: "notaRef.current", mercadoConsumivel: "notaRef.current", mercadoMapa: "notaRef.current", mercadoCompra: "notaRef.current", mercadoPechincha: "notaRef.current", mercadoVenda: "notaRef.current",
  dominioDecretoAceito: "notaRef.current", dominioDizimado: "notaRef.current", dominioFracasso: "notaRef.current", dominioCumprido: "notaRef.current", dominioObraPronta: "notaRef.current", dominioRevolta: "notaRef.current", dominioImposto: "notaRef.current", dominioObraIniciada: "notaRef.current", dominioGovernador: "notaRef.current", dominioReivindicacao: "notaRef.current", dominioTratado: "notaRef.current",
  tempoClimaAoPassar: "climaMsg", tempoClimaDaNoite: "climaMsg", tempoSonho: "sonhoMsg", tempoOndeAcordo: "localMsg",
  feGuilda: "notaRef.current", feGuildaFundada: "notaRef.current", feNaGeografia: "notaRef.current", feTemplo: "notaRef.current", feAscensao: "notaRef.current",
  caminhoMovRegistrado: "notaRef.current", caminhoMovResolvido: "notaRef.current", caminhoChegada: "notaRef.current", caminhoDestino: "notaRef.current",
  entradaDaMasmorra: "envelopeDaEntrada", armadilhaSofridaNaMasmorra: "enviados",
  genteCompanheiro: "notaRef.current", genteMissaoPerdida: "notaRef.current", genteRelacaoFormal: "notaRef.current", genteNovoArco: "notaRef.current", genteRelacaoMudada: "env",
  vezPergunta: "enviados", vezEscrevi: "notaRef.current", vezRolagem: "enviados",
  funcaoReviver: "notaRef.current", funcaoCura: "enviados", funcaoCondicao: "enviados", funcaoAtiva: "notaRef.current" };
export function recorteDosEnvelopes(app, { novo, so } = {}) {
  const corte = corteDe(app);
  const r = {};
  for (const b of so ? [so] : BLOCOS) {
    const A = ANCORAS[b];
    const fora = !novo && A.antesDe ? corte(...A.antesDe) + "\n" : "";
    /* `envolve`: o sítio que é um campo de objeto (nota: `...`,) corre dentro de um objeto, nas duas pontas */
    const cerne = corte(...(novo ? A.hoje : A.antes));
    r[b] = { orgaos: fora + (A.envolve ? A.envolve[0] + "\n" + cerne + "\n" + A.envolve[1] : cerne), devolve: DEVOLVE[b] || "enviados" };
  }
  return r;
}
export function blocoComoFuncao({ orgaos, devolve }) {
  const corpo = `with (S) { return function () {\n${orgaos}\nreturn ${devolve};\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS ----------------
   O relógio (o dia, a hora, a noite), o lugar, quem despertou para a fé
   (e o resumo vazio), a luta ou a paz, a masmorra, a jornada, o prédio, a
   cidade do mapa (sem muro, paliçada, muralha, a militar, a costa, a
   montanha) e fora dele, a ficha do turno e a do ref, e um padrão de peças
   vazias que muda com o caso. */
const CIDADES = [
  { nome: "Ponte do Martelo", populacao: 190, bioma: "planície" },
  { nome: "Agulha de Sal", populacao: 900, bioma: "costa", porte: "vila de pesca" },
  { nome: "Torre Funda", populacao: 3000, bioma: "montanha" },
  { nome: "Forte Cinza", populacao: 800, porte: "fortaleza" },
  { nome: "Coroa Alta", populacao: 40000, bioma: "rio" },
];
const MINUTOS = [0, 359, 360, 480, 1000, 1259, 1260, 1439, 725];
const DIAS = [1, 2, 89, 91, 180, 271, 365, 400];
export function casoDosEnvelopes(i) {
  const cidade = i % 11 === 5 ? null : i % 13 === 7 ? "Cidade Fora do Mapa" : CIDADES[i % CIDADES.length].nome;
  return {
    i,
    dia: DIAS[i % DIAS.length], minuto: MINUTOS[(i >> 1) % MINUTOS.length],
    divindade: [null, { despertar: false }, { despertar: true, grau: 2 }, { despertar: true, grau: 0 }][i % 4],
    ascensaoVazia: i % 8 === 3,
    combate: i % 5 === 2 ? { grade: { w: 8, h: 8 }, heroi: { x: 1, y: 2 }, inimigos: [{ nome: "Lobo" }], aliados: i % 2 ? [{ nome: "Iris" }] : undefined, ordem: ["heroi", "Lobo"] } : null,
    masmorra: i % 6 === 4 ? { nome: "Cripta do Corvo", atual: 2 } : null,
    jornada: i % 7 === 1 ? { destino: "Agulha de Sal", trecho: i % 2 ? { indice: 3, total: 13, feicao: { nome: "as três pedras" } } : null } : null,
    lugar: [null, null, { nome: "A Forja" }, { nome: "o sótão", dentroDe: "A Espada Faiscante" }, { nome: "o moinho velho" }][(i >> 2) % 5],
    cidade,
    persAtual: i % 3 === 0 ? null : { nome: "Vera", nivel: 1 + (i % 9), grupo: i % 4 ? [{ nome: "Iris" }] : [] },
    refVazio: i % 9 === 2,
    personagem: { nome: "Vera do render", nivel: 3, grupo: [] },
    /* que peças voltam vazias: um padrão de bits que gira com o caso */
    vazios: (i * 2654435761) >>> 0,
    mensagens: i % 3 === 1 ? [{ autor: "mestre", texto: "Iris olha para Bruna." }, { autor: "jogador", texto: "oi" }] : [],
    missoes: i % 4 === 2 ? [{ status: "ativa", dador: "Bruna", etapas: [{ alvo: "Sarna" }, null] }, null] : [],
    pauta: i % 5 === 1 ? "ONDE Iris está em Ponte do Martelo" : "",
    sinais: i % 10 === 9 ? null : { masmorraEmJogo: i % 2 === 0, chefeEmJogo: i % 3 === 0 },
    ondeEstoura: i % 17 === 3,
  };
}

/* A MASMORRA: a sala com e sem nome de armadilha, com e sem segredo; a
   salvaguarda passada, falhada e nenhuma; o tesouro com item (com e sem
   poder) e sem; a busca que achou e a que não; a armadilha vista e a que
   ninguém viu. Tirados do índice, à parte do caso do rodapé (que não muda). */
export function masmorraDoCaso(i) {
  const segredo = i % 3 === 0 ? null : { cd: 12 + (i % 6), txt: "uma alavanca atrás do quadro", tipo: i % 2 ? "passagem_secreta" : "tesouro_escondido" };
  return {
    pos: ["Cripta do Corvo, sala 2 de 5", "Poço das Celas, sala 4 de 4", "Torre Velha, a câmara do chefe"][i % 3],
    sala: { nomeArmadilha: ["Fosso de Estacas", "", "Agulha Envenenada", undefined][i % 4], moedas: 20 + (i % 9) * 15, cena: "um nicho de água limpa sob uma lâmpada de óleo", segredo },
    svC: [null, { passou: true }, { passou: false }][i % 3],
    alvo: { nome: ["Iris", "Bruna Ferro", "Greta"][i % 3] },
    sofridoAli: 1 + (i % 11), depois: i % 2 ? " [DEPOIS]" : "", euC: { nome: "Vera", i },
    r: { mm: { nome: "Cripta" }, minutos: 10 + (i % 4) * 5, achou: i % 4 !== 1 && i % 9 !== 4, segredo: i % 4 === 1 ? null : { txt: "uma escada que desce", tipo: i % 2 ? "passagem_secreta" : "sala" } },
    posDaMasmorra: (mm, sala) => "a " + mm.nome + " (" + (sala.nomeArmadilha || "?") + ")",
    tempo: i % 3 ? " [TEMPO +10]" : "", tempoA: i % 5 ? " [TEMPO +5]" : "",
    armadilhaNaoVista: i % 2 === 0, avisoSegredo: i % 7 < 3 ? " [AVISO: há um segredo]" : "", extraTempo: i % 4 ? " [+1 tocha]" : "",
    item: [null, { nome: "Lâmina de Osso", raridade: "raro" }, { nome: "Anel da Brasa", raridade: "epico", poder: "+1 de fogo" }][i % 3],
    p2: { nome: "Vera", moedas: i }, mm: { nome: ["Cripta do Corvo", "Poço das Celas"][i % 2] }, total: 5 + (i % 17),
  };
}

/* O CORREIO E O DOMÍNIO: o decreto de cada tipo (e o que não existe, que
   cai no de reserva), com e sem descrição; a carta de cada tipo, com e sem
   oferta, com e sem mensagem; a petição aceita e recusada, com e sem nota,
   com moedas a entrar, a sair e nenhumas; a ficha viva e a que falta. */
const CARTAS = Object.keys(TIPOS_CARTA);
export function correioDoCaso(i) {
  return {
    d: { tipo: ["cabeca", "masmorra", "caca", "resgate", "escolta", "nenhum"][i % 6], descricao: ["Paga-se pela cabeça de Sarna, o Rubro.", "Limpem a Cripta do Corvo.", ""][i % 3], recompensa: 40 + (i % 7) * 25 },
    para: ["Casa Ferro", "a Câmara do Dragão", "Bruna Ferro"][i % 3],
    t: TIPOS_CARTA[CARTAS[i % CARTAS.length]],
    oferta: [0, 50, null, 120][i % 4],
    mensagem: ["", "Venho em paz.", undefined, "Pagai o que deveis ou vereis o aço."][(i >> 1) % 4],
    p: { texto: ["🆘 A Câmara do Dragão pede auxílio contra seus inimigos.", "📜 Noé Laminado pede que julgues a briga do moinho."][i % 2], de: ["a Câmara do Dragão", "Noé Laminado", "Iris"][i % 3] },
    aceite: i % 2 === 0,
    ef: [{ nota: "a Câmara te deve um favor", moedas: 30 }, { moedas: -45 }, { nota: "" }, { nota: "o moinho volta a moer", moedas: 0 }, {}][(i >> 1) % 5],
    fichaViva: () => (i % 5 === 0 ? null : { nome: "Vera viva" }),
  };
}

/* O ACAMPAMENTO E A FOGUEIRA: o descanso curto e o longo, com e sem a frase
   da manhã à frente; as notas do fim (onde acordo, o clima, o reino, a
   guarda, o sonho, os eventos) cheias e vazias; quem se senta ao fogo, de
   cada género; o lado escolhido; a resposta aceite, recusada, o porquê e a
   que não está na tabela; a ficha viva e a que falta. */
export function acampamentoDoCaso(i) {
  const nota = (n, txt) => ((i >> n) & 1 ? txt : "");
  return {
    MINUTOS_ARRUMANDO: 20, reciboNenhum: ["NÃO houve cura — PV e PM continuam exatamente como estavam.", "Queimei um dado de vida: +4 PV (já aplicado)."][i % 2],
    reinoMsg: nota(1, "\n[REINO] O imposto da estação venceu."),
    extra: [null, {}, { antes: "Amanhece; Iris ainda olha as brasas." }, { antes: "" }][i % 4], tipo: ["curto", "longo"][(i >> 1) % 2], dur: ["1 hora", "8 horas"][(i >> 1) % 2],
    reciboMsg: ["PV 12→18, PM 3→5 (já aplicado).", "O grupo inteiro descansou: PV e PM cheios."][i % 2],
    localMsg: nota(2, "\n[ONDE ACORDO] Eu ainda estou EM VIAGEM."), climaMsg: nota(3, "\n[CLIMA] chuva fina"), guardaMsg: nota(4, "\n[GUARDA] Bruna vigiou."),
    sonhoMsg: nota(5, "\n[SONHO] uma porta de sal"), eventosMsg: nota(6, "\n[EVENTOS] a ponte caiu"),
    pers: { nome: "Vera descansada" }, nome: ["Iris", "Bruna Ferro", "Petra Guarda-Portão"][i % 3],
    lado: { verbo: ["Fico do lado de Iris", "Entrego o anel"][i % 2], preco: ["Bruna não me perdoa", "◉ 30 e a confiança de Noé"][(i >> 1) % 2] },
    naLuta: i % 3 ? { nome: "Vera paga" } : { nome: "Vera na luta" },
    f: { quem: ["Iris", "Noé Laminado", "Greta"][i % 3], genero: ["f", "m", ""][i % 3], recibo: "recibo " + (i % 4) },
    resposta: ["aceitou", "recusou", "porque", "outra"][i % 4],
    fichaViva: () => (i % 5 === 0 ? null : { nome: "Vera viva" }),
  };
}

/* A ABERTURA: o herói sem habilidades, com uma, com várias e sem a lista;
   o recap que vale e o que não (e nenhum); o save com nome, sem nome e com
   o nome antigo; o herói do ref e o do capítulo. */
export function aberturaDoCaso(i) {
  return {
    pers: { nome: "Vera do capítulo", habilidades: [[], [{ nome: "Golpe Feroz" }], [{ nome: "Bênção" }, { nome: "Luz" }, { nome: "Escudo da Fé" }], undefined][i % 4] },
    recap: [null, { vale: true, dias: 3 }, { vale: false }][i % 3],
    volta: { quando: ["ontem", "há uma semana"][(i >> 1) % 2] },
    sv: [{ nomeCampanha: "A Coroa de Sal", historico: [{ role: "user", content: "oi" }] }, { personagem: { nome: "Bruna" } }, { nomeCampanha: "  ", historico: null }, { campanha: "O Dragão de Vidro" }, {}][i % 5],
  };
}

/* A VIAGEM: o trecho até à boca de uma masmorra (o último e não), até uma
   cidade (o último e não) e sem destino na jornada (com destino dito e
   sem); com e sem meio; as notas do fim cheias e vazias; as horas de cada
   escala, dentro e fora de um lugar; o forrageamento que achou e o que não,
   com nada, uma e duas colheitas; a emboscada com e sem nota. */
export function viagemDoCaso(i) {
  const m = i % 6;
  const nota = (n, txt) => ((i >> n) & 1 ? txt : "");
  return {
    nome: ["Agulha de Sal", "Coroa Alta", "o Vau das Garças"][i % 3], escolhida: { nome: ["Torre Funda", "a Ponte do Martelo"][i % 2] },
    fichaViva: () => (i % 5 === 0 ? null : { nome: "Vera viva" }),
    horas: [1, 3, 4, 8, 9, 16, 17, 24, 48][i % 9], escala: ["algumas horas (mudanças pequenas)", "um dia completo (o mundo se move bastante)"][i % 2],
    climaMsg: nota(1, "\n[CLIMA] O tempo virou: agora está chuva — fina. Use isso na cena."), reinoMsg: nota(2, "\n[REINO] O imposto venceu."),
    r: { achou: i % 3 !== 0, racoes: 1 + (i % 4), agua: i % 5, nome: ["Os Lobos do Vau", "a Matilha Cinza"][i % 2] },
    colhidos: [[], [{ nome: "Erva-de-sangue", desc: "cura leve", icone: "🌿" }], [{ nome: "Musgo", desc: "pavio", icone: "🍂" }, { nome: "Pedra-ume", desc: "tinta", icone: "🪨" }]][i % 3],
    extra: nota(3, " [TEMPO +4h]"), pColh: { nome: "Vera colhida" },
    ab: { nota: [null, "", "[EMBOSCADA] Eles cercam a estrada."][i % 3] },
    c: { rotulo: ["céu limpo", "chuva", "nevoeiro"][i % 3], nota: "a estrada " + (i % 4) }, enc: { tipo: ["nenhum", "viajante", "perigo"][i % 3] }, encV: { detalhe: "um carroceiro " + (i % 7) },
    jornadaRef: { current: { meio: [null, "carroça", "barco"][(i >> 1) % 3], alvo: { nome: ["a Cripta do Corvo", "o Poço das Celas", "Torre Velha"][i % 3], tipo: "masmorra" } } },
    paraBoca: m < 2, ultimoTrecho: m === 0, paraCidade: m === 2 || m === 3 ? "Coroa Alta" : "", ultimoTrechoCidade: m === 2,
    destino: m === 5 ? [null, ""][i % 2] : "Agulha de Sal",
    rit: { nome: ["Normal", "Forçada", "Cautelosa"][i % 3], desc: "o passo " + (i % 3) },
    notaMarcha: nota(4, " [MARCHA] cansaço"), notaErmos: nota(5, " [ERMOS] sem trilha"), notaAmbulante: nota(6, " [AMBULANTE] um mascate"), extraTempo: nota(7, " [TEMPO +1h]"),
  };
}

/* O FIO DA HISTÓRIA: a nota do turno vazia e já com outra nota à frente;
   os rumores da chave nenhum, um e dois; o degrau da escada e o que o mundo
   diz; a virada de cada forma, com nenhum, um e dois passos; a luta da chave
   com a ficha viva e sem ela. */
export function fioDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    fora: { rumores: [["Brann venceu Iolanda"], ["a Garra caiu", "o Rubro sangra"], []][i % 3] },
    r: { escada: { degrau: 1 + (i % 4) }, intervencao: { diz: ["um mensageiro bate à porta", "a ponte cai"][i % 2] } },
    rev: { forma: ["traidor", "herdeiro", "pacto"][i % 3] }, passos: [[], ["Iris some"], ["Iris some", "a guarda chega"]][(i >> 1) % 3],
    p: [], porNaPauta: (p, k, txt) => [...p, [k, txt]], torneioRef: { current: { chave: i % 3 } },
    f: { nome: ["Brann", "Iolanda da Garra"][i % 2] }, fichaViva: () => (i % 5 === 0 ? null : { nome: "Vera viva" }),
  };
}

/* A FICHA (A FORMAÇÃO): a nota do turno vazia e já com outra à frente; o
   nível de cada degrau; o atributo de cada nome e valor; a habilidade que
   abre o caminho de outra classe e a que não (com o nome da classe vazio
   também); a especialização de subclasse e a de obsessão de cada classe.
   E o que o sistema resolveu: o combate com e sem o resumo dos inimigos; o
   sucesso automático com o motivo, sem ele e vazio; a volta pela fé e pelo
   ouro, da 1.ª à 4.ª vez; o companheiro recrutado de cada nível e PV.
   E as notas [INFO]: o item forjado com e sem poder; a raça, a classe e a
   subclasse com uma vazia, e a profissão dita e não; a recalibração com e
   sem dádivas; quem sai, quem equipa, o que se transfere de onde para onde. */
export function fichaDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    personagem: { nome: "Vera do render", nivel: 2 + (i % 9), classe: ["Guerreiro", "Clérigo", "Bardo"][i % 3] },
    nomeAttr: ["Força", "Sabedoria", "Carisma", "Destreza"][i % 4], r: { valor: 1 + (i % 5), motivo: [undefined, "pular o muro", "", "erguer a grade"][i % 4], dificuldade: 8 + (i % 7) },
    hab: { nome: ["Golpe Feroz", "Bênção", "Passo Sombrio"][i % 3], custo: (i % 4) * 2, descricao: ["dano +1d6", "cura 1d8", "teleporta 9 m"][(i >> 1) % 3] },
    eraNova: [false, true, 0, "sim"][(i >> 2) % 4], classeNome: ["Mago", "Ladino", ""][(i >> 1) % 3],
    subNome: ["Campeão", "Domínio da Luz"][i % 2], espNome: ["Mestre de Armas", "Lâmina Gêmea", "Erudito"][i % 3],
    desfecho: ["três golpes", "dois acertos e um erro", "um golpe só"][i % 3], resumoInimigos: ["", " Lobo caiu; o Corvo está a 3 PV."][(i >> 1) % 2], acao: ["ataco o lobo", "giro a lança e avanço"][i % 2],
    via: ["fe", "ouro", "outra"][i % 3], np: { nome: "Vera de volta", voltas: 1 + (i % 4) }, cic: { nome: ["Mão Fria", "Olhar Vazio"][i % 2], descricao: ["a mão esquerda não aquece", "os olhos não refletem a luz"][(i >> 1) % 2] },
    comp: { nome: ["Iris", "Bruna Ferro", "Noé"][i % 3], nivel: 1 + (i % 6), vidaMax: 8 + (i % 5) * 3 },
    nome: ["Adaga Torta", "Escudo de Pinho", "Greta"][i % 3], nomeComp: ["Iris", "Noé"][i % 2],
    item: { nome: ["Lâmina de Osso", "Anel da Brasa"][i % 2], raridade: ["raro", "epico", "comum"][i % 3], poder: [null, "+1 de fogo", ""][(i >> 1) % 3] },
    titulo: ["A cabeça de Sarna", "Escolta ao Vau"][i % 2], d: { alvo: ["Sarna, o Rubro", "a Cripta do Corvo"][(i >> 1) % 2] },
    quem: ["Vera", "Iris"][i % 2], raca: ["Elfo", "", "Anão"][i % 3], classe: ["Mago", "Guerreiro"][(i >> 1) % 2], subclasse: ["", "Campeão", undefined][(i >> 2) % 3], profissao: ["", "ferreira", null][i % 3],
    faccaoJogadorRef: { current: ["A Garra de Sal", "Os Lobos do Vau"][i % 2] }, g: { nivel: 2 + (i % 4) },
    p: { nivel: 1 + (i % 12), vidaMax: 10 + i % 30, manaMax: i % 9, prof: 2 + (i % 3), dadivas: [0, 2, null, 1][i % 4] },
    nomeFinal: ["Poção de Cura", "Corda de Seda"][i % 2], deTxt: ["a mochila", "Iris"][i % 2], paraTxt: ["o baú da estalagem", "Noé"][(i >> 1) % 2],
  };
}

/* O MUNDO QUE ANDA: a nota do turno vazia e já com outra à frente; o
   festival de cada nome e dia; os dois boatos; o reino sem evento, com um e
   com dois, cada delta positivo, negativo e zero (o zero não entra), o povo
   à beira da revolta e não, e o correio do dia vazio e cheio; o arco global
   novo e a etapa de cada degrau; o fio local e nenhum, um e dois expirados;
   a quest de cada fase; a divindade com e sem o lugar forte, de cada grau.
   No reino, um evento em cada sete é sem efeito nenhum (os três deltas zero:
   a lista dos efeitos fica vazia, e é o que o texto de antes dizia). */
export function mundoDoCaso(i) {
  const ev = (j) => {
    const nada = (i + j) % 7 === 3;
    return {
      evento: { titulo: ["Colheita farta", "Peste nos currais", "Feira de inverno"][(i + j) % 3], txt: (c) => ["o trigo transborda em " + c, c + " enterra os bois", "mercadores enchem " + c][(i + j) % 3], soSeInfeliz: (i + j) % 4 === 1 },
      cidade: ["Vau", "Porto Sal", "Corvo"][(i >> 1 + j) % 3], felDelta: nada ? 0 : [0, 5, -8, 3][(i + j) % 4], popDelta: nada ? 0 : [0, -12, 30][(i + 2 * j) % 3], cofreDelta: nada ? 0 : [0, 40, 0, -15, 7][(i + 3 * j) % 5],
    };
  };
  return {
    extras: [], partes: [], notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    fest: { nome: ["Dia do Sal", "Noite das Lanternas", "festa da colheita"][i % 3], descricao: ["o povo enfeita as portas com sal", "lanternas sobem o rio"][(i >> 1) % 2] },
    boato: ["o marquês fugiu de noite", "há luz na cripta", "Iris deve ao Corvo"][i % 3], boatoDoMundo: ["Brann tomou o Vau", "a Garra perdeu a ponte"][(i >> 1) % 2],
    evs: [[], [ev(0)], [ev(0), ev(1)]][i % 3],
    correioMsgsDiaRef: { current: [[], ["[CORREIO] carta de Iris"], ["[CORREIO] a", "[CORREIO] b"]][(i >> 1) % 3] },
    r: {
      globalNovo: { nome: ["O Torneio das Coroas", "a peste cinzenta"][i % 2], semente: ["O maior torneio foi anunciado.", "Uma tosse corre os portos."][(i >> 1) % 2], etapas: [["os campeões chegam", "a chave sai", "a final"], ["o primeiro porto fecha", "a quarentena"]][i % 2] },
      localNovo: { icone: ["🔥", "🐺"][i % 2], texto: ["O celeiro arde.", "Lobos rondam a cerca."][(i >> 1) % 2], gancho: ["quem pôs o fogo?", "o pastor sumiu."][i % 2], expiraEm: 3 + (i % 9) },
      expirados: [[], [{ texto: "o celeiro arde" }], [{ texto: "os lobos" }, { texto: "o pastor" }]][(i >> 1) % 3],
      questNova: { titulo: ["O pedido de Ondine", "A ponte caída"][i % 2], descricao: ["Ondine procura ajuda.", "A ponte do Vau caiu."][(i >> 1) % 2], objetivo: ["achar o anel", "reerguer a ponte", "falar com o barqueiro"][i % 3] },
    },
    g: { nome: ["O Torneio das Coroas", "a peste cinzenta"][i % 2], etapa: i % 3, etapas: ["os campeões chegam", "a chave sai", "a final"] },
    ctx: { fase: ["abertura", "meio", "climax"][i % 3] },
    nova: { icone: ["☀", "🌑"][i % 2], nome: ["Solenne", "Mórdia"][(i >> 1) % 2], dominio: ["da Aurora", "das Marés"][i % 2], gd: [3, 7, 12, 18][i % 4], temperamento: ["benevolente", "ciumenta"][(i >> 2) % 2], culto: ["pequeno", "antigo"][i % 2], lugar: [undefined, "o Vau", ""][i % 3] },
    evd: { icone: ["⚡", "🕯"][i % 2], texto: ["Um raio parte o carvalho sagrado.", "As velas do templo apagam juntas."][(i >> 1) % 2], gancho: ["o sacerdote quer respostas", "alguém viu um vulto"][i % 2] },
  };
}

/* OS PODERES: a nota do turno vazia e já com outra à frente; a invocação de
   uma criatura e de duas; o efeito em mim e no grupo, com o bônus físico,
   mágico e nenhum, somado ao golpe e não; o milagre e o despertar de cada
   grau de fé; o alvo do identificar dito por nome e por item; o localizar
   dentro e fora do alcance (o alcance dito, zero e pelo raio); as
   habilidades resolvidas e declaradas, com e sem o que os inimigos fizeram
   depois e a cauda de tempo; a habilidade com e sem descrição; as
   invocações que se desfazem, uma e várias. */
export function poderesDoCaso(i) {
  const novas = [[{ nome: "Lobo Espectral" }], [{ nome: "Lobo Espectral" }, { nome: "Corvo de Cinza" }]][(i >> 1) % 2];
  const rv = (j) => ({ texto: ["", " O lobo ataca e erra."][((i >> 1) + j) % 2], pers: { nome: "Vera do turno", mana: (i + j) % 9 } });
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    h: { nome: ["Chamar Lobos", "Escudo da Fé", "Toque Sombrio"][i % 3] }, novas, um: novas.length === 1, molde: { conceito: ["lobos de névoa", "corvos de cinza"][i % 2] },
    s: { nome: ["Lobo Espectral", "Corvo de Cinza"][i % 2], pm: 2 + (i % 5) },
    m: { rotulo: ["Magia Ampliada", "Magia Geminada"][i % 2], diz: ["a próxima dobra o alcance", "a próxima atinge dois alvos"][(i >> 1) % 2], nome: ["Identificar", "Agulha do Norte"][i % 2], alcance: [undefined, 5000, 0][i % 3], raio: [3, 8][(i >> 1) % 2] },
    port: { alvo: ["aliados", "si", undefined][i % 3] }, res: { cond: { nome: ["Abençoado", "Invisível", "Acelerado"][i % 3], efeito: ["+1d4 em ataques", "não pode ser visto", "+1 ação"][(i >> 1) % 3] } },
    extraEscopo: ["", " (dano físico +2)", " (dano mágico +1d6)"][(i >> 2) % 3], somaNoGolpe: [true, false][(i >> 1) % 2],
    mil: { nome: ["Chuva de Luz", "O Mar Abre"][i % 2], pf: 3 + (i % 4), desc: ["Cura todos os aliados.", "As águas se separam."][(i >> 1) % 2] }, comoUso: ["ergo a lâmina ao céu", "toco a água com a palma"][i % 2],
    pers: { nome: "Vera do pers", nivel: 5 + (i % 6) }, divindadeRef: { current: { fieis: 50 + i } }, pan: ["☀ Solenne da Aurora — GD 7 (Deus Menor)", "☀ Solenne; 🌑 Mórdia"][i % 2],
    alvo: ["Anel da Brasa", { nome: "Lâmina de Osso" }][i % 2], ficha: ["+1 de fogo, raro", "dano 1d8, épico"][(i >> 1) % 2], acao: ["leio as runas", "procuro o Corvo"][i % 2],
    r: { motivo: ["ninguém com esse nome", "o nome é de ninguém"][i % 2], alvo: ["Corvo", "Porto Sal"][i % 2], direcao: ["norte", "sudoeste"][(i >> 1) % 2], km: 3 + (i % 40) }, dentro: (i >> 2) % 2 === 0,
    desfechos: [[], ["Lobo — 6 de dano"], ["Lobo — 6 de dano", "Corvo — errou"]][i % 3], listaTxt: ["Golpe Feroz", "Golpe Feroz e Bênção"][i % 2], rvH: rv(0), rvC: rv(1),
    extraTempo: ["", " [o tempo] passaram 6 segundos."][(i >> 2) % 2],
    habCitada: { nome: ["Golpe Feroz", "Bênção"][i % 2], descricao: [undefined, "cura 1d8", ""][i % 3] }, custo: (i % 4) * 2, desfechoC: ["", "Lobo — 8 de dano"][(i >> 1) % 2],
    disp: { sumiram: [["Lobo Espectral"], ["Lobo Espectral", "Corvo de Cinza"]][i % 2] }, exp: { sumiram: [["Corvo de Cinza"], ["Lobo", "Corvo"]][(i >> 1) % 2] },
  };
}

/* O MERCADO E A BOLSA: a nota do turno vazia e já com outra à frente; a
   peça equipada sem treino com uma penalidade e com duas; o consumível
   usado em paz e no meio da luta (o primeiro termo do recibo cai: é o
   ícone); o mapa que não abre nada, que abre um lugar e dois; a compra e a
   venda de cada preço; a pechincha que baixa e a que não. */
export function mercadoDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    item: { nome: ["Cota de Malha", "Escudo Torre"][(i >> 1) % 2] },
    av: { ficha: { rotulo: ["armadura pesada", "escudo"][i % 2] }, penalidades: [[{ texto: "desvantagem em Furtividade" }], [{ texto: "-2 no ataque" }, { texto: "sem magia" }]][(i >> 2) % 2] },
    cons: { nome: ["Poção de Cura", "Elixir de Mana"][i % 2] },
    r: { texto: ["🧪 recuperei 8 PV", "✨ recuperei 5 PM", "ele baixou o preço para ◉ 9", "ele não cedeu um cobre"][i % 4] },
    comb: [null, { rodada: 2 }][(i >> 1) % 2],
    it: { nome: ["Botas de couro", "Lanterna"][i % 2], regiao: ["Vale do Sal", "Serra Funda"][(i >> 1) % 2], preco: 5 + (i % 30) },
    m: { nome: ["Bram", "Ondine, a cartógrafa"][(i >> 2) % 2] },
    dsc: { novas: [[], ["Vau"], ["Vau", "Porto Sal"]][i % 3] },
    nomeItem: ["Adaga velha", "Anel de cobre"][i % 2], valor: 1 + (i % 17),
  };
}

/* O DOMÍNIO: a nota do turno vazia e já com outra à frente; o bando de um
   membro e de três; o decreto cumprido sem baixas, com baixas e mortos, e
   o de mandar matar (a represália) e o de outro tipo; a cidade de cada
   nome, a obra de cada prazo, a reivindicação e o tratado de cada pacto. */
export function dominioDoCaso(i) {
  const membros = [[{ nome: "Brann" }], [{ nome: "Brann" }, { nome: "Kael" }, { nome: "Sef" }]][(i >> 1) % 2];
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    d: { alvo: ["o Corvo", "a ponte do Vau", "Mestre Ulm"][i % 3], descricao: ["Tragam a cabeça do Corvo.", "Limpem a ponte."][(i >> 2) % 2], recompensa: 20 + (i % 50), tipo: ["cabeca", "limpar", "escoltar"][(i >> 1) % 3] },
    grupo: { bando: ["Companhia do Sal", "Garra Cinza"][i % 2], membros, forca: 3 + (i % 9) },
    baixas: (i >> 2) % 3 === 1, mortos: [[], ["Kael"], ["Kael", "Sef"]][(i >> 2) % 3],
    nome: ["Vau", "Porto Sal", "Corvo"][(i >> 1) % 3], pronta: { nome: ["o celeiro", "a muralha"][i % 2] }, rev: { prazo: 3 + (i % 6) },
    imp: { nome: ["pesado", "brando"][i % 2] }, o: { nome: ["a forja", "o templo"][i % 2], o: ["+1 de ofício", "+5% de fé"][(i >> 1) % 2], dias: 4 + (i % 11) },
    quem: ["Iris", "Bruna"][(i >> 1) % 2], casa: { nome: ["Casa do Sal", "Casa Funda"][i % 2] }, chk: { cidade: { nome: ["Agulha", "Torre Funda"][(i >> 1) % 2] }, dias: 2 + (i % 8) },
    p: { nome: ["o Reino de Sal", "a Liga do Norte"][i % 2] }, rot: ["um pacto de comércio", "uma aliança de guerra"][(i >> 1) % 2],
  };
}

/* O TEMPO E A NOITE: o clima que não virou e o que virou, de cada rótulo;
   o sonho sem condição, o que deixa inspirado e o que deixa perturbado; a
   jornada que segue e nenhuma, e a masmorra que cala o acordo. */
export function tempoDoCaso(i) {
  return {
    sonhoMsg: "",
    climaNovo: [null, { rotulo: "chuva fina", nota: "as estradas viram lama" }, { rotulo: "neblina", nota: "não se vê a dez passos" }][i % 3],
    sn: { texto: ["Um corvo fala o teu nome.", "A casa da infância arde."][(i >> 2) % 2], efeito: [undefined, "inspirado", "perturbado"][(i >> 1) % 3] },
    jornadaRef: { current: (i >> 2) % 2 ? { destino: "Agulha de Sal" } : null }, acordoCala: i % 5 === 3,
  };
}

/* A FÉ E AS CASAS: a nota do turno vazia e já com outra à frente; a casa
   cujo nome abre por «A » e a que não; o posto, o mestre e o ofício de cada
   casa; a cidade cuja fé subiu e a que recuou; o templo de cada nome e
   custo; a ascensão de cada grau, com e sem domínio e patrono. */
export function feDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    nova: { nome: ["A Mão Cinzenta", "Casa do Sal", "Ordem da Ponte"][i % 3], mestre: ["Mestra Ulma", "Velho Brann"][(i >> 1) % 2], oficio: ["ferro", "letras"][(i >> 2) % 2], sede: ["Vau", "Porto Sal"][(i >> 1) % 2], postos: ["Aprendiz", "Juramentado"] },
    postoDaCasa: (g, n) => g.postos[n],
    oficioDaCasa: (id) => ({ o: { ferro: "ferreiros", letras: "escribas" }[id] }),
    m: { cidade: ["Vau", "Agulha"][i % 2], de: { rotulo: ["indiferente", "devota"][(i >> 1) % 2] }, para: { rotulo: ["devota", "fervorosa"][(i >> 2) % 2], recepcao: ["abre as portas", "ajoelha à passagem"][(i >> 1) % 2] }, fe: 10 + (i % 80), subiu: (i >> 1) % 3 !== 0 },
    templo: { nome: ["Santuário", "Grande Templo"][i % 2] }, nomeCidade: ["Vau", "Torre Funda"][(i >> 1) % 2], custo: 100 + 7 * (i % 30), fe: 5 + (i % 90),
    depois: i % 5, tituloDe: divindades.tituloDe, dv: { fieis: 3 * i, pf: i % 17, dominio: [null, "a tempestade", ""][(i >> 1) % 3], patrono: [null, "Ondra"][(i >> 2) % 2] },
  };
}

/* O CAMINHO: a nota do turno vazia e já com outra à frente; a saída de
   cada lugar (com artigo, sem e nenhum) e a cidade de cada nome; o
   deslocamento dentro do mesmo lugar e de um para outro, sem ninguém ao
   lado, com um e com dois; a chegada de cada prazo e destino. */
export function caminhoDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    comDe: lugar.comDe, de: ["a Forja", "o moinho velho", "Casa do Sal", ""][(i >> 1) % 4], alvo: { nome: ["Vau", "Agulha de Sal"][(i >> 2) % 2] },
    nomeDe: ["a praça", "o beco"][(i >> 1) % 2], nomePara: ["a praça", "a ponte"][(i >> 2) % 2],
    colados: [[], [{ nome: "o Corvo" }], [{ nome: "o Corvo" }, { nome: "Greta" }]][i % 3],
    dias: [0.5, 1, 3.5, 12][(i >> 1) % 4], j: { para: ["Vau", "Torre Funda"][i % 2] },
  };
}

/* A MASMORRA, o que faltava: a entrada com e sem o vestido e o veredito à
   frente, de cada tamanho de planta e de tochas, perto de uma cidade e de
   nenhuma, com e sem o tempo extra; a armadilha que se sofreu, com a
   salvaguarda que passou, que falhou e nenhuma, com e sem o depois. */
export function masmorraNovaDoCaso(i) {
  const salas = Array.from({ length: 3 + (i % 6) }, (_, n) => ({ camada: n % (1 + ((i >> 1) % 4)) }));
  return {
    vestido: ["", "[VESTIDO] Visto a cota de malha."][(i >> 1) % 2],
    dif: [null, { patamar: { aoMestre: "a oposição parece maior que o grupo" } }][(i >> 2) % 2],
    envelopeDaDificuldade: (d, oQue) => (d ? "[DIFICULDADE] " + oQue + ": " + d.patamar.aoMestre : ""),
    mm: { nome: ["Cripta do Corvo", "Poço das Celas"][i % 2], salas, tochas: i % 7 },
    cidadeAtualRef: { current: [null, "Vau", "Agulha"][i % 3] }, extraTempo: i % 4 ? " [+1 tocha]" : "",
    envelopeDaSalvaguarda: (sv, o) => "[SALVAGUARDA " + (sv ? (sv.passou ? "passou" : "falhou") : "nenhuma") + "] " + o.oQue + " · " + o.meia + " · " + o.danoCheio + "/" + o.danoFinal,
    sv: [null, { passou: true }, { passou: false }][i % 3], sala: { nomeArmadilha: ["Fosso de Estacas", "Agulha Envenenada"][(i >> 1) % 2] },
    fonte: { meia: (i >> 2) % 2 === 1 }, cheio: 4 + (i % 9), rArm: { dano: 1 + (i % 5) },
    pos: ["Cripta do Corvo · camada 1 · 2/5 salas", "Poço das Celas · camada 0 · 1/4 salas NO ESCURO"][(i >> 1) % 2], depois: i % 2 ? " [DEPOIS]" : "", p2: { nome: "Vera" },
  };
}

/* A GENTE E A HISTÓRIA: a nota do turno vazia e já com outra à frente;
   quem foi embora; a missão de cada título e motivo; a relação formal de
   cada rótulo, com o cônjuge e sem; o env da perícia de cada jeito e a
   relação que ele deixou; o arco de cada nome e a direção da 1.ª etapa. */
export function genteDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    quem: ["Corvo", "Greta da Ponte"][(i >> 1) % 2],
    f: { missao: { titulo: ["Resgatar a filha do moleiro", "O selo de Vau"][i % 2] }, motivo: ["o prazo venceu", "o refém morreu"][(i >> 1) % 2] },
    nome: ["Iris", "Bruna Voss"][(i >> 2) % 2], relacao: ["aliado", "conjuge", "rival"][i % 3], rotulo: ["Aliada", "Cônjuge", "Rival"][i % 3],
    env: ["[PERÍCIA — RESOLVIDA PELO SISTEMA] Intimidação 17.", "[PERÍCIA — RESOLVIDA PELO SISTEMA] Enganação falhou."][(i >> 1) % 2],
    des: { pessoa: { nome: ["Iris", "o taberneiro"][i % 2] } }, depois: ["inimigo", "desconfiado", "aliado"][(i >> 2) % 3],
    relacaoNPC: (r) => ({ rotulo: { inimigo: "Inimigo", desconfiado: "Desconfiado", aliado: "Aliado" }[r] }),
    est: { nome: ["A Jornada do Herói", "Os Cinco Atos"][i % 2], etapas: [{ instrucao: ["Comece pelo chamado.", "Abra com a perda."][(i >> 1) % 2] }] },
  };
}

/* O TURNO DO JOGADOR: a frase de cada jeito (com aspas dentro); a ficha
   viva e nenhuma; a nota do turno vazia e já com outra; o teste de cada
   atributo (e de nenhum: a sorte), com e sem o refazer à frente, com
   vantagem, desvantagem, as duas e nenhuma, com e sem os buffs, com e
   sem dificuldade, de cada resultado. */
export function vezDoCaso(i) {
  const valor = 1 + (i % 20), mod = i % 5;
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    acao: ["Quem está mais perto de mim?", "o \"chefe\" ainda respira?", "dormir até o sol nascer"][i % 3],
    fichaViva: () => ((i >> 1) % 3 ? { nome: "Vera viva" } : null), personagem: { nome: "Vera do render" },
    personagemRef: { current: (i >> 2) % 2 ? { nome: "Vera do ref" } : null },
    preRefazer: ["", "[SEGUNDO FÔLEGO] refiz o dado.\n"][(i >> 1) % 2],
    r: { atributo: [undefined, "Força", "Percepção"][i % 3], motivo: ["arrombar a porta", "ler os vestígios"][(i >> 1) % 2], vantagem: (i >> 2) % 3 === 1 || (i >> 4) % 3 === 2, desvantagem: (i >> 2) % 3 === 2 || (i >> 3) % 4 === 3 },
    valor, mod, notaBuff: ["", " (+2 de Bênção)"][(i >> 3) % 2], total: valor + mod,
    dc: [null, 12, 15][(i >> 1) % 3], resultado: ["sucesso", "falha", "sucesso crítico"][i % 3],
  };
}

/* AS MAGIAS DE FUNÇÃO: a nota do turno vazia e já com outra; o nome da
   magia de cada feitio (com acento, que a maiúscula tem de levar); o
   companheiro que volta; a cura de cada tamanho; a linha que a condição
   desfeita deixou; a frase do jogador (com aspas dentro); a magia ativa
   por cada número de turnos, com descrição e sem. */
export function funcaoDoCaso(i) {
  return {
    notaRef: { current: ["", "[NOTA] já havia"][i % 2] },
    m: { nome: ["Reviver", "Restauração Menor", "Luz"][i % 3], descricao: ["O corpo flutua acima do chão.", "Uma luz fria acompanha a mão.", ""][(i >> 1) % 3] },
    alvo: { nome: ["Corvo", "Sarna"][(i >> 1) % 2] },
    cura: 3 + (i % 9),
    r: { linha: ["O veneno saiu do meu corpo.", "Sarna já não está cega."][(i >> 2) % 2] },
    acao: ["toco a ferida", "conjuro sobre o \"chefe\""][(i >> 1) % 2],
    turnos: 2 + (i % 5),
    pers: { nome: ["Vera do pers", "Vera paga"][(i >> 2) % 2] },
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
const h8 = (x) => createHash("sha256").update(String(x)).digest("hex").slice(0, 8);
const seguro = (args) => { try { return JSON.stringify(args); } catch { return "[circular]"; } };
/* as peças do App que ficaram: cada uma devolve uma etiqueta dos argumentos,
   ou "" quando o bit dela está aceso no caso */
const PECAS = [
  "resumoCondicoesPrompt", "infoNemesis", "resumoMercadoPrompt", "resumoGrupoPrompt", "resumoReacoesPrompt",
  "resumoGridPrompt", "resumoDeslocamentoPrompt", "resumoCombosPrompt", "resumoRitoPrompt", "resumoLugarPrompt",
  "saidasDeUmPassoPrompt", "resumoArredoresPrompt", "resumoCelulaPrompt", "resumoViagemPrompt", "resumoComodosPrompt",
  "resumoDaqui", "chefesDoFio", "resumoCenaPrompt", "resumoProficienciaPrompt", "resumoPericiasPrompt",
  "resumoHeroismoPrompt", "resumoDescansoPrompt", "resumoRelogiosPrompt", "resumoMagiasPrompt", "resumoSintoniaPrompt",
  "resumoLegadoPrompt", "resumoMissoesPrompt", "resumoGrimorioPrompt", "resumoDadivasPrompt", "resumoTracosPrompt",
  "resumoInvocacoesPrompt", "envelopeDoQueFicou", "resumoAscensao", "envelopeDaRetomada", "revelacaoDe", "envelopeDaChave", "provocacaoDoRival",
];
export function dublesDosEnvelopes(k, { novo, bloco }) {
  const log = { chamadas: [], calados: [], faltas: [] };
  const enviados = [];
  const peca = (nome, n) => (...args) => {
    log.chamadas.push(nome);
    if (nome === "resumoAscensao" && k.ascensaoVazia) return "";
    if (nome !== "resumoAscensao" && (k.vazios >>> (n % 32)) & 1) return "";
    return `<${nome} ${h8(seguro(args))}>`;
  };
  const S = {
    ...osModulos({ novo }),
    caso: k,
    calou: (onde, e) => log.calados.push([onde, String(e && e.message)]),
    /* os refs */
    diaRef: ref(k.dia), minutoRef: ref(k.minuto), divindadeRef: ref(copia(k.divindade)),
    personagemRef: ref(k.refVazio ? null : copia(k.persAtual || k.personagem)), personagem: copia(k.personagem), persAtual: copia(k.persAtual),
    masmorraRef: ref(copia(k.masmorra)), combateRef: ref(copia(k.combate)), lugarRef: ref(copia(k.lugar)),
    cidadeAtualRef: ref(k.cidade), mapaRef: ref({ cidades: copia(CIDADES) }), jornadaRef: ref(copia(k.jornada)),
    baseMundoRef: ref({ base: k.i % 3 }), sinaisDoTurnoRef: ref(copia(k.sinais)), relevanciaRef: ref(k.i % 4 ? { peso: k.i % 4 } : null),
    mensagensRef: ref(copia(k.mensagens)), npcsRef: ref({ Iris: { nome: "Iris" }, Bruna: { nome: "Bruna" } }),
    confidenciasRef: ref([]), elencoSaveRef: ref({ vistos: ["Iris"] }), missoesRef: ref(copia(k.missoes)),
    relogiosRef: ref([{ nome: "a cheia", n: k.i % 4 }]), chaoRef: ref([{ nome: "adaga", x: 1, y: 1 }]),
    mercadoAqui: { banca: k.i % 3 }, npcsDoTurno: k.i % 2 ? "PESSOAS CONHECIDAS: Iris" : null, pauta: k.pauta,
    /* o rodapé de antes lia a estação de um const do enviar, uma linha acima do recorte */
    estR: calendario.estacaoDe(k.dia),
    /* as portas do App que não são texto */
    localAtualTxt: () => { log.chamadas.push("localAtualTxt"); return `em ${k.lugar ? k.lugar.nome : "a rua"}, ${k.cidade || "lugar nenhum"}`; },
    quemMeVe: (p, o) => { log.chamadas.push("quemMeVe"); return k.i % 2 ? { viu: h8(seguro([p, o])) } : null; },
    luzDaLutaAgora: () => "penumbra",
    celulaAqui: () => ({ celula: k.i % 4 }),
    cidadeSobOsPes: () => k.cidade,
    locaisDaCidade: () => [{ nome: "A Forja" }, { nome: "A Espada Faiscante" }],
    comodosDoLocal: (sem, dono) => [{ nome: "sótão de " + dono.nome }],
    semNome: (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(),
    pausarViagem: (j, txt) => ({ ...j, pausa: txt }),
    trechoAtual: (j) => j.trecho || null,
    pertoDaqui: (c, heroi, raio) => ({ c, heroi, raio }),
    dobraMovimento: (p) => !!(p.nivel % 2),
    ranksDoPersonagem: (p) => ({ r: p.nivel || 0 }),
    atributoEfetivo: () => 1,
    sementeMundo: () => "sem-" + (k.i % 5), generoMundo: () => "Fantasia medieval", moldeMundo: () => ({ id: "molde" }),
    mundoAtual: () => (k.i % 3 ? { lexico: { a: 1 } } : null),
    ondeSeProcura: () => { if (k.ondeEstoura) throw new Error("onde estourou"); return { onde: "praça" }; },
    linhasJaDitas: (t) => [String(t).length],
    nomesDoElenco: () => ["Iris"],
  };
  PECAS.forEach((n, j) => { S[n] = peca(n, j); });
  if (bloco && bloco !== "rodape") {
    const g = GRUPO(bloco);
    if (g === "masmorra") Object.assign(S, masmorraDoCaso(k.i), { personagem: { nome: "Vera do render" }, personagemRef: ref(k.refVazio ? null : { nome: "Vera do ref" }) });
    else if (g === "correio") Object.assign(S, correioDoCaso(k.i), { personagem: { nome: "Vera do render" } });
    else if (g === "acampamento") Object.assign(S, acampamentoDoCaso(k.i), { personagem: { nome: "Vera do render" }, fecharANoite: (manha, txt) => { enviados.push([txt, seguro(manha)]); } });
    else if (g === "abertura") Object.assign(S, aberturaDoCaso(k.i));
    else if (g === "ficha") Object.assign(S, fichaDoCaso(k.i));
    else if (g === "fio") Object.assign(S, fioDoCaso(k.i), { personagem: { nome: "Vera do render" } });
    else if (g === "viagem") Object.assign(S, viagemDoCaso(k.i), { personagem: { nome: "Vera do render" } });
    else if (g === "mundo") Object.assign(S, mundoDoCaso(k.i));
    else if (g === "poderes") Object.assign(S, poderesDoCaso(k.i));
    else if (g === "mercado") Object.assign(S, mercadoDoCaso(k.i));
    else if (g === "dominio") Object.assign(S, dominioDoCaso(k.i));
    else if (g === "tempo") Object.assign(S, tempoDoCaso(k.i));
    else if (g === "fe") Object.assign(S, feDoCaso(k.i));
    else if (g === "caminho") Object.assign(S, caminhoDoCaso(k.i));
    else if (g === "masmorraNova") Object.assign(S, masmorraNovaDoCaso(k.i));
    else if (g === "gente") Object.assign(S, genteDoCaso(k.i));
    else if (g === "vez") Object.assign(S, vezDoCaso(k.i));
    else if (g === "funcao") Object.assign(S, funcaoDoCaso(k.i));
    else throw new Error("bloco sem grupo: " + bloco);
    S.enviados = enviados;
    S.enviar = (txt, p) => { enviados.push([txt, p && p.nome]); };
  }
  const escopo = new Proxy(S, {
    has: (t, nome) => {
      if (typeof nome !== "string") return false;
      if (nome in t) return true;
      if (nome in globalThis) return false;
      log.faltas.push(nome);
      return true;
    },
    get: (t, nome) => {
      if (nome === Symbol.unscopables) return undefined;
      if (nome in t) return t[nome];
      throw new ReferenceError("falta o dublê: " + String(nome));
    },
    set: (t, nome, v) => { t[nome] = v; return true; },
  });
  return { S, escopo, log };
}

/* `troca` põe uma peça no lugar de outra (a mordida que estraga o motor) */
export function correrOBloco(fazer, k, { novo, troca, bloco } = {}) {
  const { S, escopo, log } = dublesDosEnvelopes(k, { novo, bloco });
  if (troca) Object.assign(S, troca);
  let texto = null, erro = null;
  try { texto = fazer(escopo)(); } catch (e) { erro = String(e && e.message); }
  return { texto, erro, log };
}

/* A FOTO: o texto à letra, as chamadas em ordem, o que calou */
export function fotoDoEnvelope(f) {
  return {
    texto: f.texto, erro: f.erro, calados: f.log.calados, faltas: [...new Set(f.log.faltas)],
    chamadas: createHash("sha256").update(f.log.chamadas.join("|")).digest("hex").slice(0, 16),
  };
}
/* O QUE O DOURADO GUARDA (desde a abertura, 28/10/2026): com 62 sítios de
   275 casos o texto inteiro levava o arquivo a ~7 MB. A prova é o texto
   byte a byte, e um hash dele prova o mesmo: o dourado guarda por caso o
   sha256 (os 32 primeiros hex) e o comprimento do texto — o mesmo
   comprimento que a régua do teto do prompt mede —, mais o resto da foto
   (o erro, o que calou, as faltas, as chamadas). O texto inteiro só nos
   AMOSTRA primeiros casos de cada sítio: é diagnóstico (ver onde diverge),
   não prova. As duas pontas passam pela mesma `fotoGuardada`, logo a
   comparação é a mesma que era, e uma mordida muda os mesmos casos. */
export const AMOSTRA = 3;
export const tamDoTexto = (texto) => JSON.stringify(texto || "").length;
export const hashDoTexto = (texto) => createHash("sha256").update(JSON.stringify(texto === undefined ? null : texto)).digest("hex").slice(0, 32);
export function fotoGuardada(f, i) {
  const { texto, ...resto } = f;
  return { h: hashDoTexto(texto), n: tamDoTexto(texto), ...resto, ...(i < AMOSTRA ? { texto } : {}) };
}
/* O DOURADO EM DICIONÁRIO (29/10/2026): com 106 sítios o arquivo chegou a
   3,5 MB, e 9 décimos dele eram repetição — os nomes dos campos em cada um
   dos 29 mil casos, e a mesma foto em muitos casos (eram 3.621 fotos
   distintas, 146 sequências de chamadas). O dourado guarda agora, por sítio,
   as fotos distintas (sem o texto), o índice de cada caso nelas, e o texto da
   amostra à parte. Nada se perde: `douradoLido` devolve, caso a caso, a MESMA
   foto que `fotoGuardada` dava (os mesmos campos, na mesma ordem, o hash
   inteiro), e o gerador recusa escrever se a volta não for a ida. */
export function douradoGuardado(fotos) {
  const fotosDistintas = [], indice = new Map();
  const caso = fotos.map((f) => {
    const { texto, ...semTexto } = f;
    const chave = JSON.stringify(semTexto);
    if (!indice.has(chave)) { indice.set(chave, fotosDistintas.length); fotosDistintas.push(semTexto); }
    return indice.get(chave);
  });
  return { fotos: fotosDistintas, caso, amostra: fotos.slice(0, AMOSTRA).map((f) => f.texto) };
}
export const douradoLido = (g) => g.caso.map((j, i) => ({ ...g.fotos[j], ...(i < AMOSTRA ? { texto: g.amostra[i] } : {}) }));
export const casosDosEnvelopes = (n) => Array.from({ length: n }, (_, i) => casoDosEnvelopes(i));
