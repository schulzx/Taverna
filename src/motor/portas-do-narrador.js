/* ============================================================
   AS PORTAS DO NARRADOR — a chave do modo e a lista de tudo o que, hoje,
   entra no estado pela boca dele (o plano do Narrador ator, etapa 3, 03/11/2026)

   A decisão da pessoa: "o narrador é só a boca, ele só fala, ou seja, só
   sai informação dali, nada entra por ele, tudo entra pelo sistema e é
   devolvido pelo sistema" (mente/plano-narrador-ator.md). A anatomia
   (mente/narrador-ator-anatomia.md §2) contou as portas por onde a resposta
   do Narrador vira estado: 29 campos de `mudancas` (37 contando cada
   sinal) e 9 leitores da prosa, um deles o Cronista inteiro.

   DUAS TABELAS, e as peças do turno leem as duas:

   - `MODO_DO_NARRADOR` — a chave. `mestre` é o de hoje e o padrão: toda
     porta aberta, o Cronista chamado. `ator` fecha todas: a resposta e a
     prosa só vão para a tela. Trocar de modo é mudar uma palavra (o
     `padrao`), e voltar é mudá-la de novo.
   - `PORTAS_DO_NARRADOR` — cada porta, com o canal por onde entra (um campo
     de `mudancas`, um sinal, ou a prosa), a peça do motor que a tem, e o
     que ela faz. Uma porta fechada no modo é uma porta que a peça não abre.

   COMO AS PEÇAS FECHAM:
   - o canal JSON fecha à ENTRADA de cada peça que lê `mudancas`
     (`aRespostaPelaPorta`): o modo que abre tudo devolve a MESMA resposta
     (o mesmo objeto — o modo `mestre` não muda um byte); o que fecha tira
     de `mudancas` cada campo e cada sinal cuja porta está fechada, e o que
     não é porta nenhuma também (um campo ignorado ainda acende o "veio
     mudança" de quem pergunta `if (resp.mudancas)`). Sobrando nada,
     `mudancas` é `null`, como a poda já faz — a resposta é só prosa.
   - o canal da prosa fecha leitor a leitor (`portaAberta`): a prosa continua
     a ir à tela, o leitor é que não a faz estado.
   - o Cronista (`oCronistaChama`) não é chamado: o gatilho cala.

   AS GUARDAS NÃO SÃO PORTAS, e ficam abertas nos dois modos: o Portão, o
   Juiz, `semFalaInventada`, `fechoDaNarrativa` e a correção da nêmesis
   morta leem a narração só para cortar ou pedir conserto — nada que dizem
   vira estado (a anatomia, §2, «Guardas que leem a narração»).

   OS ACHADOS (03/11, ao fechar): duas portas que a anatomia não contou, e
   que a prova «nada entra pelo ator» pegaria se ficassem abertas — a mesa,
   que conta o turno como ganho pelos campos `moedas`, `xp` e
   `adicionar_itens` (o ritmo da cena), e o peso da linha do turno no
   livro-razão, que o App tira da prosa ("alguém morreu", o 🎲). Ficam na
   tabela com `achado`, e fecham como as outras.

   A FASE NE (13/11, «nenhuma IA escreve estado de jogo» — mente/
   plano-nada-entra.md). Três coisas mudaram a tabela:
   - NE1: a porta `cronista` partiu-se por SECÇÃO (canal `cronista`). A
     porta `cronista` continua a ser a chamada da 2.ª IA (o gatilho); cada
     secção da resposta dela tem agora a sua porta, e `oAceitoPelaPorta`
     tira do aceito a secção cuja porta o modo fecha. A secção `combate`
     (`mortes_narradas`) não é porta: é a guarda da coesão (só corrige).
   - NE2: as portas que viviam FORA da tabela entraram nela — a prosa que
     põe à vista no livro de factos, o alvo do ataque e o nome da luta
     prometida tirados da prosa, o núcleo lido das falas, o `perigo` da
     resposta, e as três IAs que escrevem estado sem ser o Narrador (o
     Arquivista do save e o da ascensão, o Léxico; canal `ia`). E os
     marcadores `__*` da luta (canal `marcador`), que são do código e
     nunca da IA: `sempreFechada`, logo `aRespostaPelaPorta` tira-os em
     QUALQUER modo, o `mestre` incluído. Os dois Arquivistas também são
     `sempreFechada` (NE3: a pessoa aprovou tirá-los): a tela do App lê a
     porta (`O_ARQUIVISTA_NA_TELA`), e voltar é tirar a marca daqui.
   - NE2: a chave ganhou duas colunas explícitas, `portas` (as que o modo
     abre) e `pedido` (que pedido o Narrador recebe: o do `mestre`, com a
     pauta inteira, ou o do `ator`, com a ficha). E um terceiro modo,
     `boca`: o pedido do `mestre` com todas as portas fechadas — o
     Narrador recebe tudo e só fala. Não é o padrão (é a NE7, depois dos
     substitutos da NE4).

   Puro, sem React. Provado em `testes/teste-nada-entra-pelo-ator.mjs`.
   ============================================================ */
