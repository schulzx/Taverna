/* ============================================================
   ONDE EU ESTOU (v9.39) — o terceiro lugar

   O sistema conhecia dois lugares e só dois: DENTRO de uma cidade
   (`cidadeAtual`) ou EM VIAGEM entre cidades (`jornada`). Tudo o que
   a ficção inventasse no meio — a fazenda de Jessa a quarenta minutos
   a pé, a caverna atrás da colina, o acampamento onde a arapuca está
   armada — não existia para o código.

   E aí acontecia o pior tipo de bug, o que parece má-fé da IA e não é.
   O rodapé do sistema afirma, em TODO turno: "Local: em Baixo
   Brumoso". Depois de o herói caminhar até a fazenda, essa linha
   virava mentira — e o Mestre, que foi construído para obedecer o
   sistema acima da própria memória, fazia a única coisa coerente que
   podia fazer: narrava o herói de volta à cidade, para que a frase
   voltasse a ser verdade. O jogador armava a armadilha, mandava passar
   doze horas e era teletransportado para a cidade. Insistia, e o
   Mestre inventava três dias de marcha para um lugar que ficava a uma
   caminhada — porque nada, em lugar nenhum, dizia onde aquilo era.

   Não era desobediência. Era obediência a uma mentira.

   Este módulo é a verdade que faltava: um lugar NOMEADO, ancorado a
   uma cidade, que o sistema guarda entre turnos e defende.

   DUAS REGRAS:

   1) O LUGAR É DA FICÇÃO, A MEMÓRIA É DO SISTEMA. Quem diz que o herói
      chegou à fazenda é o Mestre (ou o Cronista, lendo o que foi
      narrado) — é um fato da história, e fatos da história são dele.
      Mas quem LEMBRA, turno após turno, e quem impede que ele seja
      desfeito por descuido, é o código.

   2) ESTAR FORA NÃO É ESTAR LONGE. Um lugar nos arredores é uma
      caminhada, não uma expedição: ir e voltar custa horas. Sem isso
      escrito, o Mestre arbitra a distância cena a cena — e arbitra
      sempre a favor da cena que ele já tem na cabeça, que é a cidade.
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* Quanto custa ir e voltar. Um lugar do dia a dia da região não vira
   viagem: viagem tem sistema próprio (`jornada`) e mapa próprio. */
export const DISTANCIAS = {
  arredores: { id: "arredores", rotulo: "nos arredores", volta: "ir e voltar leva HORAS, não dias" },
  perto: { id: "perto", rotulo: "a meio dia daqui", volta: "ir e voltar leva a maior parte de um dia" },
};
export function distanciaDe(id) { return DISTANCIAS[id] || DISTANCIAS.arredores; }

export function garantirLugar(l) {
  if (!l || !l.nome) return null;
  return {
    nome: String(l.nome).slice(0, 60).trim(),
    cidade: String(l.cidade || "").slice(0, 60).trim(),
    distancia: DISTANCIAS[l.distancia] ? l.distancia : "arredores",
    desde: Number.isFinite(l.desde) ? l.desde : 0,
  };
}

export function definirLugar(nome, { cidade = "", dia = 0, distancia = "arredores" } = {}) {
  return garantirLugar({ nome, cidade, dia, distancia, desde: dia });
}

/* O mesmo lugar de novo não é um lugar novo: evita reanunciar a cada
   turno em que o Mestre repete o nome. */
export function ehOMesmoLugar(a, b) {
  if (!a || !b) return !a && !b;
  return norm(a.nome) === norm(b.nome);
}

/* Um "lugar" que na verdade é a própria cidade não é sublocal nenhum —
   é o herói em casa, e registrar isso criaria um fantasma que o rodapé
   passaria a defender contra a realidade. */
export function ehAPropriaCidade(nome, cidade) {
  const n = norm(nome), c = norm(cidade);
  if (!n || !c) return false;
  if (n === c) return true;
  /* "em Baixo Brumoso", "a cidade de Baixo Brumoso": não acrescentam lugar
     nenhum ao que já é a cidade. Já "a fazenda de Jessa" acrescenta. */
  return n.replace(/^(em|na|no|a cidade de|a vila de|o povoado de|o vilarejo de)\s+/, "").trim() === c;
}

