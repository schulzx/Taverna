/* teste-mm14-continuidade.mjs (Fase MM · MM14) — o que a sessão de prova partiu

   A sessão jogada da MM11 (mente/mm11-sessao.md) mediu o que a sonda não
   mede: o mundo aguenta uma sessão inteira sem se contradizer? Três das
   contradições são do motor, e esta suíte as reproduz com os números da
   própria sessão:

   · Nº 4 — o "como você faz isso?" do golpe final não chegava ao Narrador
     (3 em 3). A cena morava na 2.ª linha de ACABOU DE (prio 3,1) e o corte
     guloso da pauta punha o CONTRA (prio 5) no lugar dela. Agora vai ao
     DESFECHO (prio 2), por `golpeFinalNaPauta`.
   · Nº 5 — o revide do contra-ataque era contado ("3 de 8") e apagado: o
     turno dos inimigos publicava a sua cópia do campo por cima. Agora o
     laço aplica `revideNoCampo` à cópia que publica.
   · Nº 3 — voltar a uma sala limpa refazia a luta (T34). Agora
     `entrarNaSala` diz `jaLimpa` e `voltarASalaLimpa` entrega a cena. */
import { SECOES, porNaPauta, textoDaPauta, garantirPauta, TETO_DA_PAUTA, PRIO_DE_FERRO, cederNaCena } from "../src/pauta.js";
import { paraPauta } from "../src/geografo.js";
import { aplicarEscolha, envelopeDoGolpeFinal, golpeFinalNaPauta, TETO_DA_CENA_DO_JOGADOR } from "../src/golpe-final.js";
import { revideNoCampo } from "../src/reacoes.js";
import { gerarMasmorra, entrarNaSala, marcarResolvida, voltarASalaLimpa, SALA_LIMPA } from "../src/masmorras.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* As três frases que a heroína escreveu no cartão, palavra por palavra
   (T28, T29 e T39 da transcrição). */
const FRASES = {
  T28: "Saio da sombra colada às costas dele, meto a lâmina por baixo do crânio e torço até a cabeça se soltar da espinha com um estalo seco.",
  T29: "Piso a massa com a bota e abro-a ao meio com a lamina, de cima a baixo, como quem abre um peixe.",
  T39: "Agarro-o pela mandibula e esmago o cranio contra a quina de um caixote ate a luz se apagar nas orbitas.",
};
const HEROI = "Iara do Vau";

/* A pauta de um turno de luta comum, com peças reais: o ONDE e os vetos
   de distância saem do Geógrafo (a Delfina a três dias, como na sessão),
   o MOMENTO é a batida do Chamado, a FALA é a do Teodoro (que falou em
   quase todo turno da masmorra: M26, M34, M39) e o CONTRA é o slime que
   ainda está de pé. Nada aqui é cheio de propósito — é um turno como os
   da sessão. */
const MAPA = { cidades: [
  { nome: "Foz do Meio", x: 87, y: 57, porte: "cidade", bioma: "costa", descoberta: true, regiao: "Margens" },
  { nome: "Pedra do Vazio", x: 52, y: 74, porte: "fortaleza", bioma: "colina", descoberta: true },
] };
const G = paraPauta({
  cidadeAtual: "Foz do Meio", mapa: MAPA, semente: "sessao|mm11",
  espaco: { tipo: "cidade", dentro: true, tipoDoLocal: "galpao", publico: false, gentePorPerto: 0, cabem: 12, saidas: 1, porte: "cidade", luz: "escuro" },
  longe: [{ nome: "Delfina", onde: "Pedra do Vazio", dias: 3 }],
});
const turnoDeLuta = () => {
  let p = porNaPauta({}, "onde", G.onde);
  p = porNaPauta(p, "naoPode", G.naoPode);
  p = porNaPauta(p, "momento", "O Chamado: a porta da aventura está aberta, e alguém espera resposta");
  p = porNaPauta(p, "fala", "Teodoro, da porta: \"Eles não cansam. Deviam ter ficado mortos da primeira vez.\"");
  p = porNaPauta(p, "contra", "Slime quer o corpo mais perto; bate em quem estiver colado");
  return p;
};
const golpe = (nome, frase, escolha = "letal") =>
  envelopeDoGolpeFinal({ alvo: aplicarEscolha({ nome, vida: 3 }, escolha, { semente: "mm14" }), escolha, heroi: HEROI, comoFez: frase });
