/* ============================================================
   AS ABAS QUE AINDA NÃO IMPORTAM (v9.148) — Taverna

   Um herói de nível 1, no primeiro dia, na primeira cidade, abre a Gestão
   e vê dez sub-abas: Ficha, Grupo, Pessoas, Talentos, Mercado, Guilda,
   Domínios, Diplomacia, Correio, Mural. Sete delas não têm nada dentro, e
   duas descrevem um jogo que ele vai alcançar daqui a vinte horas.

   Isso não é um problema de espaço: é um problema de PROMESSA. Uma aba
   visível diz "há algo aqui". Sete abas vazias ensinam o jogador a não
   confiar na barra — e depois disso a que enche não é notada.

   ---------------- A REGRA QUE GOVERNA TUDO AQUI ----------------

   PORTA QUE ABRE NÃO FECHA.

   A tentação é mostrar cada aba enquanto ela tem conteúdo: Mercado só na
   cidade, Mural só onde há mural. Seria mais "limpo" e seria pior. Uma
   barra que muda de tamanho a cada cena não pode ser aprendida — o
   jogador procura a Guilda onde ela estava e ela não está, e o que ele
   conclui não é "saí da cidade", é "o jogo comeu a minha guilda".

   Então a condição é um GATILHO, não um estado. Ela dispara uma vez, e a
   aba fica. Sair da cidade não fecha o Mercado: fecha só a banca de
   dentro dele, que é uma frase que o painel sabe dizer.

   ---------------- O QUE ESTE MÓDULO NÃO SABE ----------------

   Ele não conhece o `personagem`, o `mapa`, nem o `correio`. Recebe um
   objeto raso de números e booleanos que o App monta, e devolve ids. É
   o que o torna testável sem montar React — e o que impede que a regra
   de "quando aparece a Diplomacia" fique escrita dentro de um JSX de
   dezessete mil linhas, que é onde ela iria morrer.
   ============================================================ */

/* ---------------- AS SUB-ABAS DA GESTÃO ----------------
   `sempre` é para o que existe desde o primeiro segundo do jogo. As duas
   que têm isso são a Ficha (o herói) e o Grupo (ele sozinho ainda é um
   grupo) — esconder qualquer uma delas seria esconder o personagem.

   `porque` não é decoração: é a frase que explica a decisão a quem vier
   depois, e é ela que impede a próxima aba de nascer com uma condição
   inventada na hora. */
export const SUBS_GESTAO = [
  { id: "ficha", rotulo: "Ficha", sempre: true },
  { id: "grupo", rotulo: "Grupo", sempre: true },
  { id: "pessoas", rotulo: "Pessoas", quando: (e) => e.conhecidos > 0, porque: "um catálogo de gente vazio ensina que a aba é inútil; a primeira pessoa que o mundo registra é o que a torna verdadeira" },
  { id: "talentos", rotulo: "Talentos", quando: (e) => e.pontos > 0 || e.nivel >= 2, porque: "sem ponto para gastar, a árvore é uma vitrine — e o nível 2 chega rápido o bastante para não virar segredo" },
  { id: "mercado", rotulo: "Mercado", quando: (e) => !!e.temBanca, porque: "a primeira banca ensina que existe comércio; a partir daí a aba fica e diz sozinha quando não há ninguém vendendo aqui" },
  /* A PROVA NO JOGO CORRIGIU ESTAS DUAS, e o erro era o mesmo nas duas:
     elas mediam o que EXISTE no mundo, não o que o jogador ENCONTROU. O
     mundo nasce com quatro casas e com todas as potências prontas — então
     "há casas" e "há potências" são verdade no primeiro segundo do
     primeiro dia, e as duas abas abriam junto com o jogo.

     O sinal certo é a PARTICIPAÇÃO: uma casa cuja sede é a cidade onde
     estou (dá para entrar nela hoje), e política só quando eu já sou
     parte de alguma coisa — antes de pertencer, não há o que negociar. */
  { id: "guilda", rotulo: "Guilda", quando: (e) => e.naCasa || !!e.casaAqui, porque: "quatro casas existirem no mundo não é o mesmo que haver uma porta na cidade onde eu estou; a aba abre quando dá para bater nela" },
  { id: "dominios", rotulo: "Domínios", quando: (e) => e.dominios > 0 || e.podeTomar, porque: "governar sem ter o que governar foi exatamente o defeito que a v9.140 consertou — a aba existia e não havia como chegar nela" },
  { id: "diplomacia", rotulo: "Diplomacia", quando: (e) => e.temFaccao && e.potencias >= 2, porque: "com uma potência só não há política, há um vizinho — e sem eu pertencer a nada não há sequer quem me atenda" },
  { id: "correio", rotulo: "Correio", quando: (e) => e.cartas > 0, porque: "uma caixa de entrada vazia no primeiro dia é a definição de aba que não importa ainda" },
  { id: "mural", rotulo: "Mural", quando: (e) => !!e.temMural, porque: "o mural é do lugar; o primeiro que o herói vê ensina o hábito de olhar" },
];