/* Os nomes vêm da ficção com artigo colado ("a fazenda de Jessa"), e
   "em a fazenda" saiu feio na tela no primeiro teste. A contração é
   burra de propósito: só resolve o artigo inicial, que é o caso real. */
export function comEm(nome) {
  const s = String(nome || "").trim();
  if (/^a\s+/i.test(s)) return `n${s.replace(/^a\s+/i, "a ")}`;
  if (/^o\s+/i.test(s)) return `n${s.replace(/^o\s+/i, "o ")}`;
  if (/^as\s+/i.test(s)) return `n${s.replace(/^as\s+/i, "as ")}`;
  if (/^os\s+/i.test(s)) return `n${s.replace(/^os\s+/i, "os ")}`;
  return `em ${s}`;
}

export function textoDoLugar(l) {
  if (!l) return "";
  const d = distanciaDe(l.distancia);
  return `${l.nome}${l.cidade ? ` (${d.rotulo} de ${l.cidade})` : ""}`;
}

/* A linha do rodapé. É aqui que a mentira virava teleporte, então é
   aqui que a verdade precisa ser mais firme do que em qualquer outro
   lugar do prompt. */
export function linhaDeLugar(l) {
  if (!l) return "";
  const d = distanciaDe(l.distancia);
  return `FORA DA CIDADE, ${comEm(l.nome)}${l.cidade ? ` — ${d.rotulo} de ${l.cidade}, ${d.volta}` : ""}. Eu NÃO estou na cidade e você NÃO me devolve a ela: só eu decido voltar, e só quando eu escrever isso. Enquanto eu não disser, toda cena acontece AQUI, inclusive as horas que passam, o que espero e o que vigio.`;
}

export function resumoLugarPrompt(l, cidade) {
  if (!l) return "";
  const d = distanciaDe(l.distancia);
  return `ONDE EU ESTOU: ${l.nome}${l.cidade ? `, ${d.rotulo} de ${l.cidade}` : ""}.
- Este lugar é REAL e o sistema o guarda entre turnos. A lista de locais e de gente da cidade abaixo é o que existe LÁ, não aqui: use-a como o mundo ao redor, não como a cena.
- ${d.volta.charAt(0).toUpperCase() + d.volta.slice(1)} — nunca transforme a volta numa viagem de dias.
- Se eu esperar, vigiar, dormir ou deixar o tempo passar, isso acontece AQUI. Faça o mundo vir até mim: quem aparece na estrada, o que se ouve ao longe, o que cai na armadilha.
- Só saio daqui quando EU escrever que saio. Se eu voltar à cidade, registre "lugar_atual": null.`;
}

/* ---------------- O CÃO DE GUARDA ----------------
   Função pura sobre o texto, roda antes de o jogador ver. Morde só o
   caso que doeu de verdade: o sistema tem um lugar registrado, a
   narrativa põe o herói de volta na cidade, e o jogador NÃO pediu isso.

   A régua é estreita de propósito. Mencionar a cidade não é voltar
   para ela ("o rumor de Baixo Brumoso ficou para trás" é cor, não
   deslocamento), e falso positivo custa uma chamada e uma cena. */
const VERBOS_DE_VOLTA = [
  "de volta a", "de volta à", "de volta para", "devolve voce a", "devolve voce à", "devolve voce para",
  "retorna a", "retorna à", "retorna para", "voce retorna", "voce volta", "volta a", "volta à",
  "chega a", "chega à", "chega em", "voce chega", "reencontra as ruas", "cruza os portoes de",
  "as portas de", "entra em", "esta de volta",
];
const PEDIDOS_DE_VOLTA = [
  "volto", "voltar", "retorno", "retornar", "de volta", "regresso", "sigo para a cidade",
  "vou para a cidade", "vou a cidade", "vou à cidade", "parto de volta", "deixo a", "saio d",
];

