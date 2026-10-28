/* gerar-combate-dourado.mjs (Fase T1-A, 5.ª fatia, 28/10/2026) — os órgãos do combate de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `combate-dourado.json`. Lê o App de ANTES de os órgãos do combate se
   tornarem puros — `git show 7338870:src/App.jsx`, o último commit em que
   todos moravam inteiros no componente —, recorta cada órgão à letra e
   corre-o em Node sobre os casos de `combate-casos.mjs`, com os refs
   trocados por objetos simples e as funções dos módulos de verdade.
   Fotografa o que o órgão devolveu e o que escreveu (a ficha, as linhas,
   a nota).

   O que é do App e não é regra vira um dublê declarado, órgão a órgão,
   na tabela ORGAOS abaixo. Nenhuma troca no texto: é o código de lá.

   uso: node testes/gerar-combate-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { casosDoCombate, sorteDoCaso, mundoDaLei } from "./combate-casos.mjs";
import { agravarParaMorte } from "../src/crime.js";
import { gerarVilao, resumoVilaoPrompt } from "../src/vilao.js";
import { nomePessoa } from "../src/nomes.js";
import { dominiosDe } from "../src/gestao.js";
import { vilaoDoFio } from "../src/saga.js";
import { gerarHabilidadeUnica, chanceUnica } from "../src/unicas.js";
import { patamarFama } from "../src/fama.js";
import { recompensaChefe } from "../src/masmorras.js";
import { essenciaDoChefe, RARIDADE_ROTULO } from "../src/loot.js";
import { garantirSuprimentos } from "../src/ermos.js";
import { concluirLugar } from "../src/mundo-base.js";
/* a abertura da luta (6.ª fatia) */
import { localDoCaso, fotoCompacta } from "./combate-casos.mjs";
import { completarInimigo } from "../src/bestiario.js";
import { devolverSegura } from "../src/gatilhos.js";
import { abrirCombateTracos, iniciativaDeTraco } from "../src/tracos.js";
import { avaliarEncontro, gastarDoDia, selo, resumoOrcamentoPrompt } from "../src/orcamento.js";
import { reconciliarGraus } from "../src/presenca-divina.js";
import { rolarIniciativa, resumoIniciativa, novosRecursos, acoesBonusDe } from "../src/combate.js";
import { atributoEfetivo } from "../src/regras-jogo.js";
import { iniciativaDeItem } from "../src/dadivas.js";
import { mapaEmTexto, ladoDe, tamanhoDe, alcanceNatural, montarGrade, posicionar } from "../src/grid.js";
import { rng, hashSemente } from "../src/semente.js";
import { acoesPorRodada, estaEmForma, desfazerForma, baixarGuardas, baixarPressa } from "../src/habilidades.js";
/* os órgãos do fim da luta (6.ª fatia) */
import { ganharVinculo } from "../src/vinculos.js";
import { caidosDaLuta } from "../src/recibo-da-luta.js";
import { dispensarTodas } from "../src/invocacoes.js";
import { podeAbrirRito, iniciarRito, provaAtual } from "../src/ascensao.js";
import { grauDe, tituloDe } from "../src/divindades.js";
import { AGORA_DA_PROVA, N_CASOS } from "./combate-casos.mjs";
import { recorteDeAntes, blocoComoFuncao, correrOBloco, fotoDoBloco, casosDoBloco, TROCAS_DECLARADAS } from "./combate-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "7338870";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const corte = (de, ate) => {
  const i0 = app.indexOf(de);
  const i1 = app.indexOf(ate, i0 + de.length);
  if (i0 < 0 || i1 < 0) throw new Error("não está onde estava: " + de.slice(0, 60));
  if (app.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 60));
  return app.slice(i0, i1);
};
const ref = (v) => ({ current: v });
const copia = (x) => JSON.parse(JSON.stringify(x));

