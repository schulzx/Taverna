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
  motorEnvelopes: ["oRodapeDoTurno", "aFormaDaqui", "SO_ISSO", "oEnvelopeDaMasmorra", "oEnvelopeDoCorreio", "oEnvelopeDoAcampamento", "oEnvelopeDaAbertura", "oEnvelopeDaViagem", "oEnvelopeDoFio", "oEnvelopeDaFicha"],
};
const MODULOS = { calendario, geografia, semCidade, prompt, chao, decretos, subtramas, arquivo, lugar, motorEnvelopes };
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
  "fichaCombate", "fichaSucesso", "fichaVolta", "fichaRecrutamento"];
/* o grupo de cada bloco: é ele que diz que dados o caso dá ao sítio */
const GRUPO = (b) => (b === "rodape" ? "rodape" : /^masmorra/.test(b) ? "masmorra" : /^correio/.test(b) ? "correio" : /^(acamp|fogo|coracao)/.test(b) ? "acampamento" : /^abertura/.test(b) ? "abertura" : /^viagem/.test(b) ? "viagem" : /^fio/.test(b) ? "fio" : /^ficha/.test(b) ? "ficha" : null);
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
};
const DEVOLVE = { rodape: "rodape", aberturaCampanha: "abrirACampanha(pers)", viagemTrecho: "textoDaViagem",
  fioMarco: "notaRef.current", fioRumores: "notaRef.current", fioMundo: "notaRef.current", fioVirada: "notaRef.current", fioInterludio: "p",
  fichaNivel: "notaRef.current", fichaPericias: "notaRef.current", fichaAtributo: "notaRef.current", fichaHabilidade: "notaRef.current", fichaSubclasse: "notaRef.current", fichaEspecializacao: "notaRef.current", fichaRefazer: "notaRef.current", fichaRecrutamento: "notaDoRecrutamento(comp)" };
export function recorteDosEnvelopes(app, { novo, so } = {}) {
  const corte = corteDe(app);
  const r = {};
  for (const b of so ? [so] : BLOCOS) {
    const A = ANCORAS[b];
    const fora = !novo && A.antesDe ? corte(...A.antesDe) + "\n" : "";
    r[b] = { orgaos: fora + corte(...(novo ? A.hoje : A.antes)), devolve: DEVOLVE[b] || "enviados" };
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
   ouro, da 1.ª à 4.ª vez; o companheiro recrutado de cada nível e PV. */
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
export const casosDosEnvelopes = (n) => Array.from({ length: n }, (_, i) => casoDosEnvelopes(i));
