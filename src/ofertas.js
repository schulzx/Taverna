/* ============================================================
   OFERTAS (v9.37) — o sistema propõe, o Mestre veste

   O mural antigo (contratos.js) era sistema-primeiro e mesmo assim
   estava quebrado, por um motivo que valia a pena escrever antes de
   corrigir: ele gerava PROSA. Sorteava "Leve um pacote lacrado até
   Rio do Sul" e depois o App precisava de uma expressão regular para
   descobrir, na própria frase que acabara de escrever, qual era o
   destino. O sistema conversando consigo mesmo por texto.

   Aqui o gerador nunca escreve uma frase que ele mesmo precise ler
   depois. Ele devolve ESTRUTURA — dador, etapas tipadas, alvos que
   existem, preço decidido antes de qualquer palavra — e a prosa fica
   inteiramente por conta do Mestre, que é bom nisso.

   E o material não vem mais de tabela genérica ("um goblin ataca na
   floresta próxima", sem nome, sem motivo, sem ninguém). Vem da BASE
   DO MUNDO, que desde a v9.8 gera para cada local de cada cidade
   gente com nome, ofício, jeito — e uma VONTADE:

       "procura um irmão que sumiu"
       "guarda uma carta que nunca entregou"
       "deve dinheiro a gente perigosa"

   Uma missão é exatamente isto: uma vontade transformada em etapa que
   o código sabe conferir. O mundo já sabia quem queria o quê; faltava
   alguém perguntar.

   TRÊS REGRAS:

   1) O ALVO SEMPRE EXISTE. A criatura sai do bestiário daquela região,
      a cidade sai do mapa, o objeto sai dos segredos daquela cidade, a
      pessoa sai da base. Nada de "a vila ao lado".

   2) O PREÇO NASCE ANTES DA FALA. É o conserto definitivo do cartaz que
      prometia 15 e do diário que anunciava 43: quando o número existe
      antes de qualquer frase, nenhuma frase pode discordar dele.

   3) CADA PESSOA TEM UM TRABALHO SÓ, PARA SEMPRE. A semente é o nome
      dela. Jessa não tem dois problemas com o mesmo gado — e se o
      jogador a encontrar na ficção, é o mesmo serviço que aparece.
      O mural é só uma janela para o que o mundo já queria.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { nomePessoa } from "./nomes.js";
import { oQueExisteAqui, idDaGente } from "./mundo-base.js";
import { criaturasDoGenero } from "./bestiario.js";
import { recompensaDe, noitesDePrazo } from "./missoes.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- O OBJETO QUE SE PROCURA ----------------
   O segredo da base é uma frase ("um livro-caixa com contas que não
   fecham"). A etapa `achar` compara com o nome do que está na bolsa,
   então precisa de uma palavra curta e distintiva — não da frase. */
const OBJETO_DO_SEGREDO = {
  bau: "baú lacrado", alcapao: "chave do alçapão", carta: "carta selada com cera preta",
  passagem: "mapa da passagem murada", cofre: "cofre pequeno", corpo: "medalhão dos ossos",
  registro: "livro-caixa", relicario: "relicário guardado",
};

/* Toda descrição gerada aqui atravessa nomes de gênero sorteado — "Quilla
   está preso", "existe ossos velhos" —, e o gerador não sabe (nem deve
   saber) o gênero de cada nome que a base inventou. A saída não é uma
   tabela de concordância: é escrever frases que não pedem concordância
   nenhuma. "não voltou" serve para qualquer pessoa; "há" serve para um
   osso e para muitos. */

/* Um pedaço de frase só entra se ACRESCENTAR alguma coisa. A base descreve
   o bicho ("rondando os arredores") sem saber o que a frase já disse
   ("ronda os arredores"), e colar os dois produz eco. Compara as palavras
   que importam: se todas já estão na parte de cima, não entra. */
const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const raiz = (p) => semAcento(p).replace(/(ndo|r|s|m|ava|ou)$/,"");
function acrescenta(pedaco, jaDito) {
  const p = semAcento(pedaco).match(/[a-z]{4,}/g) || [];
  if (!p.length) return false;
  const dito = new Set((semAcento(jaDito).match(/[a-z]{4,}/g) || []).map(raiz));
  return p.some((w) => !dito.has(raiz(w)));
}