/* cada órgão: o recorte, os dublês e a foto */
const ORGAOS = {
  /* talvezDespertarUnica: lê a sorte do turno e escreve na nota e nas linhas */
  talvezDespertarUnica: {
    texto: () => corte("  const talvezDespertarUnica = (p2, inimigosFinais, msgs) => {", "  /* REDE DE SEGURANÇA (v9.5.1)"),
    correr: (fn, k) => {
      const S = { chanceUnica, gerarHabilidadeUnica, sorteDoTurno: sorteDoCaso(k), notaRef: ref(k.notaAntes) };
      const f = fn(S);
      const msgs = [];
      const pers = f(copia(k.pers), copia(k.inimigosFinais), msgs);
      return { pers, msgs, nota: S.notaRef.current };
    },
    nome: "talvezDespertarUnica",
  },
  /* checarFama: lê famaAtual() e a última checagem; escreve na tela (pushMsgs), na nota e no ref */
  checarFama: {
    texto: () => corte("  const checarFama = () => {", "  /* NÊMESIS (v6.8)"),
    correr: (fn, k) => {
      const tela = [];
      const S = { patamarFama, famaAtual: () => k.fama, famaPatamarRef: ref(k.famaAntes), pushMsgs: (xs) => tela.push(...xs), notaRef: ref(k.notaAntes) };
      const ret = fn(S)();
      return { ret, tela, nota: S.notaRef.current, ultima: S.famaPatamarRef.current };
    },
    nome: "checarFama",
  },
  /* concluirMasmorraDoChefe: lê a masmorra, o mapa, a base e a sorte; escreve
     nos refs (a masmorra, a base, a sala em curso), num contador e na sessão */
  concluirMasmorraDoChefe: {
    texto: () => corte("  const concluirMasmorraDoChefe = (p2, msgs) => {", "  /* ---------------- O CUSTO DE QUEM SAI"),
    correr: (fn, k) => {
      const contadores = [], sessao = [], calados = [];
      const S = {
        recompensaChefe, essenciaDoChefe, RARIDADE_ROTULO, garantirSuprimentos, concluirLugar,
        masmorraRef: ref(copia(k.masmorra)), mapaRef: ref(copia(k.mapa)), baseMundoRef: ref(copia(k.base)), salaEmCursoRef: ref("sala em curso"),
        setMasmorra: () => {}, setBaseMundo: () => {}, mundoAtual: () => ({ lexico: k.lexico }), sorteDoTurno: sorteDoCaso(k),
        bumpCont: (...a) => contadores.push(a), talvezFecharSessao: (x) => sessao.push(x), calou: (onde) => calados.push(onde),
      };
      const msgs = [];
      const ret = fn(S)(copia({ ...k.pers, equipamento: k.equipamento, suprimentos: k.suprimentos, essencia: k.essencia }), msgs);
      return { ret, msgs, masmorra: S.masmorraRef.current, base: S.baseMundoRef.current, salaEmCurso: S.salaEmCursoRef.current, contadores, sessao, calados };
    },
    nome: "concluirMasmorraDoChefe",
  },
  /* registrarMorteDeAlvo: lê a lei, o registo, a nêmesis e o mundo; escreve
     na lei, no registo, e encerra a nêmesis pelo órgão dela (o dublê conta) */
  registrarMorteDeAlvo: {
    texto: () => corte("  const registrarMorteDeAlvo = (nome, causa, { aproximado = false } = {}) => {", "  /* ---------------- A MORTE DA NÊMESIS TEM UMA PORTA SÓ"),
    correr: (fn, k) => {
      const encerradas = [], calados = [];
      const w = mundoDaLei(k);
      const S = {
        agravarParaMorte, leiRef: ref(copia(k.leiM)), npcsRef: ref(copia(k.npcsM)), nemesisRef: ref(copia(k.nemesisM)), diaRef: ref(w.dia),
        mapaRef: ref(copia(k.mapaM)), cidadeAtualRef: ref(k.cidadeM), sementeMundo: () => w.semente, mundoAtual: () => ({ lexico: null }),
        generoMundo: () => w.genero, moldeMundo: () => w.molde, cidadeDoMapa: (nome) => (k.mapaM.cidades || []).find((c) => c.nome === nome) || null,
        setNpcs: () => {}, encerrarNemesis: (c) => encerradas.push(c), calou: (onde) => calados.push(onde),
      };
      const ret = fn(S)(k.alvoM, k.causaM, { aproximado: k.aproximadoM });
      return { ret, lei: S.leiRef.current, npcs: S.npcsRef.current, encerradas, calados };
    },
    nome: "registrarMorteDeAlvo",
  },
  /* tentarSurgirNemesis: lê a nêmesis, a fama, a sorte, os contadores, o mapa,
     a bolsa, o fio e quem caiu; escreve a nêmesis, a nota, e chama as
     conquistas (o dublê conta) */
  tentarSurgirNemesis: {
    texto: () => corte("  const tentarSurgirNemesis = () => {", "  /* Alguém morreu por decisão do sistema"),
    correr: (fn, k) => {
      const calados = [];
      let conquistas = 0;
      const S = {
        gerarVilao, nomePessoa, dominiosDe, vilaoDoFio, resumoVilaoPrompt,
        nemesisRef: ref(copia(k.nemesisM)), famaAtual: () => k.fama, sorteDoTurno: sorteDoCaso(k),
        mundo: { genero: k.semente.split("|")[1] }, mundoAtual: () => ({ lexico: null }), contRef: ref(copia(k.contN)),
        mapaRef: ref(copia(k.mapaN)), personagemRef: ref({ moedas: k.pers.moedas }), diaRef: ref(1 + (k.i % 9)), espinhaRef: ref(copia(k.espinhaN)),
        mundoDasMissoes: () => { if (k.derrotadosN === "estoura") throw new Error("mundoDasMissoes estourou"); return { derrotados: k.derrotadosN }; },
        calou: (onde) => calados.push(onde), setNemesis: () => {}, notaRef: ref(k.notaAntes), checarConquistas: () => { conquistas++; },
      };
      const ret = fn(S)();
      return { ret: ret === undefined ? null : ret, nemesis: S.nemesisRef.current, nota: S.notaRef.current, calados, conquistas };
    },
    nome: "tentarSurgirNemesis",
  },
  /* abrirCombate (6.ª fatia): a porta única, com o equipamento
     (equiparCombate), o tabuleiro (montarGrid) e a economia (economiaNova e
     temAcaoBonus) recortados à letra junto — só ela os chama. Lê a ficha,
     a luta no ref, o panteão, o lugar da planta, a sorte, o dia de lutas e
     o códex; escreve em seis refs, publica o combate e o códex, e agenda a
     presença (o dublê guarda o que ela receberia). O lugar que estoura
     sempre faz o órgão estourar: a foto guarda o erro. */
  abrirCombate: {
    texto: () => [
      corte("  const temAcaoBonus = (p) =>", "  /* v9.54: `acoesPorRodada`"),
      corte("  const economiaNova = (p) =>", "  /* ---------------- O PREÇO DE VESTIR"),
      corte("  const equiparCombate = (comb, pers, { situacao = \"cena\" } = {}) => {", "  /* ============================================================\n     A PORTA ÚNICA DE ABRIR COMBATE"),
      corte("  const abrirCombate = (inimigosCrus, { pers: persEntra = null, jaNoRef = false, situacao = \"cena\" } = {}) => {", "  /* O TABULEIRO NASCE DO LUGAR (v9.34)"),
      corte("  const montarGrid = (pers, inimigos, situacao = \"cena\") => {", "  /* Um passo dentro da MESMA região"),
    ].join("\n"),
    correr: (fn, k) => {
      const publicados = [], codex = [], agendas = [], presencas = [], calados = [];
      const pA = k.plantaA;
      const S = {
        completarInimigo, devolverSegura, abrirCombateTracos, avaliarEncontro, gastarDoDia, selo, resumoOrcamentoPrompt,
        reconciliarGraus, rolarIniciativa, resumoIniciativa, novosRecursos, acoesBonusDe, acoesPorRodada, atributoEfetivo,
        iniciativaDeTraco, iniciativaDeItem, mapaEmTexto, ladoDe, tamanhoDe, alcanceNatural, montarGrade, posicionar, rng, hashSemente,
        territorioEmLutaRef: ref("território de antes"), fichaViva: () => null, personagem: null,
        combateRef: ref(copia(k.combateNoRefA)), combateOciosoRef: ref(3), reacaoUsadaRef: ref(true), expiracoesSeguidasRef: ref(2),
        diaLutaRef: ref(copia(k.diaLutaA)), descobRef: ref(copia(k.descobertasA)), divindadeRef: ref(k.panteaoA.length ? { panteao: copia(k.panteaoA) } : null),
        setCombate: (c) => publicados.push(c), setDescobertas: (d) => codex.push(d),
        setTimeout: (f, ms) => agendas.push([f, ms]), presencaNaLuta: (c, p, o) => presencas.push({ c, p, o }), personagemRef: ref({ nome: "a ficha viva" }),
        sorteDoTurno: sorteDoCaso(k), calou: (onde) => calados.push(onde),
        masmorraRef: ref(pA.emMasmorra ? { nome: "Cripta" } : null), jornadaRef: ref(pA.emViagem ? { destino: "Porto Fundo" } : null),
        cidadeAtualRef: ref(pA.cidade), lugarRef: ref(copia(pA.lugar)), localAtualTxt: localDoCaso(k),
        mapaRef: ref({ cidades: [{ nome: "Vila do Sul", bioma: pA.bioma }] }),
        sementeMundo: () => k.semente, turnoDeRegistroRef: ref(k.turnoA),
      };
      let ret, erro = null;
      try { ret = fn(S)(copia(k.inimigosA), { pers: copia(k.persA), jaNoRef: k.jaNoRefA, ...(k.situacaoA === undefined ? {} : { situacao: k.situacaoA }) }); } catch (e) { erro = String(e && e.message); }
      for (const [f] of agendas) f();
      return fotoCompacta({
        ret: ret === undefined ? null : ret, erro, territorio: S.territorioEmLutaRef.current, combate: S.combateRef.current,
        ocioso: S.combateOciosoRef.current, reacao: S.reacaoUsadaRef.current, expiracoes: S.expiracoesSeguidasRef.current,
        diaLuta: S.diaLutaRef.current, descobertas: S.descobRef.current, publicados, codex, agendas: agendas.map((a) => a[1]), presencas, calados,
      });
    },
    nome: "abrirCombate",
  },
  /* bumpCont (6.ª fatia): lê e escreve o ref dos contadores */
  bumpCont: {
    texto: () => corte("  const bumpCont = (campo, n = 1) =>", "\n"),
    correr: (fn, k) => {
      const S = { contRef: ref(copia(k.contN)) };
      fn(S)(k.campoB, ...(k.nB === undefined ? [] : [k.nB]));
      return { cont: S.contRef.current };
    },
    nome: "bumpCont",
  },
  /* aplicarVinculo: devolve o grupo; escreve a linha (no turno ou na tela) e a nota de cada marco */
  aplicarVinculo: {
    texto: () => corte("  const aplicarVinculo = (grupo, nomeOuTodos, pontos, msgs) => {", "  const checarConquistas = useCallback("),
    correr: (fn, k) => {
      const tela = [];
      const S = { ganharVinculo, pushMsgs: (xs) => tela.push(xs), notaRef: ref(k.notaAntes) };
      const msgs = k.noTurnoV ? [] : null;
      const ret = fn(S)(copia(k.grupoV), k.quemV, k.pontosV, msgs);
      return { ret, msgs, tela, nota: S.notaRef.current };
    },
    nome: "aplicarVinculo",
  },
  /* notarFechoDaLuta: lê os dois refs do fecho, a ficha viva, o chão e o
     tamanho do relato; escreve num dos dois e no retrato do fim */
  notarFechoDaLuta: {
    texto: () => [
      corte("  const idsDoChao = (c) =>", "\n"),
      corte("  const notarFechoDaLuta = ({ combate: c = null, desfecho = null, caidos = null, linha = null } = {}) => {", "  /* Corre a cada `pushMsgs`, ANTES do carimbo:"),
    ].join("\n"),
    correr: (fn, k) => {
      const calados = [];
      const S = {
        caidosDaLuta, lutaDoReciboRef: ref(copia(k.lutaDoReciboF)), fechoDaLutaRef: ref(copia(k.fechoDaLutaF)), retratoDoFimRef: ref("retrato de antes"),
        fichaViva: () => copia(k.fichaVivaF), chaoRef: ref(copia(k.chaoF)), mensagensRef: ref(Array.from({ length: k.mensagensF }, () => ({}))),
        seguraRef: ref(copia(k.seguraF)), calou: (onde) => calados.push(onde),
      };
      fn(S)(...(k.argsF === undefined ? [] : [copia(k.argsF)]));
      return { luta: S.lutaDoReciboRef.current, fecho: S.fechoDaLutaRef.current, retrato: S.retratoDoFimRef.current, calados };
    },
    nome: "notarFechoDaLuta",
  },
  /* limparConjuracoesDaLuta: lê a ficha dada ou a do ref; escreve na tela,
     na nota e na ficha (ref e estado) */
  limparConjuracoesDaLuta: {
    texto: () => corte("  const limparConjuracoesDaLuta = (persBase) => {", "  const porForma = (h, pers) => {"),
    correr: (fn, k) => {
      const tela = [], publicados = [], calados = [];
      const S = {
        estaEmForma, desfazerForma, baixarGuardas, baixarPressa, dispensarTodas,
        personagemRef: ref(k.persLNoRef ? copia(k.persL) : { nome: "a ficha do ref", grupo: [] }), personagem: null,
        pushMsgs: (xs) => tela.push(xs), notaRef: ref(k.notaAntes), setPersonagem: (p) => publicados.push(p), calou: (onde) => calados.push(onde),
      };
      let ret = null, erro = null;
      try { ret = fn(S)(k.persLNoRef ? null : copia(k.persL)); } catch (e) { erro = String(e && e.message); }
      return { ret: ret === undefined ? null : ret, erro, tela, nota: S.notaRef.current, ficha: S.personagemRef.current, publicados, calados };
    },
    nome: "limparConjuracoesDaLuta",
  },
  /* abrirRitoAscensao: lê a divindade e o nível (dado, ou o da ficha);
     escreve a divindade, a tela, a nota, e salva (o dublê guarda o quê) */
  abrirRitoAscensao: {
    texto: () => corte("  const abrirRitoAscensao = (alvo, nivelHeroi) => {", "  const encararProva = () => {"),
    correr: (fn, k) => {
      const tela = [], publicadas = [], salvos = [];
      const S = {
        podeAbrirRito, iniciarRito, provaAtual, tituloDe, grauDe,
        personagemRef: ref({ nome: "Vera", nivel: k.nivelFichaR }), personagem: null, divindadeRef: ref(copia(k.divindadeR)),
        setDivindade: (d) => publicadas.push(d), pushMsgs: (xs) => tela.push(xs), notaRef: ref(k.notaAntes), salvar: (x) => salvos.push(x),
      };
      const ret = fn(S)(copia(k.alvoR), k.nivelR);
      return { ret: ret === undefined ? null : ret, divindade: S.divindadeRef.current, publicadas, tela, nota: S.notaRef.current, salvos };
    },
    nome: "abrirRitoAscensao",
  },
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  Date.now = () => AGORA_DA_PROVA;
  const casos = casosDoCombate();
  const out = { commit: COMMIT, casos: casos.length, orgaos: {} };
  for (const [nome, o] of Object.entries(ORGAOS)) {
    const fonte = o.texto();
    const fn = (S) => new Function("S", `with (S) {\n${fonte}\nreturn ${o.nome};\n}`)(S);
    out.orgaos[nome] = casos.map((k) => o.correr(fn, k));
  }
  /* o bloco do combate inteiro (6.ª fatia): o bloco e os quinze órgãos de antes, à letra (combate-bloco.mjs) */
  {
    const antes = blocoComoFuncao(recorteDeAntes(app, { trocas: TROCAS_DECLARADAS }));
    out.orgaos.blocoDoCombate = casosDoBloco(N_CASOS).map((k) => fotoDoBloco(correrOBloco(antes, k, { novo: false })));
  }
  fs.writeFileSync(path.join(AQUI, "combate-dourado.json"), JSON.stringify(out));
  for (const [nome, fotos] of Object.entries(out.orgaos)) console.log(`${nome}: ${fotos.length} fotos`);
}
