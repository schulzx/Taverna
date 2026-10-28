/* combate-bloco.mjs (Fase T1-A, 6.ª fatia, 28/10/2026) — o bloco do combate inteiro, corrido em Node

   Não é suíte: é a ferramenta que as duas pontas da prova do bloco usam.

   - `gerar-combate-dourado.mjs` recorta do App de ANTES (7338870, o último
     em que o bloco e todos os órgãos que ele chama moravam inteiros no
     componente) o bloco do combate do `aplicarResposta` e os quinze órgãos,
     e corre-os sobre os casos de `casoDoBloco`.
   - `teste-motor-luta.mjs` recorta do App de HOJE a fiação que ficou — as
     portas da luta, a chamada a `aLutaDaResposta`, os invólucros de cada
     órgão — e corre-a, com as peças puras do motor, sobre os mesmos casos.

   As duas pontas leem e escrevem os MESMOS dublês (`dublesDoBloco`): refs
   como objetos simples, e os órgãos do App que não são do bloco nem têm
   peça pura (a queda da nêmesis, o relógio, as conquistas, a sessão, o
   save, a presença adiada) como dublês declarados que tocam nos refs —
   para que uma porta chamada fora de ordem, ou um ref lido antes da hora,
   mude a foto. A foto é tudo o que ficou nos refs e tudo o que foi
   publicado, na ordem. */
import { createHash } from "node:crypto";
import { casoDoCombate, sorteDoCaso, AGORA_DA_PROVA } from "./combate-casos.mjs";
import { semearACasa } from "../src/semente.js";
import { moldePorId, MOLDE_PADRAO } from "../src/moldes.js";
/* os módulos que o bloco e os órgãos leem, de um lado e do outro */
import * as regrasJogo from "../src/regras-jogo.js";
import * as emboscada from "../src/emboscada.js";
import * as mundoBase from "../src/mundo-base.js";
import * as leiDaForma from "../src/lei-da-forma.js";
import * as presenca from "../src/presenca-divina.js";
import * as divindades from "../src/divindades.js";
import * as combateMod from "../src/combate.js";
import * as profissoes from "../src/profissoes.js";
import * as loot from "../src/loot.js";
import * as chao from "../src/chao.js";
import * as pocoes from "../src/pocoes.js";
import * as craft from "../src/craft.js";
import * as ascensao from "../src/ascensao.js";
import * as calendario from "../src/calendario.js";
import * as bestiario from "../src/bestiario.js";
import * as gatilhos from "../src/gatilhos.js";
import * as tracos from "../src/tracos.js";
import * as orcamento from "../src/orcamento.js";
import * as dadivas from "../src/dadivas.js";
import * as grid from "../src/grid.js";
import * as semente from "../src/semente.js";
import * as habilidades from "../src/habilidades.js";
import * as unicas from "../src/unicas.js";
import * as fama from "../src/fama.js";
import * as masmorras from "../src/masmorras.js";
import * as ermos from "../src/ermos.js";
import * as crime from "../src/crime.js";
import * as vilao from "../src/vilao.js";
import * as nomes from "../src/nomes.js";
import * as gestao from "../src/gestao.js";
import * as saga from "../src/saga.js";
import * as vinculos from "../src/vinculos.js";
import * as reciboDaLuta from "../src/recibo-da-luta.js";
import * as invocacoes from "../src/invocacoes.js";
import * as motorCombate from "../src/motor/combate-do-turno.js";
import * as motorLuta from "../src/motor/luta-do-turno.js";
import * as motorAplicar from "../src/motor/aplicar.js";

/* Os nomes que o código recortado lê dos módulos, um a um (nunca um
   módulo inteiro: dois módulos podem exportar o mesmo nome com sentidos
   diferentes, e o App escolhe qual importa). */
