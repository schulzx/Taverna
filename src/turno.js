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
    /* v9.76: o jogador nomeou um poder que existe no jogo e nao esta na
       ficha dele, ou reivindicou um estado que o sistema nao concedeu. */
    declarouPoderQueNaoTem: b("declarouPoderQueNaoTem"),
    /* v9.78: o frasco ESTÁ na bolsa. Aqui não há recusa: quem bebe é o
       sistema, com o mesmo código do botão do painel. */
    vaiConsumir: b("vaiConsumir"),
    /* v9.82: o jogador acionou o poder ativo de uma relíquia que está com
       ele. Uma vez por dia, e quem resolve é o sistema. */
    vaiAcionarReliquia: b("vaiAcionarReliquia"),
    ehConjuracao: b("ehConjuracao"),
    ehPortal: b("ehPortal"),
    ehEntradaEmMasmorra: b("ehEntradaEmMasmorra"),
    ehSeguirViagem: b("ehSeguirViagem"),
    ehPartidaPorNome: b("ehPartidaPorNome"),
    querPartir: b("querPartir"),
    /* o sinal que faltava na v9.57 e que custou a mecânica de movimento
       local: existe um lugar A PÉ, aqui, com este nome? */
    temAlvoLocal: b("temAlvoLocal"),
    /* v9.73: o jogador declarou o primeiro golpe. Vem antes de `ehDesafio`
       na tabela porque atacar não é um obstáculo a vencer — é uma luta a
       abrir, e o catálogo de desafios não tem nada que descreva isso. */
    ehAgressao: b("ehAgressao"),
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
   uma porta interceptando o que deveria só anotar.

   Três campos entram na v9.63, e é o que faltava para a cadeia INTEIRA
   obedecer esta tabela em vez de concordar com ela por coincidência:

   `fase` — "atalho" ou "turno". As portas de atalho pagam o próprio
   tempo (a viagem cobra a estrada, o desafio cobra os minutos da
   tentativa) ou não custam nada; as de turno pagam os 45 minutos do
   turno de exploração, e por isso vêm DEPOIS do relógio. Não é
   arrumação: é a razão pela qual milagre e habilidades nunca puderam
   morar no mesmo laço que conjurar e movimento.

   `faz` — o nome do executor. Seis portas de movimento apontam para o
   MESMO executor, e é de propósito: `interceptarMovimento` já resolve
   as seis por dentro. Sem este campo, uma porta que recusa faria o
   turno chamar o mesmo código duas vezes — e a segunda chamada mexe
   em `sinalViagemRef` de novo.

   `seRecusar` — para onde o turno vai quando o executor diz "não era
   comigo". Este campo existe porque a resposta certa NÃO é sempre a
   mesma, e supor que fosse traria de volta o pior bug do mês:
   "desafio" recusando não pode cair em "destino", ou "vou até o Javali
   Cambaleante" volta a virar uma estrada para uma cidade que não
   existe. Quem perdeu a decisão não decide depois. */
