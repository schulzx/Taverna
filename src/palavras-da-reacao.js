/* ============================================================
   AS PALAVRAS DA REAÇÃO (K3) — a prosa do cartão, e só ela

   Puro, sem React: dada a saída e o gatilho, a frase é sempre a mesma
   em qualquer máquina. `ritmo-da-reacao.js` decide SE a janela abre e
   QUANTO tempo ela tem; `reacoes.js` decide O QUE aconteceu com o dano.
   Este módulo não decide nada — ele só nomeia o que os outros dois já
   decidiram, e é por isso que é design: a palavra É a forma, do mesmo
   jeito que `PALAVRAS_DA_CHANCE` já é forma em `formas.md`.

   A LEI QUE GERA A TABELA (`mente/k3-jogo.md` §1.1), e ela é de uma
   linha: `respondeu` e `expirou` diferem em QUEM agiu, não em SE agiu —
   nos dois casos uma reação aconteceu, e o que os separa são as
   palavras. Isso vira gramática verificável por catraca:

     TODA LINHA DA COLUNA «você» COMEÇA POR "você ".
     TODA LINHA DA COLUNA «não foi você» TERMINA EM " por você".

   Uma frase que não obedeça às duas é defeito de tabela, não de gosto
   — a diferença entre as duas saídas tem de caber na gramática, senão
   ela tem de ser explicada, e explicar é o sistema a falar de si
   mesmo. `recusou` é a única saída sem gesto e por isso a única sem
   linha nesta regra: ela vive em `PALAVRAS_DO_RECUO`, à parte.
   ============================================================ */

/* ---------------- O GESTO, POR REAÇÃO ----------------
   Lida por `id` de `reacoes.js`. Duas colunas, e mais nada — o número
   não está aqui, porque o número já sai de `resolverReacao` (`cortou`,
   `dano`, `danoFinal`, `pm`) e duplicá-lo seria escrever a regra duas
   vezes. `o instinto aparou por você` é a frase que `formas.md` fixou
   palavra por palavra; as outras quatro saem dela pela mesma regra:
   quem age quando não foi o jogador é a parte do corpo que já sabia —
   a mão do marcial, o corpo do furtivo, a barreira que o conjurador já
   tinha pronta. */
export const PALAVRAS_DA_RESOLUCAO = [
  { id: "contramagia",   voce: "você cortou a magia no ar",    instinto: "a magia se desfez por você" },
  { id: "escudo_arcano", voce: "você ergueu a barreira",       instinto: "a barreira subiu por você" },
  { id: "aparar",        voce: "você aparou o golpe",          instinto: "o instinto aparou por você" },
  { id: "esquiva_agil",  voce: "você saiu da linha do golpe",  instinto: "o corpo saiu por você" },
  { id: "contra_ataque", voce: "você revidou na mesma batida", instinto: "a mão revidou por você" },
  /* `oportunidade` NÃO tem linha, e a ausência é a decisão escrita:
     `inimigo_cai` não abre janela (K1 §6) — 0 PM, sem lado mau, uma
     pergunta cuja resposta é sempre sim — logo esta reação nunca chega
     a um cartão. Uma entrada aqui seria export morto no dia em que
     nascesse: nenhum leitor a alcançaria. */
];

/* ---------------- A ÚNICA SAÍDA SEM GESTO ----------------
   `recusou` pode acontecer nos dois gatilhos que abrem janela, e
   `inimigo_erra` não tem golpe nenhum a passar: dizer "você deixou o
   golpe passar" quando o inimigo errou seria a interface a mentir
   sobre a mecânica. Sem glifo, e não se inventou um neutro — a regra
   já existia: `Papel=Recuo` não tem glifo, porque nenhum glifo desta
   casa diz *deixar passar* sem mentir. */
export const PALAVRAS_DO_RECUO = [
  { gatilho: "sofre_dano",   frase: "você deixou o golpe passar" },
  { gatilho: "inimigo_erra", frase: "você deixou a brecha passar" },
];