import { caidosDaLuta } from "../recibo-da-luta.js";

/* ---------------- AS PORTAS ----------------
   `canal`: "mudancas" (um campo), "sinal" (um sinal de `mudancas.sinais`,
   pela chave antes dos dois-pontos) ou "prosa" (um leitor da narrativa).
   `peca`: a função do motor (ou o sítio do App) onde a porta fecha. */
const P = (id, canal, grupo, peca, faz, extra = {}) => Object.freeze({ id, canal, grupo, peca, faz, ...extra });

export const PORTAS_DO_NARRADOR = Object.freeze([
  /* a ficha — aplicarMudancas (regras-jogo.js), chamada pelo `aplicar` */
  P("vida", "mudancas", "ficha", "aplicar", "cura o herói (o dano a poda já corta)"),
  P("mana", "mudancas", "ficha", "aplicar", "devolve mana (o gasto a poda já corta)"),
  P("moedas", "mudancas", "ficha", "aplicar", "mexe no ouro da bolsa"),
  P("adicionar_itens", "mudancas", "ficha", "aplicar", "põe item no inventário"),
  P("remover_itens", "mudancas", "ficha", "aplicar", "tira item do inventário"),
  P("adicionar_equipamento", "mudancas", "ficha", "aplicar", "põe peça no equipamento"),
  P("remover_equipamento", "mudancas", "ficha", "aplicar", "tira peça do equipamento"),
  P("remover_habilidades", "mudancas", "ficha", "aplicar", "tira habilidade da ficha"),
  P("efeitos_adicionar", "mudancas", "ficha", "aplicar", "põe bênção ou efeito no herói"),
  P("efeitos_remover", "mudancas", "ficha", "aplicar", "tira efeito do herói"),
  P("feito", "mudancas", "ficha", "aplicar", "dá XP pelo feito, e com ele o nível"),
  P("grupo_adicionar", "mudancas", "ficha", "aplicar", "põe companheiro no grupo"),
  P("grupo_remover", "mudancas", "ficha", "aplicar", "tira companheiro do grupo"),
  P("grupo_vida", "mudancas", "ficha", "aplicar", "cura companheiro"),
  P("grupo_xp", "mudancas", "ficha", "aplicar", "dá XP a companheiro"),
  P("grupo_itens", "mudancas", "ficha", "aplicar", "dá item a companheiro"),
  P("grupo_atualizar", "mudancas", "ficha", "aplicar", "reescreve a ficha de companheiro"),
  /* a luta — processarCombate (regras-jogo.js), chamada por aLutaDaResposta */
  P("combate_iniciar", "mudancas", "luta", "aLutaDaResposta", "abre a luta (só no ATAQUE SEM ALVO; a poda corta o resto)"),
  P("combate_encerrar", "mudancas", "luta", "aLutaDaResposta", "fecha a luta e paga o espólio"),
  /* o mundo — o meio do turno */
  P("mapa_cidades", "mudancas", "mundo", "aplicarOMapa", "cria ou reescreve cidade no mapa"),
  P("mapa_faccoes", "mudancas", "mundo", "aplicarOMapa", "cria ou reescreve facção"),
  P("lugar_atual", "mudancas", "mundo", "aplicarOMapa", "muda o lugar dentro da cidade"),
  P("cidade_atual", "mudancas", "mundo", "aplicarOMapa", "muda a cidade em que se pisa"),
  P("jornada_meio", "mudancas", "mundo", "aplicarOMapa", "mexe na viagem em curso"),
  P("faccao_jogador", "mudancas", "mundo", "aplicarOMapa", "põe o herói numa facção"),
  P("evento_global_encerrar", "mudancas", "mundo", "aplicarAsMissoes", "encerra o evento global e vira o arco"),
  /* os sinais — um campo (`sinais`), nove portas */
  P("fe", "sinal", "sinais", "aplicarOsSinais", "dá fiéis ao deus"),
  P("milagre", "sinal", "sinais", "aplicarOsSinais", "faz o milagre (cura, efeito, luta)"),
  P("viagem", "sinal", "sinais", "aplicarOsSinais", "abre a viagem no turno seguinte"),
  P("masmorra", "sinal", "sinais", "aplicarOsSinais", "abre a masmorra no turno seguinte"),
  P("raid", "sinal", "sinais", "aplicarOsSinais", "abre o chamado da raid"),
  P("ascender", "sinal", "sinais", "aplicarOsSinais", "sobe o grau divino e espalha a fé"),
  P("loot", "sinal", "sinais", "aplicarOsSinais", "gera e entrega um achado"),
  P("dominio", "sinal", "sinais", "aplicarOsSinais", "revela o domínio do deus"),
  P("patrono", "sinal", "sinais", "aplicarOsSinais", "declara o patrono do deus"),
  /* a memória — o registo */
  P("canone", "mudancas", "memoria", "aplicarORegisto", "escreve no cânone (e põe lugar no mapa)"),
  P("npcs", "mudancas", "memoria", "aplicarORegisto", "cria ou mescla gente no registo"),
  /* a prosa que vira estado */
  P("oQueFaltaCreditar", "prosa", "prosa", "aplicar", "credita a moeda e o consumível que a prosa citou"),
  P("oQueFaltaDebitar", "prosa", "prosa", "aplicar", "debita o pagamento que a prosa citou"),
  P("mencionadosNaCena", "prosa", "prosa", "aplicarOCodex", "revela a base do mundo e cria gente"),
  P("nomesAMaoNaProsa", "prosa", "prosa", "aplicarOCodex", "cria gente, e morta se a frase a matou"),
  P("detectarChegada", "prosa", "prosa", "aplicarAChegada", "muda a cidade e anda o relógio"),
  P("aNemesisNaNarrativa", "prosa", "prosa", "aNemesisNaNarrativa", "encerra a nêmesis que a prosa matou"),
  P("osVistosDaNarrativa", "prosa", "prosa", "osVistosDaNarrativa", "dá recência a quem a prosa pôs em cena"),
  P("segredosReveladosNoTurno", "prosa", "prosa", "oAceitoDoCronista", "fecha o segredo pela pista dada na prosa (o do teste fica)"),
  P("cronista", "prosa", "prosa", "oGatilhoDoCronista", "a 2.ª IA lê a prosa e propõe ~13 coisas"),
  /* os achados de 03/11 */
  P("mesa", "mudancas", "ritmo", "aMesaDoTurno", "conta o turno como ganho pelos campos moedas, xp e adicionar_itens", { campos: Object.freeze(["moedas", "xp", "adicionar_itens"]), achado: "03/11: a anatomia não a contou" }),
  P("pesoDaLinha", "prosa", "ritmo", "App: a linha do turno (anotarOTurno)", "dá peso à linha do livro-razão pela morte e pelo dado que a prosa diz", { achado: "03/11: a anatomia não a contou" }),
  /* NE1 (13/11): o Cronista, secção a secção. `chaves`: as chaves do aceito
     (julgarOCronista) que a porta governa; `cronista.livro` não tem chave —
     governa o que as secções da gente e da conversa dão ao livro de factos
     (o `nomeado` e o `falou`, que satisfaz «conversou» da quest). */
  ...[
    ["lugar", ["lugar"], "muda o sítio em que o herói está (e, recusado, escreve a nota de correção)"],
    ["global", ["missoes"], "encerra o evento global e vira o arco"],
    ["canone", ["canone"], "escreve no cânone (o artefato, a gente, o lugar)"],
    ["gente", ["pessoas"], "cria ou mescla gente no registo"],
    ["conversa", ["falou_com"], "confere as etapas de «falar com» pela conversa que leu"],
    ["fe", ["fe"], "dá fiéis e PF ao deus (o número é da tabela, o sinal é dele)"],
    ["grupo", ["grupo"], "põe no grupo quem a prosa disse que veio"],
    ["teste", ["teste_sugerido"], "abre o teste que a concessão grande exige"],
    ["cartaz", ["missao_oferecida"], "prega no mural o trabalho que alguém pediu na prosa"],
    ["relogio", ["relogio_novo"], "começa a contar um relógio"],
    ["promessas", ["promessas", "promessas_pagas"], "guarda e paga as sementes do Livro de Promessas"],
    ["livro", [], "dá ao livro de factos quem foi nomeado e com quem o herói falou"],
  ].map(([secao, chaves, faz]) => P("cronista." + secao, "cronista", "cronista", "oAceitoDoCronista", faz, { secao, chaves: Object.freeze(chaves), achado: "13/11 (NE1): a porta «cronista» partida por secção" })),
  /* NE2 (13/11): as nove de fora, com a peça que as fecha */
  P("livroVistoDaProsa", "prosa", "fora", "oQueACenaDaAoLivro (livro-do-turno.js)", "põe à vista no livro de factos quem a prosa pôs a agir — o «visto» que satisfaz «conheceu» da quest", { achado: "13/11 (NE2): a auditoria" }),
  P("alvoDaProsa", "prosa", "fora", "lerAgressao (agressao.js)", "tira da prosa o alvo do ataque: o bicho, o armado, o descrito pela arma", { achado: "13/11 (NE2): a auditoria" }),
  P("lutaPrometida", "prosa", "fora", "escolherLado → alvoPrometido (subtramas.js, agressao.js)", "dá à luta que o lado prometeu o nome que a prosa disse", { achado: "13/11 (NE2): a auditoria" }),
  P("nucleoDaFala", "prosa", "fora", "App: nucleoEmCena", "põe o núcleo em cena por o Mestre o citar nas duas últimas falas", { achado: "13/11 (NE2): a auditoria" }),
  P("marcadores", "marcador", "fora", "aRespostaPelaPorta", "os __* de mudancas (__vitoriaAuto, __inimigosFinais): marcadores do código que pagam o espólio — a IA nunca os escreve", { sempreFechada: true, achado: "13/11 (NE2): a auditoria" }),
  P("perigo", "resposta", "fora", "oPerigoDaResposta (fecho-da-resposta.js)", "abre a emboscada ou dispara o perigo que a IA descreveu (a poda já o corta sempre)", { achado: "13/11 (NE2): a auditoria" }),
  P("arquivistaDoSave", "ia", "fora", "App: «recalibrar save antigo»", "três IAs reescrevem a ficha de um save antigo", { sempreFechada: true, fechou: "NE3 (13/11): a pessoa aprovou tirar o Arquivista; voltar é tirar o sempreFechada", achado: "13/11 (NE2): a auditoria" }),
  P("arquivistaDaAscensao", "ia", "fora", "painel-ascensao.jsx: «Recalibrar ascensão»", "a IA reescreve a ascensão divina", { sempreFechada: true, fechou: "NE3 (13/11): a pessoa aprovou tirar o Arquivista; voltar é tirar o sempreFechada", achado: "13/11 (NE2): a auditoria" }),
  P("lexico", "ia", "fora", "App: lerOMundo (lexico.js#pedidoDoLexico)", "a IA escreve o vocabulário e as leis do mundo (mundo.lexico) — a troca é lexico-do-mundo.js (NE6)", { achado: "13/11 (NE2): a auditoria" }),
]);

