/* a-cena-do-jogo.js (o preparo da fiação do Mestre novo · 18/11/2026) — «a cena do jogo».

   O desenho é mente/lancamento/o-mestre-vivo.md §14.1 e §15. A régua do
   momento (motor/a-regua-do-momento.js) lê uma cena (cena-do-momento.js);
   até aqui quem escrevia a cena eram as suítes e o exame. Este módulo é a
   ponte com o jogo: recebe um RETRATO simples do que o App já tem nos refs
   (quem está aqui, o lugar, a hora, o clima, a masmorra, o encontro, os
   relógios, o grupo, os passos da quest…) e devolve a cena no formato que
   a régua lê — ou `null`, quando o retrato não basta, e aí o jogo fica
   exatamente como hoje.

   Três leis, as da casa:
   - CADA ESTADO TEM UMA FONTE, numa tabela (`DERIVACAO_DA_CENA`: o estado,
     de quem é, de onde vem no jogo, a regra). O estado que o jogo ainda não
     sabe escrever NÃO é inventado: fica em `ESTADOS_SEM_FONTE`, com o
     porquê. A suíte confere que as duas listas, juntas, são a tabela fechada
     da cena — nem um estado a mais, nem um a menos.
   - A QUEST SÓ ESCREVE ESTADO, NUNCA PEDE DADO. A etapa ativa pode declarar
     quem esconde algo, o que está trancado ou vigiado (`retrato.quest`), e
     os passos dela dizem onde há rastro e onde a besta guarda o covil
     (`retrato.passos`). Isso vira estado da cena, e é o ÚNICO ponto de
     contato da quest com o Mestre: o retrato nunca chega à régua nem ao
     catálogo, só a cena que sai dele.
   - PURO: sem sorte, sem relógio, sem React. O mesmo retrato dá a mesma
     cena em qualquer máquina; nada do que entra é mexido; lixo devolve
     `null` e nunca lança.

   E a função única que o App vai chamar, `chamadoDoMomento(frase, leitura,
   retrato, ctx)`: o catálogo lê a frase, a cena sai do retrato, a régua
   decide, e o chamado sai na MESMA forma de `oChamado` — a conversa
   incluída, que até aqui seguia pela escada sem chamado e agora ganha o
   número da escada e o preço dito antes do dado. `chamadoQueOMundoProvoca`
   é o dado espontâneo: o mundo mudou entre dois retratos, e o Mestre pede o
   teste que a cena nova chama. */
import { lerAcao, dificuldadePorId, EFEITOS_DA_FALHA } from "./desafios.js";
import { valeRolagem, oQueACenaChama } from "./motor/a-regua-do-momento.js";
import { oChamado, porQueNaoChama, O_CHAMADO, chamadoDaRolagem } from "./motor/o-mestre-chama.js";
import { lerCena, estadoPorId } from "./cena-do-momento.js";
import { ESCADA_DA_RELACAO } from "./social.js";
import { estadoSemVolta } from "./npcs.js";
import { condicaoPorId } from "./condicoes.js";
import { ehNoite } from "./calendario.js";
import { abertoAgora, tipoDoSitio } from "./elenco-do-lugar.js";
import { noEscuro } from "./masmorras.js";
import { caidosDoGrupo } from "./socorro.js";
import { noLugarDoPasso } from "./a-quest-manda.js";
import { QUEM_FALA } from "./encontro-na-estrada.js";
import { DORMINDO } from "./gente-por-dentro.js";
import { periciaPorId } from "./pericias.js";

const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const sem = (x) => txt(x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : null);
const mesmo = (a, b) => !!sem(a) && sem(a) === sem(b);

/* ---------------- OS NÚMEROS E AS LISTAS DA DERIVAÇÃO ----------------
   Tudo o que a derivação compara sai daqui (a suíte confere cada id contra
   a tabela de onde ele vem: CLIMAS, ELENCO_DO_LUGAR, os tipos de relógio, as
   condições, a escada da relação).
   `relacaoDisposta`: os laços da escada (social.js) acima do «neutro» —
     cônjuge, romance, família, aliado, amigo, companheiro;
   `relacaoDesconfiada` / `relacaoHostil`: os dois degraus abaixo do
     «desconhecido»;
   `condicaoDoMedo`: a condição que faz quem a carrega ceder (condicoes.js);
   `climaQueMolha`: o céu que deixa o chão liso ao ar livre (a «lama» da
     tabela de CLIMAS); `climaQueCobre`: o céu que tapa sol e estrela;
     `climaQueFere`: os raios da tempestade;
   `sitiosAoArLivre`: os tipos de lugar (elenco-do-lugar.js) que não têm
     teto; o lugar sem função conhecida (a praça, o largo, a rua) também não;
   `sitiosPublicos`: os lugares onde, abertos e de dia, há olhos em toda
     parte; `territorioSempre`: os que têm dono de plantão a qualquer hora
     (fechado fora do expediente, qualquer lugar vira território de alguém);
   `faltaParaAPressa`: quantos segmentos faltam num relógio para a cena
     sentir o aperto (`relogioDaPressa`: a ameaça, que enche sozinha;
     `relogioQueSeAproxima`: a caçada, que fecha o cerco). */