/* A QUINTA SAÍDA: houve gesto e não deu. `esquiva_agil` (chance 0,6) e
   `contra_ataque` (chance 0,55) podem falhar — e `resolverReacao`, hoje,
   não tem ramo de falha (K2 [R4], `mente/k3-jogo.md` §6.3, o "buraco
   maior da fase"). As palavras ficam escritas à espera da mecânica,
   porque palavra é minha mesmo quando a regra ainda não existe. Mesma
   gramática do `voce`: começa por "você" — o glifo fica, porque houve
   gesto; o que falhou foi o resultado, e essa é exatamente a distinção
   que a regra do glifo faz. */
export const PALAVRAS_SEM_GESTO = [
  { id: "esquiva_agil",  voce: "você tentou sair, e não deu" },
  { id: "contra_ataque", voce: "você revidou e não alcançou" },
];

/* Quando nada aconteceu e não houve gesto nenhum (a janela expirou e o
   instinto também falhou). Sem glifo. Reaproveita a frase que o `jogo` já
   escreveu para o número do recuo. */
export const PALAVRAS_DO_NADA = [
  { gatilho: "sofre_dano",   frase: "o golpe passou" },
  { gatilho: "inimigo_erra", frase: "a guarda fechou" },
];

/* ---------------- O FACTO, SEM O NÚMERO ----------------
   A linha que nasce no primeiro frame do cartão, antes de qualquer
   escolha — o golpe que chega. Sem número (o dano vem em segredo, K1b)
   e sem advérbio de intensidade (porta 10 do segredo do dano: um
   advérbio é o número em três sílabas). "{inimigo}" é marca literal —
   quem a lê substitui pelo nome de quem golpeou. */
export const LINHAS_DO_CARTAO = [
  { gatilho: "sofre_dano",   frase: "{inimigo} te acerta" },
  { gatilho: "inimigo_erra", frase: "{inimigo} erra o golpe" },
];

/* ---------------- AS PALAVRAS DO RISCO ----------------
   Três das seis reações têm `chance` (0,4 a 0,6 em reacoes.js), e
   oferecer "corta tudo" calando que falha 2 em 5 seria mentir o preço.
   A percentagem não entra: um duelista não sabe "60 %", sabe que
   costuma dar. Lida do MAIOR piso para baixo — a primeira faixa cuja
   `piso` a chance alcança é a que vale.

   A DIRECÇÃO DA FRASE É SEMPRE A MESMA: o que acontece quando DÁ CERTO.
   Misturar "costuma dar certo" com "às vezes falha" na mesma lista é
   enquadramento invertido (Tversky & Kahneman, 1981) — muda a decisão
   sem mudar o facto. `curta` cabe na fenda do preço (≤40 caracteres);
   `longa` é a mesma informação, para a ficha, que se lê devagar. */
export const PALAVRAS_DA_CHANCE = [
  { piso: 0.7, curta: "quase sempre",        longa: "quase sempre dá certo" },
  { piso: 0.5, curta: "mais vezes que não",  longa: "dá certo mais vezes que não" },
  { piso: 0.3, curta: "de vez em quando",    longa: "dá certo de vez em quando" },
  { piso: 0,   curta: "raramente",           longa: "raramente dá certo" },
];

/* ---------------- AS PALAVRAS DO CORTE ----------------
   `{piso, frase}` para `reacao.corta`, lida do MAIOR piso para baixo —
   tabela, nunca `if`. E `contraAtaca` é uma entrada própria: as duas
   reações que revidam não cortam dano nenhum, elas respondem "na mesma
   batida", e essa é a informação que substitui o corte na fenda do
   preço. */
