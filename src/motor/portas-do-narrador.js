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

   Puro, sem React. Provado em `testes/teste-nada-entra-pelo-ator.mjs`.
   ============================================================ */

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
]);

const IDS = PORTAS_DO_NARRADOR.map((p) => p.id);
const DO_CAMPO = new Map(PORTAS_DO_NARRADOR.filter((p) => p.canal === "mudancas" && !p.campos).map((p) => [p.id, p.id]));
const DO_SINAL = new Map(PORTAS_DO_NARRADOR.filter((p) => p.canal === "sinal").map((p) => [p.id, p.id]));

/* ---------------- A CHAVE ----------------
   `abertas`: as portas que o modo abre (o Cronista é a porta `cronista`). */
export const MODO_DO_NARRADOR = Object.freeze({
  mestre: Object.freeze({ padrao: true, abertas: Object.freeze([...IDS]),
    oQueE: "o de hoje: o Narrador narra e declara, e o que declara e o que a prosa diz entra no estado pelas portas" }),
  ator: Object.freeze({ padrao: false, abertas: Object.freeze([]),
    oQueE: "o Narrador só fala: a resposta e a prosa vão à tela, e nada entra no estado por elas" }),
});

/* o nome do modo, conferido: um nome que a tabela não tem (ou nenhum) é o padrão */
export function oModoDoNarrador(nome) {
  if (typeof nome === "string" && Object.prototype.hasOwnProperty.call(MODO_DO_NARRADOR, nome)) return nome;
  return Object.keys(MODO_DO_NARRADOR).find((k) => MODO_DO_NARRADOR[k].padrao) || "mestre";
}

const doModo = (modo) => MODO_DO_NARRADOR[oModoDoNarrador(modo)];
const abreTudo = (m) => IDS.every((id) => m.abertas.includes(id));

/* a porta está aberta neste modo? (o modo ausente é o padrão) */
export function portaAberta(id, modo) {
  return doModo(modo).abertas.includes(id);
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
  if (abreTudo(m)) return resp;
  if (!resp || typeof resp !== "object" || Array.isArray(resp)) return resp;
  try { return filtrada(resp, m); } catch { return { narrativa: resp.narrativa, mudancas: null }; }
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
        return DO_SINAL.has(chave) && m.abertas.includes(chave);
      });
      if (sinais.length) nm.sinais = sinais;
      continue;
    }
    if (DO_CAMPO.has(campo) && m.abertas.includes(campo)) nm[campo] = v;
  }
  return { ...resp, mudancas: Object.keys(nm).length ? nm : null };
}