export const REGRAS_DA_CENA_DO_JOGO = Object.freeze({
  relacaoDisposta: Object.freeze(ESCADA_DA_RELACAO.slice(0, ESCADA_DA_RELACAO.indexOf("neutro"))),
  relacaoDesconfiada: Object.freeze(["rival"]),
  relacaoHostil: Object.freeze(["inimigo"]),
  condicaoDoMedo: "amedrontado",
  climaQueMolha: Object.freeze(["chuva", "tempestade", "granizo"]),
  climaQueCobre: Object.freeze(["nublado", "chuva", "neblina", "tempestade", "garoa", "granizo"]),
  climaQueFere: Object.freeze(["tempestade"]),
  sitiosAoArLivre: Object.freeze(["mercado", "docas", "cemitério", "arena", "portao"]),
  sitiosPublicos: Object.freeze(["taverna", "mercado", "templo", "docas", "arena", "casa de banhos", "portao"]),
  territorioSempre: Object.freeze(["quartel", "cadeia"]),
  faltaParaAPressa: 1,
  relogioDaPressa: Object.freeze(["ameaca"]),
  relogioQueSeAproxima: Object.freeze(["cacada"]),
});
const R_ = REGRAS_DA_CENA_DO_JOGO;

/* ---------------- O RETRATO ----------------
   O que o App passa, campo a campo, e de onde cada um vem hoje. Tudo
   opcional. Sem NENHUM dos campos de `ONDE_DO_RETRATO` o retrato não diz
   onde o herói está, e `cenaDoJogo` devolve `null` (o Mestre de hoje).
   A suíte lê esta tabela de volta: todo campo que a derivação usa está
   aqui, com a fonte. */
export const FORMA_DO_RETRATO = Object.freeze({
  lugar: "lugarRef.current ({ nome, tipo?, dentroDe?, distancia? }) — o lugar onde o herói está",
  cidade: "cidadeAtualRef.current",
  jornada: "!!jornadaRef.current — na estrada",
  minuto: "minutoRef.current — a hora do dia, em minutos",
  clima: "climaRef.current (o id de CLIMAS, ou { id, rotulo })",
  pessoas: "quemAgeAqui(quemEstaAqui(...)) cruzado com npcsRef.current[nome]: { nome, papel, relacao, status, agora (a rotina de fichaDaPessoa), doPosto (veio de doSitio), condicoes }",
  grupo: "(fichaViva() || personagem).grupo — os companheiros, com vida, morrendo e estavel (socorro.js)",
  inimigos: "combateRef.current.inimigos — { nome, vida, vidaMax, derrotado, desacordado, rendido, condicoes }",
  encontro: "encontroPendenteRef.current — o encontro da estrada em três tempos (encontro-na-estrada.js)",
  masmorra: "masmorraRef.current — a sala atual, as tochas",
  achado: "!!(ctxDesafio().achadoDe('percepcao') || ctxDesafio().achadoDe('intelecto')) — o achado do lugar ou do passo",
  segredos: "segredosGuardados(espinhaRef.current, mundoDaBase()) — o que a espinha guarda, e quem do lugar sabe",
  favorAqui: "o livro de fatos guarda `favor` no lugar atual (factosRef.current.lugares[id].favor)",
  relogios: "relogiosRef.current — { tipo, segmentos, cheios }",
  heroi: "{ condicoes: (fichaViva() || personagem).condicoes }",
  passos: "passosDasQuestsAgora() — os passos ativos (a quest)",
  onde: "ondeDoPasso() — { lugar, dentroDe, cidade, foraDosMuros } (a quest)",
  quest: "{ esconde: [nomes], trancado: [coisas], vigiado: [coisas] } — o que a etapa ativa declara (a quest; campo novo, que nenhuma etapa declara ainda)",
});
export const ONDE_DO_RETRATO = Object.freeze(["lugar", "cidade", "jornada", "masmorra", "encontro"]);
/* os campos que são da quest: tirá-los do retrato nunca pode mudar o
   chamado quando a cena que sai é a mesma (a trava de §5) */
export const CAMPOS_DA_QUEST = Object.freeze(["passos", "onde", "quest"]);

const idDoClima = (c) => sem(obj(c) ? (c.id || c.rotulo) : c);
const idsDeCondicao = (lista) => arr(lista).map((c) => sem(typeof c === "string" ? c : obj(c) ? c.id : "")).filter(Boolean);
const temCondicao = (x, id) => idsDeCondicao(x.condicoes).includes(id);
const vidaDe = (x) => num(x.vida);

/* O retrato lido: só o que a derivação usa, já normalizado. Nada aqui é
   copiado de volta para fora. */
function lerRetrato(s) {
  const lugar = obj(s.lugar) && txt(s.lugar.nome) ? s.lugar : txt(s.lugar) ? { nome: txt(s.lugar) } : null;
  const mm = obj(s.masmorra) && !s.masmorra.encerrada && Array.isArray(s.masmorra.salas) ? s.masmorra : null;
  const sala = mm ? mm.salas.find((x) => obj(x) && x.id === mm.atual) || null : null;
  const enc = obj(s.encontro) && txt(s.encontro.criatura) && !s.encontro.desfecho && s.encontro.fase !== "desfecho" ? s.encontro : null;
  const jornada = s.jornada === true;
  const cidade = txt(s.cidade);
  const minuto = num(s.minuto);
  const tipo = lugar ? (() => { try { return tipoDoSitio(lugar); } catch { return ""; } })() : "";
  const arredores = !!lugar && lugar.distancia === "arredores";
  const dentroDosMuros = !!cidade && !jornada && !mm && !arredores;
  const aoArLivre = !mm && (jornada || !cidade || arredores || !lugar || (!txt(lugar.dentroDe) && (!tipo || R_.sitiosAoArLivre.includes(tipo))));
  return {
    lugar, tipo, mm, sala, enc, jornada, cidade, minuto, dentroDosMuros, aoArLivre,
    noite: minuto != null && ehNoite(((minuto % 1440) + 1440) % 1440),
    clima: idDoClima(s.clima),
    achado: s.achado === true,
    favorAqui: s.favorAqui === true,
    segredos: arr(s.segredos).filter(obj),
    relogios: arr(s.relogios).filter(obj),
    heroi: obj(s.heroi) ? s.heroi : {},
    passos: arr(s.passos).filter(obj),
    onde: obj(s.onde) ? s.onde : null,
    quest: obj(s.quest) ? s.quest : {},
  };
}

