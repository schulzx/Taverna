/* ============================================================
   A SALA (v9.120) — dois jogadores no mesmo turno

   Este jogo sempre foi de mesa; o que faltava era a segunda cadeira.

   E ele já sabe quase tudo de que precisa para ter uma. O GRUPO existe
   desde o começo: companheiros andam junto, entram na iniciativa, agem em
   combate, têm ficha, poder e voz. O turno já é coletivo — o que muda com
   um segundo jogador não é a mecânica da cena, é QUEM decide o que aquele
   corpo faz. Um companheiro decidido por um humano é a mesma peça no
   tabuleiro, com outra mão em cima.

   Por isso este arquivo é pequeno. Ele não reimplementa nada: guarda
   quem está sentado, junta as duas ações num turno só e diz quando o
   turno está pronto para sair.

   ---------------- TRÊS DECISÕES ----------------

   1) UM ANFITRIÃO, E ELE MANDA. Não há árbitro neutro possível sem
      servidor: se os dois lados calculassem o turno, dois dados
      diferentes decidiriam a mesma rolagem, e o jogo teria duas
      verdades. Quem criou a sala é o dono do estado, chama o Mestre e
      manda o resultado. O convidado escreve o que faz e recebe o mundo.

   2) A ORDEM É FIXA: primeiro o jogador 1, depois o jogador 2, e só
      então o Mestre. Não é hierarquia — é o que permite ao segundo
      responder ao primeiro dentro do MESMO turno ("eu seguro a porta
      enquanto ela sobe"), que é a única coisa que uma mesa de verdade
      faz e uma mesa por revezamento não faz.

   3) A SALA NÃO SABE O QUE É REDE. Ela recebe e devolve objetos; quem
      os leva de um lado ao outro é `transporte.js`. Trocar o meio de
      transporte não deve tocar em uma linha daqui, e é assim que a sala
      de hoje (duas janelas na mesma máquina) vira a sala de amanhã sem
      reescrever a regra.
   ============================================================ */

export const LUGARES = 2;

/* Sem 0/O/1/I/5/S: o código é dito em voz alta, e um código que se
   confunde ao ser lido é um código que não serve. */
export const ALFABETO_DO_CODIGO = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";
export const CODIGO_TAM = 6;

export function novoCodigo(rnd = Math.random) {
  let s = "";
  for (let i = 0; i < CODIGO_TAM; i++) s += ALFABETO_DO_CODIGO[Math.floor(rnd() * ALFABETO_DO_CODIGO.length)];
  return s;
}

/* Aceita o que o jogador digitar: minúsculo, com espaço, com hífen. O que
   ele tem na mão é um papel ou uma mensagem, não um formulário.

   E NÃO CORRIGE LETRA. A primeira versão trocava O por Q e 1 por J, "para
   ajudar" — mas o alfabeto já foi escolhido para não ter essas letras, e
   uma troca silenciosa transforma um erro de digitação num código VÁLIDO e
   errado: o jogador entra numa sala que não é a do amigo e não entende por
   quê. Melhor recusar e deixar redigitar. */
export function normalizarCodigo(c) {
  return [...String(c || "").toUpperCase()].filter((x) => ALFABETO_DO_CODIGO.includes(x)).join("").slice(0, CODIGO_TAM);
}

export function codigoValido(c) {
  const s = String(c || "");
  return s.length === CODIGO_TAM && [...s].every((x) => ALFABETO_DO_CODIGO.includes(x));
}

/* ---------------- A CATRACA ----------------
   Todo campo que alguém lê é normalizado aqui e entregue por quem chama.
   `lugares` tem tamanho fixo: uma cadeira vazia é `null`, e é preciso que
   ela exista para o jogador 2 continuar sendo o jogador 2 depois de sair
   e voltar. */
export function garantirSala(m) {
  const o = m && typeof m === "object" ? m : {};
  const lugares = [];
  for (let i = 0; i < LUGARES; i++) lugares.push(garantirLugar((o.lugares || [])[i]));
  return {
    codigo: codigoValido(o.codigo) ? o.codigo : "",
    /* o id de quem criou a sala. É ele que chama o Mestre e manda o mundo. */
    anfitriao: String(o.anfitriao || "").slice(0, 40),
    lugares,
    turno: garantirTurno(o.turno),
    /* sobe a cada estado que o anfitrião manda: o convidado descarta o que
       chegar fora de ordem, que é o que a rede faz de vez em quando */
    versao: Math.max(0, Math.round(Number(o.versao) || 0)),
  };
}