const trecho = (frase) => frase.slice(-40, -1);

/* ============================================================ */
sec("1. Nº 4 — a seção do desfecho");
{
  const d = SECOES.find((s) => s.id === "desfecho");
  const idx = (id) => SECOES.findIndex((s) => s.id === id);
  t("a seção existe, com rótulo e propósito", !!(d && d.rotulo && d.o));
  /* MOVIDA NA MM16 nº 5 (05/10), com o motivo: prio 2 não bastou. Na 3.ª
     sessão o ONDE de uma luta numa masmorra tinha quatro linhas de prio 1
     (a última, 264 caracteres da economia da cidade) e a frase caiu 2 em 2
     (teste-como-chega tem os números). O DESFECHO passou a ser de FERRO. A
     intenção continua: corta depois do que o sistema resolveu (3) — e
     agora depois de tudo. */
  t("prioridade de ferro — corta depois de tudo, e antes dela só a 1.ª linha do ONDE",
    d && d.prio === PRIO_DE_FERRO && SECOES.every((s) => s.id === d.id || s.id === "vetoDoDesfecho" || s.prio > d.prio) && d.prio < SECOES.find((s) => s.id === "acabou").prio);
  t("e na leitura vem logo depois de ACABOU DE", idx("desfecho") === idx("acabou") + 1);
}

/* ============================================================ */
sec("2. Nº 4 — a frase da sessão chega ao Narrador");
{
  /* O ANTES, guardado como documento: pelo caminho antigo (seção acabou)
     esta mesma pauta perde a cena — exatamente o que a sessão viu no T28,
     o fato sim, a frase não. Não é regra do módulo; é a razão da mudança,
     e se um dia a pauta passar a caber a cena por ACABOU esta linha avisa
     que a seção nova pode ser repensada. */
  const antigo = textoDaPauta(porNaPauta(turnoDeLuta(), "acabou", ...golpe("Esqueleto", FRASES.T28).acabou), { turno: 28 });
  t("(o antes) por ACABOU DE, o fato entra e a frase fica de fora — o T28",
    antigo.includes(`${HEROI} deu o golpe final em Esqueleto`) && !antigo.includes(trecho(FRASES.T28)));
  t("(o antes) e o CONTRA, de prioridade 5, entra no lugar dela", antigo.includes("Slime quer o corpo mais perto"));

  for (const [turno, nome] of [["T28", "Esqueleto"], ["T29", "Slime"], ["T39", "Esqueleto"]]) {
    const env = golpe(nome, FRASES[turno]);
    const txt = textoDaPauta(golpeFinalNaPauta(turnoDeLuta(), env), { turno: 1 });
    t(`${turno}: o fato E a frase escrita chegam (${nome})`,
      txt.includes(`${HEROI} deu o golpe final em ${nome}`) && txt.includes(trecho(FRASES[turno])));
    t(`${turno}: e a pauta continua dentro do teto (${txt.length}/${TETO_DA_PAUTA})`, txt.length <= TETO_DA_PAUTA);
  }

  /* T39 — "nem a linha ACABOU veio": outras coisas do turno (o propósito,
     o crime) chegam antes à ACABOU DE e empurram o golpe para a 3.ª, 4.ª
     linha. No DESFECHO ele é a primeira linha de uma seção só dele. */
  let cheioDeAcabou = turnoDeLuta();
  cheioDeAcabou = porNaPauta(cheioDeAcabou, "acabou",
    "o propósito de alguém da cena andou: " + "a".repeat(150),
    "o crime do turno: " + "b".repeat(150),
    "outra coisa que o sistema resolveu: " + "c".repeat(150));
  const env39 = golpe("Esqueleto", FRASES.T39);
  const txt39 = textoDaPauta(golpeFinalNaPauta(cheioDeAcabou, env39));
  t("T39: com a ACABOU DE cheia de outras coisas, o fato e a frase chegam na mesma",
    txt39.includes(env39.acabou[0]) && txt39.includes(trecho(FRASES.T39)));
}

