/* ============================================================
   O VEREDITO DO CARTAZ (R17) — uma conta só para "isto pode ser aceite"

   O DEFEITO, MEDIDO PELO `jogo` NO SAVE REAL (mente/formas.md, R17): quem
   DESENHA o mural filtra por título exato (`App.jsx:21905`), quem EXECUTA
   o aceite é `aceitarProposta` (`missoes.js:490`, importada em `App.jsx`
   como `ofertaDoMestre`), e ela recusa por CINCO motivos que o desenho
   nunca perguntou — o teto de `MAX_ATIVAS`, o duplicado semântico
   (`pareceMesmaMissao`), o mesmo dador com o mesmo alvo, e nenhuma etapa
   conferível. Quando os títulos divergem mas o serviço é o mesmo, o botão
   nunca pode dar certo — e o jogo mediu que isso acontecia em 4 dos 5
   cartazes do mural dela. Duas contas para o mesmo número seriam duas
   verdades (`App.jsx:21883`), e é exatamente essa doença que este módulo
   cura: NENHUMA regra nova mora aqui, só um ensaio seco da regra que já
   existe.

   A LEI DESTE FICHEIRO: NÃO REIMPLEMENTAR A PENEIRA. `vereditoDoCartaz`
   monta a MESMA proposta que `aceitarContrato` monta (`App.jsx:18962` —
   `propostaDaOferta` + a etapa `falar_com` do dador na frente, porque no
   mural quem oferece nunca está presente) e pergunta a `aceitarProposta`
   se ela passa. O que este ficheiro decide sozinho é só a LEGENDA de um
   "não" que a peneira já deu — nunca o "sim"/"não" em si. Ver o comentário
   grande mais abaixo, antes de `chaveDaRecusa`, para a prova de que isto
   não é uma segunda peneira.
   ============================================================ */
import { aceitarProposta, pareceMesmaMissao, mesmaPessoa, mesmoAlvo, garantirMissoes, MAX_ATIVAS } from "./missoes.js";
import { propostaDaOferta } from "./ofertas.js";

/* `norm` NÃO é exportada por `missoes.js` (é `const norm = ...` de topo de
   arquivo, privada) — e por isso está copiada aqui, byte a byte
   (`missoes.js:57`), com uma ressalva que importa: isto NÃO decide se o
   cartaz pode ser aceite. `pareceMesmaMissao` (chamada abaixo, exportada,
   a MESMA função que `aceitarProposta` já usou para dizer "não") é quem
   decide isso. `normalizarTitulo` só existe para escolher qual das DUAS
   legendas de um "não" já dado descrever — ver `chaveDaRecusa`. */
const normalizarTitulo = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- A TABELA DOS TEXTOS (fechada por `jogo`+`desenho`, R17) ----------------
   Texto de veredito é regra tanto quanto número: se é o jogador que lê
   antes do clique, sai de tabela nomeada, não de string solta espalhada
   pelo `App.jsx`. `MAX_ATIVAS` entra por referência — nunca escrito à
   mão — porque o dia em que o teto mudar a frase muda sozinha. */
const TEXTOS = {
  tecto: {
    texto: () => `A sua palavra já está dada ${MAX_ATIVAS} vezes.`,
    saida: { rotulo: "largue um contrato no Diário", vai: "diario" },
  },
  /* v2 (emenda do `regente`, depois de o `oficial` ligar a peça): `texto`
     NÃO embute mais o nome. A primeira versão escrevia `«${contra}»`
     dentro da própria frase — e `A Consequência` TAMBÉM sabe desenhar
     `colidiu` entre «» em `T.inkMeio` (é a "fenda" que `formas.md` pede).
     As duas coisas ao mesmo tempo obrigavam quem liga a escolher uma
     (o `oficial` escolheu a frase inteira, e a cor do nome — o canal
     que esta etapa existe para dar — nunca aparecia). Agora `texto` é só
     o ANTES: pára onde o nome entraria, sem pontuação à direita, porque
     nada pode vir DEPOIS do nome que `A Consequência` desenha por conta
     própria. `contra` continua nu (sem «») — quem cerca com aspas e
     tinge é sempre a peça, nunca esta função. */
  "mesmo-papel": {
    texto: () => `Já pegou este serviço:`,
    saida: null,
  },
  parece: {
    texto: () => `Parece o mesmo serviço que`,
    saida: { rotulo: "ver no Diário", vai: "diario" },
  },
  "mesma-pessoa": {
    texto: ({ dador }) => `${dador} já lhe pediu isto.`,
    saida: null,
  },
  "ja-feito": {
    texto: () => `Isto já está feito — ninguém retirou o papel.`,
    saida: null,
  },
};