/* as portas que algum modo pode abrir: a `sempreFechada` não abre nunca */
const IDS = PORTAS_DO_NARRADOR.filter((p) => !p.sempreFechada).map((p) => p.id);
const DO_CAMPO = new Map(PORTAS_DO_NARRADOR.filter((p) => p.canal === "mudancas" && !p.campos).map((p) => [p.id, p.id]));
const DO_SINAL = new Map(PORTAS_DO_NARRADOR.filter((p) => p.canal === "sinal").map((p) => [p.id, p.id]));

/* ---------------- A CHAVE ----------------
   Duas colunas (NE2, 13/11), e já não uma só: `portas` — as que o modo
   abre (o Cronista é a porta `cronista`) — e `pedido` — que pedido o
   Narrador recebe: `mestre` (a pauta inteira, os envelopes) ou `ator` (a
   ficha do ator, pedido-do-ator.js). Até aqui o pedido do ator vinha
   colado à chave das portas (`modo === "ator"`), e por isso o modo das
   portas fechadas não podia ter o pedido de hoje. */
export const MODO_DO_NARRADOR = Object.freeze({
  mestre: Object.freeze({ padrao: true, portas: Object.freeze([...IDS]), pedido: "mestre",
    oQueE: "o de hoje: o Narrador narra e declara, e o que declara e o que a prosa diz entra no estado pelas portas" }),
  ator: Object.freeze({ padrao: false, portas: Object.freeze([]), pedido: "ator",
    oQueE: "o Narrador só fala: a resposta e a prosa vão à tela, e nada entra no estado por elas" }),
  boca: Object.freeze({ padrao: false, portas: Object.freeze([]), pedido: "mestre",
    oQueE: "o pedido do mestre, com todas as portas fechadas: o Narrador recebe a pauta inteira e só fala — o modo da NE7" }),
});