/* O que o JOGADOR escreveu, sem os turnos que o SISTEMA disparou.

   Sem esta limpeza o cão de guarda se desarmava sozinho: quando o jogador
   clica em "12h", quem viaja como mensagem é o envelope [PASSAR O TEMPO],
   e dentro dele está escrito "NÃO me leve de volta à cidade" — uma
   PROIBIÇÃO que o detector lia como pedido. O sistema mandando não fazer
   algo não pode contar como o jogador pedindo para fazer.

   A marca é o colchete na PRIMEIRA posição: todo envelope abre com um
   cabeçalho entre colchetes, e o que o jogador digita nunca abre assim.
   Tirar colchetes de dentro do texto não bastaria — o envelope é
   "[CABEÇALHO] seguido de instrução solta", e a instrução é o problema. */
export function falaDoJogador(texto) {
  const t = String(texto || "").trimStart();
  return t.startsWith("[") ? "" : t.trim();
}

export function pediuParaVoltar(textoDoJogador, cidade) {
  const t = norm(falaDoJogador(textoDoJogador));
  if (!t) return false;
  if (PEDIDOS_DE_VOLTA.some((p) => t.includes(norm(p)))) return true;
  const c = norm(cidade);
  return !!c && t.includes(c);
}

export function detectarVoltaForcada(narrativa, { lugar, cidade, pedidoDoJogador } = {}) {
  if (!lugar || !cidade) return null;
  const t = norm(narrativa);
  if (!t) return null;
  if (pediuParaVoltar(pedidoDoJogador, cidade)) return null;
  const c = norm(cidade);
  if (!t.includes(c)) return null;
  /* a cidade aparece — mas apareceu como DESTINO do herói?

     A cidade tem que vir COLADA no verbo, não a alguns caracteres dele. Com
     uma janela folgada, "um mensageiro chega a cavalo, vindo de Baixo
     Brumoso" mordia: o verbo era de chegada, mas quem chegava não era o
     herói. Exigir adjacência resolve sem lista de sujeitos. */
  const voltou = VERBOS_DE_VOLTA.some((v) => {
    const alvo = norm(v);
    let i = t.indexOf(alvo);
    while (i >= 0) {
      if (t.slice(i + alvo.length).replace(/^[\s,]+/, "").startsWith(c)) return true;
      i = t.indexOf(alvo, i + 1);
    }
    return false;
  });
  if (!voltou) return null;
  return { lugar: lugar.nome, cidade };
}

export function notaVoltaForcada(achado) {
  return `[CORREÇÃO DE LUGAR — REGISTRO DO SISTEMA] Você me devolveu a ${achado.cidade}, e eu não pedi para voltar. O SISTEMA registra que eu estou em ${achado.lugar}, fora da cidade, e continuo lá: eu não caminhei de volta, não anoiteci na estrada e não cheguei a portão nenhum. RETOME a cena EM ${achado.lugar.toUpperCase()} — o que se ouve daqui, o que se move no escuro, quem chega até aqui. Só eu decido voltar à cidade, e só quando eu escrever isso.`;
}

export const LUGAR_PROMPT = `ONDE O HERÓI ESTÁ (v9.39):
- Além das cidades e das viagens, existe um terceiro lugar: um ponto NOMEADO fora da cidade e perto dela — uma fazenda, um moinho, uma gruta, o acampamento onde a armadilha está armada.
- Quando o herói chegar a um lugar assim, registre "lugar_atual": "a fazenda de Jessa" (nome curto, como se diz em voz alta). Quando ele voltar para dentro da cidade, registre "lugar_atual": null.
- Enquanto houver um lugar registrado, o herói ESTÁ nele. Não o devolva à cidade por conta própria — nem para passar o tempo, nem para dormir, nem para "reapresentar a cena". Esperar de tocaia é uma cena legítima e acontece onde a tocaia está.
- Lugar assim NÃO é viagem: ir e voltar custa HORAS. Nunca invente dias de marcha para o que fica nos arredores — viagem de verdade tem sistema próprio e começa por outro caminho.`;