/* ---------------- OS MOLDES ----------------
   Cada molde sabe (a) de que material precisa, (b) que vontades ele
   atende e (c) como montar as etapas. `risco` é o multiplicador do
   preço: varrer uma praga vale mais que levar uma carta.

   `paga: 0` não é ausência de valor — é um combinado que não é
   dinheiro. Quem está apaixonado sem retorno não paga em moeda.

   `prazo` (v9.38) é em NOITES, e só existe quando a ficção o justifica:
   quem está preso não espera um mês, e a praga se espalha. Entregar uma
   carta ou levar um recado, não — pôr relógio em tudo transformaria a
   campanha inteira numa corrida, e prazo que está em toda parte não
   pressiona em lugar nenhum. */
export const MOLDES = [
  {
    id: "cacada", tipo: "contrato", icone: "🏹", risco: 1.2, prazo: 0, precisa: ["criatura"],
    vontades: ["vingança", "medo de dormir", "lembrado por algo", "coragem"],
    montar: ({ pessoa, criatura, aqui }) => ({
      titulo: `A caçada de ${pessoa.nome}`,
      /* o comportamento da criatura vem da base e às vezes DIZ a mesma coisa
         que a metade de cima da frase — "Atirador ronda os arredores —
         rondando os arredores". Quando ele repete, some. */
      descricao: (() => {
        const abertura = `${criatura.nome} ronda ${aqui.regiao ? aqui.regiao.nome : "os arredores"}`;
        const como = String(criatura.comportamento || "").trim();
        return `${abertura}${acrescenta(como, abertura) ? ` — ${como}` : ""}. ${pessoa.nome} quer o bicho morto.`;
      })(),
      etapas: [{ tipo: "derrotar", alvo: criatura.nome, quantos: 1 }],
      gancho: `${pessoa.nome} ${pessoa.vontade}, e a caçada tem a ver com isso`,
    }),
  },
  {
    id: "praga", tipo: "contrato", icone: "🧹", risco: 1.6, prazo: 6, precisa: ["criatura"],
    vontades: ["protege alguém", "cuida de um filho", "trai o patrão"],
    montar: ({ pessoa, criatura, local }) => ({
      titulo: `Praga em ${local.nome}`,
      descricao: `${criatura.nome} se multiplicou perto de ${local.nome} — são três, pelo menos. ${pessoa.nome} quer o lugar limpo.`,
      etapas: [{ tipo: "derrotar", alvo: criatura.nome, quantos: 3 }],
      gancho: `${pessoa.nome} ${pessoa.vontade}, e a praga ameaça exatamente isso`,
    }),
  },
  {
    id: "entrega", tipo: "contrato", icone: "📦", risco: 0.9, prazo: 0, precisa: ["cidade"],
    vontades: ["carta que nunca entregou", "esconde de onde veio", "navio"],
    montar: ({ pessoa, cidade }) => {
      /* o item que a etapa confere é o MESMO texto que o sistema põe na
         bolsa. Um token curto como "carta" casaria com a carta de outra
         missão e fecharia a etapa errada. */
      const item = `carta lacrada de ${pessoa.nome}`;
      return {
        titulo: `A carta de ${pessoa.nome}`,
        descricao: `${pessoa.nome} guarda uma carta lacrada que precisa chegar a ${cidade.nome}. Sem abrir.`,
        etapas: [{ tipo: "levar_a", item, alvo: cidade.nome }],
        daItem: item,
        gancho: `${pessoa.nome} ${pessoa.vontade}, e a carta é sobre isso — o que tem dentro não será dito`,
      };
    },
  },
  {
    id: "recado", tipo: "favor", icone: "💌", risco: 0, prazo: 0, precisa: ["pessoaLocal"],
    vontades: ["apaixonado sem retorno", "espera um navio", "sonha em ser lembrado"],
    montar: ({ pessoa, outro, local }) => ({
      titulo: `Um recado para ${outro.nome}`,
      descricao: `${pessoa.nome} não tem coragem de falar com ${outro.nome}, em ${outro.local || local.nome}. Pede que você leve o recado.`,
      etapas: [{ tipo: "falar_com", alvo: outro.nome }],
      gancho: `${pessoa.nome} ${pessoa.vontade} — e não há moeda nisto: o pagamento é o que ${pessoa.nome} sabe e ainda não contou`,
    }),
  },
  {
    id: "busca", tipo: "contrato", icone: "🔦", risco: 1.1, prazo: 8, precisa: ["cidade", "sumido"],
    vontades: ["irmão que sumiu", "liberdade de alguém", "dívida"],
    montar: ({ pessoa, cidade, sumido }) => ({
      titulo: `Quem ${pessoa.nome} perdeu`,
      descricao: `${sumido} sumiu a caminho de ${cidade.nome}. ${pessoa.nome} quer notícia — qualquer uma.`,
      etapas: [{ tipo: "ir_a", alvo: cidade.nome }, { tipo: "falar_com", alvo: sumido }],
      gancho: `${pessoa.nome} ${pessoa.vontade}, e ${sumido} é esse alguém`,
    }),
  },
  {
    id: "prova", tipo: "contrato", icone: "🔎", risco: 1.0, prazo: 0, precisa: ["segredo"],
    vontades: ["sabe de um crime", "trai o patrão", "esconde de onde veio", "profecia"],
    montar: ({ pessoa, segredo, objeto }) => ({
      titulo: `O que há em ${segredo.local}`,
      descricao: `${pessoa.nome} diz que há ${segredo.o}, em ${segredo.local}. Quer isso nas mãos, não na boca do povo.`,
      /* o alvo é o nome INTEIRO do objeto, e o envelope obriga o Mestre a
         usar exatamente esse nome ao entregá-lo: assim a etapa fecha com o
         objeto certo e não com qualquer coisa parecida na bolsa */
      etapas: [{ tipo: "achar", alvo: objeto }],
      objeto,
      gancho: `${pessoa.nome} ${pessoa.vontade}, e não quer que se saiba de onde veio a informação`,
    }),
  },
  {
    id: "resgate", tipo: "contrato", icone: "🆘", risco: 1.9, prazo: 4, precisa: ["cidade", "criatura", "sumido"],
    vontades: ["liberdade de alguém", "protege alguém", "cuida de um filho", "vingança"],
    montar: ({ pessoa, cidade, criatura, sumido }) => ({
      titulo: `Tirar ${sumido} de lá`,
      descricao: `${sumido} não voltou de perto de ${cidade.nome}, e há ${criatura.nome} no caminho. ${pessoa.nome} paga para trazer de volta.`,
      etapas: [{ tipo: "ir_a", alvo: cidade.nome }, { tipo: "derrotar", alvo: criatura.nome, quantos: 1 }],
      gancho: `${pessoa.nome} ${pessoa.vontade}, e é por ${sumido} que junta cada moeda`,
    }),
  },
  {
    id: "viagem", tipo: "contrato", icone: "🛡", risco: 1.3, prazo: 0, precisa: ["cidade"],
    vontades: ["sair desta cidade", "viagem impossível", "profecia", "navio"],
    montar: ({ pessoa, cidade }) => ({
      titulo: `A estrada até ${cidade.nome}`,
      descricao: `${pessoa.nome} precisa chegar a ${cidade.nome} e não faz o caminho sem companhia.`,
      etapas: [{ tipo: "ir_a", alvo: cidade.nome }],
      gancho: `${pessoa.nome} ${pessoa.vontade}, e a viagem é a única chance disso acontecer`,
    }),
  },
];