/* quem fala é gente (QUEM_FALA, encontro-na-estrada.js); o resto é bicho */
const fala = (nome) => QUEM_FALA.some((q) => sem(nome).includes(sem(q)));
const vivoDeLuta = (x) => !x.derrotado && (vidaDe(x) == null || vidaDe(x) > 0);

/* os seres do retrato, antes dos estados: { nome, papel, ...a ficha, e as
   marcas de onde veio (doGrupo, deLuta, doCovil) } */
function seresDe(s, R) {
  const pessoas = [], criaturas = [];
  const ja = (lista, nome) => lista.some((x) => mesmo(x.nome, nome));
  const caidos = (() => { try { return caidosDoGrupo(arr(s.grupo)); } catch { return []; } })();
  for (const g of arr(s.grupo)) {
    if (!obj(g) || !txt(g.nome) || g.invocada || ja(pessoas, g.nome)) continue;
    /* só quem tem a vida no retrato: caidosDoGrupo lê a vida ausente como 0 */
    const caido = num(g.vida) != null ? caidos.find((c) => mesmo(c.nome, g.nome)) : null;
    pessoas.push({ ...g, nome: txt(g.nome), papel: txt(g.papel || g.conceito), doGrupo: true, caido: caido ? caido.estado : "" });
  }
  for (const p of arr(s.pessoas)) {
    if (!obj(p) || !txt(p.nome) || ja(pessoas, p.nome)) continue;
    pessoas.push({ ...p, nome: txt(p.nome), papel: txt(p.papel || p.rotulo) });
  }
  for (const i of arr(s.inimigos)) {
    if (!obj(i) || !txt(i.nome)) continue;
    if (fala(i.nome)) { if (!ja(pessoas, i.nome)) pessoas.push({ ...i, nome: txt(i.nome), papel: txt(i.papel), deLuta: true }); }
    else if (vivoDeLuta(i) && !ja(criaturas, i.nome)) criaturas.push({ ...i, nome: txt(i.nome), deLuta: true });
  }
  if (R.enc) {
    const nome = txt(R.enc.criatura);
    if (fala(nome)) { if (!ja(pessoas, nome)) pessoas.push({ nome, papel: "", doEncontro: true }); }
    else if (!ja(criaturas, nome)) criaturas.push({ nome, doEncontro: true });
  }
  /* a quest: a besta do confronto, quando o herói está no covil dela (o
     passo diz quem e onde; a-quest-manda.js, S7) */
  for (const p of R.passos) {
    const c = obj(p.confronto) ? p.confronto : null;
    if (!c || !obj(c.covil) || !R.onde) continue;
    let noCovil = false;
    try { noCovil = noLugarDoPasso(c.covil, R.onde); } catch { noCovil = false; }
    const nome = txt(c.quem) || txt(c.nome);
    if (!noCovil || !nome) continue;
    const ja2 = criaturas.find((x) => mesmo(x.nome, nome));
    if (ja2) ja2.doCovil = true; else criaturas.push({ nome, doCovil: true });
  }
  return { pessoas, criaturas };
}

const nomesDaGenteDosSegredos = (R) => R.segredos.flatMap((x) => arr(x.gente).map((g) => (obj(g) ? g.nome : g)));
const nomesDaQuest = (R, campo) => arr(R.quest[campo]).map((n) => (obj(n) ? n.nome : n)).filter((n) => !!txt(n));
const relogioPerto = (R, tipos) => R.relogios.some((r) => tipos.includes(r.tipo) && num(r.segmentos) != null && num(r.cheios) != null
  && r.cheios < r.segmentos && r.segmentos - r.cheios <= R_.faltaParaAPressa);
const salaDe = (R, tipo) => !!R.sala && R.sala.tipo === tipo && R.sala.resolvida !== true;
const segredoDaSala = (R) => (R.sala && obj(R.sala.segredo) && !R.sala.segredo.revelado ? R.sala.segredo : null);

/* ---------------- A DERIVAÇÃO ----------------
   Uma linha por estado que o jogo sabe escrever: `estado`, `de` (o dono, o
   mesmo de ESTADOS_DA_CENA), `fonte` (de onde vem no jogo, em palavras —
   bastidor, nunca vai à tela), e `se`:
     pessoa / criatura: se(ser, R) — o ser do retrato e o retrato lido;
     coisa:             se(R) → [nomes das coisas que carregam o estado];
     cena:              se(R) → bool.
   A ordem das coisas é a da tabela: a primeira coisa é a que a régua lê
   como «a coisa» da ação (haOposicao), e por isso a porta vem primeiro. */
