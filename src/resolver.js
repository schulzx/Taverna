/* ============================================================
   O RESOLVER DE LUGARES (v9.57) — "aquela cidade onde o rei mora"

   O jogo já sabia levar o herói a um lugar cujo NOME ele escrevesse:
   `lugarPedido` (v9.55) casa a taverna dentro da cidade, e
   `detectarPartida` casa a cidade no mapa. Os dois exigem o nome.

   Mas ninguém joga assim o tempo todo. Joga-se dizendo "vamos para a
   capital", "quero ir ao porto do norte", "voltamos para a cidade onde
   está a guilda". São descrições, não nomes — e o jogo respondia a elas
   com silêncio: nada acontecia, e o Mestre inventava um destino.

   Aqui a descrição vira lugar. O sistema procura em tudo o que ele
   próprio gerou — nome, porte, região, continente, bioma, facção,
   domínio, o que já foi visitado — e devolve UMA de três coisas:

     ACHEI      um só candidato: vai.
     AMBÍGUO    mais de um: o SISTEMA pergunta, com as opções numeradas.
     NADA       nenhum: o SISTEMA pergunta, e diz o que ele conhece.

   A DECISÃO QUE IMPORTA: quem pergunta é o sistema, não o Mestre. Se o
   Mestre desambiguasse, ele escolheria — e escolher destino é do
   jogador. E se ele apenas perguntasse na prosa, a resposta voltaria
   como texto livre para ser interpretada de novo, o que é o mesmo
   problema um turno depois.

   NA DÚVIDA, NÃO MOVE. Um resolver que chuta teleporta o herói para o
   lugar errado, e isso custa uma sessão. Preferir perguntar é sempre
   mais barato do que preferir adivinhar.
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- O QUE SE PODE DIZER DE UM LUGAR ----------------
   Cada linha é uma maneira de descrever sem nomear. `campo` é onde a
   resposta mora na ficha da cidade; `rx` é como o jogador a escreve. */
/* `\w*` no fim de cada substantivo, e não `\b`: o jogador escreve "nas
   montanhas", não "na montanha". Foi o primeiro furo que o teste achou —
   `\bmontanha\b` não casa com "montanhas", porque o `s` é caractere de
   palavra e mata a fronteira. Vale para toda esta tabela. */
const PISTAS = [
  { id: "capital", rx: /\b(capital\w*|corte|sede do reino|trono|cidade do rei|onde o rei mora|onde mora o rei|onde fica o trono)\b/, casa: (c) => /capital|atrio|porto franco|capital orbital/i.test(String(c.porte || c.tipo || "")) },
  { id: "porto", rx: /\b(porto\w*|cais|doca\w*|orla|cidade portuaria|cidade do mar|litoral|beira[- ]mar)\b/, casa: (c) => /porto|fundeadouro|pesca|embarcad/i.test(String(c.porte || c.tipo || "")) || /costa|mar|ilha/.test(norm(c.bioma)) },
  { id: "fortaleza", rx: /\b(fortaleza\w*|forte\w*|guarnicao|quartel|praca forte|cidade murada)\b/, casa: (c) => /fortaleza|forte|base|posto avan|guarni/i.test(String(c.porte || c.tipo || "")) },
  { id: "aldeia", rx: /\b(aldeia\w*|vilarejo\w*|povoado\w*|lugarejo\w*|vila pequena)\b/, casa: (c) => /aldeia|patamar|fundeadouro|posto avan/i.test(String(c.porte || c.tipo || "")) || (Number(c.populacao) || 0) < 400 },
  { id: "grande", rx: /\b(cidade grande|metropole\w*|a maior|maior cidade|cidade populosa)\b/, casa: (c, todas) => (Number(c.populacao) || 0) >= Math.max(...todas.map((x) => Number(x.populacao) || 0)) * 0.8 },
  { id: "montanha", rx: /\b(montanha\w*|serra\w*|nas alturas|no alto|entre as pedras|pico\w*)\b/, casa: (c) => /montanha|serra|gelo/.test(norm(c.bioma)) },
  { id: "floresta", rx: /\b(floresta\w*|bosque\w*|mata\w*|entre as arvores|selva\w*)\b/, casa: (c) => /floresta|bosque|mata|selva/.test(norm(c.bioma)) },
  { id: "deserto", rx: /\b(deserto\w*|areia\w*|duna\w*)\b/, casa: (c) => /deserto|areia/.test(norm(c.bioma)) },
  { id: "pantano", rx: /\b(pantano\w*|brejo\w*|charco\w*)\b/, casa: (c) => /pantano|brejo/.test(norm(c.bioma)) },
  { id: "gelo", rx: /\b(gelo|neve|tundra\w*|geleira\w*|norte gelado)\b/, casa: (c) => /gelo|neve|tundra/.test(norm(c.bioma)) },
  { id: "minha", rx: /\b(meu dominio|meus dominios|minha cidade|minha sede|meu reino|nossa cidade|em casa|para casa)\b/, casa: (c) => !!c.sede || norm(c.relacao) === "vassala" },
  { id: "visitada", rx: /\b(onde (ja )?estivemos|que (ja )?visitamos|onde (ja )?passamos|de onde viemos|onde eu ja estive)\b/, casa: (c) => !!c.pisada },
  { id: "aliada", rx: /\b(aliad\w*|amig\w*|nossos aliados)\b/, casa: (c) => norm(c.relacao) === "aliada" },
  { id: "inimiga", rx: /\b(inimig\w*|hostil|do inimigo)\b/, casa: (c) => norm(c.relacao) === "inimiga" },
];

