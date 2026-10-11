/* ============================================================
   A LEITURA DE UMA PESSOA (11/10, MM11 · 5.ª sessão, M32)

   "Não acredito nele… tento ler se ele está mentindo." Intuição 15+4=19
   contra 15: SUCESSO. E o Mestre respondeu com o homem a falar do padeiro
   e da moeda — nem uma linha do que o teste comprou. O envelope de teste
   mandava "revele UMA coisa concreta e útil sobre ler a intenção", e o
   Narrador não tinha coisa nenhuma para revelar: o sistema sabia quem era
   a pessoa (o que ela quer, o que esconde, o que lhe devo e ela me deve,
   e — quando o mundo foi perguntado — se mente), e não o disse.

   É a régua da Fase MM: o jogador pergunta ao Mestre o que perguntaria ao
   Matt ("ele está a mentir?"), e a resposta tem de sair do sistema. Uma
   Intuição bem-sucedida entrega UMA verdade concreta sobre a pessoa, tirada
   da ficha dela; a crítica entrega duas.

   AS CAMADAS do que se pode dizer, por ordem (`CAMADAS_DA_LEITURA`):
   a leitura é de ROSTO, não de arquivo. Ela vê que a pessoa mente, o que
   ela quer, que esconde alguma coisa e o peso que isso lhe faz; o
   CONTEÚDO do que ela esconde só chega no crítico, e o que um lugar da
   espinha guarda (`segredosGuardados`) nunca — esse cai no lugar, quando
   o sistema o disser. Nada aqui inventa: sem dado na ficha, a camada não
   abre, e a última (quem ela é comigo) sempre tem dado.
   ============================================================ */

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const curto = (s, n = 90) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().replace(/[.;]+$/, "").slice(0, n);

/* O que a pergunta do jogador puxa para a frente: quem pergunta se mente
   quer ouvir isso primeiro, e não o que a pessoa quer da vida. */
export const PERGUNTA_DA_LEITURA = [
  { camada: "mente", rx: /\b(ment\w*|verdade|sincer\w*|engan\w*|blef\w*|acredit\w*)\b/ },
  { camada: "esconde", rx: /\b(escond\w*|segred\w*|oculta\w*|cala\w*)\b/ },
  { camada: "quer", rx: /\b(quer\w*|intenc\w*|inten[cç]\w*|pretend\w*|planej\w*|busca\w*|procura\w*)\b/ },
];

/* As camadas, pela ordem em que o rosto as entrega. `de` diz se há dado;
   `diz` escreve a verdade; `so` marca a que só o crítico abre. */
export const CAMADAS_DA_LEITURA = [
  {
    id: "mente",
    de: (p, c) => c.mente === "sim" || c.mente === "nao",
    diz: (p, c) => (c.mente === "sim"
      ? `${p.nome} está a mentir-me${p.quer ? ` — e a mentira serve ao que quer: ${curto(p.quer)}` : ""}`
      : `${p.nome} diz a verdade como a conhece — pode estar enganado, mas não me mente`),
  },
  {
    id: "quer",
    de: (p) => !!curto(p.quer),
    diz: (p) => `o que ${p.nome} quer de verdade: ${curto(p.quer)}`,
  },
  {
    id: "sabe",
    de: (p, c) => !!(c.segredo && c.segredo.nome),
    diz: (p, c) => `${p.nome} sabe de ${c.segredo.nome} mais do que diz — o quê, o rosto não conta`,
  },
  {
    id: "esconde",
    de: (p) => !!curto(p.teme),
    diz: (p, c) => (c.critico
      ? `${p.nome} esconde isto, e o rosto deixa-o ver: ${curto(p.teme, 120)}`
      : `${p.nome} esconde alguma coisa, e pesa-lhe — o olhar foge quando a conversa chega perto`),
  },
  {
    id: "laco",
    de: (p) => !!(p.meDeve || p.euDevo),
    diz: (p) => (p.meDeve
      ? `${p.nome} sente que me deve, e isso pesa a meu favor`
      : `${p.nome} não esqueceu o que eu lhe devo, e mede-me por isso`),
  },
  {
    id: "quem",
    de: () => true,
    diz: (p) => {
      const rel = norm(p.relacao || "desconhecido");
      const t = curto(p.temperamento, 40);
      const base = ["inimigo", "rival"].includes(rel) ? `${p.nome} não joga a meu favor, e não o esconde bem`
        : ["aliado", "amigo", "companheiro", "familia", "romance", "conjuge"].includes(rel) ? `${p.nome} está do meu lado, e não finge`
        : `${p.nome} não me deve nada e mede-me antes de dar um passo`;
      return t ? `${base}; por baixo do que mostra, é ${t}` : base;
    },
  },
];

/* Quantas verdades o teste compra. */
export const VERDADES_DA_LEITURA = { sucesso: 1, critico: 2 };

/* `pessoa`: a da cena (`pessoasDaCena` — nome, quer, teme, temperamento,
   relacao, meDeve, euDevo); `mente`: "sim"/"nao" quando o mundo foi
   perguntado (`estaMentindo`), senão null; `pergunta`: a frase do
   jogador; `segredos`: os da espinha (`segredosGuardados`), para a camada
   "sabe". Devolve null sem pessoa; senão { quem, camadas, linhas }. */
export function leituraDaPessoa(pessoa, { mente = null, pergunta = "", critico = false, segredos = [] } = {}) {
  const p = pessoa && typeof pessoa === "object" && pessoa.nome ? pessoa : null;
  if (!p) return null;
  const segredo = (Array.isArray(segredos) ? segredos : []).find((s) => s && Array.isArray(s.gente) && s.gente.some((g) => g && g.nome === p.nome)) || null;
  const ctx = { mente: mente === "sim" || mente === "nao" ? mente : null, critico: !!critico, segredo };
  const q = norm(pergunta);
  const puxadas = PERGUNTA_DA_LEITURA.filter((x) => x.rx.test(q)).map((x) => x.camada);
  const abertas = CAMADAS_DA_LEITURA.filter((c) => { try { return !!c.de(p, ctx); } catch { return false; } });
  /* a pedida primeiro (se tem dado), depois a ordem do rosto */
  const ordem = [...abertas.filter((c) => puxadas.includes(c.id)), ...abertas.filter((c) => !puxadas.includes(c.id))];
  const quantas = critico ? VERDADES_DA_LEITURA.critico : VERDADES_DA_LEITURA.sucesso;
  const escolhidas = ordem.slice(0, quantas);
  return { quem: p.nome, camadas: escolhidas.map((c) => c.id), linhas: escolhidas.map((c) => c.diz(p, ctx)) };
}

/* O envelope que viaja com o teste: a verdade, e a ordem de a dizer. */
export function envelopeDaLeitura(l) {
  if (!l || !Array.isArray(l.linhas) || !l.linhas.length) return "";
  return `[A LEITURA — O QUE O SISTEMA SABE DE ${String(l.quem).toUpperCase()}] Li ${l.quem}, e isto é verdade: ${l.linhas.join("; ")}. É ISTO o que o meu teste comprou — mostre-o no rosto, na voz ou no gesto de ${l.quem} e diga-mo por inteiro, numa ou duas frases, sem o transformar em adivinha e sem acrescentar nada que não esteja aqui.`;
}