const L = (estado, de, fonte, se) => Object.freeze({ estado, de, fonte, se });
export const DERIVACAO_DA_CENA = Object.freeze([
  /* pessoa */
  L("disposta", "pessoa", "a relação da pessoa (npcsRef: relacao), um laço acima do «neutro» na escada da relação (social.js)",
    (x) => R_.relacaoDisposta.includes(sem(x.relacao))),
  L("desconfiada", "pessoa", "a relação: rival", (x) => R_.relacaoDesconfiada.includes(sem(x.relacao))),
  L("hostil", "pessoa", "a relação: inimigo; ou o inimigo de pé na luta (combateRef)",
    (x) => R_.relacaoHostil.includes(sem(x.relacao)) || (!!x.deLuta && vivoDeLuta(x) && x.rendido !== true && x.desacordado !== true)),
  L("com_medo", "pessoa", "o inimigo que se rendeu (sem-espada.js: rendido) ou a condição amedrontado (condicoes.js)",
    (x) => x.rendido === true || temCondicao(x, R_.condicaoDoMedo)),
  L("esconde_algo", "pessoa", "quem do lugar sabe o que a espinha guarda (segredosGuardados: gente), ou quem a etapa da quest declara que esconde",
    (x, R) => [...nomesDaGenteDosSegredos(R), ...nomesDaQuest(R, "esconde")].some((n) => mesmo(n, x.nome))),
  L("deve_favor", "pessoa", "o livro de fatos guarda um favor deste lugar ao herói (favor), e a pessoa é do posto (doSitio)",
    (x, R) => R.favorAqui && x.doPosto === true),
  L("do_grupo", "pessoa", "os companheiros da ficha (personagem.grupo)", (x) => x.doGrupo === true),
  L("morta", "pessoa", "o status sem volta da ficha (npcs.js: estadoSemVolta), ou o inimigo caído na luta sem ter sido poupado",
    (x) => estadoSemVolta(x.status) || (!!x.deLuta && !vivoDeLuta(x) && x.desacordado !== true && x.rendido !== true)),
  L("desacordada", "pessoa", "o poupado do golpe final (golpe-final.js: desacordado), ou o companheiro caído e estável (socorro.js)",
    (x) => x.desacordado === true || x.caido === "estavel"),
  L("moribunda", "pessoa", "o companheiro caído sangrando (socorro.js: caidosDoGrupo)", (x) => x.caido === "sangrando"),
  L("dormindo", "pessoa", "a rotina da pessoa a esta hora (gente-por-dentro.js: DORMINDO)", (x) => txt(x.agora) === DORMINDO),
  /* criatura */
  L("ferida", "criatura", "a vida do inimigo na luta abaixo da máxima (combateRef)",
    (x) => vidaDe(x) != null && num(x.vidaMax) != null && vidaDe(x) > 0 && vidaDe(x) < x.vidaMax),
  L("assustada", "criatura", "a condição amedrontado, ou o bicho que se rendeu", (x) => x.rendido === true || temCondicao(x, R_.condicaoDoMedo)),
  L("territorial", "criatura", "a besta do confronto da quest, com o herói no covil dela (a-quest-manda.js: confronto)", (x) => x.doCovil === true),
  /* coisa — a porta primeiro: é «a coisa» que a régua lê */
  L("trancado", "coisa", "fora da masmorra, a tranca que o mundo deriva de toda porta (desafios.js: trancaDe); na masmorra, só a sala de enigma por abrir; e o que a etapa da quest declara trancado",
    (R) => [...((R.mm ? salaDe(R, "enigma") : true) ? ["porta"] : []), ...nomesDaQuest(R, "trancado")]),
  L("vigiado", "coisa", "o que a etapa da quest declara vigiado (o mundo ainda não guarda a ronda)", (R) => nomesDaQuest(R, "vigiado")),
  L("armadilhado", "coisa", "a sala de armadilha da masmorra que não disparou, ou o segredo da sala que é perigo e não foi visto (masmorras.js)",
    (R) => ((R.sala && R.sala.tipo === "armadilha" && R.sala.resolvida !== true && !R.sala.disparou) || (segredoDaSala(R) && segredoDaSala(R).perigo) ? ["a sala"] : [])),
  L("ha_algo_escondido", "coisa", "o achado do lugar ou do passo (achadoDe, a pergunta que o catálogo já faz), ou o segredo da sala da masmorra ainda não revelado",
    (R) => (R.achado || (segredoDaSala(R) && !segredoDaSala(R).perigo) ? ["o lugar"] : [])),
  L("escuro", "coisa", "a masmorra sem tochas (masmorras.js: noEscuro), ou a noite ao ar livre (calendario.js: ehNoite)",
    (R) => ((R.mm ? noEscuro(R.mm) : R.aoArLivre && R.noite) ? ["o lugar"] : [])),
  L("escorregadio", "coisa", "o céu que molha (CLIMAS: chuva, tempestade, granizo), ao ar livre", (R) => (R.aoArLivre && R_.climaQueMolha.includes(R.clima) ? ["o chão"] : [])),
  L("rastro_fresco", "coisa", "o sinal do encontro da estrada que é rastro, antes de a criatura ser vista (encontro-na-estrada.js)",
    (R) => (R.enc && R.enc.fase === "sinal" && obj(R.enc.sinal) && R.enc.sinal.tipo === "rasto" ? ["o rastro"] : [])),
  L("rastro_velho", "coisa", "o passo de rastro da quest, com o herói num lugar dele (a quest não guarda a idade: o rastro é de antes de o herói chegar)",
    (R) => (R.onde && R.passos.some((p) => p.especie === "rasto" && arr(p.lugares).some((l) => { try { return noLugarDoPasso(l, R.onde); } catch { return false; } })) ? ["o rastro"] : [])),
  /* a cena */
  L("com_pressa", "cena", "um relógio de ameaça a um segmento de encher (relogios.js)", (R) => relogioPerto(R, R_.relogioDaPressa)),
  L("com_testemunhas", "cena", "dentro dos muros, de dia, na rua ou num lugar público aberto (elenco-do-lugar.js: abertoAgora)",
    (R) => R.dentroDosMuros && !R.noite && (!R.lugar || (R_.sitiosPublicos.includes(R.tipo) && abertoAgora(R.tipo, R.minuto)))),
  L("territorio_de_alguem", "cena", "dentro dos muros, num lugar de plantão (quartel, cadeia) ou num lugar fechado a esta hora",
    (R) => R.dentroDosMuros && !!R.tipo && (R_.territorioSempre.includes(R.tipo) || !abertoAgora(R.tipo, R.minuto))),
  L("perigo_fisico", "cena", "a tempestade ao ar livre (CLIMAS: «raios»)", (R) => R.aoArLivre && R_.climaQueFere.includes(R.clima)),
  L("algo_se_aproxima", "cena", "um relógio de caçada a um segmento de encher (relogios.js: «fecha o cerco»)", (R) => relogioPerto(R, R_.relogioQueSeAproxima)),
  L("ceu_encoberto", "cena", "o céu fechado ao ar livre (CLIMAS)", (R) => R.aoArLivre && R_.climaQueCobre.includes(R.clima)),
  L("heroi_penalizado", "cena", "uma condição do herói que dá desvantagem (condicoes.js: desvantagem)",
    (R) => idsDeCondicao(R.heroi.condicoes).some((id) => { const c = condicaoPorId(id); return !!(c && c.desvantagem); })),
]);