/* Direções cardeais: a pista mais comum de todas ("a cidade do norte"). */
const CARDEAIS = [
  { id: "norte", rx: /\b(ao? norte|do norte|nortenh[ao]|setentrional)\b/, casa: (c, todas) => c.y <= media(todas, "y") - 8 },
  { id: "sul", rx: /\b(ao? sul|do sul|sulista|meridional)\b/, casa: (c, todas) => c.y >= media(todas, "y") + 8 },
  { id: "leste", rx: /\b(a leste|ao leste|do leste|oriental|do nascente)\b/, casa: (c, todas) => c.x >= media(todas, "x") + 8 },
  { id: "oeste", rx: /\b(a oeste|ao oeste|do oeste|ocidental|do poente)\b/, casa: (c, todas) => c.x <= media(todas, "x") - 8 },
];
const media = (lista, campo) => (lista.length ? lista.reduce((s, c) => s + (Number(c[campo]) || 0), 0) / lista.length : 50);

/* ---------------- OS CANDIDATOS ----------------
   Só entra o que o jogador PODE conhecer. Devolver uma cidade que ele
   nunca ouviu falar seria o sistema entregando o mapa de graça — e a
   névoa existe justamente para que descobrir valha alguma coisa. */
function conhecidas(mapa) {
  return ((mapa && mapa.cidades) || []).filter((c) => c && c.nome && c.descoberta !== false);
}

/* Casa pelo NOME, inteiro ou por pedaço significativo. É a via mais
   forte: quem escreve o nome sabe o que quer. */
const VAZIAS = new Set(["a", "o", "as", "os", "da", "do", "das", "dos", "de", "e", "em", "na", "no", "um", "uma", "que", "para", "pra"]);
const pedacos = (s) => norm(s).split(/[^a-z0-9]+/).filter((p) => p.length > 2 && !VAZIAS.has(p));

function casaPeloNome(texto, nome) {
  const t = norm(texto);
  if (!nome) return 0;
  if (t.includes(norm(nome))) return 3;                 // nome inteiro: certeza
  const ps = pedacos(nome);
  if (!ps.length) return 0;
  const achou = ps.filter((p) => new RegExp(`\\b${p}`).test(t)).length;
  if (!achou) return 0;
  /* um pedaço de um nome de duas palavras vale; "Forte" sozinho, com
     quatro "Forte alguma coisa" no mapa, vira ambiguidade — que é o
     desfecho certo, não um erro. */
  return achou === ps.length ? 3 : 2;
}

/* ---------------- A BUSCA ----------------
   `extra` deixa quem chama somar o que só ele sabe: o cânone, o códex,
   as pessoas conhecidas. Cada entrada é { cidade, termos } — os termos
   são o que aquela cidade também "responde". */
export function resolverLugar(texto, mapa, { extra = [], excluir = "" } = {}) {
  const t = norm(texto);
  const todas = conhecidas(mapa);
  const alvo = todas.filter((c) => norm(c.nome) !== norm(excluir));
  if (!t.trim() || !alvo.length) return { tipo: "nada", candidatos: [], conhecidas: alvo };

  const pontos = new Map();
  const porque = new Map();
  const soma = (c, n, razao) => {
    pontos.set(c.nome, (pontos.get(c.nome) || 0) + n);
    if (razao) porque.set(c.nome, [...(porque.get(c.nome) || []), razao]);
  };

  for (const c of alvo) {
    const p = casaPeloNome(t, c.nome);
    if (p) soma(c, p, "pelo nome");
  }
  /* a região e o continente também são nomes que o jogador diz */
  for (const c of alvo) {
    if (c.regiao && norm(t).includes(norm(c.regiao))) soma(c, 2, `fica em ${c.regiao}`);
    if (c.continente && norm(t).includes(norm(c.continente))) soma(c, 1, `fica em ${c.continente}`);
  }
  for (const pista of [...PISTAS, ...CARDEAIS]) {
    if (!pista.rx.test(t)) continue;
    for (const c of alvo) if (pista.casa(c, alvo)) soma(c, 2, pista.id);
  }
  /* o que só quem chama sabe: cânone, códex, gente conhecida */
  for (const e of extra || []) {
    if (!e || !e.cidade || !Array.isArray(e.termos)) continue;
    for (const termo of e.termos) {
      const n = norm(termo);
      if (n.length > 3 && t.includes(n)) {
        const c = alvo.find((x) => norm(x.nome) === norm(e.cidade));
        if (c) soma(c, 3, e.porque || `você conhece ${termo} de lá`);
      }
    }
  }

  const ordenados = [...pontos.entries()]
    .map(([nome, n]) => ({ cidade: alvo.find((c) => c.nome === nome), pontos: n, porque: porque.get(nome) || [] }))
    .filter((x) => x.cidade)
    .sort((a, b) => b.pontos - a.pontos);

  if (!ordenados.length) return { tipo: "nada", candidatos: [], conhecidas: alvo };
  /* um vencedor claro é quem tem MAIS pontos que o segundo. Empate no
     topo é ambiguidade de verdade, e ambiguidade não se resolve no
     chute: o jogador escolhe. */
  const topo = ordenados[0].pontos;
  const empatados = ordenados.filter((x) => x.pontos === topo);
  if (empatados.length === 1) return { tipo: "achei", escolha: ordenados[0], candidatos: ordenados, conhecidas: alvo };
  /* v9.57: MUITOS empatados não é uma escolha, é uma lista. Medido num
     mundo-Torre de 91 andares, "a cidade do norte" empatava dezenas — e
     oferecer cinco deles, escolhidos pela ordem de geração, seria fingir
     uma pergunta: o jogador não pediu nenhum daqueles cinco em especial.
     Acima do teto, o sistema diz que a descrição é vaga e pede outra. */
  if (empatados.length > TETO_DE_OPCOES) return { tipo: "vago", candidatos: empatados, conhecidas: alvo };
  return { tipo: "ambiguo", candidatos: empatados, conhecidas: alvo };
}