/* ============================================================ */
sec("3. Nº 4 — a pauta cheia, e o preço dentro do teto");
{
  /* A pauta cheia das outras suítes (mm10, mm8f): toda seção com uma
     linha de 110 — ONDE, FALA, PESO e NÃO PODE todos presentes, que numa
     luta já é mais do que a sessão viu. A cena no teto de 240. */
  let cheia = {};
  /* MM16: sem as duas seções do turno (o desfecho e o veto de quem caiu,
     que o golpe é que enche) e cedida como numa luta (`cederNaCena`): a
     economia da cidade, a rua, a vizinhança e as potências não estão numa
     luta. Com elas, esta pauta "cheia" era uma luta que nenhum jogo monta. */
  for (const s of SECOES) if (!["desfecho", "vetoDoDesfecho"].includes(s.id)) cheia = porNaPauta(cheia, s.id, `${s.id} linha ` + "x".repeat(110));
  cheia = cederNaCena(cheia, { luta: true });
  const longa = ("desço a lâmina pela nuca dele e seguro-o antes de bater no chão ").repeat(6);
  for (const escolha of ["letal", "nao_letal"]) {
    const a = aplicarEscolha({ nome: "Esqueleto", vida: 2 }, escolha, { semente: "mm14" });
    const e = envelopeDoGolpeFinal({ alvo: a, escolha, heroi: HEROI, comoFez: longa });
    const tx = textoDaPauta(golpeFinalNaPauta(cheia, e));
    t(`pauta cheia, ${escolha}: o fato, a cena no teto e o veto entram (${tx.length}/${TETO_DA_PAUTA})`,
      longa.length > TETO_DA_CENA_DO_JOGADOR && e.acabou.every((l) => tx.includes(l)) && e.naoPode.every((l) => tx.includes(l)) && tx.length <= TETO_DA_PAUTA);
  }
  /* O PIOR CASO DE TODOS, e o que cede nele. Pauta cheia, nome de 36
     letras, herói de 21, poupar (o fato mais longo, com a hora do
     despertar) e a cena no teto: a linha da cena passa dos ~400 e não
     cabe. O que cede é ELA — nunca o fato, nunca o veto, e o teto não se
     move. É o limite escrito desta etapa: subir o teto é proibido, e
     encurtar o teto da cena (240) cortaria o exemplo da própria pessoa. */
  const alvo = aplicarEscolha({ nome: "Vorgath, o Carrasco das Sete Colinas", vida: 2 }, "nao_letal", { semente: "mm14" });
  const env = envelopeDoGolpeFinal({ alvo, escolha: "nao_letal", heroi: { nome: "Ingrid Quebra-Escudos" }, comoFez: longa });
  const com = textoDaPauta(golpeFinalNaPauta(cheia, env));
  const sem = textoDaPauta(cheia);
  t("pior de todos: o fato do poupado e o veto entram", com.includes(env.acabou[0]) && com.includes(env.naoPode[0]));
  t("pior de todos: a pauta continua dentro do teto (que não se mexeu)", com.length <= TETO_DA_PAUTA && TETO_DA_PAUTA === 1400, `${com.length}`);
  console.log(`      (pior de todos: fato ${env.acabou[0].length}, cena ${env.acabou[1].length} — a cena ${com.includes(env.acabou[1]) ? "entra" : "cede"})`);
  /* O PREÇO, escrito: o que sai para o desfecho inteiro entrar (fato, cena
     no teto e veto do poupado), contra a mesma pauta sem golpe nenhum.
     Nunca sai o ONDE, a FALA nem o PESO. O veto do poupado vai à frente do
     NÃO PODE, e por isso, nesta pauta cheia, o veto ANTIGO passa a 2,1 e
     empata com a cena — e o empate de prioridade 2 decide-se pela ordem
     de leitura, como a FALA (v9.135) já decidia contra o veto. É o preço
     mais caro desta etapa, e fica escrito: numa pauta cheia E poupando,
     o segundo veto cede à frase do jogador. No letal (acima) nenhum veto
     sai; no turno da sessão (abaixo), também não. */
  const aP = aplicarEscolha({ nome: "Esqueleto", vida: 2 }, "nao_letal", { semente: "mm14" });
  const eP = envelopeDoGolpeFinal({ alvo: aP, escolha: "nao_letal", heroi: HEROI, comoFez: longa });
  const pP = golpeFinalNaPauta(cheia, eP);
  const comP = textoDaPauta(pP);
  /* MOVIDA NA MM16: o veto do poupado mora na seção de ferro dele, que sai
     no bloco do NÃO PODE, à frente — a intenção (o primeiro veto que o
     Narrador lê é o de quem acabou de cair) prova-se no texto. */
  t("o veto do poupado é a primeira linha do NÃO PODE",
    pP.vetoDoDesfecho[0] === eP.naoPode[0] && comP.includes(`NÃO PODE  ${eP.naoPode[0]}`));
  const linhasDe = (txt) => SECOES.filter((s) => s.id !== "desfecho" && txt.includes(`${s.id} linha `)).map((s) => s.id);
  const antes = linhasDe(sem), depois = linhasDe(comP);
  const sairam = antes.filter((id) => !depois.includes(id));
  const prio = Object.fromEntries(SECOES.map((s) => [s.id, s.prio]));
  /* MOVIDA NA MM16, com o motivo: o desfecho é de FERRO — a pessoa pediu a
     frase do jogador "acima de tudo, como o veto de quem caiu". O preço
     deixa de ter piso de prioridade: numa pauta cheia, poupando e com a
     frase no teto, cede o que corta primeiro na ordem da tabela. O que fica
     escrito é o que NUNCA sai: o lugar (a 1.ª linha do ONDE). */
  t("o que sai para o desfecho entrar nunca é o lugar",
    !sairam.includes("onde") && depois.includes("onde"), `saíram: ${sairam.join(", ")}`);
  {
    const aL = aplicarEscolha({ nome: "Esqueleto", vida: 2 }, "letal", { semente: "mm14" });
    const txL = textoDaPauta(golpeFinalNaPauta(cheia, envelopeDoGolpeFinal({ alvo: aL, escolha: "letal", heroi: HEROI, comoFez: longa })));
    t("no letal, com a pauta cheia, nenhum veto sai", txL.includes("naoPode linha "));
  }
  console.log(`      (o preço, numa pauta cheia: saem ${sairam.join(", ") || "nada"} — ${comP.length}/${TETO_DA_PAUTA})`);

  /* E o preço no turno da sessão: o que o turno do T28 perde para a frase
     dela entrar. */
  const envS = golpe("Esqueleto", FRASES.T28);
  const semS = textoDaPauta(turnoDeLuta()), comS = textoDaPauta(golpeFinalNaPauta(turnoDeLuta(), envS));
  const linhasS = Object.values(garantirPauta(turnoDeLuta())).flat();
  const perdeu = linhasS.filter((l) => semS.includes(l) && !comS.includes(l));
  t("no turno da sessão, nenhum veto nem o ONDE saem para a frase entrar",
    perdeu.every((l) => !G.naoPode.includes(l) && !G.onde.includes(l)), perdeu.join(" | "));
  console.log(`      (o preço no turno do T28: ${perdeu.length ? perdeu.map((l) => l.slice(0, 40)).join(" | ") : "nada"})`);
}

