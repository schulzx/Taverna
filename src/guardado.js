/* ============================================================
   O TURNO GUARDADO (Fase X, etapa X3) — ou o turno se completa,
   ou não começou

   POR QUE ISTO EXISTE, e por que não é conforto de interface.

   Hoje o turno de combate acontece em DUAS batidas separadas, e nesta
   ordem: primeiro o motor resolve (`aplicarGolpeDoJogador`, App.jsx —
   rola o dado, aplica o dano, escreve as linhas de sistema, cobra a ação
   e roda o revide), e SÓ DEPOIS o App monta o envelope de texto
   (`[COMBATE — RESOLVIDO PELO SISTEMA] …`) e chama o Narrador pela rede.
   Quando a segunda batida falha, o mundo já mudou: o golpe está dado, o
   inimigo está ferido, e o que faltou foi alguém para contar.

   Daí os três buracos que este módulo fecha.

   1) A RE-ROLAGEM. Se o jogador, vendo "O Mestre não respondeu", declara
      de novo em vez de pedir a narração do que ficou preso, o motor ROLA
      OUTRA VEZ. Numa casa cuja primeira lei é determinismo por semente,
      isso é um exploit que se disfarça de azar: basta uma queda de rede
      para um resultado ruim ganhar segunda chance. `travaODeclarar` é a
      trava, e `oQueNarrar` é a promessa do outro lado — o "tentar de
      novo" NARRA o que já aconteceu, byte por byte, e nunca recomputa.

   2) O MEIO-TURNO. O `salvar(...)` do App só roda no caminho de sucesso.
      Se o Narrador cai e o jogador recarrega a página, o golpe que o
      motor já aplicou pode evaporar. O registro que `guardarTurno`
      devolve é serializável de propósito: ele cabe no save, e é ele que
      permite retomar a mesa no ponto exato em que ela parou.

   3) O MOTIVO TÉCNICO NA TELA. A falha imprime hoje, para o jogador, a
      mensagem crua do provedor — o que fere a lei "o sistema não fala de
      si mesmo". Mas APAGAR o motivo seria pior: foi justamente esse
      vazamento que permitiu diagnosticar duas quedas. `lerOSilencio`
      resolve os dois lados de uma vez: `tecnico` volta ÍNTEGRO (é o que
      o App manda ao `console`, e quem apaga o motivo fica cego) e `casa`
      é a frase em voz de mundo, que é a única que sobe à tela.

   ------------------------------------------------------------
   E UMA REGRA QUE VOLTOU DO App.jsx PARA CÁ, DE PROPÓSITO

   A CONTA DE TENTATIVAS QUANDO O MESMO TURNO CAI DE NOVO. Ela nasceu na
   fiação — o `catch` do `enviar` comparava a `marca` do registro velho
   com a do novo e refazia o registro à mão, com um `Object.freeze({ ...g,
   tentativas })` solto no meio do App. Era regra morando na tela, e a lei
   da casa diz o contrário: conta se prova, tela se olha.

   E não é regra pequena. Sem ela o campo volta a 0 a cada queda e o
   console diz "tentativa 1" para sempre — e é justamente o número de
   tentativas que separa "o provedor tossiu uma vez" de "o Mestre está
   fora do ar há dez minutos". Uma regra que só existe dentro de um
   `catch` de 20 mil linhas é uma regra que ninguém pode provar; aqui ela
   entra por argumento (`anterior`) e a suíte a lê de volta.

   ------------------------------------------------------------
   O QUE ESTE ARQUIVO NÃO FAZ

   Não fala com a rede, não conhece `fetch`, `localStorage`, React nem
   JSX. Não decide QUANDO guardar nem QUANDO liberar — isso é fiação, e
   mora no App. Não formata nada: `casa` é DADO (texto de veredito), sem
   cor, sem markup, sem instrução de botão; quem decide como mostrar é a
   tela. Não tem relógio nem sorteio: `quando` entra por argumento, e não
   há um `Math.random` nem um `Date.now` neste arquivo — o módulo que
   existe por causa do determinismo não pode ser a exceção a ele.

   E não estoura. Nunca. Este código roda no caminho de uma falha; um
   órgão que quebra durante a falha apaga exatamente o turno que ele
   existe para salvar. Entrada torta devolve resposta honesta.
   ============================================================ */

/* ============================================================
   A TABELA DOS SILÊNCIOS

   As classes de queda estão MEDIDAS em `api/narrador.js` e
   `api/_portao.js` — nenhuma foi imaginada. O que chega ao App é sempre
   uma string: `chamarModelo` lança `new Error(data.erro || "HTTP <n>")`,
   e o `catch` de `enviar` guarda `e.message`. Por isso a classificação
   se faz por MARCA (pedaço de frase que o servidor escreve) e por
   CÓDIGO (o número HTTP solto na string) — as duas coisas na linha, em
   vez de espalhadas por `if`s no meio do código.

   A ORDEM DESTA TABELA É A PRECEDÊNCIA, e isso é regra, não acaso.
   Duas razões concretas, as duas medidas:

   · A recusa do portão por teto diário diz "Limite diário alcançado
     (500 chamadas)" — e traz um 500 dentro do texto. Se `provedor_caiu`
     (que reclama o 500) viesse antes de `teto_do_dia`, o teto diário seria
     lido como provedor fora do ar, e o jogo ofereceria "tentar de novo"
     a cada meia-noite que falta.

   · Quando o provedor recusa por crédito, o corpo que volta é
     "Todos os provedores falharam — deepseek (…: 402: Insufficient
     Balance)" — o 502 do roteador POR FORA e o 402 verdadeiro POR
     DENTRO. `sem_dinheiro` vem primeiro porque a causa real é ele, e
     porque é a única resposta que muda o que a pessoa deve fazer.

   `podeTentar` não é enfeite: é a diferença entre um botão que resolve e
   um botão que ensina o jogador a bater na porta trancada.

   As frases de `casa` não dizem erro, rede, servidor, provedor, chave
   nem número: o jogador não lê a máquina.

   ------------------------------------------------------------
   MM15 (3) — A FRASE QUE ACUSAVA O JOGADOR, e o que mudou por causa dela

   Até aqui a linha do teto diário (e da origem recusada) dizia "A porta
   não se abre para esta mão: o Mestre não conta esta história a quem bate
   assim". Na segunda sessão de prova (`mente/mm11-sessao-2.md`, T11) a
   API respondeu 429 — o teto do endereço, infra, nada que a jogadora
   tivesse escrito — e foi ESTA frase que subiu. Ela lê-se como recusa do
   conteúdo: "fiz uma coisa proibida". Quem a lê reescreve a ação, manda de
   novo, e gasta mais — contra uma porta que abre sozinha à hora certa.

   A voz de mundo tinha escondido a CAUSA, e a causa é a única coisa que
   diz ao jogador o que fazer. Daí as duas regras novas desta tabela:

   1. TODA LINHA DIZ DE QUEM FOI. `natureza` separa as três verdades:
      · "ligacao" — o transporte: o Mestre nem chegou a ouvir. A linha diz
        "a ligação", com essa palavra, e nenhuma soa a recusa.
      · "conteudo" — a recusa verdadeira: os provedores leram e não
        escreveram por causa do que foi pedido. É a ÚNICA que diz ao
        jogador para dizer de outro modo.
      · "jogo" — o Mestre respondeu e fomos nós que tropeçamos ao ler.
        Não é ligação, e a linha não finge que é.
   2. O TETO É O SEU PRÓPRIO SILÊNCIO. Deixou de dividir linha com a
      origem recusada: um volta à hora certa, o outro não volta sozinho, e
      "A porta não se abre" servia aos dois sem servir a nenhum.

   O QUE A LEITURA MOSTROU SOBRE "RECUSA DE CONTEÚDO": nenhuma das marcas
   da antiga linha `recusado` era de conteúdo — eram origem, teto, chave
   e modelo, tudo transporte ou infra. As recusas de conteúdo REAIS
   estavam escondidas noutra classe: o Gemini devolve `sem texto (SAFETY)`
   (e PROHIBITED_CONTENT, BLOCKLIST, SPII, RECITATION) quando o filtro
   dele barra a resposta, e o DeepSeek devolve 400 com "Content Exists
   Risk" no corpo. Essas iam dar a `provedor_caiu` ("o Mestre perde o
   fio"). É ELAS que se preserva — como classe própria, `conteudo`.
   ============================================================ */