export const PALAVRAS_DO_CORTE = [
  { piso: 1,   frase: "anula" },
  /* "corta a maior parte" (19) estourava o orçamento de 40 quando a
     forma canónica de `precoDoVerbo` (com os espaços de `formas.md:896`)
     se junta ao nome mais longo (`escudo arcano`): 42 contra 40, por 2.
     O conserto é a PALAVRA, não o espaço em branco — "corta o grosso"
     (14) é português idiomático, honesto para 60% (não promete "quase
     tudo") e devolve a folga ao orçamento onde ele de facto se resolve. */
  { piso: 0.6, frase: "corta o grosso" },
  { piso: 0.5, frase: "corta metade" },
  { contraAtaca: true, frase: "na mesma batida" },
];

/* A frase do silêncio (K1, revista em K3 — `mente/k3-jogo.md` §2). Não
   diz janela, não diz reação, não diz preferência, e não explica
   mecanismo nenhum: diz o EFEITO ("o instinto assume") e a DURAÇÃO
   ("o resto da luta"), que é tudo o que o jogador precisa e é tudo o
   que é verdade. Vive só no cartão — no log ela seria o sistema a
   falar de si mesmo (porta 10 do segredo do dano) — como a última linha
   da última `Etapa=Resolvida` da luta, debaixo da frase de `expirou`. */
export const AVISO_DO_SILENCIO = "o instinto assume o resto da luta";

const resolucaoPorId = (id) => PALAVRAS_DA_RESOLUCAO.find((p) => p.id === id) || null;
const semGestoPorId = (id) => PALAVRAS_SEM_GESTO.find((p) => p.id === id) || null;
const recuoPorGatilho = (gatilho) => PALAVRAS_DO_RECUO.find((p) => p.gatilho === gatilho) || null;

/* ---------------- A PROSA DA RESOLUÇÃO, NUM SÍTIO SÓ ----------------
   `saida`: "respondeu" | "expirou" | "recusou" | "sem_gesto". As quatro
   primeiras colunas do quadro de `mente/k3-jogo.md` §1.4, viradas
   função — para que nenhum JSX precise saber qual tabela ler para qual
   saída. `respondeu` e `sem_gesto` leem `voce` (houve gesto, seja ele
   qual for o resultado); `expirou` lê `instinto`; `recusou` não olha
   `reacaoId` nenhum — ele é sobre o gatilho, não sobre a reação que
   NÃO aconteceu. */
export function falaDaResolucao({ saida, reacaoId, gatilho }) {
  if (saida === "recusou") {
    const linha = recuoPorGatilho(gatilho);
    return linha ? linha.frase : "";
  }
  if (saida === "sem_gesto") {
    const linha = semGestoPorId(reacaoId);
    return linha ? linha.voce : "";
  }
  const linha = resolucaoPorId(reacaoId);
  if (!linha) return "";
  return saida === "expirou" ? linha.instinto : linha.voce;
}

/* ---------------- O PREÇO DO VERBO ----------------
   `aparar · 0 PM — corta metade`, forma fixada em `formas.md:896`,
   espaço antes e depois do `PM`, travessão com espaço dos dois lados.
   Orçamento de 40 caracteres (K1): a `chance` entra pela coluna CURTA
   e, se não couber nos 40, sai — nunca se corta o preço, e a forma
   NUNCA se comprime para caber (essa compressão era o defeito: ela
   corria sempre, para as cinco reações, quando só uma precisava). O
   verbo é `reacao.nome.toLowerCase()` — COM acento e hífen ("esquiva
   ágil", "contra-ataque") — e não o `id` (que não tem nenhum dos dois):
   é a forma que `formas.md` já escreveu ("escudo arcano · 2 PM"), e a
   peça mais visitada da fase não pode ser a única sem acento do jogo.

   O aperto resolve-se na TABELA (`PALAVRAS_DO_CORTE`), não na
   formatação: com o nome mais longo (`escudo arcano`) e a forma
   canónica inteira, só o corte de piso 0,6 estourava os 40 — a palavra
   mudou lá, não aqui.

   `oportunidade` ("Ataque de Oportunidade", 22 caracteres) NUNCA cabe
   com um efeito ao lado, e não é bug: `inimigo_cai` não abre janela
   (K1 §6), essa reação nunca chega a um cartão, e por isso o orçamento
   de 40 caracteres só é contrato para quem PODE chegar lá — as de
   gatilho `sofre_dano`/`inimigo_erra` (ver a suíte). E as duas que
   revidam (`contra_ataque`, `oportunidade`) somam nome + "na mesma
   batida" + chance acima de 40 SEMPRE: a chance delas nunca cabe, e cai
   pela própria regra do orçamento — a regra a funcionar contra uma
   combinação que ela não tem como acomodar, não um bug dela. */
