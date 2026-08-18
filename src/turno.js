/* ============================================================
   O TURNO (v9.61) — o mestre de código

   "Todo turno passa por ele e ele aciona a IA. Ele viraria o mestre
   e a IA somente o narrador."

   A ambição já era a da casa; o que faltava era um LUGAR. Até aqui o
   turno era uma corrente de `if` espalhada entre o campo de envio e o
   `enviar` — dezenas de portas, cada uma sabendo da anterior por
   acidente de posição no arquivo. Funcionava, e a ordem dela me
   mordeu TRÊS VEZES numa única sessão de trabalho:

   1) o resolver de destinos comeu "vou até o Javali Cambaleante",
      porque veio antes de quem sabia que o Javali é uma taverna;
   2) o botão do mapa chamava o movimento por fora da cadeia;
   3) o painel de Ações chamava a rolagem por fora da adjudicação.

   Os três são o mesmo bug: uma regra que mora num só de dois
   caminhos. E os três são invisíveis para qualquer teste de módulo,
   porque o defeito não está em nenhum módulo — está na ORDEM, que não
   era um objeto, era um layout de arquivo.

   Aqui a ordem vira DADO. Uma tabela de portas, cada uma com a
   pergunta que a abre e a razão de estar onde está; e uma função pura
   que, dado o que o sistema sabe do turno, diz qual porta ganha e por
   quê. Isso é testável, e é o que transforma "essa ordem está certa?"
   de opinião em asserção.

   O QUE ESTE ARQUIVO NÃO FAZ: agir. Ele decide QUEM decide. Os
   efeitos continuam no App, onde estão o estado e o React — e é de
   propósito: um despachante que também executa vira outro monólito,
   só que com nome melhor.

   A DIVISÃO QUE SE SUSTENTA, e ela é a resposta à pergunta que abriu
   esta versão: o CÓDIGO decide o que é verdade e o que acontece; a IA
   decide como aquilo se parece e o que significa. O Mestre de IA não
   perde nada que ele faça bem — perde só o que ele fazia mal, que era
   arbitrar regra.
   ============================================================ */

/* ---------------- OS SINAIS ----------------
   O que o sistema sabe do turno ANTES de decidir. Tudo booleano e
   tudo barato: quem precisa de módulo pesado (conjurar, movimento,
   desafio) manda a resposta pronta, não o texto. É o que mantém este
   arquivo puro e o teste honesto — a tabela decide sobre fatos, não
   sobre adivinhação. */
export function garantirSinais(s) {
  const o = s && typeof s === "object" ? s : {};
  const b = (k) => !!o[k];
  return {
    texto: String(o.texto || ""),
    ehComando: b("ehComando"),
    temEscolhaPendente: b("temEscolhaPendente"),
    ehConjuracao: b("ehConjuracao"),
    ehPortal: b("ehPortal"),
    ehEntradaEmMasmorra: b("ehEntradaEmMasmorra"),
    ehSeguirViagem: b("ehSeguirViagem"),
    ehPartidaPorNome: b("ehPartidaPorNome"),
    querPartir: b("querPartir"),
    /* o sinal que faltava na v9.57 e que custou a mecânica de movimento
       local: existe um lugar A PÉ, aqui, com este nome? */
    temAlvoLocal: b("temAlvoLocal"),
    ehDesafio: b("ehDesafio"),
    ehPerguntaAoMundo: b("ehPerguntaAoMundo"),
    temMilagreArmado: b("temMilagreArmado"),
    temHabilidadesSelecionadas: b("temHabilidadesSelecionadas"),
    emCombate: b("emCombate"),
    emViagem: b("emViagem"),
    bloqueado: b("bloqueado"),
  };
}

/* ---------------- AS PORTAS ----------------
   Ordenadas, e a ordem é o conteúdo. `porque` não é comentário: é a
   justificativa que o teste lê e que o próximo a mexer aqui precisa
   derrubar antes de reordenar.

   `intercepta` diz se a porta RESOLVE o turno sozinha (nada vai ao
   Mestre por conta dela) ou se ela apenas marca o turno e deixa
   seguir. A distinção existe porque metade dos bugs de ordem era
   uma porta interceptando o que deveria só anotar. */