function garantirLugar(l) {
  if (!l || !l.id) return null;
  return {
    id: String(l.id).slice(0, 40),
    nome: String(l.nome || "").slice(0, 60),
    /* a ficha inteira do personagem daquele jogador, quando ele já a fez */
    ficha: l.ficha && typeof l.ficha === "object" ? l.ficha : null,
    /* visto pela última vez: quem fecha a aba não some da cadeira na hora */
    visto: Math.max(0, Math.round(Number(l.visto) || 0)),
  };
}

export function garantirTurno(t) {
  const o = t && typeof t === "object" ? t : {};
  const acoes = {};
  for (const [k, v] of Object.entries(o.acoes || {})) {
    const txt = String(v == null ? "" : v).trim().slice(0, 2000);
    if (k && txt) acoes[String(k).slice(0, 40)] = txt;
  }
  return { numero: Math.max(0, Math.round(Number(o.numero) || 0)), acoes };
}

/* ---------------- SENTAR E LEVANTAR ---------------- */

export function criarSala({ codigo, anfitriao, nome = "", rnd = Math.random }) {
  const cod = codigoValido(codigo) ? codigo : novoCodigo(rnd);
  const m = garantirSala({ codigo: cod, anfitriao });
  return sentarNaSala(m, { id: anfitriao, nome }).sala;
}

/* Ela se chama SENTAR e não ENTRAR porque `masmorras.js` já tem um
   `entrarNaSala` desde sempre, e lá sala é câmara de covil. Duas funções
   com o mesmo nome e sentidos diferentes é como se perde uma hora achando
   por que o herói foi parar numa cripta ao aceitar um convite.

   Idempotente pelo id: reentrar não abre uma cadeira nova, e é isso que
   faz recarregar a página não custar o lugar de ninguém. */
export function sentarNaSala(sala, { id, nome = "", quando = 0 }) {
  const m = garantirSala(sala);
  if (!id) return { ok: false, motivo: "sem identificação", sala: m };
  const jaEm = m.lugares.findIndex((l) => l && l.id === id);
  if (jaEm >= 0) {
    const lugares = m.lugares.slice();
    lugares[jaEm] = { ...lugares[jaEm], nome: nome || lugares[jaEm].nome, visto: quando };
    return { ok: true, sala: { ...m, lugares }, assento: jaEm };
  }
  const vago = m.lugares.findIndex((l) => !l);
  if (vago < 0) return { ok: false, motivo: "a sala está cheia", sala: m };
  const lugares = m.lugares.slice();
  lugares[vago] = garantirLugar({ id, nome, visto: quando });
  return { ok: true, sala: { ...m, lugares }, assento: vago };
}

export function sairDaSala(sala, id) {
  const m = garantirSala(sala);
  return { ...m, lugares: m.lugares.map((l) => (l && l.id === id ? null : l)) };
}

export function assentoDe(sala, id) {
  return garantirSala(sala).lugares.findIndex((l) => l && l.id === id);
}

export function ocupados(sala) {
  return garantirSala(sala).lugares.filter(Boolean);
}

export function salaCheia(sala) {
  return ocupados(sala).length >= LUGARES;
}

/* A ficha entra na cadeira, não numa lista à parte: é dela que sai o nome
   na tela, o grupo do começo e a ordem das ações. */
export function sentarFicha(sala, id, ficha) {
  const m = garantirSala(sala);
  const i = assentoDe(m, id);
  if (i < 0) return m;
  const lugares = m.lugares.slice();
  lugares[i] = { ...lugares[i], ficha: ficha && typeof ficha === "object" ? ficha : null, nome: (ficha && ficha.nome) || lugares[i].nome };
  return { ...m, lugares };
}

export function todosProntos(sala) {
  const oc = ocupados(sala);
  return oc.length >= LUGARES && oc.every((l) => l.ficha && l.ficha.nome);
}

/* ---------------- O TURNO A DUAS MÃOS ---------------- */