export const MOTIVOS_DO_SILENCIO = [
  {
    /* 402, e o 500 de "Nenhuma chave configurada" (api/narrador.js, no
       fim do roteador de provedor). É a única classe em que insistir é
       inútil E a pessoa pode consertar: falta crédito ou falta chave.
       "insufficient balance" é o que o DeepSeek escreve no corpo do 402,
       e ele viaja nos 250 caracteres de `corpo` que o roteador anexa. */
    id: "sem_dinheiro",
    natureza: "ligacao",
    codigos: [402],
    marcas: ["nenhuma chave configurada", "insufficient balance", "insufficient_quota", "billing"],
    casa: "A mesa do Mestre está fechada por agora: a ligação não se abre, por mais que se insista.",
    podeTentar: false,
  },
  {
    /* O TETO DIÁRIO DO PORTÃO (api/_portao.js, `deixarEntrar`): 429 com
       "Limite diário alcançado (N chamadas)". Viaja SEM o número 429 na
       string — `chamarModelo` lança `data.erro` quando ele existe, e o
       status só aparece quando o corpo vem vazio —, por isso é a MARCA que
       o acha. E vem antes de `demanda` (que reclama o 429) e de
       `provedor_caiu` (que reclamaria o "500 chamadas" do texto).

       É o caso do T11. Insistir agora não abre — `podeTentar` é falso —,
       mas a porta abre SOZINHA à hora da virada, e é essa hora que a
       linha diz quando o App passa o fuso (`HORA_DA_VIRADA`, abaixo). */
    id: "teto_do_dia",
    natureza: "ligacao",
    codigos: [],
    marcas: ["limite diario alcancado"],
    casa: "A mesa do Mestre fechou por hoje: a ligação só volta quando o dia da mesa virar.",
    /* a mesma frase com a hora local da virada; `HORA` é trocado por
       `lerOSilencio` quando recebe o fuso. Sem fuso, vale `casa`. */
    casaComHora: "A mesa do Mestre fechou por hoje: a ligação só volta às HORA do seu relógio.",
    podeTentar: false,
  },
  {
    /* 401/403/404 e a recusa de ORIGEM do portão ("Este endereço só
       responde ao jogo.", com `motivo` "sem origem" ou "origem não
       autorizada"). O 404 entra aqui porque, nos dois provedores, ele
       significa modelo que não existe — a porta certa, o nome errado; e
       tentar de novo repete o mesmo nome. Nada disto é o jogador: é o
       endereço de onde ele joga, ou a configuração da mesa. */
    id: "porta_fechada",
    natureza: "ligacao",
    codigos: [401, 403, 404],
    marcas: [
      "este endereco so responde",
      "sem origem",
      "origem nao autorizada",
      "invalid api key",
      "api key not valid",
      "unauthorized",
      "permission denied",
    ],
    casa: "Deste endereço não há ligação com a mesa do Mestre: a voz não chega até ele.",
    podeTentar: false,
  },
  {
    /* O `fetch` que nem chega a ter resposta. Não há código nenhum aqui
       — o que existe é a mensagem do navegador, e ela muda com o
       navegador: "Failed to fetch" no Chrome, "NetworkError when
       attempting to fetch resource." no Firefox, "Load failed" no
       Safari. São essas três que aparecem no `e.message` do `catch`.

       E de propósito NÃO se classifica por "TypeError": o `try` do
       `enviar` abraça o turno inteiro, então um defeito de código
       qualquer também lança TypeError ali. Classificar por nome de
       classe transformaria bug do jogo em "sem rede" — e mentir sobre a
       causa é pior do que dizer "desconhecido". */
    id: "sem_rede",
    natureza: "ligacao",
    codigos: [],
    marcas: ["failed to fetch", "networkerror", "network request failed", "load failed", "err_internet_disconnected"],
    casa: "A ligação caiu antes de o Mestre ouvir você.",
    podeTentar: true,
  },
  {
    /* Aborto e estouro de tempo. 408 é o Request Timeout; o 504 NÃO
       entra aqui — ele é o roteador dizendo que o provedor demorou, e
       isso é `provedor_caiu`, que já cobre a família 5xx inteira. */
    id: "tempo_esgotado",
    natureza: "ligacao",
    codigos: [408],
    marcas: ["abort", "timeout", "timed out", "etimedout", "tempo esgotado"],
    casa: "A ligação ficou muda no caminho, e o Mestre não chegou a ouvir você.",
    podeTentar: true,
  },
  {
    /* A RECUSA VERDADEIRA — o único silêncio que é sobre o que se pediu.
       Os filtros dos provedores: o Gemini devolve `sem texto (<motivo>)`
       com o `finishReason` ou o `blockReason` (api/narrador.js, no fim de
       `chamarGemini`) e o DeepSeek devolve 400 com "Content Exists Risk"
       no corpo, que o roteador anexa ao `ultimoErro`.

       `todos: true` É A REGRA QUE IMPEDE A ACUSAÇÃO FALSA. O roteador
       junta as quedas dos provedores com " · " numa linha só; se UM
       recusou pelo conteúdo e o OUTRO só estava fora do ar, o problema não
       é a frase do jogador — é a ligação, e insistir pode passar pelo
       outro. Só quando TODOS os provedores tentados recusaram pelo
       conteúdo é que a linha diz ao jogador para dizer de outro modo.

       `podeTentar` fica verdadeiro de propósito: o filtro do Gemini julga
       a RESPOSTA que o modelo escreveu, e uma segunda escrita pode passar;
       e num turno em que os dados já caíram, sem botão a mesa trancava. */
    id: "conteudo",
    natureza: "conteudo",
    todos: true,
    codigos: [],
    marcas: [
      "content exists risk",
      "sem texto (safety)",
      "sem texto (prohibited_content)",
      "sem texto (blocklist)",
      "sem texto (spii)",
      "sem texto (recitation)",
      "sem texto (image_safety)",
    ],
    casa: "O Mestre ouviu, e não narra isso desse jeito: diga de outro modo o que você faz.",
    podeTentar: true,
  },
  {
    /* 500/502/503/504 e o 502 do roteador ("Todos os provedores
       falharam — …", api/narrador.js). Entram junto os dois silêncios
       que o próprio roteador nomeia quando o provedor responde vazio:
       "resposta vazia" (DeepSeek) e "sem texto (…)" (Gemini, com o
       `finishReason` ou o `blockReason` entre parênteses). O provedor
       falou; só não disse nada. Para o jogador dá no mesmo. */
    id: "provedor_caiu",
    natureza: "ligacao",
    codigos: [500, 502, 503, 504],
    marcas: [
      "todos os provedores falharam",
      "resposta vazia",
      "sem texto",
      /* MM15 (3): o que `chamarMestre` passa a lançar quando nem a segunda
         escrita trouxe narrativa (`MOTIVO_SEM_NARRATIVA`, abaixo) */
      "resposta sem narrativa",
      "internal server error",
      "bad gateway",
      "service unavailable",
      "gateway timeout",
    ],
    casa: "A ligação com o Mestre se partiu antes de a resposta chegar.",
    podeTentar: true,
  },
  {
    /* 429 do provedor — a fila cheia. Note que ele quase nunca chega
       cru: `TRANSITORIOS` (api/narrador.js) já tenta de novo sozinho e,
       se a fila inteira cair, o que volta é o 502 com o 429 escrito por
       dentro, e aí manda `provedor_caiu`, que vem antes. Esta linha é o
       caso em que o 429 chega limpo — e ela existe porque a espera de um
       instante é uma resposta diferente de "o Mestre caiu". */
    id: "demanda",
    natureza: "ligacao",
    codigos: [429],
    marcas: ["rate limit", "rate_limit", "too many requests", "resource_exhausted"],
    casa: "A ligação está congestionada, e a voz do Mestre não passou.",
    podeTentar: true,
  },
  {
    /* O MESTRE RESPONDEU e o tropeço foi nosso: a resposta chegou e algo
       ao aplicá-la estourou dentro do `try` de `enviar`. Não é ligação, e
       dizer "a ligação caiu" seria mentir sobre a causa — que é a mentira
       que esta etapa existe para acabar.

       Sem código e sem marca DE PROPÓSITO: nenhuma string de erro diz
       "o Mestre respondeu". Quem sabe isso é a fiação (a resposta voltou
       ou não), e é `destinoDaFalha` que escolhe esta linha pelo nome
       quando ela lhe diz `respondeu: true`. Pelo laço de marcas, nunca se
       chega aqui. */
    id: "tropeco",
    natureza: "jogo",
    codigos: [],
    marcas: [],
    casa: "A resposta do Mestre chegou, mas veio embaralhada e não se deixou ler.",
    podeTentar: true,
  },
  {
    /* O RESTO, e ele PRECISA existir: silêncio sem frase é pior do que
       frase genérica. Sem esta linha, o dia em que o provedor inventar
       um erro novo o jogador olharia para uma tela que não diz nada — ou,
       pior, para a mensagem crua da máquina. Sem código e sem marca de
       propósito: quem chega aqui chegou por não casar nenhuma das
       outras.

       É ligação, e diz que é: o `try` que a pega começa na chamada ao
       Mestre, e o tropeço DEPOIS da resposta tem a sua própria linha
       (`tropeco`). O que sobra aqui é o transporte que ninguém nomeou. */
    id: "desconhecido",
    natureza: "ligacao",
    codigos: [],
    marcas: [],
    casa: "A ligação com o Mestre calou sem dizer por quê.",
    podeTentar: true,
  },
];