/* ============================================================ */
sec("4. Nº 4 — a porta aguenta lixo e não muta");
{
  const base = turnoDeLuta();
  const copia = JSON.stringify(base);
  const env = golpe("Esqueleto", FRASES.T28);
  const p = golpeFinalNaPauta(base, env);
  t("a pauta recebida fica intacta", JSON.stringify(base) === copia);
  t("o fato e a cena vão ao DESFECHO, e nenhum dos dois à ACABOU DE",
    (p.desfecho || []).length === 2 && !(p.acabou || []).some((l) => env.acabou.includes(l)));
  const pp = golpe("Slime", "", "nao_letal");
  const p2 = golpeFinalNaPauta({}, pp);
  /* MOVIDA NA MM16: o veto vai à seção de ferro dele (rótulo NÃO PODE) */
  t("poupar sem frase: só o fato no DESFECHO, e o veto no NÃO PODE", (p2.desfecho || []).length === 1 && (p2.vetoDoDesfecho || []).length === 1 && !p2.naoPode);
  const vazia = JSON.stringify(garantirPauta(base));
  t("envelope de lixo devolve a pauta como veio",
    [null, undefined, 3, "x", {}, { acabou: null }, { acabou: [null, 5, "  "] }, { acabou: "texto solto", naoPode: {} }]
      .every((x) => JSON.stringify(golpeFinalNaPauta(base, x)) === vazia));
  t("pauta de lixo vira pauta válida", JSON.stringify(golpeFinalNaPauta(null, env).desfecho) === JSON.stringify(env.acabou));
  /* O ref do App junta o golpe do herói com o do grupo (MM3b), a palavra
     (MM9) e os prisioneiros: todos entram, na ordem em que chegaram. */
  const junto = { acabou: [...env.acabou, "Bram deu o golpe final em Slime, e foi para matar: Slime está morto."], naoPode: [] };
  const pj = golpeFinalNaPauta({}, junto);
  t("o envelope junto do turno entra inteiro, na ordem", JSON.stringify(pj.desfecho) === JSON.stringify(junto.acabou));
}