export const ICONE_OFERTA = MOLDES.reduce((a, m) => { a[m.id] = m.icone; return a; }, { padrao: "📜" });
export function moldePorId(id) { return MOLDES.find((m) => m.id === id) || null; }

/* Afinidade entre a vontade e o molde. Sem correspondência, o molde
   ainda serve — só perde para quem casou. Uma pessoa sempre tem um
   trabalho possível; o que muda é se ele fala dela ou não. */
function afinidade(molde, vontade) {
  const v = norm(vontade);
  return molde.vontades.some((chave) => v.includes(norm(chave))) ? 3 : 1;
}

/* ---------------- O MATERIAL ----------------
   Tudo o que um molde pode pedir, retirado do mundo que já existe. */
function materialDe({ rnd, pessoa, aqui, mapa, genero, nivel, molde = null, lex = null }) {
  const bichos = (aqui.criaturas || []).filter((c) => (c.nivel || 1) <= nivel + 3);
  const banco = criaturasDoGenero(genero).filter((c) => (c.nivelRef || 1) <= nivel + 3);
  const criatura = bichos.length ? pick(rnd, bichos)
    : banco.length ? { ...pick(rnd, banco), nivel: 1, comportamento: "rondando os arredores" } : null;
  const outras = ((mapa && mapa.cidades) || []).filter((c) => c.nome !== aqui.cidade.nome);
  const cidade = outras.length ? pick(rnd, outras) : null;
  const segredo = (aqui.segredos || []).length ? pick(rnd, aqui.segredos) : null;
  const vizinhos = (aqui.gente || []).filter((p) => p.nome !== pessoa.nome);
  const outro = vizinhos.length ? pick(rnd, vizinhos) : null;
  const local = (aqui.locais || []).find((l) => l.nome === pessoa.local) || (aqui.locais || [])[0] || { nome: pessoa.local || aqui.cidade.nome };
  return {
    criatura, cidade, segredo, outro, local,
    objeto: segredo ? (OBJETO_DO_SEGREDO[segredo.tipo] || "objeto guardado") : null,
    /* quem sumiu não está na base: é alguém de fora, e por isso nasce aqui
       com nome próprio — determinístico, para nunca trocar de nome.

       v9.113: e COM O LÉXICO. Sem ele saía "Tirar Falk de lá" num mundo
       de caçadores modernos — o nome de quem sumiu é a única coisa da
       oferta que o jogador lê antes de aceitar. */
    sumido: nomePessoa(genero, undefined, rnd, lex),
  };
}

