/* ============================================================
   A FASE CB NO App.jsx (CB lote 1, 09/11 — o oficial)

   A pessoa: «apertei em viajar para o lugar e instantaneamente abriu uma
   batalha contra um dragão ancião… não teve narração sobre o encontro, não
   teve nada». O motor (encontro-na-estrada.js, intencao.js, previsao.js,
   golpe-final.js, a bandeja) é provado nas suítes dele. Esta prova a
   FIAÇÃO: lê o App.jsx como texto, ancorada em conteúdo que só existe se a
   fiação ligou o motor (nunca em número de linha), e joga em Node o que a
   fiação entrega ao motor onde dá para jogar.

   1. o encontro lê a estrada (rolarEncontro com o perigo do trecho);
   2. a viagem não abre a mesa (nenhum abrirCombate no rolar da estrada);
   3. a narração vem antes da mesa;
   4. as três fases do encontro (o sinal, a escolha, o resolvido);
   5. a intenção no começo da rodada, e cumprida no revide;
   6. a previsão do golpe, e andar e atacar num toque;
   7. o d20 do golpe na bandeja;
   8. o fecho uma vez por luta;
   9. tudo em calou: uma peça nova que estoura nunca custa o turno.
   ============================================================ */
import { readFileSync } from "node:fs";
import { oEncontroNaEstrada, pautaDoEncontro, resolverEscolha, avistar } from "../src/encontro-na-estrada.js";
import { oFechoPergunta } from "../src/golpe-final.js";
import { CAMPOS } from "../src/estado.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra !== "" ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o fim de linha normalizado (uma cópia fresca pode vir em CRLF) */
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const conta = (s) => APP.split(s).length - 1;
/* o corpo de uma função do componente: de `  const nome = ` à próxima
   declaração do mesmo recuo (uma const, um efeito, um ref atribuído) */