const NOMES = {
  regrasJogo: ["processarCombate", "aplicarNivel", "evoluirCompanheiro", "atributoEfetivo"],
  emboscada: ["conferirLista", "envelopeDaListaAparada", "envelopeDaLutaImpossivel"],
  mundoBase: ["chefePorNome", "criaturaPorNome", "concluirLugar"],
  leiDaForma: ["guardiaoPorNome"],
  presenca: ["reconciliarGraus", "resolverPresenca"],
  divindades: ["grauDe", "tituloDe"],
  combateMod: ["gerarEspolios", "rolarIniciativa", "resumoIniciativa", "novosRecursos", "acoesBonusDe"],
  profissoes: ["moedasDeEspolio", "despojosExtras"],
  loot: ["essenciaDeEspolio", "gerarEspolioItem", "essenciaDoChefe", "RARIDADE_ROTULO"],
  chao: ["achadoDeEquipamento", "achadoDeConsumivel", "achadoDeComponente", "resumoDoChao", "porNoChao"],
  pocoes: ["sortearConsumivel", "itemConsumivel"],
  craft: ["despojosDe", "itemComponente"],
  ascensao: ["identificarDivindadeAbatida", "podeAbrirRito", "iniciarRito", "provaAtual"],
  calendario: ["MINUTOS_POS_COMBATE"],
  bestiario: ["completarInimigo"],
  gatilhos: ["devolverSegura"],
  tracos: ["abrirCombateTracos", "iniciativaDeTraco"],
  orcamento: ["avaliarEncontro", "gastarDoDia", "selo", "resumoOrcamentoPrompt"],
  dadivas: ["iniciativaDeItem"],
  grid: ["mapaEmTexto", "ladoDe", "tamanhoDe", "alcanceNatural", "montarGrade", "posicionar"],
  semente: ["rng", "hashSemente"],
  habilidades: ["acoesPorRodada", "estaEmForma", "desfazerForma", "baixarGuardas", "baixarPressa"],
  unicas: ["gerarHabilidadeUnica", "chanceUnica"],
  fama: ["patamarFama", "calcularFama"],
  masmorras: ["recompensaChefe", "desfechoDaLuta"],
  ermos: ["garantirSuprimentos"],
  crime: ["agravarParaMorte"],
  vilao: ["gerarVilao", "resumoVilaoPrompt"],
  nomes: ["nomePessoa"],
  gestao: ["dominiosDe"],
  saga: ["vilaoDoFio"],
  vinculos: ["ganharVinculo"],
  reciboDaLuta: ["caidosDaLuta"],
  invocacoes: ["dispensarTodas"],
  motorCombate: ["despertarUnica", "aFamaDoFeito", "concluirAMasmorra", "aMorteDoAlvo", "surgirANemesis", "abrirOCombate", "economiaNova", "temAcaoBonus", "somarAoContador", "osVinculos", "notarOFecho", "limparAsConjuracoes", "oRitoDoDeicidio"],
  motorLuta: ["aLutaDaResposta"],
  motorAplicar: ["notaComOTurno"],
};
const MODULOS = { regrasJogo, emboscada, mundoBase, leiDaForma, presenca, divindades, combateMod, profissoes, loot, chao, pocoes, craft, ascensao, calendario, bestiario, gatilhos, tracos, orcamento, dadivas, grid, semente, habilidades, unicas, fama, masmorras, ermos, crime, vilao, nomes, gestao, saga, vinculos, reciboDaLuta, invocacoes, motorCombate, motorLuta, motorAplicar };
function osModulos({ novo }) {
  const o = {};
  for (const [mod, lista] of Object.entries(NOMES)) {
    /* o lado de antes não conhece o motor de hoje: se o recorte o chamasse, estouraria */
    if (!novo && /^motor/.test(mod)) continue;
    for (const n of lista) {
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
/* os órgãos que o bloco chama, com o que eles chamam, nos dois Apps */
const ORGAOS_COMUNS = [
  ["  const famaAtual = () =>", "\n"],
  ["  const cenaDoChao = () =>", "\n"],
  ["  const idsDoChao = (c) =>", "\n"],
  ["  const bumpCont = (campo, n = 1) =>", "\n"],
  ["  const porNoChaoAqui = (novos) => {", "  /* ORÇAMENTO DO DIA (v9.19)"],
  ["  const notarFechoDaLuta = ({ combate: c = null, desfecho = null, caidos = null, linha = null } = {}) => {", "  /* Corre a cada `pushMsgs`, ANTES do carimbo:"],
  ["  const limparConjuracoesDaLuta = (persBase) => {", "  const porForma = (h, pers) => {"],
  ["  const talvezDespertarUnica = (p2, inimigosFinais, msgs) => {", "  /* REDE DE SEGURANÇA (v9.5.1)"],
  ["  const concluirMasmorraDoChefe = (p2, msgs) => {", "  /* ---------------- O CUSTO DE QUEM SAI"],
  ["  const abrirRitoAscensao = (alvo, nivelHeroi) => {", "  const encararProva = () => {"],
  ["  const resolverSalaAposCombate = () => {", "  const sairDaMasmorra = () => {"],
  ["  const aplicarVinculo = (grupo, nomeOuTodos, pontos, msgs) => {", "  const checarConquistas = useCallback("],
  ["  const checarFama = () => {", "  /* NÊMESIS (v6.8)"],
  ["  const tentarSurgirNemesis = () => {", "  /* Alguém morreu por decisão do sistema"],
  ["  const registrarMorteDeAlvo = (nome, causa, { aproximado = false } = {}) => {", "  /* ---------------- A MORTE DA NÊMESIS TEM UMA PORTA SÓ"],
];
/* o App de antes: o bloco inteiro, os órgãos e a porta de abrir com o
   equipamento e o tabuleiro, e o retrato do topo */
export function recorteDeAntes(app) {
  const corte = corteDe(app);
  const orgaos = [
    corte("function retratoComOsFinais(antes, finais) {", "\n}\n") + "\n}",
    corte("  const temAcaoBonus = (p) =>", "  /* v9.54: `acoesPorRodada`"),
    corte("  const economiaNova = (p) =>", "  /* ---------------- O PREÇO DE VESTIR"),
    corte("  const equiparCombate = (comb, pers, { situacao = \"cena\" } = {}) => {", "  /* ============================================================\n     A PORTA ÚNICA DE ABRIR COMBATE"),
    corte("  const abrirCombate = (inimigosCrus, { pers: persEntra = null, jaNoRef = false, situacao = \"cena\" } = {}) => {", "  /* O TABULEIRO NASCE DO LUGAR (v9.34)"),
    corte("  const montarGrid = (pers, inimigos, situacao = \"cena\") => {", "  /* Um passo dentro da MESMA região"),
    ...ORGAOS_COMUNS.map(([de, ate]) => corte(de, ate)),
  ];
  const bloco = corte("    if (resp.mudancas) {\n      const combateAntes = combateRef.current;", "    /* v9.49: aqui morava o cão de guarda");
  return { orgaos: orgaos.join("\n"), bloco };
}
/* o App de hoje: a fiação que ficou — as portas, a chamada, os invólucros */
export function recorteDeHoje(app) {
  const corte = corteDe(app);
  const orgaos = [
    corte("  const plantaDaLuta = () => {", "  /* Um passo dentro da MESMA região"),
    corte("  const aplicarEfeitoDaLuta = (ef) => {", "  const aplicarResposta = useCallback("),
    ...ORGAOS_COMUNS.map(([de, ate]) => corte(de, ate)),
  ];
  const bloco = corte("    if (resp.mudancas) {\n      try {\n        const daLuta = aLutaDaResposta(", "    /* v9.49: aqui morava o cão de guarda");
  return { orgaos: orgaos.join("\n"), bloco };
}
/* o recorte vira uma função (resp, pers, msgs) → { resp, pers }, com os dublês no escopo */
export function blocoComoFuncao({ orgaos, bloco }) {
  const corpo = `with (S) { return function (resp, pers, msgs) {\n${orgaos}\n${bloco}\nreturn { resp, pers };\n}; }`;
  return (S) => new Function("S", corpo)(S);
}

/* ---------------- OS CASOS DO BLOCO ----------------
   Cada caso parte de `casoDoCombate(i)` e ganha o que o bloco lê: a luta no
   ref (nenhuma, aberta sem ordem, aberta com ordem, com caídos), a resposta
   do Narrador (nada de luta, a lista que abre — às vezes grande, às vezes
   com um deus —, o dano que mata todos ou só um, o encerrar com e sem
   caídos, a remoção), o ócio e o golpe deste turno, a masmorra (o chefe,
   uma sala em curso), a nêmesis entre os que caem (e a que resiste), o
   deus abatido de quem despertou, e o que a vitória lê. */
const NOMES_DO_BESTIARIO = ["Lobo", "Goblin", "Ogro", "Bandido", "Esqueleto", "Slime", "Golem de Pedra"];
function luta(i, { comOrdem, caidos }) {
  const n = 1 + (i % 3);
  const inimigos = Array.from({ length: n }, (_, k) => ({
    nome: k === 0 && i % 7 === 3 ? "Sarna" : k === 1 && i % 6 === 1 ? "Avatar de Morr" : `${NOMES_DO_BESTIARIO[(i + k) % NOMES_DO_BESTIARIO.length]}${k ? " " + (k + 1) : ""}`,
    ameaca: ["comum", "elite", "fraco", "lendario", "competente"][(i + k * 2) % 5],
    vida: caidos === "todos" || (caidos === "um" && k === 0) ? 0 : 6 + ((i + k) % 9), vidaMax: 15, des: (i + k) % 4 - 1,
    derrotado: caidos === "todos" || (caidos === "um" && k === 0), ...(k === 0 && i % 4 === 0 ? { x: 2, y: 3 } : {}),
    gd: k === 1 && i % 6 === 1 ? 4 : 0,
  }));
  return { inimigos, rodada: 2 + (i % 3), economia: { acao: 0, extra: 0 }, ...(comOrdem ? { ordem: [{ nome: "Vera Cinza", lado: "heroi", iniciativa: 12 }], grade: { largura: 8, altura: 8 }, heroi: { x: 1, y: 1 } } : {}) };
}
export function casoDoBloco(i) {
  const k = casoDoCombate(i);
  const tipo = i % 11;
  const nomesIni = (q) => Array.from({ length: q }, (_, j) => ({ nome: j === 0 && i % 5 === 2 ? "Avatar de Morr" : `${NOMES_DO_BESTIARIO[(i + j) % NOMES_DO_BESTIARIO.length]}${j ? " " + (j + 1) : ""}`, ameaca: ["comum", "elite", "lendario"][(i + j) % 3], ...(j === 0 && i % 9 === 0 ? { gd: 3 } : {}) }));
  const combate = tipo === 0 || tipo === 1 || tipo === 8 ? null
    : tipo === 2 || tipo === 3 ? luta(i, { comOrdem: true, caidos: tipo === 2 ? "todos" : "um" })
    : tipo === 4 ? luta(i, { comOrdem: false, caidos: "nenhum" })
    : luta(i, { comOrdem: i % 2 === 0, caidos: tipo === 9 || tipo === 7 ? "nenhum" : i % 3 === 0 ? "um" : "nenhum" });
  const vivos = combate ? combate.inimigos.filter((e) => !e.derrotado) : [];
  const mudancas = [
    () => ({ moedas: 2 }),
    () => ({ combate_iniciar: nomesIni(i % 13 === 1 ? 9 : 1 + (i % 3)) }),
    () => ({ combate_encerrar: true }),
    () => ({ combate_encerrar: true }),
    () => ({ combate_iniciar: nomesIni(1) }),
    () => ({ combate_inimigo_vida: vivos.map((e) => ({ nome: e.nome, vida: -99 })) }),
    () => ({ combate_inimigo_vida: vivos.slice(0, 1).map((e) => ({ nome: e.nome, vida: -3 })) }),
    () => ({ combate_remover: vivos.slice(0, 1).map((e) => e.nome) }),
    () => ({ combate_iniciar: nomesIni(2), combate_encerrar: i % 2 === 0 }),
    () => ({}),
    () => ({ combate_encerrar: true }),
  ][tipo]();
  return {
    ...k,
    combateB: combate,
    mudancasB: mudancas,
    ociosoB: i % 3 === 0 ? 1 : 0,
    ataqueResolvidoB: i % 5 === 4,
    persB: {
      ...k.persA, moedas: (i * 13) % 300, xp: [0, 250, 880, 2600, 6400][i % 5], nivel: i % 6 === 1 ? 15 + (i % 5) : 1 + (i % 12),
      ...(i % 4 === 0 ? { forma: { id: "urso", nome: "Forma de Urso", ganho: 6, dano: 3 } } : {}),
      ...(i % 6 === 1 ? { profissao: "Caçador de Recompensas" } : i % 6 === 2 ? { profissao: "Curtidor" } : {}),
      grupo: [
        { nome: "Brás", vida: 9, vidaMax: 15, nivel: 1 + (i % 4), xp: [0, 200, 900][i % 3], vinculo: [10, 24, 49, 74][i % 4], marcos: [] },
        ...(i % 7 === 3 ? [{ nome: "Fera Chamada", invocada: true, vida: 4, vidaMax: 4 }] : []),
      ],
    },
    persNoRefB: i % 10 === 6 ? { ...k.persA, nome: "a ficha do ref", forma: { id: "lobo", nome: "Forma de Lobo", ganho: 4 }, grupo: [{ nome: "Fera Chamada", invocada: true }] } : { nome: "a ficha do ref", nivel: 1 + (i % 12), moedas: 5, grupo: [] },
    masmorraB: i % 8 === 2 ? { nome: "Cripta do Corvo", salas: [{ id: 1, tipo: "entrada" }, { id: 3, tipo: "chefe", moedas: 60 }], atual: 3, tochas: i % 3 }
      : i % 8 === 5 ? { nome: "Poço das Celas", salas: [{ id: 1, tipo: "entrada" }, { id: 2, tipo: "combate", chave: i % 2 === 0 }, { id: 3, tipo: "chefe", trancada: true }], atual: 2, tochas: 1 } : null,
    salaEmCursoB: i % 8 === 5 ? (i % 16 === 5 ? null : 2) : null,
    nemesisB: i % 7 === 3 ? { nome: "Sarna", titulo: "a Víbora", status: "ativa", odio: 30 } : i % 7 === 4 ? { nome: "Velho Inimigo", status: "derrotada" } : null,
    nemesisResisteB: i % 14 === 10,
    divindadeB: i % 6 === 1 ? { ehJogador: true, despertar: i % 12 !== 7, fieis: 1500, panteao: [{ nome: "Morr", gd: 4, dominio: "morte" }] } : null,
    baseB: { mortos: i % 5 === 0 ? ["Morvane"] : [], concluidas: [] },
    derrotadosB: i % 4 === 0 ? ["Lobo Velho"] : [],
    famaPatamarB: [0, 10, 25][i % 3],
    descobertasB: i % 3 === 0 ? [] : ["lobo", "Ogro"],
    diaLutaB: { gasto: (i % 4) * 0.5, lutas: i % 3 },
    minutoB: (i * 53) % 1440,
  };
}

/* ---------------- OS DUBLÊS ---------------- */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const ref = (v) => ({ current: v });
export function dublesDoBloco(k, { novo, sorte, extras }) {
  const log = { tela: [], combates: [], fichas: [], codex: [], nemesis: [], masmorras: [], bases: [], npcs: [], divindades: [], chaos: [], conquistas: [], sessoes: [], salvos: [], calados: [], presencas: [], agendas: [], quedas: [], relogios: [] };
  const S = {
    ...osModulos({ novo }),
    personagem: null, mundo: { genero: k.semente.split("|")[1] },
    combateRef: ref(copia(k.combateB)), notaRef: ref(k.notaAntes), descobRef: ref(copia(k.descobertasB)), divindadeRef: ref(copia(k.divindadeB)),
    mapaRef: ref(copia(k.mapaN)), masmorraRef: ref(copia(k.masmorraB)), salaEmCursoRef: ref(k.salaEmCursoB), combateOciosoRef: ref(k.ociosoB),
    ataqueResolvidoRef: ref(k.ataqueResolvidoB), intencaoRef: ref("investir"), impressionouRef: ref(2), derrotadosDaSessaoRef: ref(copia(k.derrotadosB)),
    nemesisRef: ref(copia(k.nemesisB)), npcsRef: ref(copia(k.npcsM)), leiRef: ref(copia(k.leiM)), contRef: ref(copia(k.contN)), diaRef: ref(1 + (k.i % 9)),
    personagemRef: ref(copia(k.persNoRefB)), espinhaRef: ref(copia(k.espinhaN)), chaoRef: ref(copia(k.chaoF)), lutaDoReciboRef: ref(copia(k.lutaDoReciboF)),
    fechoDaLutaRef: ref(copia(k.fechoDaLutaF)), retratoDoFimRef: ref(null), mensagensRef: ref(Array.from({ length: k.mensagensF }, () => ({}))), seguraRef: ref(null),
    baseMundoRef: ref(copia(k.baseB)), territorioEmLutaRef: ref(null), reacaoUsadaRef: ref(true), expiracoesSeguidasRef: ref(1), diaLutaRef: ref(copia(k.diaLutaB)),
    famaPatamarRef: ref(k.famaPatamarB), cidadeAtualRef: ref(k.cidadeM), lugarRef: ref(null), jornadaRef: ref(null), turnoDeRegistroRef: ref(k.turnoA), minutoRef: ref(k.minutoB),
    setCombate: (c) => log.combates.push(c), setPersonagem: (p) => log.fichas.push(p), setDescobertas: (d) => log.codex.push(d), setNemesis: (n) => log.nemesis.push(n),
    setMasmorra: (m) => log.masmorras.push(m), setBaseMundo: (b) => log.bases.push(b), setNpcs: (n) => log.npcs.push(n), setDivindade: (d) => log.divindades.push(d), setChao: (c) => log.chaos.push(c),
    pushMsgs: (xs) => log.tela.push(copia(xs)), calou: (onde) => log.calados.push(onde), salvar: (x) => log.salvos.push(copia(x)), talvezFecharSessao: (m) => log.sessoes.push(m),
    sorteDoTurno: sorte || sorteDoCaso(k),
    ...(extras || {}),
    sementeMundo: () => k.semente, generoMundo: () => k.semente.split("|")[1], moldeMundo: () => moldePorId(MOLDE_PADRAO), mundoAtual: () => ({ lexico: null, genero: k.semente.split("|")[1] }),
    cidadeDoMapa: (nome) => ((S.mapaRef.current || {}).cidades || []).find((c) => c.nome === nome) || null,
    fichaViva: () => S.personagemRef.current || S.personagem,
    localAtualTxt: () => "a praça",
    setTimeout: (f, ms) => log.agendas.push([f, ms]),
    presencaNaLuta: (c, p, o) => log.presencas.push(copia({ c, p, o })),
    /* AS CONQUISTAS: leem os contadores, a nêmesis e o códex no instante em que são chamadas */
    checarConquistas: () => log.conquistas.push(copia({ cont: S.contRef.current, nemesis: S.nemesisRef.current && S.nemesisRef.current.status, codex: (S.descobRef.current || []).length })),
    /* QUEM JÁ CAIU: o que mundoDasMissoes leria (a base e a sessão) */
    mundoDasMissoes: () => { if (k.derrotadosN === "estoura") throw new Error("mundoDasMissoes estourou"); return { derrotados: [...((S.baseMundoRef.current || {}).mortos || []), ...(S.derrotadosDaSessaoRef.current || [])] }; },
    /* A QUEDA DA NÊMESIS (dublê de encerrarNemesis): resiste quando o caso
       manda; senão cai, conta, chama as conquistas, diz na tela e na nota */
    encerrarNemesis: (causa) => {
      const n = S.nemesisRef.current;
      log.quedas.push(causa);
      if (!n || n.status === "derrotada") return false;
      if (k.nemesisResisteB) { S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[ELE ESCAPA] ${n.nome}`; return false; }
      S.nemesisRef.current = { ...n, status: "derrotada", odio: 0, mortaEm: S.diaRef.current, comoMorreu: causa || "" };
      log.nemesis.push(S.nemesisRef.current);
      S.contRef.current = { ...S.contRef.current, nemesisVencidas: (S.contRef.current.nemesisVencidas || 0) + 1 };
      S.checarConquistas();
      S.pushMsgs([{ autor: "sistema", texto: `☠ ${n.nome} caiu.` }]);
      S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[A QUEDA] ${n.nome}`;
      return true;
    },
    /* O RELÓGIO (dublê de avancarOsMinutos): anda os minutos; fora da luta, a
       primeira invocação da ficha do turno expira; escreve no ref se a ficha
       mudou, e chama as conquistas */
    avancarOsMinutos: (n, fichaDoTurno = null) => {
      log.relogios.push(n);
      S.minutoRef.current += n;
      let ficha = fichaDoTurno;
      if (!S.combateRef.current && ficha && (ficha.grupo || []).some((g) => g && g.invocada)) {
        const sai = ficha.grupo.find((g) => g && g.invocada);
        ficha = { ...ficha, grupo: ficha.grupo.filter((g) => g !== sai) };
        S.pushMsgs([{ autor: "sistema", texto: `✧ ${sai.nome} se desfaz.` }]);
        S.notaRef.current = `${S.notaRef.current ? S.notaRef.current + "\n" : ""}[INVOCAÇÃO ENCERRADA PELO SISTEMA] ${sai.nome}`;
      }
      if (ficha && ficha !== fichaDoTurno) { S.personagemRef.current = ficha; S.setPersonagem(ficha); }
      S.checarConquistas();
      return { texto: "", ficha: ficha || fichaDoTurno };
    },
  };
  return { S, log };
}

/* corre o bloco (de antes ou de hoje) sobre um caso, e fotografa */
export function correrOBloco(fazer, k, { novo, sorte, extras }) {
  const agora = Date.now;
  Date.now = () => AGORA_DA_PROVA;
  semearACasa(k.semente);
  const { S, log } = dublesDoBloco(k, { novo, sorte, extras });
  const msgs = [];
  let ret = null, erro = null;
  try { ret = fazer(S)({ narrativa: "…", mudancas: copia(k.mudancasB) }, copia(k.persB), msgs); } catch (e) { erro = String(e && e.message); }
  for (const [f] of log.agendas) f();
  Date.now = agora;
  const refs = {};
  for (const [nome, v] of Object.entries(S)) if (/Ref$/.test(nome) && v && typeof v === "object" && "current" in v) refs[nome] = v.current;
  return { ret, msgs, erro, refs, log: { ...log, agendas: log.agendas.map((a) => a[1]) } };
}

/* a foto compacta: o texto à vista e o resto pela impressão digital.
   O id do que cai no chão (chao.js) é o relógio parado mais um contador do
   MÓDULO, que anda de corrida em corrida dentro do mesmo processo: o id é
   um crachá, não uma regra, e a foto troca-o pela ordem em que aparece
   (o mesmo item, o mesmo número), para a prova não depender de quantas
   corridas vieram antes. */
const ID_DO_CHAO = new RegExp(`"ch${AGORA_DA_PROVA.toString(36)}[0-9a-z]+"`, "g");
function semIdsDoChao(texto) {
  const vistos = new Map();
  return texto.replace(ID_DO_CHAO, (id) => { if (!vistos.has(id)) vistos.set(id, `"chao#${vistos.size + 1}"`); return vistos.get(id); });
}
export function fotoDoBloco(foto0) {
  const foto = JSON.parse(semIdsDoChao(JSON.stringify(foto0)));
  return {
    msgs: foto.msgs, nota: foto.refs.notaRef, erro: foto.erro, calados: foto.log.calados, tela: foto.log.tela.length,
    tudo: createHash("sha256").update(JSON.stringify(foto)).digest("hex"),
  };
}
export const casosDoBloco = (n) => Array.from({ length: n }, (_, i) => casoDoBloco(i));

/* ---------------- A LUTA DE BOLSO ----------------
   Para as suítes que provavam uma linha do bloco lendo o texto do App: o
   bloco saiu para o motor, e o motor não se lê como texto (a catraca de
   teste-assercoes-de-texto) — joga-se. `lutaDeBolso` corre
   `aLutaDaResposta` com um App de mentira, pequeno e à vista: os refs num
   objeto, as portas a anotar quem foi chamado e com quê, cada uma a
   devolver o que a do App devolveria no caso simples. */
export function lutaDeBolso({ pers, mudancas, ...ler }, portas = {}) {
  const st = {
    combate: null, divindade: null, descobertas: [], ocioso: 0, ataqueResolvido: false, derrotadosDaSessao: [], masmorra: null, salaEmCurso: null,
    mapa: { cidades: [] }, semente: "bolso|Fantasia medieval", genero: "Fantasia medieval", molde: null, lexico: null,
    nota: "", fichas: [], contadores: {}, ...ler,
  };
  const chamadas = [];
  const anota = (nome, devolve) => (...args) => { chamadas.push({ porta: nome, args: JSON.parse(JSON.stringify(args === undefined ? null : args)) }); return devolve(...args); };
  let n = 0;
  const ctx = {
    ler: () => ({ ...st }),
    aplicar: (efs) => {
      for (const e of efs) {
        if (e.tipo === "nota") for (const l of e.linhas) st.nota = `${st.nota ? st.nota + "\n" : ""}${l}`;
        else if (e.tipo === "combate") st.combate = e.combate;
        else if (e.tipo === "ficha") st.fichas.push(e.ficha);
        else if (e.tipo === "descobertas") st.descobertas = e.descobertas;
        else if (e.tipo === "ocioso") st.ocioso = e.ocioso;
        else if (e.tipo === "ataqueResolvido") st.ataqueResolvido = e.ataqueResolvido;
        else if (e.tipo === "derrotados") st.derrotadosDaSessao = e.derrotados;
        else st[e.tipo] = e[e.tipo];
      }
    },
    sorteDoTurno: () => () => { n = (n * 9301 + 49297) % 233280; return n / 233280; },
    abrirCombate: anota("abrirCombate", (_, o) => ({ pers: o.pers, msgs: [], nota: "[INICIATIVA ROLADA PELO SISTEMA]" })),
    limparConjuracoesDaLuta: anota("limparConjuracoesDaLuta", (p) => p),
    notarFechoDaLuta: anota("notarFechoDaLuta", () => undefined),
    registrarMorteDeAlvo: anota("registrarMorteDeAlvo", () => false),
    bumpCont: anota("bumpCont", (campo, q = 1) => { st.contadores = { ...st.contadores, [campo]: (st.contadores[campo] || 0) + q }; }),
    avancarOsMinutos: anota("avancarOsMinutos", (q, ficha) => ({ texto: "", ficha })),
    checarFama: anota("checarFama", () => 0),
    tentarSurgirNemesis: anota("tentarSurgirNemesis", () => undefined),
    aplicarVinculo: anota("aplicarVinculo", (grupo) => grupo),
    porNoChaoAqui: anota("porNoChaoAqui", () => undefined),
    talvezDespertarUnica: anota("talvezDespertarUnica", (p) => p),
    concluirMasmorraDoChefe: anota("concluirMasmorraDoChefe", (p) => ({ pers: p, concluiu: true })),
    resolverSalaAposCombate: anota("resolverSalaAposCombate", () => undefined),
    abrirRitoAscensao: anota("abrirRitoAscensao", () => undefined),
  };
  for (const [nome, f] of Object.entries(portas)) ctx[nome] = anota(nome, f);
  const saida = motorLuta.aLutaDaResposta({ pers, mudancas }, ctx);
  return { saida, st, chamadas, chamou: (nome) => chamadas.filter((c) => c.porta === nome) };
}