export const PORTAS_DO_TURNO = [
  {
    id: "comando", rotulo: "Comando de teste", intercepta: true,
    fase: "atalho", faz: "comando", seRecusar: "seguinte",
    quando: (s) => s.ehComando,
    porque: "'/' é ferramenta de autor, não ação de personagem: não vira turno, não gasta tempo e não chega ao Mestre",
  },
  {
    id: "resposta", rotulo: "Resposta a uma pergunta do sistema", intercepta: true,
    fase: "atalho", faz: "movimento", seRecusar: "seguinte",
    quando: (s) => s.temEscolhaPendente,
    porque: "se o sistema acabou de perguntar 'qual dos três?', o que vem a seguir é a resposta — lê-la como ação nova recomeça a conversa",
  },
  {
    /* O QUE EU NÃO TENHO (v9.76). Antes de qualquer porta que AJA, uma que
       confere a ficha. "Uso invisibilidade" não casava porta nenhuma — não
       é comando, não é magia da ficha (justamente por não estar nela), não
       é desafio, não é pergunta ao mundo —, caía em `cena`, e a IA narrava
       o que foi pedido, porque narrar o que foi pedido é o trabalho dela.

       A única coisa que separava o jogador de qualquer poder do jogo era
       escrever o nome dele: o grimório, a árvore de talentos, os pontos de
       habilidade e os vinte níveis de progressão viravam decoração.

       Vem ANTES de `conjurar` porque é a mesma pergunta vista pelo avesso,
       e a ordem certa é conferir antes de agir. Não há conflito: quem TEM
       o poder não abre esta porta. */
    id: "poder", rotulo: "Poder que não está na ficha", intercepta: true,
    fase: "atalho", faz: "poder", seRecusar: "seguinte",
    quando: (s) => s.declarouPoderQueNaoTem,
    porque: "a ficha é a única fonte do que o herói pode fazer, e conferi-la antes de a cena existir é o que impede o jogo inteiro de ser obtido escrevendo o nome",
  },
  {
    /* O GESTO DA RELÍQUIA (v9.82). Vem antes do frasco e da magia porque é
       a declaração mais específica que existe no jogo: há UMA Comedora de
       Reis no mundo, e quem escreve o nome dela não está pedindo outra
       coisa. Fosse depois, "uso o Banquete" poderia ser lido como qualquer
       verbo de uso com um substantivo atrás. */
    id: "reliquia", rotulo: "Gesto de relíquia", intercepta: true,
    fase: "atalho", faz: "reliquia", seRecusar: "seguinte",
    quando: (s) => s.vaiAcionarReliquia,
    porque: "uma relíquia tem nome próprio e um gesto que só ela faz — e o gesto é do sistema, que rola, aplica e marca o uso do dia",
  },
  {
    /* O FRASCO QUE ESTÁ NA BOLSA (v9.78). A irmã positiva da porta acima, e
       a que corrigia o buraco mais antigo dos dois: `usarConsumivelUI`
       existe desde sempre — rola o dado da poção, aplica, tira o frasco da
       bolsa e salva —, mas só era alcançável pelo BOTÃO. Quem escrevia
       "bebo a poção de cura" caía na cena, e a IA narrava a cura: o herói
       ficava curado na ficção, com a poção ainda na bolsa e os PV intactos
       na ficha. */
    id: "consumir", rotulo: "Consumível da bolsa", intercepta: true,
    fase: "atalho", faz: "consumir", seRecusar: "seguinte",
    quando: (s) => s.vaiConsumir,
    porque: "beber uma poção é a coisa mais mecânica que existe — dado, efeito e um item a menos —, e deixá-la na ficção fazia a cura acontecer sem sair da bolsa",
  },
  {
    id: "conjurar", rotulo: "Magia nomeada da ficha", intercepta: true,
    fase: "atalho", faz: "conjurar", seRecusar: "seguinte",
    quando: (s) => s.ehConjuracao,
    porque: "nomear uma magia que está na SUA ficha é a declaração mais explícita do jogo, e por isso ganha de qualquer heurística",
  },
  {
    id: "portal", rotulo: "Portal", intercepta: true,
    fase: "atalho", faz: "movimento", seRecusar: "seguinte",
    quando: (s) => s.ehPortal,
    porque: "'abro um portal e sigo para Aldoria' tem verbo de partida — sem esta ordem o sistema abriria a estrada que a magia existe para pular",
  },
  {
    id: "masmorra", rotulo: "Entrada em masmorra", intercepta: false,
    fase: "atalho", faz: "movimento", seRecusar: "seguinte",
    quando: (s) => s.ehEntradaEmMasmorra,
    porque: "'desço na cripta fora da cidade' é entrar num covil, não abrir estrada",
  },
  {
    id: "seguir", rotulo: "Avançar na estrada", intercepta: false,
    fase: "atalho", faz: "movimento", seRecusar: "seguinte",
    quando: (s) => s.ehSeguirViagem && s.emViagem,
    porque: "quem já está na estrada AVANÇA nela; sem esta porta o herói fica a 7% do caminho para sempre",
  },
  {
    id: "partida", rotulo: "Partida por nome", intercepta: false,
    fase: "atalho", faz: "movimento", seRecusar: "seguinte",
    quando: (s) => s.ehPartidaPorNome,
    porque: "o nome literal de uma cidade conhecida é intenção sem ambiguidade",
  },
  {
    /* O PRIMEIRO GOLPE (v9.73). Antes do desafio, e a razão é a mesma que
       pôs o desafio antes do destino: a coisa mais concreta que o jogador
       declarou ganha. "Ataco o guarda" não é obstáculo a vencer nem estrada
       a abrir — é uma luta a abrir, e ela não passava por porta nenhuma:
       caía em `cena`, e quem decidia se havia briga era a IA.

       Fora de combate, e só: dentro da luta quem age é o painel, com
       alcance, posição e economia de ação. E a recusa cai na porta SEGUINTE
       porque um ataque que o sistema não soube resolver ainda pode ser
       muita coisa — inclusive um desafio, como "avanço sobre a porta". */
    id: "agressao", rotulo: "Primeiro golpe", intercepta: true,
    fase: "atalho", faz: "agressao", seRecusar: "seguinte",
    quando: (s) => s.ehAgressao && !s.emCombate,
    porque: "quando o jogador declara violência contra alguém que está na cena, não há o que decidir: a luta começa, e nenhum narrador tem direito de veto sobre isso",
  },
  {
    /* A PORTA QUE FALTAVA. O desafio vem ANTES do destino por descrição, e
       é exatamente a inversão que consertou "Vou até o Javali Cambaleante":
       quem tem um alvo a pé aqui não está pedindo estrada.

       E a recusa dele pula "destino" de propósito (v9.63): quase toda ação
       declarada sobre um lugar daqui NÃO é desafio nenhum — "vou até o
       Javali" é só andar, e quem anda é o `talvezAndarNaCidade` lá no
       envio. Se a recusa caísse na porta seguinte, a estrada comeria o
       movimento local outra vez. Ela cai no oráculo porque a única coisa
       que uma ação declarada aqui ainda pode ser é uma pergunta sobre
       AQUI — "tem alguém me vigiando?" fala do lugar onde estou. */
    id: "desafio", rotulo: "Ação declarada", intercepta: true,
    fase: "atalho", faz: "desafio", seRecusar: "oraculo",
    quando: (s) => s.ehDesafio || s.temAlvoLocal,
    porque: "a ação que o jogador declarou sobre o que está ao alcance dos pés e das mãos ganha do que está a dias de viagem",
  },
  {
    id: "destino", rotulo: "Destino por descrição", intercepta: true,
    fase: "atalho", faz: "movimento", seRecusar: "seguinte",
    quando: (s) => s.querPartir,
    porque: "'vamos para a capital' só vira estrada depois que ninguém aqui perto atendeu por esse nome",
  },
  {
    id: "oraculo", rotulo: "Pergunta ao mundo", intercepta: true,
    fase: "atalho", faz: "oraculo", seRecusar: "seguinte",
    quando: (s) => s.ehPerguntaAoMundo && !s.emCombate,
    porque: "pergunta fechada sobre o que o mundo não estabeleceu é do oráculo — e fora da luta, onde perguntar não custa o turno",
  },
  {
    id: "milagre", rotulo: "Milagre armado", intercepta: true,
    fase: "turno", faz: "milagre", seRecusar: "cena",
    quando: (s) => s.temMilagreArmado,
    porque: "um milagre É o turno: não se encaixa numa sequência com magias, e depois delas roubaria a descrição que era dele",
  },
  {
    id: "habilidades", rotulo: "Habilidades selecionadas", intercepta: true,
    fase: "turno", faz: "habilidades", seRecusar: "cena",
    quando: (s) => s.temHabilidadesSelecionadas,
    porque: "o que foi escolhido no painel é declaração explícita e resolve o turno inteiro, com custo e ordem",
  },
  {
    id: "cena", rotulo: "Cena", intercepta: true,
    fase: "turno", faz: "cena", seRecusar: "cena",
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

/* ---------------- A CASCATA (v9.63) ----------------
   A decisão diz quem GANHA. A cascata diz o que acontece quando o
   ganhador chega lá e descobre que não era com ele.

   Isso não é detalhe: `temAlvoLocal` abre a porta "desafio" para
   QUALQUER frase que cite um lugar daqui, e a esmagadora maioria delas
   não é desafio nenhum — é só andar. Sem uma regra escrita para a
   recusa, cada porta ia inventar a sua, que é literalmente como a
   cadeia estava antes desta versão: `conjurar` e `desafio` rodavam
   sempre, ganhando ou perdendo, e só o movimento consultava a decisão.
   O resultado era uma tabela que descrevia um turno parecido com o que
   o programa fazia, e "parecido" é onde moram os bugs de ordem.

   Devolve as portas abertas em duas fases, sem repetir executor: seis
   portas de movimento apontam para o mesmo `interceptarMovimento`, e
   chamá-lo duas vezes no mesmo turno mexeria nos sinais de viagem
   depois de ele já ter decidido não viajar. */
export function cascataDoTurno(sinais) {
  const s = garantirSinais(sinais);
  const abertas = PORTAS_DO_TURNO.filter((p) => { try { return !!p.quando(s); } catch { return false; } });
  const vistos = new Set();
  const unica = abertas.filter((p) => { if (vistos.has(p.faz)) return false; vistos.add(p.faz); return true; });
  const so = (f) => unica.filter((p) => p.fase === f).map((p) => ({ id: p.id, faz: p.faz, seRecusar: p.seRecusar, porque: p.porque }));
  return { atalhos: so("atalho"), turno: so("turno") };
}

/* Onde continuar depois de a porta `i` recusar. Fora da lista (>= tamanho)
   quer dizer "acabaram os atalhos": o turno vira turno de verdade — paga o
   relógio e segue para a fase da cena. */
export function proximaPorta(lista, i) {
  const atual = (lista || [])[i];
  if (!atual) return (lista || []).length;
  const modo = atual.seRecusar || "seguinte";
  if (modo === "seguinte") return i + 1;
  if (modo === "cena") return lista.length;
  const j = lista.findIndex((p, k) => k > i && p.id === modo);
  return j >= 0 ? j : lista.length;
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