export function precoDoVerbo(reacao) {
  if (!reacao) return "";
  const verbo = String(reacao.nome || "").toLowerCase();
  const pm = reacao.pm || 0;
  const corteFn = reacao.contraAtaca
    ? PALAVRAS_DO_CORTE.find((p) => p.contraAtaca === true)
    : [...PALAVRAS_DO_CORTE]
        .filter((p) => typeof p.piso === "number")
        .sort((a, b) => b.piso - a.piso)
        .find((p) => (reacao.corta || 0) >= p.piso);
  const efeito = corteFn ? corteFn.frase : "";
  const base = `${verbo} · ${pm} PM — ${efeito}`;
  if (reacao.chance == null) return base;
  const faixa = [...PALAVRAS_DA_CHANCE].sort((a, b) => b.piso - a.piso).find((f) => reacao.chance >= f.piso);
  if (!faixa) return base;
  const comChance = `${base} · ${faixa.curta}`;
  return comChance.length <= 40 ? comChance : base;
}

/* ---------------- A SEGUNDA LINHA, EM MONO ----------------
   `mente/k3-jogo.md` §1.4: o cartão tem duas linhas — a prosa
   (`falaDaResolucao`) e o número, pronto de `resolverReacao`. O
   `oficial` a montava por concatenação solta dentro do `App.jsx`
   (dívida declarada em comentário); ela sai de lá para cá porque
   NÚMERO FORMATADO É TABELA, NÃO FIAÇÃO — e o `App.jsx` não é meu para
   mexer, mas a regra que ele chama é.

   As sete linhas do quadro, por `gatilho` e pelo estado dos números —
   SEM precisar de um `saida` à parte: `cortou === 0` já é a marca de
   "nada foi cortado" (o recuo, ou uma reação hipotética de corte zero,
   que hoje não existe no catálogo), e `acertou == null` já é a marca
   de "nenhum revide aconteceu" (o recuo do lado de `inimigo_erra`).
   Duas colunas de números bastam para as sete linhas — é o que faz
   isto tabela, e não um `if` por saída.

     sofre_dano, cortou === 0            -> "{dano} inteiros"
     sofre_dano, 0 < cortou < dano       -> "{cortou} evitado · {dano} vira {danoFinal}"
     sofre_dano, cortou >= dano          -> "o golpe não te acerta · {dano} vira 0"
     sofre_dano, as três de cima, com PM -> … · "−{pm} PM"
     inimigo_erra, acertou == null       -> "a guarda fechou"
     inimigo_erra, acertou === true      -> "revide em {alvoContra} · {danoFinal} de dano"
     inimigo_erra, acertou === false     -> "revide em {alvoContra} · errou" */
export function numeroDaResolucao({ gatilho, cortou = 0, dano = 0, danoFinal, pm = 0, alvoContra = "", acertou = null } = {}) {
  if (gatilho === "inimigo_erra") {
    if (acertou == null) return "a guarda fechou";
    const final = danoFinal != null ? danoFinal : dano;
    return acertou ? `revide em ${alvoContra} · ${final} de dano` : `revide em ${alvoContra} · errou`;
  }
  if (!cortou) return `${dano} inteiros`;
  const final = danoFinal != null ? danoFinal : Math.max(0, dano - cortou);
  const base = cortou >= dano ? `o golpe não te acerta · ${dano} vira 0` : `${cortou} evitado · ${dano} vira ${final}`;
  return pm ? `${base} · −${pm} PM` : base;
}