/* o nome do modo, conferido: um nome que a tabela não tem (ou nenhum) é o padrão */
export function oModoDoNarrador(nome) {
  if (typeof nome === "string" && Object.prototype.hasOwnProperty.call(MODO_DO_NARRADOR, nome)) return nome;
  return Object.keys(MODO_DO_NARRADOR).find((k) => MODO_DO_NARRADOR[k].padrao) || "mestre";
}

const doModo = (modo) => MODO_DO_NARRADOR[oModoDoNarrador(modo)];
const abreTudo = (m) => IDS.every((id) => m.portas.includes(id));

/* que pedido o Narrador recebe neste modo: "mestre" ou "ator" (a coluna
   `pedido`; o modo ausente é o padrão) */
export function oPedidoDoModo(modo) {
  return doModo(modo).pedido === "ator" ? "ator" : "mestre";
}

/* a porta está aberta neste modo? (o modo ausente é o padrão) */
export function portaAberta(id, modo) {
  return doModo(modo).portas.includes(id);
}

/* O ACEITO DO CRONISTA PELA PORTA (NE1): tira do aceito do juízo
   (julgarOCronista) cada secção cuja porta `cronista.*` o modo fecha. O
   modo que abre todas devolve o MESMO objeto. Lixo vira `{}`. */