function temMaterial(molde, mat) {
  return molde.precisa.every((p) => (
    p === "criatura" ? !!mat.criatura
      : p === "cidade" ? !!mat.cidade
        : p === "segredo" ? !!mat.segredo
          : p === "pessoaLocal" ? !!mat.outro
            : p === "sumido" ? !!mat.sumido
              : false
  ));
}

/* ---------------- O PREÇO ----------------
   Mesma fórmula do resto da casa, multiplicada pelo risco do molde:
   um contrato do mural e uma missão arbitrada pelo sistema não podem
   pagar em escalas diferentes, ou o jogador aprende a preferir a
   porta que paga melhor em vez da história que quer viver. */
/* ---------------- O NÍVEL DO TRABALHO (v9.115) ----------------
   A dificuldade precisava de um número que o trabalho trouxesse de casa,
   e até aqui não havia nenhum: a missão nascia com o nível do HERÓI, o
   que faz todo contrato do diário sair "à altura" e transforma o rótulo
   em enfeite — se nada varia, ninguém olha.

   O número não é novo, só nunca tinha sido lido assim. `risco` já
   distingue uma entrega (0,9) de uma praga (1,6) desde a v9.37, e a
   criatura do molde já vem com o nível dela. Falta o espalhamento, e ele
   é o ponto: um mural em que tudo é do tamanho do herói não é um mural, é
   um corredor. Alguns trabalhos TÊM de estar acima — é o que dá sentido a
   voltar mais forte — e o cartaz agora diz isso antes, e não depois.

   Determinístico pela mesma semente da oferta: o mesmo cartaz vale o
   mesmo amanhã e no save do mês que vem. */
export function nivelDaOferta({ nivel = 1, risco = 1, criatura = null, rnd }) {
  const doRisco = (Number(risco) || 1) - 1;
  const sorteio = rnd ? Math.floor(rnd() * 7) - 2 : 0;   /* −2 a +4 */
  const doBicho = criatura && Number(criatura.nivel) > 0 ? Number(criatura.nivel) : 0;
  const meu = (Number(nivel) || 1) + doRisco * 3 + sorteio;
  /* o bicho é PISO, não média: um contrato para matar coisa de nível 12
     não é de nível 5 porque o sorteio quis */
  return Math.max(1, Math.round(Math.max(meu, doBicho)));
}

export function precoDaOferta({ tipo, nivel, etapas, risco }) {
  if (!risco) return 0;
  const base = recompensaDe({ tipo, nivel, etapas }).moedas;
  /* arredonda para cinco: preço de cartaz é número redondo */
  return Math.max(5, Math.round((base * risco) / 5) * 5);
}

/* ---------------- A OFERTA DE UMA PESSOA ----------------
   Determinística pelo NOME dela: a mesma pessoa oferece o mesmo
   trabalho hoje, amanhã e no save do mês que vem. */