/* ============================================================
   A HORA DA VIRADA DO TETO

   O teto diário conta por DIA UTC: `api/_portao.js` monta a chave com
   `new Date().toISOString().slice(0, 10)`, que é a data em Greenwich. A
   mensagem do portão diz "volta a zero à meia-noite" — e para quem joga
   no Brasil (UTC−3) essa meia-noite é às 21h. Dizer "meia-noite" na tela
   mandava o jogador esperar três horas a mais do que precisa.

   Por isso a linha do teto diz a hora LOCAL, e ela sai daqui: a hora UTC
   da virada, que é número de regra e mora numa tabela. A suíte confere
   que o portão continua a contar pelo dia UTC — se um dia ele mudar de
   fuso, esta linha e aquela mudam juntas ou a catraca grita.
   ============================================================ */
export const HORA_DA_VIRADA = {
  /* a hora UTC em que a chave `uso:<dia>` do portão muda de dia */
  horaUTC: 0,
  /* minutos num dia: o módulo de volta ao relógio de 24 horas */
  minutosNoDia: 1440,
};

/* `fuso` é o que o navegador dá em `new Date().getTimezoneOffset()`:
   minutos a SOMAR à hora local para chegar a UTC (Brasília = 180). A
   hora local da virada é, então, a hora UTC MENOS o fuso, dentro do dia.
   Fuso torto (não número, fora de ±14h) devolve "" e a linha sem hora. */
const horaLocalDaVirada = (fuso) => {
  const f = Number(fuso);
  if (typeof fuso !== "number" || !Number.isFinite(f) || Math.abs(f) > 14 * 60) return "";
  const dia = HORA_DA_VIRADA.minutosNoDia;
  const m = ((HORA_DA_VIRADA.horaUTC * 60 - f) % dia + dia) % dia;
  const h = Math.floor(m / 60), min = m % 60;
  return min ? `${h}h${String(min).padStart(2, "0")}` : `${h}h`;
};

/* Acentuação some antes da comparação porque a mesma recusa viaja com e
   sem acento dependendo de quem a escreve ("limite diário" no portão,
   "limite diario" num log). Comparar sem acento é comparar o que
   interessa. O `tecnico` original nunca passa por aqui — só a cópia. */
/* a faixa \u0300-\u036f é o bloco "Combining Diacritical Marks" do
   Unicode: depois do NFD, é exatamente onde os acentos do português
   foram parar. Escrita por escape de propósito — marca combinante solta
   no meio de um arquivo é invisível e não sobrevive a um editor
   distraído. */
const semAcento = (s) =>
  String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* O código HTTP tem de estar SOLTO na string: `429` casa em "HTTP 429" e
   em "deepseek-v4-pro: 429 (retentando…)", mas não casa dentro de
   "1429" nem de "4.29". Sem isso, um número de um corpo de resposta
   qualquer classificaria a queda inteira. */
const temOCodigo = (texto, codigo) =>
  new RegExp("(^|[^0-9.])" + codigo + "([^0-9.]|$)").test(texto);

const linhaDoSilencio = (id) =>
  MOTIVOS_DO_SILENCIO.find((m) => m.id === id) || MOTIVOS_DO_SILENCIO[MOTIVOS_DO_SILENCIO.length - 1];

/* ============================================================
   LER O SILÊNCIO

   Recebe a string crua do `catch` e devolve as duas verdades separadas:
   `casa`, que sobe para a tela, e `tecnico`, que desce para o console.

   `tecnico` VOLTA ÍNTEGRO — sem cortar, sem aparar, sem mascarar. Esta
   função classifica; ela não edita. Foi o motivo inteiro, com o nome do
   modelo e o pedaço do corpo, que permitiu diagnosticar as quedas desta
   sessão; um motivo resumido teria escondido justamente a parte que
   importava.

   Entrada `null`, vazia ou de tipo errado não estoura: devolve a linha
   do desconhecido, que é a resposta honesta para "calou e não disse por
   quê".
   ============================================================ */
/* OS PEDAÇOS DA QUEDA (MM15). O roteador de `api/narrador.js` junta a
   queda de cada provedor numa linha: "Todos os provedores falharam — A ·
   B". Uma linha com `todos: true` só casa se CADA pedaço tiver uma das
   suas marcas. Fora do roteador (um erro solto), a string inteira é o
   único pedaço. */
const CABECA_DO_ROTEADOR = "todos os provedores falharam";
const pedacosDaQueda = (agulha) => {
  const i = agulha.indexOf(CABECA_DO_ROTEADOR);
  if (i < 0) return [agulha];
  const resto = agulha.slice(i + CABECA_DO_ROTEADOR.length).replace(/^\s*[—-]\s*/, "");
  const pedacos = resto.split(" · ").map((p) => p.trim()).filter(Boolean);
  return pedacos.length ? pedacos : [agulha];
};

export function lerOSilencio(motivoTecnico, opcoes) {
  const tecnico =
    typeof motivoTecnico === "string"
      ? motivoTecnico
      : motivoTecnico == null
        ? ""
        : String(motivoTecnico);
  /* `= {}` não cobre `null`: as opções são lidas uma a uma */
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const agulha = semAcento(tecnico);
  let achada = null;
  if (agulha) {
    for (const linha of MOTIVOS_DO_SILENCIO) {
      const marcas = linha.marcas || [];
      const porMarca = linha.todos
        ? marcas.length > 0 && pedacosDaQueda(agulha).every((p) => marcas.some((m) => p.includes(m)))
        : marcas.some((m) => agulha.includes(m));
      const porCodigo = (linha.codigos || []).some((c) => temOCodigo(agulha, c));
      if (porMarca || porCodigo) { achada = linha; break; }
    }
  }
  const linha = achada || linhaDoSilencio("desconhecido");
  const hora = linha.casaComHora ? horaLocalDaVirada(o.fuso) : "";
  return {
    id: linha.id,
    casa: hora ? linha.casaComHora.replace("HORA", hora) : linha.casa,
    podeTentar: linha.podeTentar !== false,
    natureza: linha.natureza || "ligacao",
    tecnico,
  };
}