/* ============================================================ */
sec("5. Nº 5 — o revide chega ao corpo");
{
  const campo = () => [{ nome: "Esqueleto", vida: 8, vidaMax: 8 }, { nome: "Slime", vida: 4, vidaMax: 4 }];
  const c0 = campo();
  const copia = JSON.stringify(c0);
  const t26 = revideNoCampo(c0, { alvo: "Esqueleto", dano: 5 });
  t("T26: \"5 de dano (ele está com 3 de 8)\" — e o campo diz 3", t26[0].vida === 3 && t26[0].ultimoDano === 5 && t26[0].derrotado === false);
  t("T38: \"4 de dano (ele está com 4 de 8)\" — e o campo diz 4", revideNoCampo(campo(), { alvo: "Esqueleto", dano: 4 })[0].vida === 4);
  t("a lista recebida fica intacta, e o outro inimigo é o mesmo objeto", JSON.stringify(c0) === copia && t26[1] === c0[1] && t26 !== c0);
  const mata = revideNoCampo(campo(), { alvo: "Slime", dano: 9 });
  t("revide que leva a zero derruba — e não passa de zero", mata[1].vida === 0 && mata[1].derrotado === true);
  const caido = [{ nome: "Esqueleto", vida: 0, vidaMax: 8, derrotado: true }];
  t("corpo já caído não é ferido nem levantado (a mesma lista volta)", revideNoCampo(caido, { alvo: "Esqueleto", dano: 3 }) === caido);
  const c1 = campo();
  t("revide sem mordida devolve a MESMA lista",
    [null, undefined, {}, { alvo: "Esqueleto" }, { alvo: "Esqueleto", dano: 0 }, { alvo: "Esqueleto", dano: -2 }, { alvo: "Esqueleto", dano: "x" }, { alvo: "Ninguém", dano: 3 }, { dano: 3 }]
      .every((rv) => revideNoCampo(c1, rv) === c1));
  t("campo de lixo volta como veio", [null, undefined, {}, "x"].every((x) => revideNoCampo(x, { alvo: "a", dano: 1 }) === x));
  t("lixo dentro da lista não derruba a conta", revideNoCampo([null, 3, { nome: "Esqueleto", vida: 8 }], { alvo: "Esqueleto", dano: 2 })[2].vida === 6);
  t("dois com o mesmo nome: só o primeiro de pé apanha",
    (() => { const r = revideNoCampo([{ nome: "Rato", vida: 0, derrotado: true }, { nome: "Rato", vida: 5 }, { nome: "Rato", vida: 5 }], { alvo: "Rato", dano: 2 }); return r[1].vida === 3 && r[2].vida === 5; })());

  /* O LAÇO, reduzido ao que o partia: o turno dos inimigos segura a sua
     cópia do campo (`combPos`) e a publica no fim. O revide escrito só no
     ref morre na publicação; aplicado à cópia, chega ao tabuleiro. */
  const rodada = (aplicarNaCopia) => {
    let ref = { inimigos: campo() };
    const combPos = ref;
    const revide = { alvo: "Esqueleto", dano: 5 };
    ref = { ...ref, inimigos: revideNoCampo(ref.inimigos, revide) };        // o que tentarReacaoNoGolpe já fazia
    if (aplicarNaCopia) combPos.inimigos = revideNoCampo(combPos.inimigos, revide);
    ref = combPos;                                                           // finalizarRodada publica a cópia
    return ref.inimigos[0].vida;
  };
  t("(o antes) sem a cópia, o tabuleiro volta a 8 de 8 — o que a sessão viu", rodada(false) === 8);
  t("com a cópia, o tabuleiro diz 3 de 8 — o que o Narrador ouviu", rodada(true) === 3);
}