export function ofertaDePessoa({ semente, pessoa, aqui, mapa, genero = "Fantasia medieval", nivel = 1, molde: moldeDoMundo = null, lex = null }) {
  if (!pessoa || !pessoa.nome || !aqui || !aqui.cidade) return null;
  const rnd = rngDe(`${semente}|oferta|${idDaGente(aqui.cidade.nome, pessoa)}`);
  const mat = materialDe({ rnd, pessoa, aqui, mapa, genero, nivel, molde: moldeDoMundo, lex });
  const possiveis = MOLDES.filter((m) => temMaterial(m, mat));
  if (!possiveis.length) return null;
  /* sorteio com peso: o molde que atende a vontade dela sai três vezes
     mais, mas não sempre — senão toda pessoa apaixonada vira um recado */
  const urna = [];
  for (const m of possiveis) for (let i = 0; i < afinidade(m, pessoa.vontade); i++) urna.push(m);
  const molde = pick(rnd, urna);
  const corpo = molde.montar({ ...mat, pessoa, aqui, mapa, rnd, nivel, genero, lex });
  if (!corpo || !corpo.etapas || !corpo.etapas.length) return null;
  /* O gancho de cada molde AFIRMA um nexo entre a vontade e o serviço ("a
     viagem é a única chance disso acontecer"). Isso só é verdade quando o
     molde saiu por afinidade com a vontade; quando saiu pelo sorteio, a
     frase vira non sequitur — "tem medo de dormir, e a viagem é a única
     chance disso acontecer". Sem afinidade, o sistema só informa o que
     move a pessoa e deixa o nexo para o Mestre, se houver. */
  const gancho = afinidade(molde, pessoa.vontade) > 1
    ? corpo.gancho
    : `${pessoa.nome} ${pessoa.vontade} — pode não ter nada a ver com o pedido`;
  /* O NÍVEL PRÓPRIO, e o preço sai dele. Trabalho mais duro paga mais:
     as duas coisas têm de sair do mesmo número, senão o cartaz promete
     um risco e cobra outro. */
  const nivelDoTrabalho = nivelDaOferta({ nivel, risco: molde.risco, criatura: mat.criatura, rnd });
  const paga = precoDaOferta({ tipo: molde.tipo, nivel: nivelDoTrabalho, etapas: corpo.etapas.length, risco: molde.risco });
  return {
    id: `of_${idDaGente(aqui.cidade.nome, pessoa)}`.replace(/\s+/g, "_"),
    molde: molde.id, icone: molde.icone, tipo: molde.tipo,
    titulo: corpo.titulo, descricao: corpo.descricao,
    dador: pessoa.nome,
    dadorPapel: pessoa.papel || "", dadorLocal: pessoa.local || "", dadorModo: pessoa.modo || "",
    dadorVontade: pessoa.vontade || "",
    cidade: aqui.cidade.nome,
    etapas: corpo.etapas,
    nivel: nivelDoTrabalho,
    paga,
    /* o molde é quem sabe se a coisa espera: três dos oito correm contra o
       tempo, e o número vai no cartaz antes de o jogador decidir */
    prazo: noitesDePrazo(molde.prazo),
    daItem: corpo.daItem || null,
    objeto: corpo.objeto || null,
    gancho: gancho || "",
  };
}

/* ---------------- O QUE ESTA CIDADE TEM PARA OFERECER ----------------
   Uma volta pela base do mundo, uma oferta por pessoa. Não é o mural:
   é o estoque de que o mural (e o Mestre) tiram. */
export function ofertasDaqui({ semente, mapa, cidade, base, genero = "Fantasia medieval", nivel = 1, quantas = 3, evitar = [], molde = null, lex = null }) {
  /* v9.113: `molde` e `lex` chegam aqui, e a falta deles era visível na
     primeira cena do jogo: num mundo de caçadores modernos o mural
     oferecia "Jarl Mata-Lobos" mandando o herói a "Pedra da Serpente".

     `oQueExisteAqui` recebe sete argumentos e esta chamada passava
     cinco. `mundo-base.js` passa os sete nas três chamadas dele; este
     arquivo foi escrito antes de o léxico existir e ficou para trás. */
  const aqui = oQueExisteAqui(semente, mapa, cidade, base, genero, molde, lex);
  if (!aqui || !aqui.gente || !aqui.gente.length) return [];
  const proibido = new Set(evitar.map(norm));
  const todas = [];
  for (const p of aqui.gente) {
    const of = ofertaDePessoa({ semente, pessoa: p, aqui, mapa, genero, nivel, molde, lex });
    if (!of) continue;
    if (proibido.has(norm(of.titulo)) || proibido.has(norm(of.dador))) continue;
    todas.push(of);
  }
  /* embaralho de verdade (Fisher-Yates), semeado pela cidade: o mural muda de
     cara entre cidades sem mudar sozinho a cada render. Um comparador
     aleatório em `sort` não embaralha — enviesa, e ainda depende do
     algoritmo de ordenação do motor. */
  const rnd = rngDe(`${semente}|mural|${cidade}`);
  for (let i = todas.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [todas[i], todas[j]] = [todas[j], todas[i]];
  }
  return todas.slice(0, quantas);
}