const DAS_SECOES = PORTAS_DO_NARRADOR.filter((p) => p.canal === "cronista");
export function oAceitoPelaPorta(aceito, modo) {
  const a = aceito && typeof aceito === "object" && !Array.isArray(aceito) ? aceito : {};
  const fechadas = DAS_SECOES.filter((p) => !portaAberta(p.id, modo)).flatMap((p) => p.chaves);
  if (!fechadas.some((k) => Object.prototype.hasOwnProperty.call(a, k))) return a;
  const out = {};
  for (const [k, v] of Object.entries(a)) if (!fechadas.includes(k)) out[k] = v;
  return out;
}

/* o Cronista lê neste modo? */
export function oCronistaChama(modo) {
  return portaAberta("cronista", modo);
}

/* a resposta como o modo a deixa entrar: o modo que abre tudo devolve a
   mesma (o mesmo objeto); o que fecha tira de `mudancas` o que não abre.
   FALHA FECHADA: se a conta estourar num modo que fecha, sai só a prosa —
   uma porta com defeito nunca abre o que o modo fechou. */
export function aRespostaPelaPorta(resp, modo) {
  const m = doModo(modo);
  if (!resp || typeof resp !== "object" || Array.isArray(resp)) return resp;
  /* os marcadores do código (a porta `marcadores`, sempre fechada): em
     qualquer modo. Sem nenhum, a resposta é a mesma (o mesmo objeto). */
  let r;
  try { r = semMarcadores(resp); } catch { return { narrativa: resp.narrativa, mudancas: null }; }
  if (abreTudo(m)) return r;
  try { return filtrada(r, m); } catch { return { narrativa: resp.narrativa, mudancas: null }; }
}