/* o corpo de uma IIFE de render: de `  const nome = (() => {` ao `  })();` */
const corpoIIFE = (nome) => {
  const i = APP.indexOf("\n  const " + nome + " = (() => {");
  if (i < 0) return "";
  const f = APP.indexOf("\n  })();", i);
  return f < 0 ? "" : APP.slice(i, f);
};
const corpo = (nome) => {
  const i = APP.indexOf("\n  const " + nome + " = ");
  if (i < 0) return "";
  const resto = APP.slice(i + 1);
  const m = resto.slice(1).search(/\n  (const |let |useEffect\(|[a-zA-Z]+Ref\.current = |\/\* -{8})/);
  return m < 0 ? resto : resto.slice(0, m + 1);
};

sec("1. o encontro lê a estrada");
{
  t("a âncora das duas suítes fica (o gênero do mundo, com o recuo)", conta("rolarEncontro((mundo && mundo.genero) || cenarioAtivo().generos.padrao,") === 1);
  t("e o quinto argumento é o perigo do trecho", APP.includes('sorteDoTurno("encontro-qual"), estradaDoTrecho(destino));'));
  const e = corpo("estradaDoTrecho");
  t("estradaDoTrecho mede pelo perigoDoTrecho (a jornada, ou o trecho que vai nascer)", e.includes("perigoDoTrecho(mapaRef.current, jornadaRef.current)") && e.includes("perigoDoTrecho(mapaRef.current, { de: cidadeAtualRef.current"));
}

sec("2. a viagem não abre a mesa");
{
  const v = corpo("viajar");
  t("achei o corpo da viagem", v.length > 5000 && v.includes("const enc = rolarEncontro("));
  t("nenhum abrirCombate no rolar da estrada (era a investida direta, o dragão da pessoa)", !v.includes("abrirCombate("));
  t("o perigo do trecho vira encontro pendente (oEncontroNaEstrada → pousarOEncontro)", v.includes("oEncontroNaEstrada(enc, { pers: persV, clima: c && c.id, noite: ehNoite(minutoRef.current), bonus: bonusDoEncontro(persV), dia: diaRef.current, trecho })") && v.includes("pousarOEncontro(encontroDaEstrada);"));
  t("e a jornada PÁRA com o encontro à frente", v.includes('pausarViagem(jornadaRef.current, "um encontro na estrada")'));
  t("com um encontro por decidir, a estrada não anda", v.includes("if (encontroPendenteRef.current && !combateRef.current) {"));
  t("o fôlego da fuga continua a mandar (quem acabou de escapar não é apanhado)", v.includes('folegoSegura(folegoRef.current, { lugares: ondeEstou(), origem: "emboscada", criatura: inv.criatura })'));
  t("o trecho no sinal não diz o nome: diz o sinal", v.includes('if (encontroDaEstrada.fase === "sinal" && encontroDaEstrada.sinal) encV = { ...encV, detalhe: encontroDaEstrada.sinal.frase };'));
}

sec("3. a narração antes da mesa");
{
  const n = corpo("narrarOEncontro");
  t("a chamada própria do Mestre (QUEM_RESPONDE.encontro)", n.includes('quemResponde("encontro").chamadas') && n.includes("enviar("));
  t("com a pauta do encontro (ACABOU DE e NÃO PODE), nunca bloco estático", n.includes("porNaPautaDoTurno(pautaDoEncontro(e));"));
  const p = corpo("porNaPautaDoTurno");
  /* MOVIDA no CB lote 2 (10/11): o canal era o do crime, emprestado; passou
     ao seu (`pautaDeUmTurno`, REFS_DA_PAUTA), e a junção é a do motor
     (juntarNaPautaDeUmTurno). A intenção é a mesma: um canal de um turno,
     que a pauta consome e limpa, nunca bloco estático. */
  t("a pauta vai pelo canal de um turno que a pauta consome e limpa", p.includes("pautaDeUmTurnoRef.current = juntarNaPautaDeUmTurno(pautaDeUmTurnoRef.current, pa);") && !p.includes("crimeDoTurnoRef") && APP.includes("const pautaDeUmTurnoRef = useRef(null);") && /nucleoCacheRef, pautaDeUmTurnoRef,/.test(APP));
  /* a linha do envio fica a de sempre (o recorte dos envelopes corta por ela): é o
     `qr` do trecho que cede à chamada própria do encontro, antes do envelope */
  t("a viagem com encontro chama o Mestre agora", APP.includes('if (encontroDaEstrada && !qr.chamadas && quemResponde("encontro").chamadas) qr = quemResponde("encontro");') && APP.includes("    if (qr.chamadas) enviar(textoDaViagem, persV);"));
  const s = corpo("seguirOEncontro");
  t("com luta, o Mestre narra a descida e NÃO abre a mesa", s.includes("if (e.desfecho.luta) { pousarOEncontro(e); narrarOEncontro(e, p); return; }") && !s.includes("abrirCombate("));
  t("a entrada só corre com o Mestre calado (o efeito espera o carregando)", APP.includes('if (fase !== "jogo" || carregando || combate || entradaNaMesa) return;'));
  t("e a mesa abre pela porta única, com a abertura do desfecho", APP.includes('abrirCombate(e.inimigos || [], { pers: p0, situacao: e.desfecho.situacao || "encontro", iniciativa: e.desfecho.iniciativa || null, fugaAberta: e.desfecho.fugaAberta === true })'));
  t("a porta leva a iniciativa e a fuga aberta ao motor", APP.includes("pers: persEntra || fichaViva() || personagem, situacao, iniciativa, fugaAberta,"));
  t("a entrada na mesa tem um aoFim estável (useCallback) e uma rede se a peça calar", APP.includes("const aoFimDaEntrada = useCallback(") && APP.includes("CARTAO_DO_ENCONTRO.entrada.total * 3"));
  /* jogado: a pauta da luta pede a descida e veta os golpes */
  const enc = oEncontroNaEstrada({ tipo: "perigo", criatura: "Lobo", ameaca: "fraco", quantos: 2 }, { pers: { nivel: 3 }, bonus: { percepcao: 0 }, dia: 1, trecho: "A>B" });
  const luta = enc && enc.fase === "sinal" ? avistar(enc, { d20: 1, bonus: { percepcao: 0 }, sorte: () => 0 }) : null;
  const pa = luta ? pautaDoEncontro(luta) : null;
  t("jogado: o sinal falhado com investida chega à pauta como «a luta abre depois»", !!pa && luta.fase === "resolvido" && luta.desfecho.luta === true && /a luta abre depois/.test(pa.acabou[0] || "") && /golpes/.test(pa.naoPode[0] || ""), JSON.stringify(pa));
}

sec("4. as três fases do encontro");
{
  t("o sinal: o pedido de Percepção é o de sempre (oCartaoDoPedido)", APP.includes("oCartaoDoPedido(ep.pedido, ep.pedido.v, { mod: bonusDoEncontro(pv).percepcao || 0"));
  const l = corpo("lerOSinal");
  t("o d20 da bandeja lê o sinal; «Agora não» é o passivo (o 10)", l.includes('const d20 = passivo ? 10 : dadoDoEncontro("encontro-sinal");') && l.includes("avistar(ep, { d20, bonus: bonusDoEncontro(p)"));
  t("o «Rolar» e o «Agora não» do pedido do sinal vão ao sinal", APP.includes("p.chave === ep.pedido.chave) { lerOSinal(false); return; }") && APP.includes("p.chave === ep.pedido.chave) { lerOSinal(true); return; }"));
  t("o caixilho do sinal pousa por cima do pedido", APP.includes('encontroPendente.fase === "sinal" && encontroPendente.sinal') && APP.includes("<SinalNaFolha sinal={encontroPendente.sinal} />"));
  t("a escolha: o cartão das seis, com o veredito de cada uma", APP.includes("escolhasDoEncontro(encontroPendente, { bonus: bonusDoEncontro(p), moedas: p.moedas || 0 })") && APP.includes("<CartaoDoEncontro estado={encontroPendente} escolhas={escolhas}"));
  t("o cartão só depois de o Mestre falar", APP.includes('encontroPendente.fase === "escolha" && !carregando && !entradaNaMesa'));
  t("o toque resolve pela regra (resolverEscolha), com o d20 na bandeja", corpo("escolherNoEncontro").includes('resolverEscolha(ep, id, { d20: dadoDoEncontro("encontro-escolha")') && corpo("escolherNoEncontro").includes("aBandeja(lancamento("));
  const s = corpo("seguirOEncontro");
  t("o resolvido sem luta cobra o preço, recua se é o caso, e retoma a jornada", s.includes("avancarMinutos(horas * 60)") && s.includes("recuarViagem(j, horas * 60)") && s.includes("retomarViagem(j)") && s.includes("moedas: (pv.moedas || 0) - moedas"));
  t("e a criatura fica à vista", s.includes("criaturaAVistaRef.current = jornadaRef.current ? { nome: e.criatura"));
  /* o encontro vai ao save DENTRO da jornada que pausou (`jornada.encontro`): um
     campo de topo novo partia as sessões gravadas de jogar-em-node em todo turno */
  t("o encontro pendente vai ao save na jornada (campo novo e aditivo) e volta no load", corpo("pousarOEncontro").includes("jornadaRef.current = e ? { ...resto, encontro: e } : resto;") && APP.includes("sv.jornada && sv.jornada.encontro && typeof sv.jornada.encontro === \"object\" && sv.jornada.encontro.fase") && !CAMPOS.some((c) => c.campo === "encontroPendente"));
  /* jogado: perante a lenda, voltar atrás está aberto e não pede dado */
  const lenda = oEncontroNaEstrada({ tipo: "perigo", criatura: "Dragão Ancião", ameaca: "lendario", quantos: 1, importante: true }, { pers: { nivel: 14 }, bonus: { percepcao: 30 }, dia: 1, trecho: "A>B" });
  const fuga = lenda && lenda.fase === "escolha" ? resolverEscolha(lenda, "fugir", { bonus: {} }) : null;
  t("jogado: perante o Dragão Ancião a fuga é certa e sem luta", !!fuga && fuga.desfecho && fuga.desfecho.luta === false && fuga.teste === null, JSON.stringify(fuga && fuga.desfecho));
}

sec("5. a intenção no começo da rodada");
{
  const a = corpo("anunciarIntencoes");
  t("anuncia com a mente de sempre, pela semente, e com a fuga", a.includes("intencoesDaRodada(comb, {") && a.includes('sorte: sorteDoTurno("intencoes"), comFuga: true'));
  t("uma vez por rodada (a que já tem a sua não sorteia outra)", a.includes("if (comb.intencoes && comb.intencoes.rodada === rod) return comb.intencoes;"));
  /* pelo efeito da luta que nasce, e não dentro de `abrirCombate`: a porta é
     recortada e jogada byte a byte contra o App de antes (teste-motor-luta) */
  t("a luta nova anuncia a rodada 1 (o efeito da luta que nasce, qualquer porta)", APP.includes("if (aberta === lutaAbertaRef.current) return;") && APP.includes("try { anunciarIntencoes(fichaViva() || personagem); } catch (e) { calou(\"a intenção da rodada 1\", e); }") && !corpo("abrirCombate").includes("anunciarIntencoes("));
  t("a rodada nova anuncia antes do meu golpe", APP.includes("reacaoUsadaRef.current = false;   // nova rodada, reação de novo disponível\n      }\n      /* CB6: a rodada nova anuncia") && APP.includes("anunciarIntencoes(persAtual);"));
  t("o revide cumpre o anunciado (intencoes a turnoDosInimigos)", APP.includes("      intencoes: anunciadas,\n    });"));
  t("foge quem anunciou fugir", APP.includes('anunciadas.some((it) => it && it.inimigo === x.nome && it.tipo === "fugir")'));
  t("quem vai soprar não anda", APP.includes('filter((it) => it && it.tipo === "sopro")') && APP.includes("movimentos: mv0.movimentos.filter((m) => !soprando.has(m.nome))"));
  t("o balanço vai ao registo da rodada", APP.includes("balancoDasIntencoes(ints, acoes,") && APP.includes("setRegistoDaRodada("));
  /* MOVIDA no CB lote 2 (10/11): a lista chega por `intencoesDaMesa`, que
     durante o turno deles dá as ANUNCIADAS (cada passo cumpre o que se viu) e
     fora dele a da rodada, a mesma de antes. */
  t("e a mesa recebe a lista", APP.includes("intencoes={intencoesDaMesa}") && corpoIIFE("intencoesDaMesa").includes("return combate && combate.intencoes && Array.isArray(combate.intencoes.lista) ? combate.intencoes.lista : null;"));
}

sec("6. a previsão do golpe, e andar e atacar");
{
  const p = APP.slice(APP.indexOf("const previsaoNaMesa = (() => {"), APP.indexOf("const andarEAtacar = "));
  t("a previsão é a do motor, com a penalidade do alcance do veredito", p.includes("previsaoDoHeroi(pers, alvo, {") && p.includes("penalidade: noAlcance ? (Number(noAlcance.penalidade) || 0) : 0"));
  t("longe: o caminho e os golpes livres do caminho (andaDe)", p.includes("andaDe: plano ? de : null"));
  t("quem não se alcança nem andando não tem previsão (a peça cala-se)", p.includes("if (!noAlcance && !plano) return null;"));
  t("o plano anda até à primeira casa de onde se alcança", corpo("planoDeAndarAte").includes('passoAteAlcancar(comb.grade, de, alvo, { ocupados, deslocamentoM: restante, ignoraDificil: passo.ignoraDificil, alcanceM, desempate: "passo" })'));
  t("um clique anda e ataca", corpo("andarEAtacar").includes("moverPara(pl.destino)") && corpo("andarEAtacar").includes("declararGolpe(nome);"));
  t("a mesa recebe a previsão, o caminho e os dois gestos", APP.includes("previsaoDoGolpe={previsaoNaMesa ? previsaoNaMesa.previsao : null}") && APP.includes("aoAndarEAtacar={andarEAtacar}") && APP.includes("aoPreverGolpe={(nome) =>"));
}

sec("7. a bandeja e o golpe sentido");
{
  t("o d20 de cada golpe do herói rola na bandeja, com a régua do crítico", APP.includes("try { aBandeja(lancamentoDoAtaque(r, { criticoEm: criticoMinimo(pers) })); } catch (e) { calou("));
  /* MOVIDA no CB lote 2 (10/11): o golpe deles já não vai à mesa dentro do
     laço — guarda-se (`golpesDelesDaVez`) e vai no passo de quem o deu, ou
     todo de uma vez no fim se o turno não se contar. Continua a ser um
     eventoDoGolpe. */
  t("o golpe do herói e o deles viram eventos (eventoDoGolpe)", APP.includes('sentirGolpe(eventoDoGolpe(r, { vidaAntes: alvo.vida, vidaMax: alvo.vidaMax || alvo.vida, lado: "heroi" }));') && APP.includes("golpesDelesDaVez.push(eventoDoGolpe(a.r, {"));
  t("o som não toca no App (a grade toca-o)", !APP.includes("tocarGolpe("));
  const s = corpo("sentirGolpe");
  t("uma rajada só por clique, com chave única, limpa a cada rajada", s.includes('chave: "g" + rajadaNRef.current') && s.includes("rajadaRef.current = []; rajadaAgendadaRef.current = false; setGolpesDaRajada("));
}

sec("8. o fecho uma vez por luta");
{
  const g = corpo("aplicarGolpeDoJogador");
  t("a queda pergunta pela regra (oFechoPergunta), não por toda queda", g.includes("oFechoPergunta({ alvo, r, inimigos: lista, peloAliado: false, perguntas: perguntasAgora, lembrada: fe.lembrada || null, preferencia: pref })"));
  t("as perguntas contam-se por luta (combate.fecho)", g.includes("perguntasAgora += 1") && g.includes("fecho: { ...fe, perguntas: perguntasAgora }"));
  t("a queda do meio aplica a lembrada e mostra o chip", g.includes("porAlvo[alvo.nome] = f.escolha") && g.includes("mostrarQuedasDoMeio(doMeio)"));
  t("cada queda com a sua escolha", APP.includes("const escolhaDeste = (escolhaEComoFez && escolhaEComoFez.porAlvo && escolhaEComoFez.porAlvo[alvo.nome]) || escolhaAplicada;"));
  t("a resposta do cartão passa a ser a lembrada", APP.includes('lembrada: escolhaId === "letal" ? "letal" : "nao_letal"'));
  t("a queda pela mão do aliado nunca pergunta", APP.includes("if (quedasPendentesComp.length && !QUANDO_O_FECHO_PERGUNTA.peloAliado) {") && APP.includes('if (escolhaDoAliado) { finalizarRodada(escolhaDoAliado, ""); return; }'));
  t("o chip muda só aquela queda, pela porta única, e o Narrador sabe", corpo("mudarQueda").includes("aplicarEscolha(e, escolha, { semente: sementeDaFuga(comb) })") && corpo("mudarQueda").includes("golpeFinalEnvelopeRef.current ="));
  t("e o véu do último golpe cobre o campo menos a casa dele", APP.includes("ultimoGolpe={golpeFinalPendente && Array.isArray(golpeFinalPendente.quedas)"));
  /* jogado: a segunda queda «último» numa luta que já perguntou não pergunta */
  const ultimo = { nome: "Bandido", vida: 5, vidaMax: 10 };
  const r = { tipo: "ataque", resultado: "acerta", dano: 8 };
  const a1 = oFechoPergunta({ alvo: ultimo, r, inimigos: [ultimo], perguntas: 0, preferencia: "perguntar" });
  const a2 = oFechoPergunta({ alvo: ultimo, r, inimigos: [ultimo], perguntas: 1, preferencia: "perguntar" });
  t("jogado: a luta pergunta uma vez, e depois aplica a lembrada", a1.pergunta === true && a2.pergunta === false && a2.escolha === "nao_letal", JSON.stringify([a1, a2]));
}

sec("8b. CB lote 2: o d20 no alvo e o turno deles contado");
{
  /* o urgente: depois de cada ataque a Bandeja do golpe tapava a fileira dos verbos */
  t("`dado` leva só o teste que o Mestre pede (a Bandeja do golpe saiu da barra)", APP.includes("      dado={dadoDaBatalha}\n") && !APP.includes('key="bandeja-da-luta"'));
  t("com o teste pendente, os verbos já estão impedidos (bloqueado = carregando || rolagem)", APP.includes("const bloqueado = carregando || !!rolagem;"));
  t("o d20 do golpe rola no alvo (`lance`) e continua na bandeja", APP.includes("lance={lanceNaLuta}") && APP.includes("porNoLance(r, alvo.nome, criticoMinimo(pers));") && APP.includes("try { aBandeja(lancamentoDoAtaque(r, { criticoEm: criticoMinimo(pers) })); }"));
  const s = corpo("sentirGolpe");
  t("o lance sai no MESMO lote que os golpes (o número espera pelo dado)", /setGolpesDaRajada\(l\.length \? l : null\); \} catch \(e\) \{ calou\("a rajada na mesa", e\); \}\n\s*\/\*[^*]*\*\/\n\s*soltarOLance\(\);/.test(s));
  const pl = corpo("porNoLance");
  t("o lance tem a forma da grade: alvo, n, dados (natural, bonus, total, defesa, desfecho), acertam, criticoEm", pl.includes("{ natural: nat, bonus:") && pl.includes("defesa:") && pl.includes("desfecho }") && pl.includes("acertam:") && pl.includes("criticoEm: criticoEm || 20"));
  t("dois golpes no mesmo alvo: dois d20 na mesma pílula", pl.includes("ja.findIndex((l) => l.alvo === alvoNome)") && pl.includes("dados: [...l.dados, d]"));
  /* o turno deles */
  const fz = APP.slice(APP.indexOf("const finalizarRodada = (escolhaDaRodada, comoFezDaRodada) => {"), APP.indexOf("A RODADA SUSPENDE AQUI"));
  const iAnuncio = fz.indexOf('calou("a intenção da rodada nova"'), iPassos = fz.indexOf("passosDoTurno(acoes, {"), iEntrega = fz.indexOf("entregar({ pers: persAtual");
  t("passosDoTurno corre DEPOIS de o estado estar aplicado (no fim da rodada, depois do anúncio novo)", iAnuncio > 0 && iPassos > iAnuncio && iPassos < iEntrega);
  t("com o retrato da entrada, as fugas, o anunciado e o grupo", fz.includes("antes: inimigosAntesDoTurno.filter(") && fz.includes("fugas: fugasDoTurno, intencoes: anunciadas || []") && fz.includes("vidas: vidasAntesDoTurno, vidaMax: vidaMaxAntesDoTurno") && fz.includes("companheiros: acoesComp") && APP.includes("fugasDoTurno.push({ nome: e.nome, r, morreu });"));
  t("sem turno contado, os golpes deles vão à mesa de uma vez (a rajada de sempre)", fz.includes("if (!contou) for (const ev of golpesDelesDaVez) { try { sentirGolpe(ev); }"));
  t("o relógio é um setTimeout por passo (nunca um contador de quadros), pela duração planeada", APP.includes("tid = setTimeout(() => avancarOTurnoDeles(td.id, prox),") && corpo("planoDoTurno").includes("duracaoDosPassos(td.passos, { velocidade: turnoDeles2x ? 2 : 1, reduzido: !!reduzidoRef.current, tabela: TURNO_DELES })"));
  t("a mesa recebe o turno com Saltar e 2×; saltar vai ao fim", APP.includes("turnoDeles={turnoNaMesa}") && corpoIIFE("turnoNaMesa").includes("aoSaltar: saltarOTurnoDeles, aoAcelerar: acelerarOTurnoDeles") && corpo("saltarOTurnoDeles").includes("porOTurno(null)"));
  t("o 2× é preferência do navegador (TURNO_DELES.preferencia), nunca do save", corpo("acelerarOTurnoDeles").includes("localStorage.setItem(TURNO_DELES.preferencia,") && APP.includes('localStorage.getItem(TURNO_DELES.preferencia) === "1"'));
  t("durante o turno, os golpes que a mesa vê são os do passo (golpesDaMesa)", APP.includes("golpes={golpesDaMesa}") && APP.includes('evs.push({ ...gp.evento, chave: "t" + td.id + ":" + i + ":" + j })'));
  t("na espera, a mesa mostra-os onde estavam", corpoIIFE("combateDaMesa").includes("td.indice >= 0") && APP.includes("combate={combateDaMesa}"));
  t("a luta nova nasce sem lance nem turno", APP.includes("setLanceNaLuta(null); lanceDaRajadaRef.current = []; porOTurno(null);"));
  /* o resto do lote */
  t("a economia da vez dá ao painel o recurso de cada verbo", APP.includes("recursosDosVerbos={recursosDosVerbosDaMesa}") && corpoIIFE("recursosDosVerbosDaMesa").includes("economiaDaVez(combate, personagem, { passoTotalM: passoDaBatalha.passoTotal })"));
  t("a linha do caminho é caminhoComProvocacoes, com o que resta andar", corpo("planoDeAndarAte").includes("caminhoComProvocacoes(comb.grade, de, { x: dest.x, y: dest.y }, comb.inimigos || [], { aliados: comb.aliados || [], deslocamentoM: restante,"));
  t("o golpe da habilidade vai à bandeja e à mesa (golpeDaHabilidade)", APP.includes("golpeDaHabilidade(r, { habilidade: h, criticoEm: criticoMinimo(pers), vidaAntes: alvo.vida, vidaMax: alvo.vidaMax || alvo.vida, atingidos })") && APP.includes("for (const ev of gh.eventos || []) sentirGolpe(ev);"));
  t("a área não tem d20 do herói no alvo (§CB 17.1)", APP.includes("if (!(ehArea(h) || h.area)) porNoLance(r, alvo.nome, criticoMinimo(pers));"));
}