export const PORTAS_DO_TURNO = [
  {
    id: "comando", rotulo: "Comando de teste", intercepta: true,
    quando: (s) => s.ehComando,
    porque: "'/' é ferramenta de autor, não ação de personagem: não vira turno, não gasta tempo e não chega ao Mestre",
  },
  {
    id: "resposta", rotulo: "Resposta a uma pergunta do sistema", intercepta: true,
    quando: (s) => s.temEscolhaPendente,
    porque: "se o sistema acabou de perguntar 'qual dos três?', o que vem a seguir é a resposta — lê-la como ação nova recomeça a conversa",
  },
  {
    id: "conjurar", rotulo: "Magia nomeada da ficha", intercepta: true,
    quando: (s) => s.ehConjuracao,
    porque: "nomear uma magia que está na SUA ficha é a declaração mais explícita do jogo, e por isso ganha de qualquer heurística",
  },
  {
    id: "portal", rotulo: "Portal", intercepta: true,
    quando: (s) => s.ehPortal,
    porque: "'abro um portal e sigo para Aldoria' tem verbo de partida — sem esta ordem o sistema abriria a estrada que a magia existe para pular",
  },
  {
    id: "masmorra", rotulo: "Entrada em masmorra", intercepta: false,
    quando: (s) => s.ehEntradaEmMasmorra,
    porque: "'desço na cripta fora da cidade' é entrar num covil, não abrir estrada",
  },
  {
    id: "seguir", rotulo: "Avançar na estrada", intercepta: false,
    quando: (s) => s.ehSeguirViagem && s.emViagem,
    porque: "quem já está na estrada AVANÇA nela; sem esta porta o herói fica a 7% do caminho para sempre",
  },
  {
    id: "partida", rotulo: "Partida por nome", intercepta: false,
    quando: (s) => s.ehPartidaPorNome,
    porque: "o nome literal de uma cidade conhecida é intenção sem ambiguidade",
  },
  {
    /* A PORTA QUE FALTAVA. O desafio vem ANTES do destino por descrição, e
       é exatamente a inversão que consertou "Vou até o Javali Cambaleante":
       quem tem um alvo a pé aqui não está pedindo estrada. */
    id: "desafio", rotulo: "Ação declarada", intercepta: true,
    quando: (s) => s.ehDesafio || s.temAlvoLocal,
    porque: "a ação que o jogador declarou sobre o que está ao alcance dos pés e das mãos ganha do que está a dias de viagem",
  },
  {
    id: "destino", rotulo: "Destino por descrição", intercepta: true,
    quando: (s) => s.querPartir,
    porque: "'vamos para a capital' só vira estrada depois que ninguém aqui perto atendeu por esse nome",
  },
  {
    id: "oraculo", rotulo: "Pergunta ao mundo", intercepta: true,
    quando: (s) => s.ehPerguntaAoMundo && !s.emCombate,
    porque: "pergunta fechada sobre o que o mundo não estabeleceu é do oráculo — e fora da luta, onde perguntar não custa o turno",
  },
  {
    id: "milagre", rotulo: "Milagre armado", intercepta: true,
    quando: (s) => s.temMilagreArmado,
    porque: "um milagre É o turno: não se encaixa numa sequência com magias, e depois delas roubaria a descrição que era dele",
  },
  {
    id: "habilidades", rotulo: "Habilidades selecionadas", intercepta: true,
    quando: (s) => s.temHabilidadesSelecionadas,
    porque: "o que foi escolhido no painel é declaração explícita e resolve o turno inteiro, com custo e ordem",
  },
  {
    id: "cena", rotulo: "Cena", intercepta: true,
    quando: () => true,
    porque: "o que não é regra é ficção, e ficção é da IA — esta porta existe para que 'ir ao Mestre' seja uma decisão, não um resto",
  },
];

export function portaPorId(id) { return PORTAS_DO_TURNO.find((p) => p.id === id) || null; }

/* ---------------- A DECISÃO ----------------
   Devolve a primeira porta que se abre, as que foram descartadas e o
   porquê de cada coisa. A lista de descartadas não é enfeite: é ela
   que responde "por que este turno não virou uma viagem?" sem que
   ninguém precise reler o App. */
export function decidirTurno(sinais) {
  const s = garantirSinais(sinais);
  if (s.bloqueado) return { porta: null, id: "bloqueado", porque: "há uma rolagem ou uma chamada em curso", descartadas: [] };
  const descartadas = [];
  for (const p of PORTAS_DO_TURNO) {
    let abre = false;
    try { abre = !!p.quando(s); } catch { abre = false; }
    if (abre) return { porta: p, id: p.id, porque: p.porque, intercepta: !!p.intercepta, descartadas };
    descartadas.push(p.id);
  }
  const fim = PORTAS_DO_TURNO[PORTAS_DO_TURNO.length - 1];
  return { porta: fim, id: fim.id, porque: fim.porque, intercepta: true, descartadas };
}

/* Todas as portas que se abririam, na ordem — para o teste poder dizer
   "esta frase acorda três portas, e a que ganha é esta". É assim que se
   flagra uma precedência errada antes de ela virar bug de partida. */
export function portasQueAbrem(sinais) {
  const s = garantirSinais(sinais);
  return PORTAS_DO_TURNO.filter((p) => { try { return !!p.quando(s); } catch { return false; } }).map((p) => p.id);
}

/* A linha de diagnóstico. Não vai para o jogador — vai para quem
   estiver caçando um turno que foi parar no lugar errado. */
export function linhaDaDecisao(d) {
  if (!d) return "";
  return `⚙ turno → ${d.id}${d.descartadas.length ? ` (passou por: ${d.descartadas.join(", ")})` : ""}`;
}

/* Três linhas, e a terceira é a que importa. As outras duas quase se
   repetem em DESAFIOS_PROMPT — este bloco sobe em todo turno, então cada
   frase aqui é cobrada na campanha inteira. */
export const TURNO_PROMPT = `QUEM DECIDE O QUÊ (v9.61):
- Todo turno passa primeiro pelo SISTEMA, que decide se aquilo é comando, magia, movimento, ação que pede dado, pergunta ao mundo ou cena. Chegou a você SEM envelope: é cena, ficção pura, narre. Chegou COM envelope: aquilo já aconteceu, e você não reabre nem recalcula.
- A divisão não muda: o sistema decide o que é VERDADE e o que ACONTECE; você decide como aquilo se PARECE e o que SIGNIFICA. Toda a riqueza do mundo está do seu lado da linha — as pessoas, as vozes, o peso das coisas. O que não está é arbitrar regra.`;