/* ---------------- POR QUE "mesmo-papel" E "parece" SÃO DOIS ----------------
   Esta é a decisão mais importante do ficheiro, e não é uma segunda
   peneira — é a LEGENDA da primeira. `aceitarProposta` já decidiu que a
   proposta colide (motivo "esse mesmo trabalho já está no diário");
   tudo o que falta é dizer POR QUE RAMO ela colidiu, e os dois ramos de
   `pareceMesmaMissao` (`missoes.js:473`) não mentem a mesma coisa:

   - título normalizado igual → é FACTO. O título existe, é conferível,
     não há o que discutir. `Saída=Não tem`: a peça é definitiva.
   - título diferente, vocabulário parecido → é JUÍZO. O `jogo` ensaiou
     isto no save real: de 4 recusas por este motivo, 2 eram falso
     positivo — "Tirar Lia da Silva de lá" × "Tirar Alba de lá", cobertura
     0,667 contra um limiar de 0,62, duas vítimas diferentes, dois lugares
     diferentes. Um selo que dissesse "já está no diário" sobre isto seria
     uma MENTIRA EM REPOUSO — pior que o botão, que só mente quando
     premido. Por isso `Saída=Tem`: o que há a fazer é o jogador abrir o
     Diário e decidir com os próprios olhos.

   A régua que separa os dois É a mesma que `pareceMesmaMissao` já usa por
   dentro (a primeira linha da função: `norm(a.titulo) === norm(b.titulo)`)
   — só que ela nunca devolve QUAL dos dois ramos disparou, e é essa
   pergunta, feita DEPOIS do "não", que este ficheiro responde. */
function chaveDaRecusa(motivo, { atual, proposta, dador }) {
  if (motivo === "já há missões demais em jogo") {
    return { chave: "tecto", contra: "" };
  }
  if (motivo === "esse mesmo trabalho já está no diário") {
    const colidiu = atual.find((q) => ["ativa", "oferecida", "concluida"].includes(q.status) && pareceMesmaMissao(q, proposta));
    const contra = (colidiu && colidiu.titulo) || "";
    const ehFacto = !!colidiu && normalizarTitulo(colidiu.titulo) === normalizarTitulo(proposta.titulo);
    return { chave: ehFacto ? "mesmo-papel" : "parece", contra };
  }
  if (motivo === "essa pessoa já lhe deu esse mesmo trabalho") {
    const colidiu = atual.find((q) => ["ativa", "oferecida"].includes(q.status) && mesmaPessoa(q.dador, proposta.dador) && mesmoAlvo(q, proposta));
    return { chave: "mesma-pessoa", contra: (colidiu && colidiu.titulo) || "" };
  }
  if (motivo === "nenhuma etapa que o sistema saiba conferir") {
    return { chave: "ja-feito", contra: "" };
  }
  /* defensivo: `aceitarProposta` tem um sexto motivo ("sem título" /
     "proposta malformada") que um cartaz nunca deveria produzir — ele
     sempre tem título (o próprio mural não pega sem um) e etapas
     tipadas. Se aparecer mesmo assim, o veredito não inventa uma das
     cinco chaves da tabela: diz que recusa, sem fingir saber por qual
     das cinco portas. */
  return { chave: "", contra: "" };
}