/* Cinco é o que se lê de relance e se escolhe com um toque. Acima disso a
   lista deixa de ajudar e passa a ser mais uma coisa para ler. */
export const TETO_DE_OPCOES = 5;

export function perguntaDeVaguidade(r, oQueEuDisse = "") {
  if (!r || r.tipo !== "vago") return "";
  const exemplos = r.candidatos.slice(0, 3).map((x) => x.cidade.nome);
  return `🧭 "${oQueEuDisse.trim()}" serve para ${r.candidatos.length} lugares que você conhece — entre eles ${exemplos.join(", ")}. Seja mais específico: diga o nome, ou junte pistas ("o porto do norte", "a fortaleza da Marca Cinzenta").`;
}

/* ---------------- AS PERGUNTAS ----------------
   Numeradas e curtas: o jogador responde com um número, e a resposta não
   volta a ser um texto para interpretar de novo. */
export function perguntaDeAmbiguidade(r, oQueEuDisse = "") {
  if (!r || r.tipo !== "ambiguo") return "";
  const linhas = r.candidatos.map((x, i) => {
    const c = x.cidade;
    const detalhe = [c.porte || c.tipo, c.regiao, c.populacao ? `${Number(c.populacao).toLocaleString("pt-BR")} almas` : ""].filter(Boolean).join(" · ");
    return `${i + 1}. ${c.nome}${detalhe ? ` — ${detalhe}` : ""}`;
  });
  return `🧭 "${oQueEuDisse.trim()}" serve para ${r.candidatos.length} lugares que você conhece. Qual deles?\n${linhas.join("\n")}\n(responda com o número ou o nome)`;
}

export function perguntaDeVazio(r, oQueEuDisse = "") {
  if (!r || r.tipo !== "nada") return "";
  const nomes = (r.conhecidas || []).slice(0, 8).map((c) => c.nome);
  return `🧭 Não encontrei "${oQueEuDisse.trim()}" no que você conhece do mundo.${nomes.length ? ` Lugares que você conhece: ${nomes.join(", ")}${(r.conhecidas || []).length > nomes.length ? "…" : ""}.` : ""} Diga o nome, ou uma pista que eu reconheça (a capital, o porto, a cidade do norte).`;
}

/* A resposta do jogador à pergunta: um número da lista, ou um nome. */
export function respostaDaEscolha(texto, candidatos = []) {
  const t = norm(texto);
  if (!t || !candidatos.length) return null;
  const n = t.match(/^\s*(\d{1,2})\b/);
  if (n) {
    const i = Number(n[1]) - 1;
    if (i >= 0 && i < candidatos.length) return candidatos[i].cidade || candidatos[i];
  }
  for (const x of candidatos) {
    const c = x.cidade || x;
    if (c && c.nome && t.includes(norm(c.nome))) return c;
  }
  return null;
}

export const RESOLVER_PROMPT = `DESTINOS POR DESCRIÇÃO (v9.57):
- O jogador pode dizer para onde vai sem usar o nome ("a capital", "o porto do norte", "a cidade onde estivemos"). Quem procura o lugar é o SISTEMA, não você: ele conhece o mapa inteiro e devolve o destino resolvido.
- Quando a descrição servir a mais de um lugar, o SISTEMA pergunta ao jogador com uma lista numerada. Você NÃO escolhe por ele e NÃO adivinha o destino — escolher para onde ir é do jogador, sempre.
- Se o sistema não reconhecer o lugar, ele também pergunta. Não invente uma cidade para preencher o vazio: um destino que não está no mapa não existe.`;