/* ---------------- O QUE O MESTRE RECEBE ----------------
   O envelope é a fronteira entre as duas competências. Tudo que é
   número, alvo e etapa já está decidido e é dito como fato; tudo que
   é cena — a voz, o gesto, a pressa — é pedido a ele, que é o que
   ele faz melhor do que qualquer tabela. */
function fatos(of) {
  const preco = of.paga
    ? `O pagamento é ${of.paga} moedas, combinado agora: se falar de preço, é ESSE número.`
    : `Isto NÃO se paga em moedas — o combinado é outro (o que ${of.dador} sabe, uma porta que se abre, um favor devolvido). Não prometa dinheiro.`;
  const prazo = of.prazo
    ? ` Há PRAZO: ${of.prazo} noites, contadas pelo relógio do sistema. Deixe a pressa aparecer na cena, mas não conte as noites nem dê tempo extra.`
    : "";
  return `${preco}${prazo}${of.daItem ? ` ${of.dador} entrega em mãos: ${of.daItem} (o sistema já pôs na minha bolsa — não envie itens).` : ""}${of.objeto ? ` O que se procura chama-se "${of.objeto}" — use exatamente esse nome quando eu encontrar, e mande-o com "adicionar_itens".` : ""}`;
}

export function envelopeDaAbordagem(of) {
  return `[OFERTA DE TRABALHO — MONTADA PELO SISTEMA, AINDA NÃO ACEITA] ${of.dador}${of.dadorPapel ? `, ${of.dadorPapel}` : ""}${of.dadorLocal ? `, em ${of.dadorLocal}` : ""}, procura o herói para oferecer isto: "${of.titulo}". ${of.descricao} ${fatos(of)}

Encene a abordagem em 3 ou 4 frases: ${of.dadorModo ? `${of.dador} ${of.dadorModo}` : `o jeito de ${of.dador}`}, o que a pessoa diz, o que ela evita dizer. ${of.gancho ? `A verdade por trás do pedido, que deve transparecer sem ser explicada: ${of.gancho}.` : ""} Depois PARE: eu aceito ou recuso no diário, e é de lá que a resposta vem. Não presuma aceite, não comece o serviço, não invente etapa nem prazo.`;
}

export function envelopeDoCartaz(of) {
  return `[CARTAZ DO MURAL — ESCRITO PELO SISTEMA] Peguei no mural um contrato: "${of.titulo}". ${of.descricao} Quem assina é ${of.dador}${of.dadorPapel ? `, ${of.dadorPapel}` : ""}${of.dadorLocal ? `, que fica em ${of.dadorLocal}` : ""}. ${fatos(of)}

Reconheça na ficção que eu peguei o cartaz — o papel na mão, quem olhou, o que se comenta sobre esse serviço — em 2 ou 3 frases, e siga a cena de onde eu estava. NÃO resolva nada do serviço agora e NÃO conclua a missão: quem marca etapa é o sistema.`;
}

/* A oferta vira a proposta que `aceitarProposta` sabe validar. Um lugar
   só faz a tradução, para os dois lados nunca discordarem sobre a forma. */
export function propostaDaOferta(of) {
  return {
    titulo: of.titulo, tipo: of.tipo, dador: of.dador,
    descricao: of.descricao, paga: of.paga, prazo: of.prazo || 0, etapas: of.etapas,
    /* o nível viaja junto: sem ele a missão renasceria com o do herói e a
       dificuldade que o cartaz mostrou mudaria ao ser aceita */
    nivel: of.nivel || 0,
  };
}

export const OFERTAS_PROMPT = `TRABALHOS OFERECIDOS (v9.37 — quem monta é o sistema):
- Quando alguém do mundo oferecer serviço ao herói, o trabalho chega a você por envelope, PRONTO: quem oferece, o que se pede, quais etapas e quanto paga. Nada disso é seu para inventar ou renegociar.
- O seu trabalho é a CENA: a voz, o gesto, a hesitação, o que a pessoa esconde. É a parte que nenhuma tabela faz.
- Continue livre para propor trabalho pelo campo "missao_oferecida" quando a ficção pedir — uma promessa feita numa conversa vira missão. O sistema valida, calcula e recusa o que não vira etapa.`;