/* ---------------- O QUE O JOGO AINDA NÃO SABE ESCREVER ----------------
   Cada estado da tabela da cena sem linha acima, e o porquê. Três razões:
   (1) não há fonte no jogo; (2) a fonte é de UMA coisa ou de UM assunto, e a
   régua lê a marca na cena INTEIRA — escrita pela fonte, calaria dados que
   nada têm a ver (o «já resolvido» de uma pessoa calaria a escalada do
   muro); (3) o catálogo já faz o trabalho, e o estado o desfaria. */
const S = (estado, porque) => Object.freeze({ estado, porque });
export const ESTADOS_SEM_FONTE = Object.freeze([
  S("motivo_para_negar", "é da fala, não da pessoa: como estado, sem o tamanho do pedido, faria a pergunta de cortesia ao guarda rolar — desde 19/11 a régua o lê por frase, no alvo da fala, pelo papel e pelo tamanho do pedido (MOTIVO_PARA_NEGAR_DO_ALVO, motor/a-regua-do-momento.js)"),
  S("ja_convencida", "o catálogo já devolve «isso você já conseguiu» pelo livro de tentativas; e a régua lê a marca na cena inteira (jaResolvido calaria toda ação de outra família)"),
  S("faminta", "o bestiário e o encontro não guardam o apetite da criatura"),
  S("acuada", "nada no jogo guarda que a criatura está sem saída"),
  S("mansa", "nada no jogo guarda o bicho manso (a montaria, o cão da casa)"),
  S("fragil", "o mundo não guarda a firmeza do que se pisa ou se segura"),
  S("suspeito", "o mundo não marca a coisa que destoa; o achado já entra como «algo escondido»"),
  S("do_heroi", "é da coisa que a frase nomeia; sem casar a frase com o inventário, a régua lê a marca na cena inteira e calaria todo saber"),
  S("raro_de_achar", "é da coisa que a frase procura (a raridade do item); a régua lê a marca na cena inteira"),
  S("coisa_comum", "é da coisa que a frase nomeia; a régua lê a marca na cena inteira e calaria todo saber"),
  S("selado", "o portão do chefe da masmorra abre com a chave, não é impossível; e a régua lê a marca na cena inteira (calaria toda escalada da sala)"),
  S("sem_resistencia", "é de uma coisa (a passagem que já cedeu); a régua lê a marca na cena inteira e calaria o baú da mesma sala"),
  S("a_vista", "o jogo não guarda o que a narração já mostrou; e a régua lê a marca na cena inteira"),
  S("rastro_obvio", "a quest e o encontro não guardam o quanto o rastro salta aos olhos; e a marca «à vista» é lida na cena inteira"),
  S("em_movimento", "a viagem anda por trechos resolvidos entre turnos: o herói não age com o veículo em marcha"),
  S("ameacado", "o motor da consequência ainda não escreve o tranco (o barco virou, a queda) como estado"),
  S("som_claro", "o jogo não guarda o que há entre o herói e a fonte do som"),
  S("som_abafado", "o jogo não guarda o que há entre o herói e a fonte do som"),
  S("assunto_raro", "o livro de fatos não marca o assunto que nem todo mundo reconhece"),
  S("ja_testado", "o livro de tentativas já cala isto no catálogo (jaTentou, vasculhado); o estado calaria também a via nova que o catálogo reabre"),
  S("ja_resolvido", "a etapa fechada é da quest inteira; a régua lê a marca na cena inteira e calaria todo dado da cena"),
  S("heroi_treinado", "é por assunto (o campo que o herói estudou): a ficha guarda perícias, não assuntos — e a régua ainda não lê a marca"),
  S("heroi_ja_sabe", "o saber da ficha já entra por ctx.saber (saberComum, jaSabeOAssunto); o estado sem assunto calaria todo saber"),
  S("heroi_tem_alavanca", "é de uma porta ou de uma pessoa (a chave que abre ISTO); a régua lê a marca na cena inteira"),
]);