const ehMarcador = (k) => typeof k === "string" && k.startsWith("__");
function semMarcadores(resp) {
  const md = resp.mudancas;
  if (!md || typeof md !== "object" || Array.isArray(md) || !Object.keys(md).some(ehMarcador)) return resp;
  const limpa = {};
  for (const [k, v] of Object.entries(md)) if (!ehMarcador(k)) limpa[k] = v;
  return { ...resp, mudancas: limpa };
}

/* O PESO DA LINHA PELO SISTEMA (o Narrador ator, etapa 2, 03/11). A porta
   `pesoDaLinha` fechada tira a prosa do livro-razão, e com ela o «rolou
   dado» e o «alguém morreu» que só a prosa dizia. O sistema sabe os dois
   por ele: o teste do turno (o App guarda-o em `testeDoTurnoRef`, a
   rolagem da resposta quando a houver) e quem caiu na luta DESTE turno —
   caído na luta de depois (ou no fecho dela, quando ela acabou) e não
   caído na luta do início do turno. `lutaAntes` é a da foto do início (o
   golpe do herói resolve-se antes de o Narrador ser chamado, e a luta do
   envio já o traz caído).
   → { houveDado, alguemCaiu, caidos } */
export function oPesoPeloSistema(entrada) {
  const e = entrada && typeof entrada === "object" ? entrada : {};
  const antes = new Set(caidosDaLuta(e.lutaAntes));
  const agora = [...caidosDaLuta(e.lutaDepois), ...(Array.isArray(e.caidosDoFecho) ? e.caidosDoFecho : [])];
  const caidos = [...new Set(agora.filter((n) => typeof n === "string" && n && !antes.has(n)))];
  return { houveDado: !!(e.teste || e.rolagem), alguemCaiu: caidos.length > 0, caidos };
}

function filtrada(resp, m) {
  const md = resp.mudancas;
  if (!md || typeof md !== "object" || Array.isArray(md)) return md == null ? resp : { ...resp, mudancas: null };
  const nm = {};
  for (const [campo, v] of Object.entries(md)) {
    if (campo === "sinais") {
      const sinais = (Array.isArray(v) ? v : []).filter((s) => {
        const txt = String(s || "").trim();
        const ix = txt.indexOf(":");
        const chave = (ix < 0 ? txt : txt.slice(0, ix)).trim().toLowerCase();
        return DO_SINAL.has(chave) && m.portas.includes(chave);
      });
      if (sinais.length) nm.sinais = sinais;
      continue;
    }
    if (DO_CAMPO.has(campo) && m.portas.includes(campo)) nm[campo] = v;
  }
  return { ...resp, mudancas: Object.keys(nm).length ? nm : null };
}