sec("9. tudo em calou");
{
  const PECAS = ["pousarOEncontro", "bonusDoEncontro", "estradaDoTrecho", "porNaPautaDoTurno", "narrarOEncontro", "seguirOEncontro", "lerOSinal", "escolherNoEncontro", "sentirGolpe", "lembradaDaLuta", "mostrarQuedasDoMeio", "mudarQueda", "anunciarIntencoes", "planoDeAndarAte", "andarEAtacar",
    /* CB lote 2 */
    "msDoLance", "porNoLance", "soltarOLance", "planoDoTurno", "contarOTurnoDeles", "comecarOTurnoDeles", "avancarOTurnoDeles", "saltarOTurnoDeles", "acelerarOTurnoDeles"];
  const sem = PECAS.filter((n) => { const c = corpo(n); return !c || !c.includes("try {") || !c.includes("calou("); });
  t(`as ${PECAS.length} peças novas correm em try/calou`, sem.length === 0, sem.join(", "));
  const SITIOS = ["o encontro da estrada", "a jornada parada pelo encontro", "a intenção antes do revide", "o sopro não anda", "o golpe deles na mesa", "o registo da rodada", "a intenção da rodada nova", "a queda pela mão do aliado", "o fecho uma vez por luta", "o d20 do golpe na bandeja", "o teu golpe na mesa", "a escolha lembrada do cartão", "o pedido do sinal na estrada", "o d20 do sinal", "o sinal: agora não", "abrir a mesa do encontro", "a entrada na mesa do encontro", "a previsão do golpe", "o cartão do encontro", "a mesa nova nasce limpa", "a intenção da rodada 1", "o encontro pendente no load",
    /* CB lote 2 */
    "o golpe da habilidade na mesa", "o retrato antes do turno deles", "o turno deles contado", "a linha do caminho", "o relógio do turno deles", "o golpe do passo deles", "o turno deles na mesa", "a mesa antes do turno deles", "as intenções na mesa", "a economia da vez"];
  const faltam = SITIOS.filter((s) => conta('calou("' + s + '"') < 1);
  t(`e os ${SITIOS.length} sítios de fiação dentro de funções que já existiam também`, faltam.length === 0, faltam.join(", "));
}

console.log(`\na fase CB no App: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