/* ============================================================
   OS SELOS DO RESOLVIDO

   O App marca com um selo entre colchetes, na PRIMEIRA linha do
   envelope, todo turno em que o motor JÁ ROLOU e JÁ APLICOU. É esse selo
   que distingue "o mundo já mudou, falta contar" de "estou perguntando
   uma coisa ao Mestre" — e é essa distinção que decide se a trava morde.

   POR QUE PADRÃO, E NÃO UMA LISTA DE LITERAIS. A varredura do App.jsx
   acha hoje mais de vinte envelopes selados, e vários montam o rótulo em
   tempo de execução: `[MASMORRA — ${pos} · TESOURO RESOLVIDO PELO
   SISTEMA]` e `[${m.nome} — JÁ APLICADA PELO SISTEMA]` não existem como
   texto em lugar nenhum do código. Uma lista de literais nasceria
   incompleta e envelheceria a cada envelope novo — e envelhecer, aqui,
   quer dizer deixar a re-rolagem voltar em silêncio.

   `medidos` é a lista MEDIDA hoje no App.jsx, guardada ao lado do padrão
   de propósito: ela é dado, e não comentário, justamente para que a
   suíte possa varrê-la de volta e provar que todo selo real continua
   casando o seu padrão. Comentário a catraca não lê.

   O QUE FICOU DE FORA, e é deliberado: `[LUGAR — RECUSADO PELO SISTEMA]`
   (o sistema recusou, não aplicou), `[ITEM GERADO PELO SISTEMA]` e
   `[QUEST GERADA PELO SISTEMA]` (geração, não resolução de ação
   declarada) e toda a família `[… — REGISTRO DO SISTEMA]`, que anota um
   fato sem rolar nada. Travar a declaração nesses casos seria punir sem
   ter o que perder.

   ONDE SE OLHA, e isso poda a busca por buracos pela metade: o que a
   trava julga é o `conteudo` que vai a `enviar(...)` — o envelope. A
   NOTA (`notaRef`) não passa por aqui: ela viaja pela pauta dinâmica, e
   nunca é o texto do turno. Por isso `[TRATADO — JÁ FIRMADO PELO
   SISTEMA]`, `[CONTRATO PAGO pelo sistema: …]`, `[DÁDIVA ÉPICA CONCEDIDA
   PELO SISTEMA]`, `[RITO DE ASCENSÃO — ABERTO PELO SISTEMA]` e
   `[CONCENTRAÇÃO — QUEBRADA PELO SISTEMA]` anunciam coisa consumada com
   particípio fora desta lista e mesmo assim NÃO são buraco: nenhum deles
   é envelope.

   O BURACO QUE ESTA TABELA NÃO ALCANÇA, e que fica anotado para quem
   vier: há envelope que vai a `enviar` SEM SELO NENHUM depois de o motor
   cobrar — `[${m.nome}] ${acao}`, a magia de invisibilidade/voo/luz, sai
   com o PM já descontado e um cabeçalho que é só o nome da magia. Não há
   padrão que o pegue sem pegar o mundo inteiro junto: falta o selo, não
   falta linha na tabela. O conserto é batizar o envelope no App, e isso
   é fiação — não se resolve daqui.
   ============================================================ */
export const SELOS_DO_RESOLVIDO = [
  {
    id: "resolvido",
    /* sem a marca `g`: RegExp com `g` guarda `lastIndex` e mente na
       segunda chamada com a mesma instância */
    padrao: /\bRESOLVID[AO]S?\b/i,
    porque: "o motor rolou e aplicou; o envelope só pede a narração",
    medidos: [
      "[COMBATE — RESOLVIDO PELO SISTEMA]",
      "[COMBATE — RESOLVIDO]",
      "[HABILIDADE — RESOLVIDA PELO SISTEMA]",
      "[HABILIDADES — RESOLVIDAS PELO SISTEMA]",
      "[AGUENTEI O GOLPE — RESOLVIDO PELO SISTEMA]",
      "[QUEDA — RESOLVIDA PELO SISTEMA]",
      "[REAÇÃO — REVIDE RESOLVIDO PELO SISTEMA]",
      "[SACRIFÍCIO ARCANO — RESOLVIDO PELO SISTEMA]",
      "[MOVIMENTO — RESOLVIDO PELO SISTEMA]",
      "[RITUAL — RESOLVIDO PELO SISTEMA]",
      "[IDENTIFICAR — RESOLVIDO PELO SISTEMA]",
      "[LOCALIZAR — RESOLVIDO PELO SISTEMA]",
      "[GUILDA — RESOLVIDO PELO SISTEMA]",
      "[GUILDA FUNDADA — RESOLVIDO PELO SISTEMA]",
      "[MISSAO PERDIDA — RESOLVIDO PELO SISTEMA]",
      "[VOLTA DOS MORTOS — RESOLVIDA PELO SISTEMA]",
    ],
  },
  {
    id: "ja_feito",
    /* "JÁ" + particípio: o envelope diz, com todas as letras, que o
       preço já foi cobrado. A lista de particípios é fechada e medida —
       aberta (`J[ÁA]\s+\w+`) ela casaria "já disse", "já vi", "já era".

       `ABERT` entrou por um buraco que a catraca do X3 pegou: a masmorra
       manda `[MASMORRA — … — COMBATE JÁ ABERTO PELO SISTEMA]`, e ABRIR
       COMBATE É TURNO RESOLVIDO. Quando essa linha parte, `abrirCombate`
       já rodou inteiro — ficha trocada, INICIATIVA ROLADA, traços de
       abertura aplicados, desgaste da masmorra cobrado. Se o Narrador
       cai ali e o jogador declara de novo, a luta reabre e a iniciativa
       rola outra vez: é a re-rolagem que esta etapa existe para impedir,
       entrando pela porta de trás.

       E é ESTA a régua para o caso seguinte: o selo trava quando o
       sistema MEXEU NA FICHA (rolou um dado, cobrou um preço, trocou o
       estado que o jogador perderia), e não quando ele apenas ANOTOU um
       fato. Abrir combate mexe. Por isso `[PARTIDA — REGISTRADA PELO
       SISTEMA]` fica de fora mesmo tendo particípio: ela só grava o
       destino escolhido, sem dado e sem preço; e `[DESPERTAR DIVINO —
       MARCO REGISTRADO PELO SISTEMA]` também, porque o marco já foi ao
       save na linha seguinte — não há o que perder numa queda. Travar
       onde não há perda é punir o jogador por uma falha que não foi
       dele.

       Note que `ABERT` continua exigindo o "JÁ" da frente, e é por isso
       que ele é estreito: `[RITO DE ASCENSÃO — ABERTO PELO SISTEMA]` (que
       é nota, e não envelope) e `[ABERTURA DE CAPÍTULO]` seguem de fora,
       sem precisar de exceção escrita. */
    padrao: /\bJ[ÁA]\s+(APLICAD|RESOLVID|PAG|REGISTRAD|COBRAD|NOMEAD|ABERT)[AO]S?\b/i,
    porque: "o preço já saiu da ficha; declarar de novo cobraria duas vezes",
    medidos: [
      /* medido em App.jsx: `pos` é "<nome> · camada N · V/T salas", e o
         rótulo do meio alterna entre CHEFE e COMBATE */
      "[MASMORRA — Cripta dos Sussurros · camada 2 · 3/9 salas · CHEFE — COMBATE JÁ ABERTO PELO SISTEMA]",
      "[MASMORRA — Cripta dos Sussurros · camada 1 · 2/9 salas · COMBATE — COMBATE JÁ ABERTO PELO SISTEMA]",
      "[PECHINCHA — JÁ RESOLVIDA PELO SISTEMA]",
      "[REVOLTA — JÁ RESOLVIDA PELO SISTEMA]",
      "[MILAGRE — EFEITO JÁ APLICADO PELO SISTEMA]",
      "[MILAGRE INVOCADO — efeito JÁ APLICADO pelo sistema]",
      "[CONDIÇÃO — DANO JÁ APLICADO PELO SISTEMA]",
      "[CONSUMÍVEL — JÁ APLICADO PELO SISTEMA]",
      "[IMPOSTO — JÁ APLICADO PELO SISTEMA]",
      "[MAPA COMPRADO — JÁ APLICADO PELO SISTEMA]",
      "[OBRA CONCLUÍDA — JÁ APLICADA PELO SISTEMA]",
      "[OBRA INICIADA — JÁ PAGA PELO SISTEMA]",
      "[REIVINDICAÇÃO — JÁ PAGA PELO SISTEMA]",
      "[COMPRA — JÁ REGISTRADA PELO SISTEMA]",
      "[GOVERNADOR — JÁ NOMEADO PELO SISTEMA]",
    ],
  },
  {
    id: "rolado_pelo_sistema",
    /* o dado já caiu. Aqui o particípio vem SEM o "já", e é a companhia
       obrigatória de "pelo sistema" que impede o falso positivo. */
    padrao: /\b(ROLAD|APLICAD)[AO]S?\s+PELO\s+SISTEMA\b/i,
    porque: "o dado já caiu; rolar de novo seria dar segunda chance a um resultado",
    medidos: [
      "[INICIATIVA ROLADA PELO SISTEMA]",
      "[ATAQUES DE OPORTUNIDADE — ROLADOS PELO SISTEMA]",
      "[EFEITO APLICADO PELO SISTEMA]",
      "[FOGO AMIGO — APLICADO PELO SISTEMA]",
      "[DÁDIVA DA RECUPERAÇÃO — APLICADA PELO SISTEMA]",
      "[FÚRIA PERSISTENTE — APLICADA PELO SISTEMA]",
    ],
  },
];