/* ---------------- A CENA DO JOGO ----------------
   O retrato → a cena no formato da régua (lida e congelada por lerCena), ou
   null quando o retrato não diz onde o herói está. Nunca lança. */
export function cenaDoJogo(retrato) {
  try {
    if (!obj(retrato) || !ONDE_DO_RETRATO.some((k) => retrato[k] != null && retrato[k] !== false && retrato[k] !== "")) return null;
    const R = lerRetrato(retrato);
    const { pessoas, criaturas } = seresDe(retrato, R);
    const estadosDe = (x, de) => DERIVACAO_DA_CENA.filter((l) => l.de === de).filter((l) => { try { return !!l.se(x, R); } catch { return false; } }).map((l) => l.estado);
    const coisas = [];
    for (const l of DERIVACAO_DA_CENA.filter((x) => x.de === "coisa")) {
      let nomes = [];
      try { nomes = arr(l.se(R)); } catch { nomes = []; }
      for (const n of nomes) {
        const nome = txt(n);
        if (!nome) continue;
        const c = coisas.find((x) => mesmo(x.nome, nome));
        if (c) { if (!c.estados.includes(l.estado)) c.estados.push(l.estado); }
        else coisas.push({ nome, estados: [l.estado] });
      }
    }
    const daCena = DERIVACAO_DA_CENA.filter((l) => l.de === "cena").filter((l) => { try { return !!l.se(R); } catch { return false; } }).map((l) => l.estado);
    return lerCena({
      pessoas: pessoas.map((p) => ({ nome: p.nome, papel: p.papel, estados: estadosDe(p, "pessoa") })),
      criaturas: criaturas.map((c) => ({ nome: c.nome, estados: estadosDe(c, "criatura") })),
      coisas,
      cena: { estados: daCena },
    });
  } catch { return null; }
}

/* ---------------- O CHAMADO DA CONVERSA ----------------
   A conversa que rola passa pelo mesmo chamado de qualquer ação: a perícia,
   o número da escada do pedido (o `dc` que a conta social já deu) e o
   preço dito antes. O preço é o que a falha de fato cobra hoje: o livro de
   tentativas fecha o mesmo pedido à mesma pessoa (EFEITOS_DA_FALHA:
   «fecha»). Nada mais é prometido — a relação que piora não é cobrada pelo
   jogo ainda, e o aviso não a diz. */
/* 19/11 (o-mestre-vivo.md §19): o aviso é o fato da falha, na língua da
   mesa. «Se falhar, a resposta é não, e pedir igual não muda nada» era o
   livro de tentativas explicando-se ao jogador (sessão mv-3, texto de regra
   na tela). O preço continua o mesmo — a mesma via fecha —, dito pelo que o
   jogador vê: a resposta é não; a mentira não cola; a pessoa não se dobra.
   `porPericia`: o aviso de cada perícia da conversa; sem linha, `aviso`. */
export const O_CHAMADO_DA_CONVERSA = Object.freeze({
  aviso: "Se falhar, a resposta é não.",
  porPericia: Object.freeze({
    enganacao: "Se falhar, a mentira não cola.",
    intimidacao: "Se falhar, a pessoa não se dobra.",
  }),
  efeito: "fecha",
});

function chamadoDaConversa(v) {
  if (!obj(v) || v.tipo !== "teste" || !v.social || !Number.isFinite(Number(v.dc))) return null;
  const per = v.pericia ? periciaPorId(v.pericia) : null;
  const periciaNome = (per && per.nome) || txt(v.rotulo) || "Presença";
  const dc = Number(v.dc);
  const situacoes = arr(v.situacoes);
  const porque = situacoes.map((s) => s && s.diz).filter(Boolean).join(" e ");
  const aviso = O_CHAMADO_DA_CONVERSA.porPericia[v.pericia] || O_CHAMADO_DA_CONVERSA.aviso;
  const linha = O_CHAMADO.molde
    .replace("{pericia}", periciaNome)
    .replace("{dc}", String(dc))
    .replace("{porque}", porque ? `, ${porque}` : "")
    .replace("{aviso}", aviso);
  const efeito = EFEITOS_DA_FALHA.some((e) => e.id === O_CHAMADO_DA_CONVERSA.efeito) ? O_CHAMADO_DA_CONVERSA.efeito : "fecha";
  return Object.freeze({
    pericia: v.pericia || "", periciaNome, dc, aviso,
    cobrado: aviso.replace(O_CHAMADO.condicional, "").replace(O_CHAMADO.fimDoAviso, ""),
    efeito,
    dado: Object.freeze({ teste: O_CHAMADO.dado, preco: null }),
    chave: String(v.chave || ""), linha, porque,
  });
}

/* o bônus do herói para ESTE veredito: `ctx.bonus` (número), ou
   `ctx.bonusDe(veredito)` — o App só sabe o bônus depois de saber a perícia */