export function porAcao(sala, id, texto) {
  const m = garantirSala(sala);
  if (assentoDe(m, id) < 0) return m;
  const txt = String(texto || "").trim();
  if (!txt) return m;
  return { ...m, turno: garantirTurno({ ...m.turno, acoes: { ...m.turno.acoes, [id]: txt } }) };
}

export function acaoDe(sala, id) {
  return garantirSala(sala).turno.acoes[id] || "";
}

/* Falta quem ainda não escreveu. É esta lista que a tela mostra — "esperando
   Kael" —, porque um turno parado sem dizer por quem é um turno travado. */
export function quemFalta(sala) {
  const m = garantirSala(sala);
  return m.lugares.filter((l) => l && !m.turno.acoes[l.id]).map((l) => l.nome || "alguém");
}

export function turnoCompleto(sala) {
  const m = garantirSala(sala);
  const oc = ocupados(m);
  return oc.length > 0 && oc.every((l) => !!m.turno.acoes[l.id]);
}

/* As duas ações viram UM pedido, na ordem das cadeiras. O rótulo com o nome
   é o que permite ao Narrador saber de quem é cada corpo — sem ele, duas
   frases em primeira pessoa viram uma pessoa só com duas vontades. */
export function textoDoTurno(sala) {
  const m = garantirSala(sala);
  const partes = [];
  m.lugares.forEach((l, i) => {
    if (!l) return;
    const a = m.turno.acoes[l.id];
    if (!a) return;
    partes.push(`[JOGADOR ${i + 1} — ${l.nome || `cadeira ${i + 1}`}] ${a}`);
  });
  return partes.join("\n");
}

export function limparTurno(sala) {
  const m = garantirSala(sala);
  return { ...m, turno: garantirTurno({ numero: m.turno.numero + 1, acoes: {} }) };
}

/* ---------------- O QUE ATRAVESSA O FIO ----------------
   Um recado é sempre {tipo, de, sala?, carga?}. Enumerados aqui porque um
   protocolo espalhado em strings soltas é o mesmo problema dos sinais do
   Mestre antes de existir uma lista: quem lê não sabe o que pode chegar. */
export const RECADOS = {
  ola: "ola",           // convidado → anfitrião: cheguei, este é o meu id
  sala: "sala",         // anfitrião → todos: como está a sala agora
  ficha: "ficha",       // convidado → anfitrião: minha ficha ficou pronta
  acao: "acao",         // convidado → anfitrião: o que eu faço neste turno
  estado: "estado",     // anfitrião → todos: o mundo depois do turno
  saiu: "saiu",         // qualquer um: estou saindo
};
export function recadoValido(r) {
  return !!r && typeof r === "object" && Object.values(RECADOS).includes(r.tipo) && !!r.de;
}

/* ---------------- O QUE O MESTRE PRECISA SABER ----------------
   Curto de propósito, e só entra quando há de fato dois na sala: numa
   campanha de um jogador este bloco seria uma regra sobre gente que não
   existe. */
export function envelopeDaSala(sala) {
  const oc = ocupados(garantirSala(sala));
  if (oc.length < 2) return "";
  const nomes = oc.map((l, i) => `${i + 1}) ${l.nome}`).join(" · ");
  return `[SALA DE DOIS — DO SISTEMA] Nesta campanha há DOIS personagens de jogador: ${nomes}. Os dois estão no mesmo grupo e vivem a mesma cena. Cada turno chega com as duas ações marcadas por [JOGADOR 1] e [JOGADOR 2]: resolva as DUAS, na ordem em que vieram, e deixe a segunda reagir à primeira quando fizer sentido. Nenhum dos dois é coadjuvante — não resuma um para narrar o outro, não decida por nenhum deles, e não faça um agir sem que o jogador dele tenha escrito. O mundo responde aos dois.`;
}

/* Curto ao osso, e atrás de porta: numa campanha de um jogador este bloco
   seria uma regra sobre gente que não existe. O envelope da abertura diz o
   resto uma vez; o que precisa ser lembrado em TODO turno é só isto — não
   jogar por quem não escreveu. */
export const SALA_PROMPT = `MESA DE DOIS (v9.120):
- [JOGADOR 1] e [JOGADOR 2] são duas pessoas reais na mesma cena. Resolva as DUAS ações, na ordem, e deixe a segunda alcançar a primeira.
- NUNCA decida por um deles nem o faça agir num turno em que ele não escreveu: quem ficou parado, ficou parado.`;