/* ============================================================
   É TURNO RESOLVIDO?

   Só o PRIMEIRO par de colchetes conta. O corpo do envelope é prosa
   escrita para a IA e diz coisas como "o dano já foi aplicado" no meio
   de uma frase — varrer o texto inteiro daria positivo em envelope que
   não resolveu nada. O selo é o cabeçalho, e é ali que se olha.

   Frase crua de jogador nunca começa por colchete, então ela responde
   `false` sem precisar de regra própria: quem digita "ataco o bandido"
   não tem turno preso a perder.
   ============================================================ */
export function ehTurnoResolvido(conteudo) {
  const texto = typeof conteudo === "string" ? conteudo : "";
  const cabeca = /^\s*\[([^\]]*)\]/.exec(texto);
  if (!cabeca) return false;
  const selo = cabeca[1];
  return SELOS_DO_RESOLVIDO.some((s) => s.padrao.test(selo));
}

/* ============================================================
   A IMPRESSÃO DO ENVELOPE

   FNV-1a de 32 bits (Fowler–Noll–Vo, 1991), na forma canônica: `base` é
   o offset basis 2166136261 (0x811c9dc5) e `primo` é o FNV prime
   16777619 (0x01000193). Os dois números são da especificação, não são
   escolha desta casa — e estão aqui, nomeados, porque a primeira lei não
   abre exceção para número de algoritmo.

   POR QUE UMA MARCA, e não comparar as strings direto: a marca é curta,
   cabe no save, sobrevive ao JSON e serve de asserção. É com ela que a
   suíte prova BYTE A BYTE que o texto narrado depois da falha é o mesmo
   que o motor produziu antes dela — que é a promessa inteira desta
   etapa. O comprimento vai colado no fim porque duas strings só colidem
   se colidirem no hash E tiverem o mesmo tamanho.

   Determinística por construção: mesma string, mesma marca, em qualquer
   máquina. `Math.imul` é o que garante a multiplicação de 32 bits com
   estouro — sem ele, o número vira ponto flutuante e o resultado muda de
   acordo com o tamanho do texto.
   ============================================================ */
export const IMPRESSAO_FNV = {
  /* offset basis de 32 bits da especificação FNV-1a */
  base: 2166136261,
  /* FNV prime de 32 bits da mesma especificação */
  primo: 16777619,
  /* 8 dígitos hexadecimais são exatamente 32 bits: a marca nunca encolhe
     quando o hash começa com zero */
  digitos: 8,
};

export function marcaDoTurno(conteudo) {
  const texto = typeof conteudo === "string" ? conteudo : "";
  let h = IMPRESSAO_FNV.base >>> 0;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    /* duas passadas por letra, byte baixo e byte alto: assim "á" e "a"
       não se confundem e o acento pesa na marca */
    h = Math.imul(h ^ (c & 0xff), IMPRESSAO_FNV.primo) >>> 0;
    h = Math.imul(h ^ ((c >>> 8) & 0xff), IMPRESSAO_FNV.primo) >>> 0;
  }
  return h.toString(16).padStart(IMPRESSAO_FNV.digitos, "0") + "-" + texto.length;
}

/* ============================================================
   NÃO HÁ TURNO PRESO

   Um valor só para dizer "vazio", para o App, o save e a suíte não
   inventarem três jeitos de dizer a mesma coisa. É `null` porque é o que
   o save já escreve e o que o JSON devolve intacto — um objeto-sentinela
   viraria um segundo vazio, e aí "não há turno preso" teria duas formas,
   que é como esta base já sabe que nasce bug.
   ============================================================ */
export const SEM_GUARDADO = null;

/* A CONTA QUE CONTINUA (interna de propósito)

   Duas quedas seguidas do MESMO envelope são a mesma insistência, e a
   conta não pode voltar a zero no meio dela. A identidade do turno é a
   `marca` — a impressão determinística do envelope —, e não o objeto:
   o registro anterior pode ter ido ao save e voltado como JSON cru, sem
   nada congelado, e ainda assim é o mesmo turno.

   O QUE ESTE NÚMERO CONTA: quantas vezes o jogador JÁ PEDIU DE NOVO —
   não quantas vezes o Mestre calou. Por isso aqui ele é HERDADO COMO
   ESTÁ, sem somar um. Quem soma é `maisUmaTentativa`, no instante do
   "tentar de novo", que é o instante do pedido; somar também na queda
   contaria o mesmo retry duas vezes, e o console pularia de "tentativa
   1" para "tentativa 3" com um clique só. O ordinal da queda que
   acabou de acontecer é, portanto, `tentativas + 1` — e é assim que o
   App o imprime.

   Não vira export: leitor de verdade só há um, e export morto mente. A
   suíte prova esta regra ATRAVÉS de `guardarTurno`, que é por onde ela
   existe.

   `anterior` torto — string, número, objeto sem `marca`, `null` — não
   estoura nem herda: recomeça em 0, que é a resposta honesta para "não
   sei de onde isto vem". */
const tentativasHerdadas = (anterior, marca) => {
  if (!anterior || typeof anterior !== "object") return 0;
  if (anterior.marca !== marca) return 0;
  const antes = Number(anterior.tentativas);
  /* `Math.floor` apara o save corrompido: um 2.5 vindo do JSON viraria
     "tentativa 3.5" no console, e número quebrado numa contagem de
     vezes é ruído que se disfarça de dado */
  return Number.isFinite(antes) && antes > 0 ? Math.floor(antes) : 0;
};

/* ============================================================
   GUARDAR O TURNO

   O registro do turno que o motor resolveu e o Narrador não contou.
   Guarda o ENVELOPE EXATO — é ele, e não uma reconstrução, que será
   narrado depois.

   `= {}` no destructuring não cobre `null`, então aqui não há
   destructuring nenhum: cada campo é lido e tratado um a um.

   Sem envelope não há turno guardado: `guardarTurno(null)` devolve
   `SEM_GUARDADO` em vez de um registro oco. Um registro de conteúdo
   vazio travaria a declaração do jogador sem ter nada para narrar em
   troca — trancar a porta e perder a chave.

   O registro é CONGELADO. Quem precisar de outro estado chama
   `maisUmaTentativa`, que devolve estrutura nova; `guardado.tentativas++`
   escrito à mão falha alto em vez de corromper o registro em silêncio.
   E o congelamento é raso de propósito: `histBase` e `persAtual` são do
   App, e este módulo não manda no que é dos outros.

   `anterior` é OPCIONAL, e é o registro que já estava preso quando esta
   queda aconteceu. Se for o mesmo turno — mesma `marca` —, o registro
   novo CONTINUA a conta de tentativas em vez de voltar a zero; se for
   outro turno, ou `SEM_GUARDADO`, ou lixo, nasce em 0. Ausente, o
   comportamento é o de sempre: 0, byte por byte.
   ============================================================ */
export function guardarTurno(args) {
  const a = args == null ? {} : args;
  const conteudo = typeof a.conteudo === "string" ? a.conteudo : "";
  if (!conteudo) return SEM_GUARDADO;
  /* o histórico entra por cópia rasa: a lista é nossa, as mensagens
     continuam sendo do App */
  const histBase = Array.isArray(a.histBase) ? a.histBase.slice() : null;
  const persAtual = a.persAtual == null ? null : a.persAtual;
  /* `quando` é ARGUMENTO, nunca `Date.now()`: um relógio aqui dentro
     tornaria o registro impossível de provar */
  const quando =
    typeof a.quando === "number" && Number.isFinite(a.quando)
      ? a.quando
      : typeof a.quando === "string" && a.quando
        ? a.quando
        : 0;
  const marca = marcaDoTurno(conteudo);
  return Object.freeze({
    conteudo,
    marca,
    histBase,
    persAtual,
    /* `fuso` é opcional (MM15): só a linha do teto o usa, para dizer a
       hora local em que a mesa reabre */
    silencio: Object.freeze(lerOSilencio(a.motivo, { fuso: a.fuso })),
    /* zero para turno novo; a conta do anterior quando é a MESMA queda
       insistindo — a regra inteira está em `tentativasHerdadas` */
    tentativas: tentativasHerdadas(a.anterior, marca),
    quando,
    /* é este campo que a trava lê. Deriva do envelope, e não de quem
       chamou, porque quem chama é o App — e a verdade sobre "o motor já
       rolou" está escrita no selo, não na intenção da fiação. */
    rolou: ehTurnoResolvido(conteudo),
  });
}