function ctxDoVeredito(ctx, v) {
  const c = obj(ctx) ? ctx : {};
  let bonus = num(c.bonus);
  if (bonus == null && typeof c.bonusDe === "function" && obj(v)) { try { bonus = num(c.bonusDe(v)); } catch { bonus = null; } }
  const { bonusDe: _b, ...resto } = c;
  return bonus == null ? { ...resto, bonus: undefined } : { ...resto, bonus };
}

function oChamadoDe(v, ctx) {
  let ch = null;
  try { ch = oChamado(v, ctx); } catch { ch = null; }
  if (!ch) { try { ch = chamadoDaConversa(v); } catch { ch = null; } }
  return ch;
}

/* ---------------- O CHAMADO DO MOMENTO ----------------
   A função única do App. `frase`: o que o jogador escreveu; `leitura`: o
   contexto de lerAcao (ctxDesafio()); `retrato`: o retrato de hoje; `ctx`:
   o de oChamado (ctxDoChamado: emCombate, mundoDisseNao, contexto, saber) e
   `vantagem`, com o bônus em `bonus` ou `bonusDe(veredito)`.
   Devolve { rola, chamado | null, porque, diz, resposta, espontaneo: null,
   destino | null, cena, veredito, pesos, ouviu }:
     rola     — a régua manda rolar (com `chamado` null e rola true, o teste
                rola como hoje: não havia preço a dizer);
     chamado  — a MESMA forma de oChamado (a conversa incluída);
     resposta — na pergunta que não rola, como a pessoa responde (franca,
                evasiva, recusa, silêncio): sinal para a pauta, nunca dado;
     destino  — { dado, faces, id, diz } quando a sorte decide sem perícia;
     veredito — o que a régua julgou (o do catálogo, o da escuta ou o do ato
                da frase encadeada): é ele que vai à bandeja e ao livro.
   Sem cena (o retrato não basta), o de hoje: oChamado sobre o catálogo,
   com a conversa sem chamado. Nunca lança. */
export function chamadoDoMomento(frase, leitura, retrato, ctx) {
  const leit = obj(leitura) ? leitura : {};
  let v = null;
  try { v = lerAcao(typeof frase === "string" ? frase : "", leit); } catch { v = null; }
  const cena = cenaDoJogo(retrato);
  if (!cena) {
    const c = ctxDoVeredito(ctx, v);
    let por = null;
    try { por = porQueNaoChama(v, c); } catch { por = "erro"; }
    let chamado = null;
    try { chamado = oChamado(v, c); } catch { chamado = null; }
    return Object.freeze({ rola: por === null || por === "conversa", chamado: chamado || null, porque: por || "chama", diz: "", resposta: null,
      espontaneo: null, destino: null, cena: null, veredito: v, pesos: null, ouviu: null });
  }
  const c0 = ctxDoVeredito(ctx, v);
  let r = null;
  try { r = valeRolagem(v, cena, { ...c0, frase: typeof frase === "string" ? frase : "", leitura: leit }); } catch { r = null; }
  if (!r) return Object.freeze({ rola: false, chamado: null, porque: "erro", diz: "", resposta: null, espontaneo: null, destino: null, cena, veredito: v, pesos: null, ouviu: null });
  const vEf = r.veredito !== undefined ? r.veredito : v;
  let chamado = null;
  if (r.rola && r.porque !== "destino" && obj(vEf)) chamado = oChamadoDe(vEf, ctxDoVeredito(ctx, vEf));
  return Object.freeze({
    rola: !!r.rola, chamado: chamado || null, porque: r.porque, diz: r.diz || "", resposta: r.resposta || null,
    espontaneo: null, destino: r.destino || null, cena, veredito: vEf || null, pesos: r.pesos || null, ouviu: r.ouviu || null,
    /* 19/11 (§17): a vantagem que a cena dá (quem vai ser roubado dorme) */
    ...(r.vantagem ? { vantagem: r.vantagem } : {}),
    /* 21/11 (§20): a quem a fala se dirige (a pauta do turno o diz ao Narrador) */
    ...(r.alvo ? { alvo: r.alvo } : {}),
  });
}

/* ---------------- O DADO QUE O MUNDO PROVOCA ----------------
   Dois retratos (o de antes do turno e o de depois): se a cena nova traz um
   estado que chama um teste e que não estava antes (oQueACenaChama), o
   Mestre pede esse teste. Não há frase do jogador: o chamado é o das outras
   origens (chamadoDaRolagem, a mesma cara do chamado da frase), contra o
   degrau da tabela de dificuldades, e o preço dito é só o que falhar É —
   não perceber, ser notado, não lembrar; nada que o jogo não cobre. A chave
   é do espontâneo, nunca a de uma ação do catálogo: o livro de tentativas
   não ganha uma busca que o jogador não fez.
   `degrau`: o id em DIFICULDADES (desafios.js); `risco`: por perícia. */
export const O_DADO_DO_MUNDO = Object.freeze({
  degrau: "comum",
  risco: Object.freeze({
    percepcao: "você não percebe a tempo",
    furtividade: "alguém nota você",
    saberes: "a memória não devolve nada",
  }),
  chave: "espontaneo",
});