/* ---------------- A ASSINATURA — o `App.jsx` já escreve contra ela ----------------
   { pode, chave, texto, contra, saida }
   - pode   — só é `false` quando `aceitarProposta` devolve `ok:false`.
   - chave  — "" quando pode; senão uma das cinco linhas da tabela acima.
   - contra — o título da missão que colidiu, ou "". É `pareceMesmaMissao`
     (ou `mesmaPessoa`+`mesmoAlvo`) quem sabe qual é — nunca se pergunta
     a mais ninguém, e é isto que impede o selo de mentir.
   - texto  — a frase, com `{dador}` já preenchido. QUANDO `contra` não é
     vazio, `texto` termina exatamente onde o nome entraria (sem «» e
     sem pontuação à direita) — é `A Consequência`, não esta função, quem
     cerca `contra` com «» e o tinge de `T.inkMeio`; ver a nota em `TEXTOS`.
   - saida  — `null`, ou `{ rotulo, vai:"diario" }`. */
export function vereditoDoCartaz(cartaz, missoes, { nivel = 1, dia = 0, mundo = null } = {}) {
  if (!cartaz) return { pode: false, chave: "", texto: "", contra: "", saida: null };

  /* A MESMA MONTAGEM QUE `aceitarContrato` FAZ (`App.jsx:18962`), byte a
     byte: `propostaDaOferta` traduz o cartaz, e a primeira etapa é
     sempre procurar quem assinou — porque no mural, ao contrário de uma
     proposta cara a cara, quem oferece NÃO está presente
     (`dadorPresente: false`). */
  const prop = propostaDaOferta(cartaz);
  const r = aceitarProposta(missoes, {
    ...prop,
    etapas: [{ tipo: "falar_com", alvo: cartaz.dador }, ...(Array.isArray(prop.etapas) ? prop.etapas : [])],
  }, { nivel, dia, mundo, dadorPresente: false });

  if (r.ok) return { pode: true, chave: "", texto: "", contra: "", saida: null };

  /* Daqui para baixo só se descobre a LEGENDA — `r.ok` já é `false`, e
     nada aqui pode reverter isso. `garantirMissoes` é a mesma normalização
     que `aceitarProposta` já aplicou por dentro; chamá-la de novo não é
     confiar menos nela, é precisar de OLHAR para a lista que ela devolve
     (o retorno de `aceitarProposta` numa recusa não traz a missão que
     colidiu — só o motivo). */
  const atual = garantirMissoes(missoes);
  const proposta = {
    titulo: String(prop.titulo || "").trim(),
    descricao: prop.descricao || "",
    dador: prop.dador || "",
    etapas: Array.isArray(prop.etapas) ? prop.etapas : [],
  };
  const dador = cartaz.dador || "";

  const { chave, contra } = chaveDaRecusa(r.motivo, { atual, proposta, dador });
  if (!chave) {
    /* "o sistema não fala de si mesmo" — `r.motivo` aqui é vocabulário do
       MECANISMO ("sem título", "proposta malformada"), nunca de jogo, e
       devolvê-lo direto botaria "sem título." na tela do jogador. Uma
       recusa sem chave reconhecida ainda tem de dizer um "não" da casa;
       o motivo cru fica só para quem depura, via `console.warn` — nunca
       na prop que o `App.jsx` lê para desenhar `A Consequência`. */
    if (typeof console !== "undefined" && console.warn) {
      console.warn(`vereditoDoCartaz: motivo de recusa sem legenda: "${r.motivo}"`);
    }
    return { pode: false, chave: "", texto: "Isto não pode ser aceite agora.", contra: "", saida: null };
  }

  const entrada = TEXTOS[chave];
  return { pode: false, chave, texto: entrada.texto({ contra, dador }), contra, saida: entrada.saida };
}