/* ============================================================
   MAIS UMA TENTATIVA

   Registro novo com a conta de tentativas somada — nada é mutado. A
   conta existe porque insistir cinco vezes no mesmo silêncio é uma
   informação sobre o mundo (e sobre o que dizer ao jogador), e porque
   sem ela a tela não tem como saber que já ofereceu.

   Aceita registro vindo do SAVE, que é objeto comum de JSON e não traz
   nada congelado. Sem registro, não há tentativa: devolve `SEM_GUARDADO`.
   ============================================================ */
export function maisUmaTentativa(guardado) {
  if (!guardado || typeof guardado !== "object") return SEM_GUARDADO;
  const antes = Number(guardado.tentativas);
  return Object.freeze({
    ...guardado,
    tentativas: (Number.isFinite(antes) && antes > 0 ? antes : 0) + 1,
  });
}

/* ============================================================
   O QUE NARRAR

   A garantia anti-re-rolagem escrita como função: o que volta é o
   `conteudo` guardado, BYTE POR BYTE. Nada de recompor, nada de
   reanexar nota, nada de "melhorar" o envelope — o motor já decidiu o
   que aconteceu, e o segundo pedido é só o pedido de contar.

   Sem guardado, string vazia: quem chamar sem ter nada preso não manda
   um envelope fantasma ao Mestre.
   ============================================================ */
export function oQueNarrar(guardado) {
  if (!guardado || typeof guardado !== "object") return "";
  return typeof guardado.conteudo === "string" ? guardado.conteudo : "";
}

/* ============================================================
   A TRAVA DO DECLARAR

   `true` quando há turno guardado que JÁ ROLOU. Enquanto ela estiver
   levantada, o App não deixa uma segunda declaração chegar ao motor —
   que é a diferença entre uma queda de rede e uma segunda chance.

   E ela é ESTREITA de propósito. Turno guardado que não rolou (uma
   pergunta, uma conversa, uma abertura de capítulo) NÃO trava: ali não
   há resultado a perder, e travar seria punir o jogador por uma falha
   que não foi dele. A trava existe para proteger uma rolagem, não para
   proteger a fila.

   O ramo do `rolou` ausente é para o save antigo, escrito antes de este
   campo existir: em vez de destravar por omissão — que é destravar
   exatamente no caso que a trava existe para cobrir —, relê o selo do
   envelope, que está guardado ali do lado.
   ============================================================ */
export function travaODeclarar(guardado) {
  if (!guardado || typeof guardado !== "object") return false;
  if (guardado.rolou === true) return true;
  if (guardado.rolou == null) return ehTurnoResolvido(guardado.conteudo);
  return false;
}

/* ============================================================
   MM15 (3) — O TURNO QUE NÃO ACONTECEU

   O defeito, medido no T11 da segunda sessão de prova: a API respondeu
   429 três vezes, o Mestre não disse nada — e o relógio andou de 08:40
   para 08:50. Dez minutos de mundo por um turno que não houve: cinco de
   `MINUTOS_POR_TURNO`, cobrados por `agirInterno` antes de chamar
   `enviar`, e cinco da caminhada que `talvezAndarNaCidade` registou
   dentro de `enviar`, também antes da chamada. E não só o relógio: a
   pauta daquele turno já trazia "[MOVIMENTO — REGISTRADO PELO SISTEMA]
   … AGORA estou no Último Gomo" — o lugar tinha mudado, a nota estava
   escrita, e nada disso se desfez quando o Mestre calou.

   A REGRA: SE O MESTRE NÃO OUVIU, O TURNO NÃO CONTA. Nada do que o turno
   avança por ter "acontecido" fica — relógio, dia, lugar, recursos,
   missões, a rodada da frente, o sino, a nota, as linhas na tela. O
   mundo volta ao retrato tirado antes, e a frase do jogador volta à caixa.

   A EXCEÇÃO É A DE X3, E ELA É LEI: o que os DADOS já decidiram antes da
   chamada não se desfaz. Desfazer um golpe rolado e deixar o jogador
   declará-lo de novo é a re-rolagem que `travaODeclarar` existe para
   impedir — uma queda de rede não pode ser segunda chance. Nesses turnos
   desfaz-se só o que `enviar` avançou por conta própria (a pauta, a
   frente, o sino), para o "tentar de novo" não o cobrar duas vezes; o
   resultado dos dados fica, guardado, à espera de ser contado.

   O QUE ESTE BLOCO NÃO FAZ: não conhece ref nenhuma, nem `useRef`, nem o
   save. Recebe RETRATOS (objetos comuns), decide, e devolve o retrato a
   repor. Quem tira a foto e quem a repõe é a fiação.
   ============================================================ */

/* ------------------------------------------------------------
   A RESPOSTA SEM NARRATIVA

   O terceiro silêncio que se disfarçava: `chamarMestre` tenta DUAS vezes
   quando o JSON chega sem narrativa, e se a segunda também falha devolve
   a primeira assim mesmo — com a narrativa de recurso que `extrairJSON`
   põe no lugar ("O Mestre hesita por um instante… (toque em Tentar de
   novo)", ou o "…" de `sanearResposta`). O turno então CONTA: o relógio
   anda, as mudanças da resposta aplicam-se, e a tela mostra, como fala do
   Mestre, uma instrução de botão. É uma falha de ligação vestida de
   sucesso.

   Os dois recursos são texto de `src/json.js`, e a suíte prova que
   `narrativaFaltou` os reconhece pelo que `extrairJSON` devolve de
   verdade — não por cópia. `MOTIVO_SEM_NARRATIVA` é o que o App lança
   nesse caso, e cai em `provedor_caiu` pela marca que a tabela tem.
   ------------------------------------------------------------ */
export const NARRATIVA_QUE_NAO_VEIO = {
  /* o que `sanearResposta` devolve quando o campo veio vazio */
  vazias: ["…"],
  /* o começo das duas frases de recurso de `extrairJSON` */
  prefixos: ["O Mestre hesita"],
};

export const MOTIVO_SEM_NARRATIVA = "resposta sem narrativa depois da segunda escrita";

export function narrativaFaltou(resp) {
  if (!resp || typeof resp !== "object") return true;
  const n = typeof resp.narrativa === "string" ? resp.narrativa.trim() : "";
  if (!n) return true;
  if (NARRATIVA_QUE_NAO_VEIO.vazias.includes(n)) return true;
  return NARRATIVA_QUE_NAO_VEIO.prefixos.some((p) => n.startsWith(p));
}

/* ------------------------------------------------------------
   OS TRÊS DESTINOS DE UMA FALHA

   A ORDEM É A PRECEDÊNCIA, como na tabela dos silêncios.

   · `mestre_respondeu` — a resposta CHEGOU e o tropeço foi nosso, ao
     aplicá-la. O turno volta ao retrato do ENVIO (o que a resposta
     aplicou pela metade sai; o que os dados decidiram antes fica), e o
     "tentar de novo" pede a narração do mesmo envelope.
   · `dados_ja_cairam` — o envelope (ou a nota que ia com ele) traz o selo
     de turno resolvido, ou a luta está aberta — onde todo turno escrito
     fecha com a vez do mundo ROLADA (`fecharMeuTurno`), mesmo quando o
     envelope começa pela frase crua e escapa ao selo. Mesmo retrato do
     envio, mesmo reenvio do envelope. E o botão aparece SEMPRE
     (`botaoSempre`): com a trava levantada e sem botão, a mesa ficava
     trancada para sempre — a porta sem chave de que X3 falava, agora
     pelo lado de cá. Um 429 do teto num golpe já rolado era exatamente
     isso: nem declarar, nem pedir que contassem, nem depois da virada.
   · `turno_nao_houve` — o resto: nada rolou, nada se decidiu. O mundo
     volta ao retrato do INÍCIO do turno, a frase volta à caixa, e o
     turno não fica guardado (não há nada preso para contar).

   `linha` é a segunda metade do que o jogador lê, depois da `casa` do
   silêncio: a primeira diz o que aconteceu com a ligação, esta diz o que
   aconteceu com o turno. As duas são verdade juntas.
   ------------------------------------------------------------ */