/* ---------------- O QUE O MUNDO MOSTRA (19/11/2026, §17) ----------------
   A primeira sessão jogada viu o espontâneo virar ação do herói: um dado de
   Percepção que o mundo provocou ao chegar foi narrado como «você revira a
   mesa e o baú». O espontâneo não é um gesto: o herói PERCEBE (ou não) algo
   que o mundo fez. O que ele percebe sai do estado que provocou o dado, e de
   nada mais — o relógio da caçada diz o que se aproxima, o céu diz o raio, o
   lugar diz de quem é. oQue(retrato): o nome da coisa, tirado do retrato
   depois; sem nome, o espontâneo NÃO é chamado (um dado sobre nada seria um
   convite ao Narrador para inventar). passou / falhou: o que o herói percebe,
   na primeira pessoa do envelope, com {oQue} e {efeito} (o efeito do estado,
   ESTADOS_DA_CENA). O estado sem linha aqui não provoca. */
const relogioDoTipo = (s, tipos) => arr(s.relogios).filter(obj).find((r) => tipos.includes(r.tipo) && num(r.segmentos) != null && num(r.cheios) != null
  && r.cheios < r.segmentos && r.segmentos - r.cheios <= R_.faltaParaAPressa) || null;
/* 19/11 (§18): o nome do relógio é uma frase inteira («Vesna fecha o
   cerco», «A Liga põe um preço na sua cabeça»), e o molde antigo o lia como
   um nome («é Vesna fecha o cerco, e está perto»). Os moldes agora o usam
   como a frase que ele é. E o território que está ABERTO agora (o quartel,
   a cadeia, o portão, de plantão a qualquer hora) não provoca: quem entra
   pela porta da frente é visto e recebido, e um mestre não pede Furtividade
   a quem não está se escondendo — só o lugar fechado a esta hora é invasão. */
export const O_QUE_O_MUNDO_MOSTRA = Object.freeze({
  algo_se_aproxima: Object.freeze({
    oQue: (s) => { const r = relogioDoTipo(s, R_.relogioQueSeAproxima); return r ? txt(r.nome) : ""; },
    passou: "Eu percebo a tempo: {efeito}. A caçada está perto: {oQue}.",
    falhou: "Eu não percebo a tempo que a caçada chegou perto: {oQue}.",
  }),
  perigo_fisico: Object.freeze({
    oQue: (s) => (R_.climaQueFere.includes(idDoClima(s.clima)) ? "a " + (txt(obj(s.clima) ? s.clima.rotulo || s.clima.id : s.clima) || "tempestade") : ""),
    passou: "Eu percebo a tempo: {efeito} — {oQue} pesa sobre o caminho, e eu vejo onde não pisar.",
    falhou: "Eu não percebo a tempo o que {oQue} prepara: {efeito}.",
  }),
  territorio_de_alguem: Object.freeze({
    oQue: (s) => {
      const nome = obj(s.lugar) ? txt(s.lugar.nome) : txt(s.lugar);
      if (!nome) return "";
      let tipo = "";
      try { tipo = tipoDoSitio(obj(s.lugar) ? s.lugar : { nome }); } catch { tipo = ""; }
      return tipo && abertoAgora(tipo, num(s.minuto)) ? "" : nome;
    },
    passou: "Ninguém repara em mim quando entro: {oQue} tem dono, mas por enquanto ninguém me viu.",
    falhou: "{oQue} tem dono, e alguém de lá repara em mim onde eu não devia estar.",
  }),
  vigiado: Object.freeze({
    oQue: (s) => arr(obj(s.quest) ? s.quest.vigiado : []).map((n) => txt(obj(n) ? n.nome : n)).find(Boolean) || "",
    passou: "Eu passo por {oQue} sem ser visto: {efeito}, e ninguém me nota.",
    falhou: "Alguém que vigia {oQue} me nota.",
  }),
});

/* → { pericia, estado, porque, chamado, mostra } | null. `retratoAntes` null:
   tudo o que chama na cena nova chama. Sem o que mostrar (O_QUE_O_MUNDO_MOSTRA,
   acima), null: o espontâneo não é chamado. Nunca lança. */
export function chamadoQueOMundoProvoca(retratoAntes, retratoDepois) {
  try {
    const depois = cenaDoJogo(retratoDepois);
    if (!depois) return null;
    const pede = oQueACenaChama(cenaDoJogo(retratoAntes), depois);
    if (!pede) return null;
    const M = O_QUE_O_MUNDO_MOSTRA[pede.estado];
    let oQue = "";
    try { oQue = M ? txt(M.oQue(retratoDepois)) : ""; } catch { oQue = ""; }
    if (!oQue) return null;
    const e = estadoPorId(pede.estado);
    const mostra = Object.freeze({ estado: pede.estado, oQue, efeito: (e && e.efeito) || "", passou: M.passou, falhou: M.falhou });
    const per = periciaPorId(pede.pericia);
    const deg = dificuldadePorId(O_DADO_DO_MUNDO.degrau);
    let chamado = null;
    if (per && deg) {
      const ch = chamadoDaRolagem({ rotulo: per.nome, dificuldade: deg.dc, origem: "teste" }, { risco: O_DADO_DO_MUNDO.risco[pede.pericia] || "" });
      if (ch) chamado = Object.freeze({ ...ch, pericia: pede.pericia, chave: O_DADO_DO_MUNDO.chave + "|" + pede.estado });
    }
    return Object.freeze({ pericia: pede.pericia, estado: pede.estado, porque: pede.porque, chamado, mostra });
  } catch { return null; }
}