/* ============================================================ */
sec("6. Nº 3 — a sala limpa fica limpa");
{
  const mm = { nome: "Galpão das Redes", atual: 2, tochas: 3, ritmo: "normal", chave: false, saques: { moedas: 0, itens: 0 }, salas: [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1], visitada: true, resolvida: true },
    { id: 1, tipo: "combate", camada: 1, saidas: [2], visitada: true, resolvida: true, inimigos: [{ nome: "Esqueleto", ameaca: "comum" }, { nome: "Slime", ameaca: "fraco" }] },
    { id: 2, tipo: "enigma", camada: 2, saidas: [3], visitada: true, resolvida: true },
    { id: 3, tipo: "combate", camada: 3, saidas: [], visitada: false, resolvida: false, inimigos: [{ nome: "Ghoul", ameaca: "comum" }] },
  ] };
  const copia = JSON.stringify(mm);
  const volta = entrarNaSala(mm, 1);
  t("T34: voltar à sala da luta que já acabou diz jaLimpa", volta.jaLimpa === true);
  t("e voltar continua a ser andar: gasta a tocha e muda de sala", volta.mm.tochas === 2 && volta.mm.atual === 1);
  t("o estado recebido fica intacto", JSON.stringify(mm) === copia);
  t("a sala nova não está limpa", entrarNaSala(mm, 3).jaLimpa === false);
  t("a entrada não conta como sala limpa (não tem conteúdo)", entrarNaSala({ ...mm, atual: 1 }, 0).jaLimpa === false);
  t("porta trancada continua a só bloquear", entrarNaSala({ ...mm, salas: mm.salas.map((s) => s.id === 3 ? { ...s, trancada: true } : s) }, 3).bloqueado === true);

  const vl = voltarASalaLimpa(volta.sala, { pos: "Galpão das Redes · camada 1" });
  t("a cena de volta nomeia quem caiu — os dois do T29", /Esqueleto, Slime/.test(vl.envelope));
  t("e proíbe o que a sessão viu: levantar, reaparecer, atacar", /não se levanta/.test(vl.envelope) && /não reaparece/.test(vl.envelope) && /não volta a atacar/.test(vl.envelope));
  t("a posição entra no envelope", vl.envelope.includes("Galpão das Redes · camada 1"));
  t("a linha da tela é jogo, não mecanismo", !/\[|SISTEMA|resolvid|limp/i.test(vl.linha) && vl.linha.length > 0);
  t("determinístico: a mesma sala dá a mesma cena", JSON.stringify(voltarASalaLimpa(volta.sala, { pos: "x" })) === JSON.stringify(voltarASalaLimpa(volta.sala, { pos: "x" })));
  t("sala por resolver não tem cena de volta (a porta segue o de sempre)", voltarASalaLimpa(mm.salas[3]) === null);
  t("a entrada e o lixo também não", [mm.salas[0], null, undefined, {}, "x", { resolvida: "sim", tipo: "combate" }].every((s) => voltarASalaLimpa(s) === null));
  t("opções nulas ou ausentes não quebram", !!voltarASalaLimpa(volta.sala) && !!voltarASalaLimpa(volta.sala, null));

  /* O MESMO BURACO, nas outras salas: o tesouro pagava de novo, o
     santuário curava de novo, a armadilha disparava de novo. Toda sala que
     o gerador faz tem o seu "o que ficou". */
  const tipos = new Set();
  for (let k = 0; k < 60; k++) for (const s of gerarMasmorra("Fantasia medieval", k % 2 ? 9 : 3).salas) tipos.add(s.tipo);
  tipos.delete("entrada");
  t(`todo tipo de sala do gerador tem a sua linha na tabela (${[...tipos].join(", ")})`, [...tipos].every((tp) => SALA_LIMPA[tp] && SALA_LIMPA[tp].oQueFicou && SALA_LIMPA[tp].linha));
  const tesouro = voltarASalaLimpa({ id: 9, tipo: "tesouro", resolvida: true, moedas: 40, caiItem: true });
  t("o tesouro limpo não fala de moedas nem de item", tesouro && !/\d|moeda|item/i.test(tesouro.envelope.replace(/1-2/, "")));
  t("tipo desconhecido cai na linha da luta, nunca em null", voltarASalaLimpa({ tipo: "cripta_nova", resolvida: true }).linha === SALA_LIMPA.combate.linha);

  /* E a sala volta a limpa depois de uma segunda vitória: marcar duas
     vezes não inventa chave nem saque. */
  const duas = marcarResolvida(marcarResolvida(mm, 1), 1);
  t("marcar a mesma sala duas vezes não soma saque nem chave", duas.chave === false && duas.saques.moedas === 0);
}

/* A FIAÇÃO — por texto, fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("nº 4: a pauta põe o golpe final por golpeFinalNaPauta", app.includes("if (gf) p = golpeFinalNaPauta(p, gf);"));
  t("nº 5: o revide aplica-se no campo do turno dos inimigos", app.includes("if (rv) combPos.inimigos = revideNoCampo(combPos.inimigos, rv);"));
  const i = app.indexOf("const irParaSala = (id) => {");
  const corpo = i >= 0 ? app.slice(i, i + 4000) : "";
  t("nº 3: voltar a uma sala limpa não a refaz", corpo.includes("if (r.jaLimpa) {") && corpo.includes("voltarASalaLimpa(sala") && corpo.indexOf("if (r.jaLimpa)") < corpo.indexOf("PERCEPÇÃO PASSIVA"));
}

console.log(`\nMM14 · a continuidade: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