export const DESTINOS_DA_FALHA = [
  {
    id: "mestre_respondeu",
    desfazer: "envio",
    reenvio: "envelope",
    devolverFrase: false,
    guardar: true,
    botaoSempre: false,
    linha: "Nada do que a resposta trazia ficou na mesa; peça ao Mestre que conte outra vez.",
  },
  {
    id: "dados_ja_cairam",
    desfazer: "envio",
    reenvio: "envelope",
    devolverFrase: false,
    guardar: true,
    botaoSempre: true,
    linha: "O que os dados decidiram fica decidido; falta só o Mestre contar.",
  },
  {
    id: "turno_nao_houve",
    desfazer: "turno",
    reenvio: "frase",
    devolverFrase: true,
    guardar: false,
    botaoSempre: false,
    linha: "Nada do que você fez chegou a acontecer: a sua frase espera por você.",
  },
];

const destinoPorId = (id) => DESTINOS_DA_FALHA.find((d) => d.id === id) || DESTINOS_DA_FALHA[DESTINOS_DA_FALHA.length - 1];

/* ------------------------------------------------------------
   O QUE SOBREVIVE AO DESFEITO

   O retrato é o do save — é ele que enumera o mundo inteiro, e um órgão
   novo que entra no save entra no desfeito sem ninguém se lembrar (uma
   lista de refs à parte apodreceria no primeiro órgão novo). Mas nem
   tudo o que o save leva é MUNDO. Estes campos ficam como estão AGORA:

   · `custo`, `provedor`, `provedores` — a medida do que foi GASTO. As
     chamadas do turno falhado foram pagas (as falas colhidas, as leves);
     desfazer o turno não devolve o dinheiro, e apagar a conta mentiria
     sobre ele. É esta conta que mostrou as 37 chamadas da sessão 2.
   · `guardado` — o turno preso de X3. Quem decide o que ele vira é o
     destino (`guardar`), não o retrato velho.
   · `abasAbertas`, `preferenciaDaReacao` — escolhas da pessoa, não do
     mundo; abrir uma aba durante a espera não é parte do turno.
   · `backupEm`, `salvoEm` — marcas da gravação, não do jogo.
   ------------------------------------------------------------ */
export const SOBREVIVEM_AO_DESFEITO = [
  "custo", "provedor", "provedores", "guardado",
  "abasAbertas", "preferenciaDaReacao", "backupEm", "salvoEm",
];

/* ------------------------------------------------------------
   O QUE O TURNO ANDA ANTES DE O MESTRE RESPONDER — medido no App.jsx

   A lista não é o que se repõe (o que se repõe é o retrato inteiro): é a
   PROVA de que o retrato cobre o que anda. Cada linha diz um campo, a
   ref que o guarda e quem o move antes da chamada. A suíte confere que
   cada campo `noSave` é chave do objeto que `salvar` grava, e que cada
   função nomeada ainda existe no App — se uma for renomeada, ou um campo
   sair do save, a catraca grita em vez de o desfeito passar a esquecê-lo
   em silêncio.

   `noSave: false` são os soltos: refs que o turno gasta e o save não
   leva. A fiação fotografa-os ao lado do retrato (`soltos`), e é por eles
   que a nota não volta com o "[MOVIMENTO — REGISTRADO]" de um passo que
   se desfez, e o trabalho de oficina não se perde na queda.

   `quem` é nome de função e não número de linha, de propósito: número de
   linha de um arquivo de 25 mil apodrece no commit seguinte.
   ------------------------------------------------------------ */
export const O_QUE_O_TURNO_ANDA = [
  { campo: "minuto", ref: "minutoRef", noSave: true, quem: ["agirInterno", "avancarMinutos", "moverParaLocal", "irAoLugarPeloMapa"] },
  { campo: "dia", ref: "diaRef", noSave: true, quem: ["avancarMinutos", "avancarDiasReino"] },
  { campo: "reino", ref: "reinoRef", noSave: true, quem: ["avancarMinutos", "avancarDiasReino"] },
  { campo: "personagem", ref: "personagemRef", noSave: true, quem: ["mudarFicha", "avancarMinutos", "rodarAFrente", "talvezVirar", "avancarDiasReino"] },
  { campo: "mensagens", ref: "mensagensRef", noSave: true, quem: ["agirInterno", "pushMsgs"] },
  { campo: "confidencias", ref: "confidenciasRef", noSave: true, quem: ["agirInterno"] },
  { campo: "conquistas", ref: "conqRef", noSave: true, quem: ["checarConquistas"] },
  { campo: "abertura", ref: "aberturaMundoRef", noSave: true, quem: ["marcarTurnoDoMundo"] },
  { campo: "turnosDeMundo", ref: "turnosDeMundoRef", noSave: true, quem: ["marcarTurnoDoMundo"] },
  { campo: "relogios", ref: "relogiosRef", noSave: true, quem: ["marcarTurnoDoMundo"] },
  { campo: "chao", ref: "chaoRef", noSave: true, quem: ["varrerChao"] },
  { campo: "cidadeAtual", ref: "cidadeAtualRef", noSave: true, quem: ["talvezChegarSozinho"] },
  { campo: "jornada", ref: "jornadaRef", noSave: true, quem: ["talvezChegarSozinho"] },
  { campo: "lugar", ref: "lugarRef", noSave: true, quem: ["talvezChegarSozinho", "moverParaLocal", "irAoLugarPeloMapa"] },
  { campo: "mapa", ref: "mapaRef", noSave: true, quem: ["talvezChegarSozinho", "avancarDiasReino"] },
  { campo: "compasso", ref: "compassoRef", noSave: true, quem: ["talvezAndarOCompasso"] },
  { campo: "estante", ref: "estanteRef", noSave: true, quem: ["talvezDarFormaACena"] },
  { campo: "raid", ref: "raidRef", noSave: true, quem: ["rodarAFrente"] },
  { campo: "missoes", ref: "missoesRef", noSave: true, quem: ["talvezVirar", "talvezDarUmaTrama"] },
  { campo: "intencoesFeitas", ref: "intencoesFeitasRef", noSave: true, quem: ["talvezDarUmaTrama"] },
  { campo: "tramasFeitas", ref: "tramasFeitasRef", noSave: true, quem: ["talvezDarUmaTrama"] },
  { campo: "elencoMem", ref: "elencoMemRef", noSave: true, quem: ["enviar", "pautaDoTurno"] },
  { campo: "baseMundo", ref: "baseMundoRef", noSave: true, quem: ["dispararPropositos"] },
  { campo: "reviravolta", ref: "reviravoltaRef", noSave: true, quem: ["mexerNaReviravolta"] },
  { campo: "reviravoltaMaior", ref: "reviravoltaMaiorRef", noSave: true, quem: ["mexerNaReviravolta"] },
  { campo: "escada", ref: "escadaRef", noSave: true, quem: ["mexerNoEncalhe"] },
  { campo: "postura", ref: "posturaRef", noSave: true, quem: ["mexerNaPostura"] },
  { campo: "gestos", ref: "gestosRef", noSave: true, quem: ["mexerNaPostura"] },
  { campo: "episodio", ref: "episodioRef", noSave: true, quem: ["mexerNoEpisodio", "mexerNaNoite"] },
  { campo: "historia", ref: "historiaRef", noSave: true, quem: ["mexerNoEpisodio"] },
  { campo: "promessas", ref: "promessasRef", noSave: true, quem: ["mexerNoEpisodio"] },
  { campo: "noite", ref: "noiteRef", noSave: true, quem: ["mexerNaNoite"] },
  { campo: "torneio", ref: "torneioRef", noSave: true, quem: ["mexerNaNoite"] },
  { campo: "cobradas", ref: "cobradasRef", noSave: true, quem: ["pautaDoTurno"] },
  { campo: "ultimaCobranca", ref: "ultimaCobrancaRef", noSave: true, quem: ["pautaDoTurno"] },
  { campo: "formasCobradas", ref: "formasCobradasRef", noSave: true, quem: ["pautaDoTurno"] },
  /* os soltos — fora do save, e por isso fotografados à parte */
  { campo: "nota", ref: "notaRef", noSave: false, quem: ["moverParaLocal", "marcarTurnoDoMundo", "mexerNaPostura", "enviar"] },
  { campo: "oficina", ref: "oficinaRef", noSave: false, quem: ["enviar"] },
  { campo: "sino", ref: "sinoDoTurnoRef", noSave: false, quem: ["marcarTurnoDoMundo", "pautaDoTurno"] },
  { campo: "ultimoPeso", ref: "ultimoPesoRef", noSave: false, quem: ["pautaDoTurno"] },
  { campo: "fatosDoPeso", ref: "fatosDoPesoRef", noSave: false, quem: ["pautaDoTurno"] },
];

