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

   As sete classes de queda estão MEDIDAS em `api/narrador.js` e
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
     (que reclama o 500) viesse antes de `recusado`, o teto diário seria
     lido como provedor fora do ar, e o jogo ofereceria "tentar de novo"
     a cada meia-noite que falta.

   · Quando o provedor recusa por crédito, o corpo que volta é
     "Todos os provedores falharam — deepseek (…: 402: Insufficient
     Balance)" — o 502 do roteador POR FORA e o 402 verdadeiro POR
     DENTRO. `sem_dinheiro` vem primeiro porque a causa real é ele, e
     porque é a única resposta que muda o que a pessoa deve fazer.

   `podeTentar` não é enfeite: é a diferença entre um botão que resolve e
   um botão que ensina o jogador a bater na porta trancada.

   As frases de `casa` são VOZ DE MUNDO. Nenhuma delas diz erro, rede,
   servidor, provedor, chave ou número: o jogador ouve o Mestre calar,
   não a máquina tossir.
   ============================================================ */
export const MOTIVOS_DO_SILENCIO = [
  {
    /* 402, e o 500 de "Nenhuma chave configurada" (api/narrador.js, no
       fim do roteador de provedor). É a única classe em que insistir é
       inútil E a pessoa pode consertar: falta crédito ou falta chave.
       "insufficient balance" é o que o DeepSeek escreve no corpo do 402,
       e ele viaja nos 250 caracteres de `corpo` que o roteador anexa. */
    id: "sem_dinheiro",
    codigos: [402],
    marcas: ["nenhuma chave configurada", "insufficient balance", "insufficient_quota", "billing"],
    casa: "O Mestre fecha o livro e guarda a pena: por hoje não há mais o que contar.",
    podeTentar: false,
  },
  {
    /* 401/403/404 e as duas recusas do portão (api/_portao.js): a de
       origem ("Este endereço só responde ao jogo.", com `motivo` "sem
       origem" ou "origem não autorizada") e a de teto diário ("Limite
       diário alcançado"). O 404 entra aqui porque, nos dois provedores,
       ele significa modelo que não existe — a porta certa, o nome
       errado; e tentar de novo repete o mesmo nome. */
    id: "recusado",
    codigos: [401, 403, 404],
    marcas: [
      "este endereco so responde",
      "limite diario alcancado",
      "sem origem",
      "origem nao autorizada",
      "invalid api key",
      "api key not valid",
      "unauthorized",
      "permission denied",
    ],
    casa: "A porta não se abre para esta mão: o Mestre não conta esta história a quem bate assim.",
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
    codigos: [],
    marcas: ["failed to fetch", "networkerror", "network request failed", "load failed", "err_internet_disconnected"],
    casa: "A estrada até a mesa do Mestre está cortada; nenhuma palavra atravessa.",
    podeTentar: true,
  },
  {
    /* Aborto e estouro de tempo. 408 é o Request Timeout; o 504 NÃO
       entra aqui — ele é o roteador dizendo que o provedor demorou, e
       isso é `provedor_caiu`, que já cobre a família 5xx inteira. */
    id: "tempo_esgotado",
    codigos: [408],
    marcas: ["abort", "timeout", "timed out", "etimedout", "tempo esgotado"],
    casa: "O Mestre respira fundo, demora — e a frase não vem.",
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
    codigos: [500, 502, 503, 504],
    marcas: [
      "todos os provedores falharam",
      "resposta vazia",
      "sem texto",
      "internal server error",
      "bad gateway",
      "service unavailable",
      "gateway timeout",
    ],
    casa: "O Mestre perde o fio no meio da frase e fica olhando o fogo.",
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
    codigos: [429],
    marcas: ["rate limit", "rate_limit", "too many requests", "resource_exhausted"],
    casa: "Há vozes demais falando ao mesmo tempo, e o Mestre não se ouve pensar.",
    podeTentar: true,
  },
  {
    /* O RESTO, e ele PRECISA existir: silêncio sem frase é pior do que
       frase genérica. Sem esta linha, o dia em que o provedor inventar
       um erro novo o jogador olharia para uma tela que não diz nada — ou,
       pior, para a mensagem crua da máquina. Sem código e sem marca de
       propósito: quem chega aqui chegou por não casar nenhuma das
       outras. */
    id: "desconhecido",
    codigos: [],
    marcas: [],
    casa: "O Mestre se cala — a mesa espera.",
    podeTentar: true,
  },
];

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
export function lerOSilencio(motivoTecnico) {
  const tecnico =
    typeof motivoTecnico === "string"
      ? motivoTecnico
      : motivoTecnico == null
        ? ""
        : String(motivoTecnico);
  const agulha = semAcento(tecnico);
  let achada = null;
  if (agulha) {
    for (const linha of MOTIVOS_DO_SILENCIO) {
      const porMarca = (linha.marcas || []).some((m) => agulha.includes(m));
      const porCodigo = (linha.codigos || []).some((c) => temOCodigo(agulha, c));
      if (porMarca || porCodigo) { achada = linha; break; }
    }
  }
  const linha = achada || linhaDoSilencio("desconhecido");
  return { id: linha.id, casa: linha.casa, podeTentar: linha.podeTentar !== false, tecnico };
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
    silencio: Object.freeze(lerOSilencio(a.motivo)),
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