/* ---------------- AS ABAS DE CIMA ----------------
   Só o Códex entra aqui. Diário, Bolsa e Mapa são o jogo — escondê-los
   seria esconder o que o jogador veio fazer. E a Ascensão já tem porta
   própria desde a v8.x (`soDesperto`), que continua sendo dela. */
export const ABAS_COM_PORTA = [
  { id: "codex", quando: (e) => e.conquistas > 0 || e.descobertas > 0, porque: "o Códex é a estante do que já se fez; no primeiro dia ele é um álbum de figurinhas vazio" },
];

const TODAS = [...SUBS_GESTAO, ...ABAS_COM_PORTA];

/* Todas as que TÊM porta. Serve a um caso só, e ele importa: o save que
   veio de antes desta versão. Quem já jogava tinha as dez sub-abas na
   tela, e escondê-las agora seria tirar do jogador o que ele já usava —
   "sumiu a minha guilda" é o relato que isso geraria. A porta é para quem
   começa, não para quem já está dentro. */
export const TODAS_AS_PORTAS = TODAS.filter((a) => !a.sempre).map((a) => a.id);

/* ---------------- O GATILHO ----------------
   Recebe o que já estava aberto e o estado de agora; devolve a união. A
   união é a regra inteira: nada sai da lista, nunca, e é por isso que
   esta função não tem um caminho que remova. */
export function abrir(jaAbertas, estado) {
  const e = estado && typeof estado === "object" ? estado : {};
  const fora = new Set(Array.isArray(jaAbertas) ? jaAbertas.filter((x) => typeof x === "string") : []);
  for (const a of TODAS) {
    if (a.sempre) continue;                 /* não precisa ser guardado: é sempre */
    if (fora.has(a.id)) continue;
    let vale = false;
    try { vale = !!a.quando(e); } catch { vale = false; }
    if (vale) fora.add(a.id);
  }
  return [...fora];
}

/* Uma aba está aberta se ela é `sempre`, se já foi aberta antes, ou se a
   condição vale AGORA — a terceira existe para que a aba apareça no mesmo
   instante em que o gatilho dispara, sem esperar o próximo salvamento. */
export function estaAberta(id, abertas, estado) {
  const a = TODAS.find((x) => x.id === id);
  if (!a) return true;                      /* aba sem porta é aba aberta */
  if (a.sempre) return true;
  if (Array.isArray(abertas) && abertas.includes(id)) return true;
  try { return !!a.quando(estado || {}); } catch { return false; }
}

export function subsAbertas(abertas, estado) {
  return SUBS_GESTAO.filter((s) => estaAberta(s.id, abertas, estado));
}

/* ---------------- O QUE ACABOU DE ABRIR ----------------
   Uma aba que aparece calada é uma aba que ninguém nota: o jogador está
   olhando a narrativa, não a barra lateral. Isto devolve o que mudou para
   que o jogo possa dizer uma linha — e uma linha só, na vez em que
   acontece. */
export function novidades(antes, depois) {
  const a = new Set(Array.isArray(antes) ? antes : []);
  return (Array.isArray(depois) ? depois : []).filter((x) => !a.has(x));
}

const ROTULO = Object.fromEntries([...SUBS_GESTAO.map((s) => [s.id, s.rotulo]), ["codex", "Códex"]]);

export function falaDaNovidade(id) {
  const r = ROTULO[id] || id;
  const razao = {
    pessoas: "o mundo começou a guardar quem você conhece",
    talentos: "você tem o que gastar",
    mercado: "há quem venda por aqui",
    /* a frase segue o GATILHO, e não a ideia geral da aba. Enquanto a
       condição era "existem casas no mundo", esta linha dizia isso — e
       ficou mentindo no instante em que o gatilho passou a ser "há uma
       sede na cidade onde estou". Frase e condição são a mesma coisa
       dita duas vezes; quando divergem, é a frase que engana. */
    guilda: "há uma casa com sede aqui, e dá para bater na porta",
    dominios: "há terra que pode passar a ser sua",
    diplomacia: "há mais de uma potência sabendo do seu nome",
    correio: "chegou correspondência",
    mural: "há um mural onde se lê o que a região precisa",
    codex: "há o que registrar",
  }[id] || "há o que ver ali";
  return `▸ ${r} — ${razao}.`;
}