/* ------------------------------------------------------------
   OS DADOS JÁ CAÍRAM?

   Mais largo que `ehTurnoResolvido`, e de propósito. A trava só olha o
   PRIMEIRO colchete do envelope, porque travar por engano pune o jogador.
   Aqui o erro caro é o contrário: dizer "nada rolou" de um turno que
   rolou desfaz o dado e devolve a re-rolagem. Então olha-se TODO cabeçalho
   entre colchetes do envelope E da nota que já esperava por ele quando
   `enviar` começou — é ali que o ritual, a oportunidade na retirada e o
   que `agirInterno` resolveu antes deixam o selo. Frase de jogador quase
   nunca tem colchete; e se tiver e casar, o erro é o seguro.
   ------------------------------------------------------------ */
const rolouNoTurno = (texto) => {
  const s = typeof texto === "string" ? texto : "";
  for (const m of s.matchAll(/\[([^\]]*)\]/g)) {
    if (SELOS_DO_RESOLVIDO.some((selo) => selo.padrao.test(m[1]))) return true;
  }
  return false;
};

/* ------------------------------------------------------------
   A FOTO DO TURNO

   `retrato` é o objeto que o save gravaria agora (o mesmo literal de
   `salvar`, sem gravar); `soltos` são os campos `noSave: false` de
   `O_QUE_O_TURNO_ANDA`; `frase` é o que o jogador escreveu, crua, antes de
   qualquer envelope — é ela que volta à caixa.

   Cópia rasa, e basta pela lei da casa: estado é SUBSTITUÍDO, nunca
   mutado, então a referência guardada agora é o valor de agora. Retrato
   torto (não objeto) vira `null`, e sem retrato não há o que repor —
   `turnoNaoAconteceu` responde `null` e a fiação segue como hoje.
   ------------------------------------------------------------ */
export function fotografarOTurno(args) {
  const a = args && typeof args === "object" ? args : {};
  const retrato = a.retrato && typeof a.retrato === "object" && !Array.isArray(a.retrato) ? { ...a.retrato } : null;
  const soltos = a.soltos && typeof a.soltos === "object" && !Array.isArray(a.soltos) ? { ...a.soltos } : {};
  const frase = typeof a.frase === "string" ? a.frase : "";
  return Object.freeze({ frase, retrato: retrato && Object.freeze(retrato), soltos: Object.freeze(soltos) });
}

/* A linha do silêncio quando o Mestre RESPONDEU: a do `tropeco`, com o
   técnico de verdade ao lado — o motivo continua a descer inteiro ao
   console, só a frase da tela muda de dono. */
const silencioDoTropeco = (motivo) => {
  const l = linhaDoSilencio("tropeco");
  const lido = lerOSilencio(motivo);
  return { id: l.id, casa: l.casa, podeTentar: l.podeTentar !== false, natureza: l.natureza || "jogo", tecnico: lido.tecnico };
};

/* ------------------------------------------------------------
   O DESTINO DA FALHA — a decisão inteira numa chamada

   Entra o que o `catch` de `enviar` tem na mão:
     motivo     a string do erro (o `e.message`)
     conteudo   o envelope que ia ao Mestre
     respondeu  `true` se `chamarMestre` já tinha devolvido quando estourou
     emCombate  `!!combateRef.current`
     fuso       `new Date().getTimezoneOffset()` (só a linha do teto o usa)
     inicio     a foto do começo do turno (`agirInterno`), se houver
     envio      a foto do topo de `enviar`

   Sai: o silêncio (a linha da ligação), o destino (a linha do turno), a
   FOTO a repor, a frase a devolver à caixa, e se há botão.

   A foto do início só é usada quando nada rolou. Se o destino pede o
   início e ele não existe — `enviar` chamado por um caminho que não tirou
   foto no começo —, cai para a do envio, e aí não há frase crua para
   devolver: o reenvio passa a ser o do envelope guardado. Mais vale
   desfazer menos do que devolver uma frase que o jogador não escreveu.
   ------------------------------------------------------------ */
/* A FOTO DO INÍCIO É DESTE TURNO? `agirInterno` tira a foto antes de saber
   se o turno chega a `enviar` — um comando, uma recusa de graça, uma porta
   que resolve sem Mestre voltam antes. Se essa foto ficasse à espera e o
   `enviar` seguinte viesse de OUTRO caminho (um botão, um descanso), a
   queda dele desfaria o mundo até um instante que não é o seu. A prova de
   que a foto é deste turno está no envelope: o turno escrito parte sempre
   com a frase do jogador à frente (`${acao}${notaOp}${rvG.texto}…`, a
   pergunta na luta, "Vou até X." do mapa). Envelope que não começa pela
   frase da foto não é o turno dela. */
const inicioEhDesteTurno = (inicio, conteudo) => {
  const f = typeof inicio.frase === "string" ? inicio.frase.trim() : "";
  const c = typeof conteudo === "string" ? conteudo.trimStart() : "";
  return !!f && c.startsWith(f);
};

export function destinoDaFalha(args) {
  const a = args && typeof args === "object" ? args : {};
  const inicioDado = a.inicio && typeof a.inicio === "object" ? a.inicio : null;
  const inicio = inicioDado && inicioEhDesteTurno(inicioDado, a.conteudo) ? inicioDado : null;
  const envio = a.envio && typeof a.envio === "object" ? a.envio : null;
  const notaDoEnvio = envio && envio.soltos && typeof envio.soltos.nota === "string" ? envio.soltos.nota : "";
  const rolou = rolouNoTurno(a.conteudo) || rolouNoTurno(notaDoEnvio);
  const id = a.respondeu === true ? "mestre_respondeu"
    : (rolou || a.emCombate === true) ? "dados_ja_cairam"
    : "turno_nao_houve";
  let d = destinoPorId(id);
  const silencio = a.respondeu === true ? silencioDoTropeco(a.motivo) : lerOSilencio(a.motivo, { fuso: a.fuso });
  let foto = d.desfazer === "turno" && inicio && inicio.retrato ? inicio : null;
  let frase = d.devolverFrase && foto && typeof foto.frase === "string" ? foto.frase : "";
  /* sem foto do início, ou sem frase nela: o turno desfaz-se até ao envio
     e o reenvio é o do envelope — nunca uma caixa com frase inventada */
  if (d.desfazer === "turno" && (!foto || !frase.trim())) {
    foto = null; frase = "";
    d = { ...d, desfazer: "envio", reenvio: "envelope", devolverFrase: false, guardar: true };
  }
  if (!foto) foto = envio && envio.retrato ? envio : null;
  return Object.freeze({
    id: d.id,
    silencio: Object.freeze(silencio),
    natureza: silencio.natureza,
    desfazer: foto ? d.desfazer : "nada",
    foto,
    frase,
    reenvio: d.reenvio,
    guardar: d.guardar,
    podeTentar: silencio.podeTentar !== false || d.botaoSempre === true,
    linha: d.linha,
  });
}

/* ------------------------------------------------------------
   O TURNO NÃO ACONTECEU — o retrato a repor

   Recebe a foto (a que `destinoDaFalha` escolheu) e o retrato de AGORA, e
   devolve o que a fiação põe de volta: o retrato de antes, com os campos
   de `SOBREVIVEM_AO_DESFEITO` tirados de agora; os soltos de antes; e a
   frase. Campo que não existia antes e passou a existir fica de fora — o
   turno o criou, e o turno não houve.

   Nada é mutado: nem a foto (congelada), nem o retrato de agora. Sem foto
   não há o que repor, e a resposta é `null` — a fiação então não mexe em
   nada, que é o comportamento de hoje, e não um estado inventado.
   ------------------------------------------------------------ */
export function turnoNaoAconteceu(foto, retratoAgora) {
  if (!foto || typeof foto !== "object" || !foto.retrato || typeof foto.retrato !== "object") return null;
  const agora = retratoAgora && typeof retratoAgora === "object" ? retratoAgora : {};
  const retrato = { ...foto.retrato };
  for (const campo of SOBREVIVEM_AO_DESFEITO) {
    if (Object.prototype.hasOwnProperty.call(agora, campo)) retrato[campo] = agora[campo];
  }
  const soltos = foto.soltos && typeof foto.soltos === "object" ? { ...foto.soltos } : {};
  return Object.freeze({
    retrato: Object.freeze(retrato),
    soltos: Object.freeze(soltos),
    frase: typeof foto.frase === "string" ? foto.frase : "",
  });
}
