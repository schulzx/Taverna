/* ============================================================
   A GENTE POR DENTRO (Fase MM, etapa MM8a) — a ficha que o registo
   nunca teve

   A sonda da mesa (MM1) pôs o jogador a perguntar ao Mestre o que se
   pergunta ao Matt sobre uma pessoa: "há quanto tempo isso lhe
   aconteceu?", "ele está à frente das minas por algum motivo?", "como
   o seu amigo se feriu assim?", "qual foi o adversário mais famoso
   dele?", "que gente trabalha ali dentro?", "cadê aquele que devia
   estar de plantão?", "qual deles parece o mais novo?", "ela já era
   desajeitada quando a conheceram?", "ela parecia forte?". Nove vezes
   a mesma resposta: NINGUÉM DECIDE. A ficha de uma pessoa sabia o
   nome, o papel, onde está e se está viva — e o Narrador inventava o
   resto, cada vez de outra maneira.

   ---------------- O QUE ESTE MÓDULO SABE ----------------

   A FICHA POR DENTRO de qualquer pessoa — da base do mundo, do registo
   ou de alguém que o Narrador pôs em cena ontem —, derivada da semente
   e do NOME, como a índole (`indoleDe`): a mesma Fina tem a mesma
   idade, o mesmo passado e a mesma folga em qualquer máquina. Nada vai
   para o save.

     · a APARÊNCIA sai do MESMO sorteio que desenha o retrato
       (`semente.js`: `tracos` e `feicoes`, com a chave que o retrato
       usa, `pessoa.semente || pessoa.nome`). O cabelo branco do retrato
       nunca é "jovem" na boca do Narrador; o maxilar largo é compleição
       robusta; a cicatriz desenhada é a cicatriz que se pergunta. Uma
       palavra que desmentisse a cara seria o sistema a contradizer-se
       na mesma cena;
     · o JEITO — o modo da base, quando a pessoa é da base, e os traços
       da índole, que qualquer pessoa tem;
     · o PASSADO com data ("há N anos"), que cita chefes, criaturas e
       cidades DESTE mundo — o adversário mais famoso de um guarda é um
       chefe que existe no mapa, não um nome inventado para a frase;
     · o MOTIVO DO POSTO, pela família do ofício;
     · a ROTINA — o turno, a folga (na semana da feira, `O_HOJE.semana`)
       e onde a pessoa está agora, pelo dia e pelo minuto;
     · QUEM TRABALHA EM CADA CASA — `genteDoLocal` já o sabia e a pauta
       não o dizia: `resumoDaqui` lista a gente da cidade sem o sítio de
       cada um. Era o #54, "sabe e não conta".

   ---------------- O REGISTO MANDA NA IDENTIDADE ----------------

   Se a pessoa já tem ficha no registo (`npcs`), o `papel`, o `local`,
   o `status`, o `genero` e a `semente` são os dela: o que o jogador já
   ouviu não muda porque esta ficha nasceu depois. A ficha por dentro só
   ACRESCENTA o que o registo nunca teve. Quem morreu (status "morto" ou
   `baseMundo.mortos`) continua a ter aparência e passado — mas não tem
   rotina, e ninguém o encontra de plantão.

   Os COMPANHEIROS (quem anda no grupo) ficam com aparência e jeito e
   sem passado, posto nem rotina: a história deles foi escrita na ficha
   do grupo quando entraram, e um passado por semente seria uma segunda
   história a desmentir a primeira.

   ---------------- O QUE VAI À PAUTA ----------------

   NADA, a não ser que a frase do jogador pergunte por alguém (ou por
   uma casa). Aí vai UMA linha, na secção PERGUNTOU — a mesma da cidade
   (MM12). Custo zero em todo turno que não pergunta.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { tracos, feicoes, CABELO } from "./semente.js";
import { indoleDe, RELEVANTE, tracoPorId } from "./indole.js";
import { oQueExisteAqui, locaisDaCidade, genteDoLocal, chefesDoMundo, criaturasDaRegiao, estaMorto, situacaoDe, ondeEsta, SITUACOES } from "./mundo-base.js";
import { nomePessoa } from "./nomes.js";
import { O_HOJE } from "./cidade-por-dentro.js";
import { comEm } from "./lugar.js";
/* MM8b: o elenco, as casas e o que a cidade diz de cada um */
import { elencoDoMundo, reputacaoDe, REPUTACAO_DA_CASA } from "./elenco.js";
/* MM14: o assunto lê-se sem os nomes próprios; a pessoa, na frase inteira */
import { fraseDoJogador, assuntoDaFrase } from "./perguntas.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const semArtigo = (s) => String(s || "").replace(/^(o|a|os|as)\s+/i, "").trim();

/* ---------------- A IDADE QUE O RETRATO MOSTRA ----------------
   Uma linha por cor de `CABELO` (semente.js), NA MESMA ORDEM — a suíte
   confere o comprimento. A idade é APARENTE ("aparenta uns 50"): num
   mundo de elfos o ano de nascimento não é o que se vê, e o jogador
   pergunta o que se vê. As cores tingidas são de gente nova; o grisalho
   e o branco nunca descem abaixo dos 45. */
export const IDADE_PELO_CABELO = [
  { de: 18, ate: 44, cabelo: "negro" },
  { de: 16, ate: 48, cabelo: "castanho-escuro" },
  { de: 16, ate: 48, cabelo: "castanho" },
  { de: 16, ate: 40, cabelo: "acobreado" },
  { de: 15, ate: 38, cabelo: "loiro" },
  { de: 45, ate: 66, cabelo: "grisalho" },
  { de: 62, ate: 86, cabelo: "branco" },
  { de: 16, ate: 30, cabelo: "tingido de violeta" },
  { de: 20, ate: 50, cabelo: "ruivo-escuro" },
  { de: 16, ate: 30, cabelo: "tingido de verde" },
];
/* as palavras não têm género: servem a ele e a ela sem concordância torta */
export const FAIXAS_DE_IDADE = [
  { ate: 19, o: "muito jovem" },
  { ate: 30, o: "jovem" },
  { ate: 44, o: "na força da idade" },
  { ate: 60, o: "de meia-idade" },
  { ate: 999, o: "de idade avançada" },
];

/* ---------------- A COMPLEIÇÃO QUE O RETRATO MOSTRA ----------------
   `feicoes(...).queixo` (0 a 1) é a largura do maxilar desenhado — é o
   eixo do corpo que a xilogravura tem. O adjetivo concorda com
   "compleição", não com a pessoa. */
export const COMPLEICAO_PELO_QUEIXO = [
  { ate: 0.18, o: "franzina", forte: false },
  { ate: 0.4, o: "esguia", forte: false },
  { ate: 0.62, o: "mediana", forte: false },
  { ate: 0.84, o: "robusta", forte: true },
  { ate: 1.01, o: "larga e pesada", forte: true },
];

/* ---------------- A MARCA DO ROSTO ----------------
   Uma linha por `tracos(...).marca` (0, 1, 2), na ordem em que o
   retrato as desenha (rosto.jsx): o risco que desce da têmpora, o traço
   vermelho na face, o ponto junto à boca. Só a cicatriz é ferida — é a
   que responde "como se feriu". */
export const MARCAS_DO_ROSTO = [
  { o: "uma cicatriz que desce da têmpora", ferida: true },
  { o: "uma pintura vermelha na face", ferida: false, sentido: ["promessa feita a um morto", "costume do povo de onde veio", "luto que não acabou"] },
  { o: "um sinal junto à boca", ferida: false, sentido: ["de nascença"] },
];

/* ---------------- AS FAMÍLIAS DE OFÍCIO ----------------
   O papel é texto livre (da base ou do Narrador); a família é o que o
   sistema sabe fazer com ele. A primeira que casa ganha — a ordem é a
   da especificidade. `comum` é a rede: papel nenhum fica sem família.

   Cada família traz o motivo do posto, a origem de uma cicatriz, quem é
   o adversário (um chefe do mundo, uma criatura da região ou uma pessoa),
   a idade mínima de quem ocupa o posto (dentro da faixa que o cabelo do
   retrato permite: um capitão de cabelo tingido é o mais velho que o
   cabelo deixa, nunca um menino) e a rotina — os turnos possíveis em minutos do dia (`ate` menor que
   `de` atravessa a meia-noite). */
export const FAMILIAS_DE_OFICIO = [
  {
    id: "armas",
    idadeMin: 17,
    rx: /guarda|capit|sargent|recruta|soldad|campea|campeo|mercen|veteran|cavaleir|carcereir|vigia|sentinel|guerreir|cacador|arqueir|miliciano/,
    postos: ["subiu quando quem estava acima morreu e ninguém mais quis o lugar", "foi posto ali por dever um favor a quem manda na cidade", "era o único que sabia ler as ordens", "ganhou o posto depois de segurar sozinho uma noite ruim"],
    cicatriz: ["um golpe mal aparado num treino", "uma rixa de quartel que ninguém conta direito"],
    adversario: "chefe",
    turnos: [{ de: 6 * 60, ate: 18 * 60, o: "de plantão de dia" }, { de: 18 * 60, ate: 6 * 60, o: "de plantão de noite" }],
  },
  {
    id: "balcao",
    idadeMin: 18,
    rx: /taverneir|estalajadeir|servical|servi[cç]al|atendente|cozinheir|music|bebado|dono da casa|dona da casa|copeir/,
    postos: ["herdou o balcão de quem a criou", "comprou a casa com o que juntou na estrada", "casou com quem era dono e ficou quando ele se foi", "ganhou a casa num jogo de dados e nunca mais saiu de trás do balcão"],
    cicatriz: ["uma garrafa partida numa noite de briga", "um caco de vidro, num inverno em que ninguém pagava"],
    adversario: "pessoa",
    turnos: [{ de: 11 * 60, ate: 2 * 60, o: "atrás do balcão" }],
  },
  {
    id: "comercio",
    idadeMin: 16,
    rx: /mercad|vendedor|caravan|cambist|contraband|mestre do porto|marinheir|batedor de carteir|mascate|comerciant|lojist/,
    postos: ["abriu a banca com a herança de um tio que ninguém conheceu", "comprou o lugar de quem fugiu com dívidas", "foi o que sobrou quando a caravana se desfez", "tem o ponto porque paga a quem de direito"],
    cicatriz: ["um assalto na estrada, a meio caminho de outra cidade", "uma faca de quem não quis pagar"],
    adversario: "pessoa",
    turnos: [{ de: 7 * 60, ate: 19 * 60, o: "na banca" }],
  },
  {
    id: "fe",
    idadeMin: 16,
    rx: /sacerdot|acolit|peregrin|reliqui|coveir|carpideir|monge|freira|frade|clerig|oracul/,
    postos: ["fez os votos depois de uma doença que devia tê-lo(a) levado", "foi deixado(a) à porta do templo em criança", "chegou como peregrino(a) e nunca mais partiu", "é o(a) único(a) que ainda sabe as rezas antigas de cor"],
    cicatriz: ["uma penitência que foi longe demais", "uma noite de vigília em que algo respondeu"],
    adversario: "criatura",
    turnos: [{ de: 5 * 60, ate: 21 * 60, o: "no templo" }],
  },
  {
    id: "oficio",
    idadeMin: 14,
    rx: /ferreir|aprendiz|encomend|artes|carpint|pedreir|mineir|minas?\b|oleir|tecel|curtidor|moleir|pescador|lenhador|pastor|lavrador/,
    postos: ["aprendeu o ofício com quem ocupava o lugar e ficou quando ele morreu", "é o melhor da cidade no que faz, e todos sabem", "herdou as ferramentas e as dívidas da família", "ficou com o lugar porque mais ninguém queria sujar as mãos"],
    cicatriz: ["um acidente de ofício, com ferro quente", "uma ferramenta que escapou num dia de pressa"],
    adversario: "criatura",
    turnos: [{ de: 6 * 60, ate: 18 * 60, o: "no ofício" }],
  },
  {
    id: "saber",
    idadeMin: 15,
    rx: /arquivist|estudant|tradutor|escriv|mago|maga|sabio|alquim|erudit|professor|mestre de letras|bibliotec/,
    postos: ["foi o(a) único(a) aluno(a) que o velho mestre aceitou", "chegou com uma carta de recomendação que ninguém conseguiu ler inteira", "ficou com o posto porque sabe onde está cada papel", "foi mandado(a) para cá como castigo e acabou por gostar"],
    cicatriz: ["um frasco que rebentou na mesa de trabalho", "um livro que não queria ser aberto"],
    adversario: "pessoa",
    turnos: [{ de: 8 * 60, ate: 20 * 60, o: "entre os papéis" }],
  },
  {
    id: "poder",
    idadeMin: 25,
    rx: /mestre de guilda|recrutador|nobre|senhor|senhora|lorde|lady|chefe|conselheir|empresari|prefeit|juiz|burgomestr|governad|regente|responsavel|encarregad/,
    postos: ["herdou o lugar e ainda tem de o provar", "comprou a nomeação a quem a vendia", "foi escolhido(a) porque os outros dois candidatos se odiavam", "ficou com o posto por ser o(a) único(a) em quem os dois lados confiavam"],
    cicatriz: ["um atentado que a cidade inteira finge não ter visto", "uma queda de cavalo numa caçada de gente importante"],
    adversario: "chefe",
    turnos: [{ de: 9 * 60, ate: 17 * 60, o: "a despachar" }],
  },
  {
    id: "comum",
    idadeMin: 14,
    rx: /./,
    postos: ["foi o que apareceu quando mais precisava", "herdou o lugar da família", "deve o lugar a alguém e ainda paga", "ganhou-o por ser de confiança"],
    cicatriz: ["uma queda feia, em criança", "uma briga de rua que ninguém ganhou"],
    adversario: "criatura",
    turnos: [{ de: 8 * 60, ate: 18 * 60, o: "no que faz" }],
  },
];

/* Onde a pessoa está quando não está no turno. O último é para a noite
   fora do turno: quem trabalha de dia dorme de noite. */
export const FORA_DO_TURNO = ["em casa", "numa taverna da cidade", "na praça", "no templo", "a tratar de família"];
/* QUEM ANDA NO GRUPO NÃO ESTÁ NO POSTO (05/10, 3.ª sessão de prova, defeito
   8). A companheira de antes vem do elenco com uma casa de trabalho — a
   Iracema Sousa vendia ervas na Praça da Panela de São da Onça —, e
   "quem trabalha na Praça da Panela?" devolvia-a de turno, sem folga,
   enquanto ela segurava a tocha ao lado do herói. Quem anda no grupo sai da
   lista de quem trabalha, e o Mestre recebe o porquê que já é verdade —
   nenhum facto novo: ela deixou o posto, e anda com o herói. `comPosto`
   para quem tinha casa de trabalho; `semPosto` para quem não tinha. Na voz
   da pauta, que é a do herói (a mesma de "anda comigo" da procura). */
export const NO_GRUPO = {
  saiu: "já não trabalha aqui",
  comPosto: "deixou o posto — anda comigo",
  semPosto: "anda comigo",
};
export const DORMINDO = "em casa, a dormir";

/* ---------------- O PASSADO ----------------
   Um ou dois acontecimentos com data. O primeiro é a CHEGADA (ou "nasceu
   aqui"); o segundo, só para quem VOLTA (`RELEVANTE`, da índole — um
   figurante com biografia inteira é um figurante que o jogador para de
   distinguir dos outros). Os anos cabem na idade aparente: ninguém
   "enfrentou um chefe há 40 anos" aparentando 25. `precisa` diz o que o
   mundo tem de ter para a linha fazer sentido; sem isso, ela não sai. */
export const EVENTOS_DO_PASSADO = [
  { id: "sobreviveu", familias: ["armas", "poder"], precisa: "chefe", o: (x) => `enfrentou ${x.chefe}${x.regiao ? ` nos arredores de ${x.regiao}` : ""} e voltou vivo(a)` },
  { id: "fera", familias: ["armas", "oficio", "comum", "comercio"], precisa: "criatura", o: (x) => `matou ${x.criatura} que rondava ${x.perto}` },
  { id: "perda", familias: ["*"], precisa: "criatura", o: (x) => `perdeu alguém da família para ${x.criatura}` },
  { id: "divida", familias: ["comercio", "balcao", "comum", "poder"], precisa: "rival", o: (x) => `fez uma dívida com ${x.rival} que ainda não pagou` },
  { id: "fuga", familias: ["*"], precisa: "outra", o: (x) => `fugiu de ${x.outra} com a roupa do corpo` },
  { id: "mestre", familias: ["oficio", "saber", "fe"], precisa: "rival", o: (x) => `aprendeu o que sabe com ${x.rival}, que já morreu` },
  { id: "rixa", familias: ["balcao", "comercio", "saber", "fe"], precisa: "rival", o: (x) => `rompeu com ${x.rival} e nunca mais se falaram` },
];
export const DESFECHOS_DO_ADVERSARIO = ["saiu vivo(a), por pouco", "venceu, e não gosta de falar disso", "perdeu, e ainda carrega a vergonha", "ficou empatado — o outro ainda anda por aí"];
/* 30% das pessoas FICARAM como são depois do que lhes aconteceu; as
   outras sempre foram assim — é a resposta a "ela já era assim quando a
   conheceram?" */
export const JEITO_QUE_MUDOU = 0.3;

/* ---------------- AS PERGUNTAS ----------------
   As palavras que dizem que o jogador perguntou por uma pessoa (ou por
   quem trabalha numa casa). Grosseiras de propósito, como as da cidade:
   um falso positivo custa uma linha verdadeira; um falso negativo
   devolve a pergunta à invenção. A ORDEM na frase decide qual se
   responde — uma resposta por turno. */
export const PERGUNTAS_DA_GENTE = [
  { id: "casa", rx: /\b(quem trabalha|trabalham? (ali|aqui|la|nest|ness|naquel)|(que|qual) (tipo de )?gente (costuma|trabalha|fica|vive)|funcionari|empregad|criadagem|quem (serve|toca|cuida d))/ },
  { id: "rotina", rx: /\b(cade|onde (ele|ela|esta|anda|fica|mora|foi)|plantao|de folga|\bfolga|turno|de servico|costuma (estar|ficar|vir|aparecer)|nao (veio|apareceu|esta aqui)|a que horas)/ },
  { id: "idade", rx: /\b(mais nov[oa]|mais velh[oa]|que idade|quantos anos|idade (dele|dela|tem)|e jovem|e velh[oa])/ },
  { id: "aparencia", rx: /\b(forte|fraco|fraca|magr[oa]|gord[oa]|robust|franzin|musculos|de peso|aparencia|como (ele|ela) e\b|cara del|pintura|tatuag)/ },
  /* MM14: "como se feriu DESSE JEITO?" (#29) é a ferida, e não o jeito dela —
     com duas respostas por turno, a locução passou a subir uma segunda linha */
  { id: "jeito", rx: /\b(desajeitad|(?<!\b(desse|deste|daquele|nesse|neste|de|do|sem|qualquer) )jeito|temperamento|personalidade|sempre foi assim|era assim|ja era|timid|nervos[oa]|mal-humorad|simpatic[oa])/ },
  /* MM14: "há quanto tempo a senhora tem o Sino Calado?", "há quanto tempo
     tocas aqui?" (T7, T44) são o POSTO com data — `linhaDoPosto` já diz "está
     no posto há N anos" — e iam ao `passado` pelo "há quanto", que responde
     de onde a pessoa veio. A forma mais longa ganha na mesma posição. */
  { id: "posto", rx: /\b(responsavel|encarregad|por que (ele|ela) (e|esta|cuida|manda|trabalha)|por algum motivo|como (ele|ela) (chegou|virou|ficou|ganhou)|cargo|posto|quem (o|a) pos|ha quanto tempo (\S+ ){0,3}?(tem|tens|toca|tocas|trabalha|trabalhas|serve|serves|cuida|cuidas|manda|mandas|e dono|e dona|es dono|es dona|esta no posto)\b( (o|a|os|as|esta|essa|este|esse|aquela|aquele) \w+)?)/ },
  { id: "adversario", rx: /\b(adversari|enfrentou|lutou contra|inimigo mais|rival mais|mais famos)/ },
  { id: "ferida", rx: /\b(se feriu|se machucou|ferid[oa]|machucad[oa]|cicatriz|como (ele|ela) perdeu)/ },
  /* MM14: "e de onde vens?" (T44) — o tu e o presente também perguntam */
  /* MM18: "Quanto tempo LEVA a pé daqui até à Muralha?" (J6 da 4.ª sessão) é
     a estrada, não a vida de quem ouve — e a ficha de Inocência ("nasceu em
     Alto do Sal… rompeu com Gertrudes") tomou o lugar da distância e do
     preço do quarto. O tempo de caminho é da cidade (`distancia`). */
  { id: "passado", rx: /\b(quanto tempo(?! (ate|leva|demora|se leva|levo|levamos|de caminh|de marcha|a pe|daqui))|ha quanto|faz quanto|quando (isso|foi|aconteceu)|aconteceu com|historia d|passado|de onde ((ele|ela|voce|tu) )?(veio|vem|vens|vieste|e|es)\b)/ },
  /* MM8b: a CASA como família — o que a cidade diz dela e se é popular —,
     e cada um dela: quem é bem-visto e quem não */
  { id: "familia", rx: /\b(o que (dizem|falam)|nesta casa|desta casa|dessa casa|essa casa|esta casa|familia|parentes|popular|reputacao|fama da casa|casa nobre)/ },
  { id: "cadaUm", rx: /\b(bem[- ]vist[oa]s?|mal[- ]vist[oa]s?|um deles|uma delas|os outros nem|mais querid[oa]|mais odiad[oa])/ },
];
/* MM14: 1 → 2. "Há quanto tempo tocas aqui? E de onde vens?" (T44) são duas
   perguntas à mesma pessoa, e a sessão só respondia uma. A mesa junta as
   respostas de todas as fichas e corta em RESPOSTAS_DA_MESA (perguntas.js),
   medido no teto da pauta em teste-mm14-perguntas. */
export const RESPOSTAS_DA_GENTE = 2;
/* quantas pessoas cabem numa resposta que fala de várias (a casa, a
   comparação de idades) */
export const PESSOAS_POR_RESPOSTA = 4;
/* MM8b: na família, quem aparenta tantos anos a mais do que outro é pai
   ou mãe dele; menos do que isso, irmão. A idade é a do retrato. */
export const IDADE_DE_PAI = 16;

/* "ele", "ela", "o seu amigo", "aquele" — alguém de quem já se falava */
const PRONOME = /\b(ele|ela|dele|dela|nele|nela|seu amigo|sua amiga|o amigo|a amiga|aquele|aquela|esse homem|essa mulher)\b/;
const PRONOME_ELA = /\b(ela|dela|nela|sua amiga|a amiga|aquela|essa mulher)\b/;
const PRONOME_ELE = /\b(ele|dele|nele|seu amigo|o amigo|aquele|esse homem)\b/;
/* a pergunta feita À pessoa: "o seu nome", "você" */
const A_QUEM_FALO = /\b(voce|voces|seu nome|contigo|consigo|o senhor|a senhora)\b/;
const AUSENCIA = /\b(cade|nao (veio|apareceu|esta aqui)|devia estar|deveria estar|sumiu)\b/;
const COMPARA = /\b(qual deles|qual delas|quem (e|parece)|mais nov|mais velh)/;

/* ============================================================
   A FICHA
   ============================================================ */

function familiaDe(papel) {
  const p = norm(papel);
  return FAMILIAS_DE_OFICIO.find((f) => f.id !== "comum" && f.rx.test(p)) || FAMILIAS_DE_OFICIO[FAMILIAS_DE_OFICIO.length - 1];
}

function doRegistro(npcs, nome) {
  const reg = obj(npcs);
  const k = Object.keys(reg).find((x) => norm(x) === norm(nome));
  const f = k ? reg[k] : null;
  return f && typeof f === "object" ? f : null;
}

/* O registo manda: só os campos que ele tem, e só se não vierem vazios. */
function identidade(pessoa, reg) {
  const out = { ...pessoa };
  if (reg) for (const k of ["papel", "local", "status", "genero", "semente"]) { const v = txt(reg[k]); if (v) out[k] = v; }
  return out;
}

/* O SÍTIO DE TRABALHO não é o paradeiro. O App regista a gente da base
   com `local` = a cidade (é onde ela está); o estabelecimento é o `local`
   da base (`genteDoLocal`). Um `local` que é nome de cidade não é casa. */
function ehCidade(mapa, nome) {
  const cs = Array.isArray(obj(mapa).cidades) ? mapa.cidades : [];
  return !!nome && cs.some((c) => c && norm(c.nome) === norm(nome));
}
function casaDe(p0, reg, mapa) {
  for (const v of [txt(p0.casa), txt(p0.local), reg ? txt(reg.local) : ""]) if (v && !ehCidade(mapa, v)) return v;
  return "";
}

function cidadeDaPessoa(mapa, p, ctx) {
  const cs = Array.isArray(obj(mapa).cidades) ? mapa.cidades.filter((c) => c && c.nome) : [];
  const alvo = norm(p.cidade || p.local || ctx.cidade);
  return cs.find((c) => norm(c.nome) === alvo) || cs.find((c) => alvo && alvo.includes(norm(c.nome))) || cs.find((c) => norm(c.nome) === norm(ctx.cidade)) || null;
}

function aparenciaDe(chave, genero, idadeMin = 0) {
  const t = tracos(chave);
  const i = CABELO.indexOf(t.cabelo);
  const faixa = IDADE_PELO_CABELO[i] || IDADE_PELO_CABELO[2];
  const r = rngDe(`idade|${chave}`);
  const de = Math.min(faixa.ate, Math.max(faixa.de, Number(idadeMin) || 0));
  const anos = de + Math.floor(r() * (faixa.ate - de + 1));
  const f = feicoes(chave, { genero: genero === "mulher" || genero === "homem" ? genero : "" });
  const comp = COMPLEICAO_PELO_QUEIXO.find((c) => f.queixo < c.ate) || COMPLEICAO_PELO_QUEIXO[2];
  const marca = MARCAS_DO_ROSTO[t.marca] || null;
  return {
    idade: { anos, faixa: (FAIXAS_DE_IDADE.find((x) => anos <= x.ate) || FAIXAS_DE_IDADE[0]).o, cabelo: faixa.cabelo },
    compleicao: comp.o, forte: comp.forte,
    marca: marca ? { o: marca.o, ferida: !!marca.ferida, sentido: marca.sentido ? pick(r, marca.sentido) : "" } : null,
  };
}

function anosAtras(rnd, idade, teto = 30) {
  const max = Math.max(1, Math.min(teto, idade - 14));
  return 1 + Math.floor(rnd() * max);
}

/* O que o mundo tem para o passado desta pessoa citar. Tudo por semente;
   o que faltar (mundo sem mapa, região sem bicho) simplesmente não é
   citado. */
function oQueOMundoTem(semente, cidade, ctx, rnd) {
  const mapa = obj(ctx.mapa);
  const regioes = Array.isArray(mapa.regioes) ? mapa.regioes : [];
  const regiao = cidade ? regioes.find((r) => r && r.nome === cidade.regiao) : null;
  let chefe = null, criatura = null;
  try {
    const cs = chefesDoMundo(semente, mapa, ctx.genero || "Fantasia medieval", ctx.lex).filter((c) => c.linha !== "principal");
    if (cs.length) chefe = pick(rnd, cs);
  } catch { chefe = null; }
  try {
    const bs = regiao ? criaturasDaRegiao(semente, regiao, ctx.genero || "Fantasia medieval", ctx.lex) : [];
    if (bs.length) criatura = pick(rnd, bs);
  } catch { criatura = null; }
  const outras = (Array.isArray(mapa.cidades) ? mapa.cidades : []).filter((c) => c && c.nome && (!cidade || c.nome !== cidade.nome));
  const outra = outras.length ? pick(rnd, outras).nome : "";
  const rival = nomePessoa(ctx.genero || "Fantasia medieval", undefined, rnd, ctx.lex);
  return { chefe, criatura, outra, rival, regiao: regiao ? regiao.nome : "", perto: regiao ? regiao.nome : (cidade ? cidade.nome : "a região") };
}

function rotinaDe(semente, nome, fam, ctx, morta, local) {
  if (morta) return { turno: "", folga: null, agora: "morreu" };
  const r = rngDe(`${semente}|rotina|${nome}`);
  const t = pick(r, fam.turnos);
  const folga = Math.floor(r() * O_HOJE.semana);
  const fora = pick(r, FORA_DO_TURNO);
  const out = { turno: t.o, de: t.de, ate: t.ate, folga, fora, local: local || "" };
  const dia = Number(ctx.dia), min = Number(ctx.minuto);
  if (!Number.isFinite(dia) || !Number.isFinite(min)) return { ...out, agora: "" };
  const m = ((Math.floor(min) % 1440) + 1440) % 1440;
  const dentro = t.de < t.ate ? m >= t.de && m < t.ate : m >= t.de || m < t.ate;
  const noite = m >= 22 * 60 || m < 6 * 60;
  const deFolga = Math.floor(dia) % O_HOJE.semana === folga;
  const agora = deFolga ? `de folga hoje, ${noite ? DORMINDO : fora}`
    : dentro ? `${t.o}${local ? ` ${comEm(local)}` : ""}`
      : (noite ? DORMINDO : `fora do turno, ${fora}`);
  return { ...out, deFolga, noTurno: !deFolga && dentro, agora };
}

const hora = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}h`;

/* A FICHA. `pessoa` é o que se tiver dela ({nome, papel, local, modo,
   semente, ...}); `ctx` traz o mundo ({mapa, genero, lex, base, npcs,
   grupo, dia, minuto, cidade}). Lixo devolve a ficha mínima, nunca erro. */
export function fichaDaPessoa(semente, pessoa, ctx) {
  const o = obj(ctx);
  const s = String(semente == null ? "" : semente);
  const p0 = obj(pessoa);
  const nome = txt(p0.nome).slice(0, 60);
  const reg = nome ? doRegistro(o.npcs, nome) : null;
  const p = identidade(p0, reg);
  const casa = casaDe(p0, reg, o.mapa);
  const papel = txt(p.papel);
  const fam = familiaDe(papel);
  const morta = norm(p.status).includes("morto") || norm(p.status).includes("morta") || (nome ? estaMorto(o.base, nome) : false);
  const noGrupo = (Array.isArray(o.grupo) ? o.grupo : []).some((g) => g && norm(g.nome) === norm(nome) && nome);
  /* a chave do retrato: a mesma de `Retrato semente={n.semente || n.nome}` */
  const chave = txt(p.semente) || nome;
  const ap = aparenciaDe(chave, txt(p.genero) || txt(p.genero_pessoa), fam.idadeMin);
  const indole = indoleDe(s, { nome });
  const volta = RELEVANTE(indole);
  const tracosDela = indole.tracos.map((x) => (tracoPorId(x) || {}).nome).filter(Boolean);

  const base = { nome, papel, casa, familia: fam.id, morta, noGrupo, aparencia: ap };
  const jeito = { modo: txt(p.modo), tracos: tracosDela, desde: "sempre" };
  if (noGrupo) return { ...base, jeito, passado: [], adversario: null, posto: null, rotina: null, ferida: null };

  const rnd = rngDe(`${s}|por-dentro|${nome}`);
  const cidade = cidadeDaPessoa(o.mapa, p, o);
  const w = oQueOMundoTem(s, cidade, o, rnd);
  const idade = ap.idade.anos;

  /* o passado: a chegada, e para quem volta, um acontecimento */
  const passado = [];
  const haChegou = anosAtras(rnd, idade, 40);
  passado.push(rnd() < 0.4 || !w.outra
    ? { ha: null, o: `nasceu ${cidade ? `em ${cidade.nome}` : "aqui"} e nunca viveu noutro lugar` }
    : { ha: haChegou, o: `veio de ${w.outra} para ${cidade ? cidade.nome : "cá"}` });
  if (volta) {
    const cabem = EVENTOS_DO_PASSADO.filter((e) => (e.familias.includes("*") || e.familias.includes(fam.id)) && (!e.precisa || w[e.precisa]));
    if (cabem.length) {
      const e = pick(rnd, cabem);
      const x = { ...w, chefe: w.chefe ? w.chefe.nome : "", criatura: w.criatura ? w.criatura.nome : "" };
      passado.push({ ha: anosAtras(rnd, idade, 25), o: e.o(x), id: e.id });
    }
  }

  /* o adversário mais famoso: um chefe do mundo, uma criatura da região
     ou uma pessoa com nome — nunca "um inimigo" */
  let adv = null;
  const tipo = fam.adversario;
  const quem = tipo === "chefe" && w.chefe ? w.chefe.nome
    : (tipo === "criatura" || tipo === "chefe") && w.criatura ? w.criatura.nome
      : w.rival;
  if (quem) {
    const vivoOuMorto = w.chefe && quem === w.chefe.nome && estaMorto(o.base, quem) ? " (que já caiu)" : "";
    adv = { nome: quem, ha: anosAtras(rnd, idade, 20), desfecho: pick(rnd, DESFECHOS_DO_ADVERSARIO), o: `${quem}${vivoOuMorto}` };
  }

  /* a cicatriz desenhada tem origem: o adversário, ou o ofício */
  let ferida = null;
  if (ap.marca && ap.marca.ferida) {
    ferida = adv && rnd() < 0.5
      ? { ha: adv.ha, o: `a cicatriz é do encontro com ${adv.nome}, há ${adv.ha} ano${adv.ha > 1 ? "s" : ""}` }
      : (() => { const h = anosAtras(rnd, idade, 30); return { ha: h, o: `a cicatriz é de ${pick(rnd, fam.cicatriz)}, há ${h} ano${h > 1 ? "s" : ""}` }; })();
  }
  /* e a ferida de AGORA, se o mundo a registou (`situacoes` da base) */
  if (nome && situacaoDe(o.base, nome) === SITUACOES.ferida) {
    const r = ondeEsta(o.base, nome);
    ferida = { ha: 0, o: `está ferido(a) agora${r.quem ? `, por ${r.quem}` : ""}${r.onde ? `, ${r.onde}` : ""}` };
  }

  /* o jeito: sempre assim, ou desde o que aconteceu */
  const ev = passado[passado.length - 1];
  if (ev && ev.ha && rnd() < JEITO_QUE_MUDOU) jeito.desde = `ficou assim há ${ev.ha} ano${ev.ha > 1 ? "s" : ""}, depois que ${ev.o}`;

  const posto = papel ? { o: pick(rnd, fam.postos), ha: anosAtras(rnd, idade, 30) } : null;
  const rotina = rotinaDe(s, nome, fam, o, morta, casa);
  return { ...base, jeito, passado, adversario: adv, posto, rotina, ferida };
}

/* ============================================================
   AS LINHAS — uma por pergunta, curtas: a pauta diz O QUE, o COMO é
   do Narrador. Sem nome de mecanismo.
   ============================================================ */
const anos = (n) => `${n} ano${n > 1 ? "s" : ""}`;
/* SÓ O NOME: o papel já está no QUEM e no registo; repeti-lo em cada
   resposta custava vinte caracteres de uma taverna cheia que não os tem
   (medido em teste-mm8a-ficha, secção 8) */
const rotuloDe = (f) => `${f.nome}${f.morta ? " (já morto(a))" : ""}`;

function linhaDaAparencia(f) {
  const a = f.aparencia;
  return `${rotuloDe(f)}, à vista: aparenta uns ${a.idade.anos} anos (${a.idade.faixa}), cabelo ${a.idade.cabelo}, compleição ${a.compleicao}${a.marca ? `, ${a.marca.o}${a.marca.sentido ? ` (${a.marca.sentido})` : ""}` : ""}`;
}
function linhaDoJeito(f) {
  const j = f.jeito;
  const partes = [j.modo, j.tracos.length ? j.tracos.join(", ") : ""].filter(Boolean).join("; ");
  return `${rotuloDe(f)}, o jeito: ${partes || "reservado(a), sem nada que salte à vista"} — ${j.desde === "sempre" ? "sempre foi assim" : j.desde}`;
}
function linhaDoPassado(f) {
  if (!f.passado || !f.passado.length) return "";
  return `${rotuloDe(f)}: ${f.passado.map((x) => (x.ha ? `há ${anos(x.ha)} ${x.o}` : x.o)).join("; ")}`;
}
function linhaDoAdversario(f) {
  if (!f.adversario) return "";
  return `${rotuloDe(f)}: o adversário mais famoso foi ${f.adversario.o}, há ${anos(f.adversario.ha)} — ${f.adversario.desfecho}`;
}
/* sem cicatriz desenhada nem ferida registada, a resposta honesta é que
   não há marca: a ferida que a cena mostrar é de hoje, e é da cena */
function linhaDaFerida(f) {
  if (f.noGrupo || !f.passado) return "";
  if (f.ferida) return `${rotuloDe(f)}: ${f.ferida.o}`;
  const ev = f.passado[f.passado.length - 1];
  return `${rotuloDe(f)}: não traz cicatriz no rosto${ev && ev.ha ? `; o pior que lhe aconteceu foi há ${anos(ev.ha)}: ${ev.o}` : ""}`;
}
/* quem anda no grupo não tem posto nem turno (NO_GRUPO): o porquê */
const linhaDoGrupo = (f) => `${rotuloDe(f)}: ${f.casa ? NO_GRUPO.comPosto : NO_GRUPO.semPosto}`;
function linhaDoPosto(f) {
  if (f.noGrupo) return linhaDoGrupo(f);
  if (!f.posto) return "";
  return `${rotuloDe(f)} está no posto há ${anos(f.posto.ha)}: ${f.posto.o}`;
}
function linhaDaRotina(f) {
  if (f.noGrupo) return linhaDoGrupo(f);
  const r = f.rotina;
  if (!r) return "";
  if (f.morta) return `${rotuloDe(f)}: não está em lado nenhum — morreu`;
  return `${rotuloDe(f)}: ${r.turno}${r.local ? ` ${comEm(r.local)}` : ""} das ${hora(r.de)} às ${hora(r.ate)}, folga um dia por semana${r.agora ? `; agora: ${r.agora}` : ""}`;
}

/* QUEM TRABALHA NUMA CASA — a gente de `genteDoLocal`, com o sítio dito,
   o papel que o registo manda e quem está de folga agora */
/* MM14: `conhecidos` — a gente do registo e da cena cuja casa é ESTA. A
   taverneira que o jogador conhece pelo nome trabalha ali mesmo que a base
   do mundo não a tenha posto lá (T8: "quem mais trabalha aqui, além de
   você?" foi respondido com um cozinheiro surdo inventado). Vem primeiro,
   porque é quem o jogador já viu. */
function linhaDaCasa(semente, local, o, conhecidos = []) {
  let gente = [];
  try { gente = genteDoLocal(semente, local, o.genero || "Fantasia medieval", o.molde, o.lex); } catch { gente = []; }
  const alvo = norm(semArtigo(local.nome));
  const daqui = (Array.isArray(conhecidos) ? conhecidos : [])
    .filter((p) => p && p.nome && [p.casa, p.local].some((x) => txt(x) && norm(semArtigo(x)) === alvo));
  const vistos = new Set();
  /* quem anda no grupo saiu do posto (NO_GRUPO): fora da lista de quem
     trabalha, e dito à parte com o porquê */
  const doGrupo = new Set((Array.isArray(o.grupo) ? o.grupo : []).map((g) => norm(g && g.nome)).filter(Boolean));
  const vivos = [...daqui, ...gente]
    .filter((p) => p && p.nome && !estaMorto(o.base, p.nome) && !norm(p.status).includes("mort") && !vistos.has(norm(p.nome)) && vistos.add(norm(p.nome)));
  const sairam = vivos.filter((p) => doGrupo.has(norm(p.nome)));
  gente = vivos.filter((p) => !doGrupo.has(norm(p.nome))).slice(0, PESSOAS_POR_RESPOSTA);
  const saiu = sairam.length ? `${NO_GRUPO.saiu}: ${sairam.map((p) => `${p.nome} (${NO_GRUPO.comPosto})`).join(", ")}` : "";
  if (!gente.length) return saiu ? `${comEm(local.nome)}, ${saiu}` : "";
  const cada = gente.map((p) => {
    const f = fichaDaPessoa(semente, p, o);
    const ag = f.rotina && f.rotina.deFolga ? `, de folga hoje: ${f.rotina.agora.replace(/^de folga hoje, /, "")}` : f.rotina && f.rotina.agora && !f.rotina.noTurno ? `, fora do turno: ${f.rotina.agora.replace(/^fora do turno, /, "")}` : "";
    return `${f.nome} (${f.papel || p.papel}${ag})`;
  });
  return `quem trabalha ${comEm(local.nome)}: ${cada.join(", ")}${saiu ? `; ${saiu}` : ""}`;
}

function linhaDaComparacao(fichas) {
  const fs = fichas.filter((f) => f && f.nome).slice(0, PESSOAS_POR_RESPOSTA);
  if (fs.length < 2) return "";
  const ord = [...fs].sort((a, b) => a.aparencia.idade.anos - b.aparencia.idade.anos);
  return `pela aparência: ${ord.map((f) => `${f.nome} uns ${f.aparencia.idade.anos}`).join(", ")} — o(a) mais novo(a) é ${ord[0].nome}, o(a) mais velho(a) é ${ord[ord.length - 1].nome}`;
}

/* ============================================================
   DE QUEM SE FALA
   ============================================================ */

/* nome inteiro, ou o primeiro nome (4 letras ou mais), como palavra */
function citaNome(frase, nome) {
  const n = norm(nome).trim();
  if (n.length < 3) return -1;
  const achar = (alvo) => {
    let i = frase.indexOf(alvo);
    while (i >= 0) {
      const a = i > 0 ? frase[i - 1] : " ", d = frase[i + alvo.length] || " ";
      if (!/[a-z0-9]/.test(a) && !/[a-z0-9]/.test(d)) return i;
      i = frase.indexOf(alvo, i + 1);
    }
    return -1;
  };
  const inteiro = achar(n);
  if (inteiro >= 0) return inteiro;
  const primeiro = n.split(/\s+/)[0];
  return primeiro.length >= 4 && primeiro !== n ? achar(primeiro) : -1;
}

/* o último citado nos textos recentes (o mais novo por último) — a
   mesma régua da agressão: o mais tarde no texto ganha */
function ultimoCitado(recentes, gente) {
  const textos = Array.isArray(recentes) ? recentes : [];
  for (let i = textos.length - 1; i >= 0; i--) {
    const t = norm(textos[i]);
    if (!t.trim()) continue;
    let melhor = null, onde = -1;
    for (const p of gente) {
      const at = t.lastIndexOf(norm(p.nome));
      if (at > onde) { melhor = p; onde = at; }
    }
    if (melhor && onde >= 0) return melhor;
  }
  return null;
}

function juntarGente(o, q) {
  const vistos = new Set();
  const out = [];
  const daBase = new Map(((q && q.gente) || []).filter((p) => p && p.nome).map((p) => [norm(p.nome), p]));
  const heroi = norm(o.heroi);
  const por = (lista, tier) => {
    for (const p of lista) {
      if (!p || !txt(p.nome) || norm(p.nome) === heroi || vistos.has(norm(p.nome))) continue;
      vistos.add(norm(p.nome));
      const b = daBase.get(norm(p.nome));
      /* o registo manda no que tem; a base só preenche o que falta */
      const cheio = b ? { casa: b.local, modo: b.modo, genero_pessoa: b.genero_pessoa, papel: b.papel, ...Object.fromEntries(Object.entries(p).filter(([, v]) => v != null && v !== "")) } : p;
      out.push({ ...cheio, _tier: tier });
    }
  };
  por(Array.isArray(o.presentes) ? o.presentes : [], 0);
  por((q && q.gente) || [], 1);
  por(Object.values(obj(o.npcs)), 2);
  return out;
}

const generoDe = (p) => norm(p.genero || p.genero_pessoa);
function doGeneroDoPronome(frase, gente) {
  const ela = PRONOME_ELA.test(frase), ele = PRONOME_ELE.test(frase);
  if (ela === ele) return gente;
  return gente.filter((p) => { const g = generoDe(p); return !g || g === (ela ? "mulher" : "homem"); });
}
/* pelo nome: quem a frase nomeia, o mais perto da cena primeiro */
function peloNome(frase, gente) {
  let melhor = null;
  for (const p of gente) {
    const i = citaNome(frase, p.nome);
    if (i < 0) continue;
    if (!melhor || p._tier < melhor._tier || (p._tier === melhor._tier && String(p.nome).length > String(melhor.nome).length)) melhor = p;
  }
  return melhor;
}
/* pelo contexto: o pronome e a conversa, ou a única pessoa da cena */
function peloContexto(frase, gente, o) {
  const aqui = doGeneroDoPronome(frase, gente.filter((p) => p._tier <= 1));
  const presentes = doGeneroDoPronome(frase, gente.filter((p) => p._tier === 0));
  if (PRONOME.test(frase) || A_QUEM_FALO.test(frase)) {
    const doPapo = ultimoCitado(o.recentes, aqui);
    if (doPapo) return doPapo;
  }
  /* uma pessoa só na cena: uma pergunta sem nome é sobre ela. Errar
     aqui custa uma linha, não uma luta (a agressão não escolhe assim) */
  const fora = presentes.filter((p) => !(Array.isArray(o.grupo) ? o.grupo : []).some((g) => g && norm(g.nome) === norm(p.nome)));
  return fora.length === 1 ? fora[0] : null;
}

/* ---------------- A PESSOA DA CASA ONDE SE ESTÁ (MM14, o resto do nº 6) ----------------
   "Há quanto tempo a senhora tem essa taverna?", dito ao balcão, é à
   taverneira — e ela está na base do mundo mesmo que nenhum turno a tenha
   posto no registo. Quem pergunta assim CHAMA alguém: pelo tratamento
   ("a senhora", "o senhor", "você") ou pelo ofício ("taverneira",
   "músico"). A resposta procura-se entre a gente da casa onde a heroína
   está — a da base (`genteDoLocal`) e a do registo que trabalha ali —,
   nunca na cidade inteira:
     · o ofício dito escolhe; o tratamento diz o sexo de quem ouve;
     · sobrando uma pessoa, é ela; sobrando várias, é quem responde pela
       casa (o primeiro ofício do lugar, `papeis[0]`: o taverneiro, a
       ferreira, o mestre do porto) — é a ele que se fala ao balcão;
     · e ninguém, se quem responde pela casa não cabe no que se disse.
   Chamar alguém que ninguém conhece ("Maren," sem Maren nenhuma no
   mundo) NÃO se adivinha: dar-lhe a ficha de outra pessoa era pôr na boca
   do Narrador um nome que o jogador não disse. */
export const TRATAMENTOS = [
  { id: "senhora", rx: /\b(a senhora|senhora|minha senhora|moca|menina)\b/, genero: "mulher" },
  { id: "senhor", rx: /\b(o senhor|senhor|meu senhor|moco|rapaz)\b/, genero: "homem" },
  { id: "voce", rx: /\b(voce|voces|tu|contigo)\b/, genero: "" },
];
/* palavras com maiúscula que não são nome de ninguém: o chamamento à mesa,
   as interjeições, os tratamentos */
const NAO_E_NOME = /^(bem|entao|olha|ok|certo|espera|calma|ei|ola|bom|sim|nao|ah|oh|pois|mestre|narrador|senhora|senhor|moca|moco|rapaz|menina|amigo|amiga|eu|ele|ela|voce|tu|mas|deus|deuses)$/;

/* a raiz de um ofício: "taverneiro(a)" → "taverneir", "músico de canto" →
   "music". Casa "taverneira" e "taverneiro" na frase. */
function raizDoOficio(papel) {
  const w = (norm(papel).replace(/\([^)]*\)/g, " ").match(/[a-z]+/) || [""])[0];
  if (w.length < 4) return "";
  return w.length >= 6 ? w.slice(0, -1) : w;
}

/* a frase chama por um nome que nenhum dos `conhecidos` tem? A maiúscula
   que abre a oração só conta quando é chamamento (seguida de vírgula). */
function nomeQueNinguemConhece(dita, conhecidos) {
  const t = String(dita == null ? "" : dita);
  const sabidos = new Set();
  for (const n of Array.isArray(conhecidos) ? conhecidos : []) for (const w of norm(n).split(/[^a-z0-9'-]+/)) if (w.length >= 3) sabidos.add(w);
  const rx = /[\p{L}][\p{L}'-]*/gu;
  let m;
  while ((m = rx.exec(t))) {
    const w = m[0];
    if (w.length < 3 || !/^\p{Lu}/u.test(w)) continue;
    const antes = t.slice(0, m.index).replace(/[\s"“”«»'(\-—]+$/u, "");
    const abre = !antes || /[.!?:;\n]$/.test(antes);
    if (abre && !/^\s*,/.test(t.slice(m.index + w.length))) continue;
    const n = norm(w);
    if (NAO_E_NOME.test(n) || sabidos.has(n)) continue;
    return true;
  }
  return false;
}

function quemDaCasa(frase, locais, gente, o) {
  const lugar = obj(o.lugar);
  const aqui = norm(semArtigo(lugar.dentroDe || lugar.nome));
  if (!aqui) return null;
  const local = (Array.isArray(locais) ? locais : []).find((l) => l && norm(semArtigo(l.nome)) === aqui);
  if (!local) return null;
  const doGrupo = new Set((Array.isArray(o.grupo) ? o.grupo : []).map((g) => norm(g && g.nome)));
  const daCasa = gente.filter((p) => [p.casa, p.local].some((x) => txt(x) && norm(semArtigo(x)) === aqui)
    && !doGrupo.has(norm(p.nome)) && !estaMorto(o.base, p.nome) && !norm(p.status).includes("mort"));
  if (!daCasa.length) return null;
  const tratamento = TRATAMENTOS.find((x) => x.rx.test(frase));
  const peloOficio = daCasa.filter((p) => { const r = raizDoOficio(p.papel); return r && new RegExp(`\\b${r}`).test(frase); });
  /* ninguém foi chamado: a pergunta não é a quem está ao balcão */
  if (!tratamento && !peloOficio.length) return null;
  let cand = peloOficio.length ? peloOficio : daCasa;
  if (tratamento && tratamento.genero) cand = cand.filter((p) => { const g = generoDe(p); return !g || g === tratamento.genero; });
  if (cand.length === 1) return cand[0];
  const cabeca = raizDoOficio((Array.isArray(local.papeis) ? local.papeis : [])[0]);
  return (cabeca && cand.find((p) => raizDoOficio(p.papel) === cabeca)) || null;
}

/* a casa de que se fala: nomeada na frase, onde estou, ou a última citada */
function casaDaFrase(frase, locais, o) {
  const cita = (l) => Math.max(citaNome(frase, l.nome), citaNome(frase, semArtigo(l.nome)));
  const nomeada = locais.find((l) => cita(l) >= 0);
  if (nomeada) return nomeada;
  const lugar = obj(o.lugar);
  const aqui = norm(lugar.dentroDe || lugar.nome);
  const onde = aqui && locais.find((l) => norm(l.nome) === aqui || norm(semArtigo(l.nome)) === norm(semArtigo(aqui)));
  if (onde) return onde;
  const textos = Array.isArray(o.recentes) ? o.recentes : [];
  for (let i = textos.length - 1; i >= 0; i--) {
    const t = norm(textos[i]);
    let melhor = null, at = -1;
    for (const l of locais) { const k = t.lastIndexOf(norm(semArtigo(l.nome))); if (k > at) { melhor = l; at = k; } }
    if (melhor) return melhor;
  }
  return null;
}

/* ============================================================
   O QUE SOBE À PAUTA
   ============================================================ */

/* (a descrição do `ctx` e da saída mora sobre `genteParaPauta`, lá em baixo) */
/* ============================================================
   A FAMÍLIA (MM8b) — a casa notável e cada um dela
   ============================================================ */

/* a casa de que se fala: nomeada (o nome ou o sobrenome), a de alguém
   nomeado, a de quem a frase aponta, a que tem sede onde estou, ou a
   única da cidade */
/* MM14: "que família manda AQUI?" pergunta pela desta cidade. A sessão
   (T9) respondeu com a Casa da Água Alta, de Campo Grande: o "dela" do fim
   da frase ("e o que se diz dela?") apontou para uma pessoa, e a casa dessa
   pessoa era de outra cidade. Quem pergunta pelo poder daqui só ouve as
   casas daqui — a nomeada continua a valer de onde for. */
export const FAMILIA_DAQUI = /\b(aqui|daqui|nesta cidade|desta cidade|na cidade|da cidade|manda|mandam|importantes?|poderos[oa]s?|notave(l|is))\b/;

function familiaDaFrase(frase, el, gente, o, pessoa, assunto = frase, { daFamilia = false } = {}) {
  /* as da cidade onde estou primeiro: o mundo repete nomes, e a Sable de
     que se fala aqui é a daqui */
  const todas = (el && el.casas) || [];
  if (!todas.length) return null;
  const soDaqui = FAMILIA_DAQUI.test(assunto);
  const daqui = todas.filter((k) => norm(k.cidade) === norm(o.cidade));
  const casas = [...daqui, ...todas.filter((k) => norm(k.cidade) !== norm(o.cidade))];
  const nomeada = casas.find((k) => citaNome(frase, k.nome) >= 0 || citaNome(frase, k.nome.replace(/^Casa\s+(d[oa]s?\s+)?/i, "")) >= 0);
  if (nomeada) return nomeada;
  const entre = soDaqui ? daqui : casas;
  for (const k of entre) if (k.membros.some((m) => citaNome(frase, m) >= 0)) return k;
  if (PRONOME.test(frase) || A_QUEM_FALO.test(frase) || /\b(deles|delas|dessa|desta|essa|esta)\b/.test(frase)) {
    const p = pessoa();
    /* MM14: e a casa tem de ser da cidade DESSA pessoa. O mundo repete
       nomes (na sessão reconstruída, a taverneira do Sino Calado e uma da
       casa de Campo Grande chamam-se as duas Mabel): quem está aqui, em
       cena ou na base daqui, é da casa daqui ou de nenhuma */
    const k = p && entre.find((x) => x.membros.some((m) => norm(m) === norm(p.nome)) && (p._tier > 1 || norm(x.cidade) === norm(o.cidade)));
    if (k) return k;
  }
  const lugar = obj(o.lugar);
  const onde = norm(semArtigo(lugar.dentroDe || lugar.nome));
  const naSede = onde && daqui.find((k) => norm(semArtigo(k.sede)) === onde);
  if (naSede) return naSede;
  /* perguntada a FAMÍLIA que manda daqui, a primeira casa daqui (a capital
     tem duas). Só a família: "ele é bem-visto por aqui?" pergunta por ele */
  if (soDaqui && daFamilia) return daqui[0] || null;
  return daqui.length === 1 ? daqui[0] : null;
}

const REPUTACAO_DA_CASA_POR_ID = Object.fromEntries(REPUTACAO_DA_CASA.map((r) => [r.id, r]));

/* #60 e #62: o que dizem da casa, e se ela é popular no resto da cidade */
function linhaDaFamilia(k, cidadeAtual = "") {
  const r = REPUTACAO_DA_CASA_POR_ID[k.reputacao] || REPUTACAO_DA_CASA[0];
  /* a cidade só se diz quando a casa não é daqui: o ONDE já a disse */
  const onde = norm(k.cidade) === norm(cidadeAtual) ? "" : `${k.cidade}, `;
  return `${k.nome} (${onde}${k.membros.length} na família): ${r.o}; popular? ${r.popular}`;
}

/* #61: cada um da casa — o papel na família (pela idade que o retrato
   mostra: quem tem 16 anos a mais é pai ou mãe, os outros são irmãos) e o
   que a cidade diz dele. Só o primeiro nome, quando não se repete na casa. */
function linhaDeCadaUm(k, s, ctxF, gente) {
  const dados = (nome) => gente.find((p) => norm(p.nome) === norm(nome)) || { nome };
  const fs = k.membros.slice(0, PESSOAS_POR_RESPOSTA).map((m) => ({ p: dados(m), f: fichaDaPessoa(s, dados(m), ctxF) }));
  if (!fs.length) return "";
  const velho = [...fs].sort((a, b) => b.f.aparencia.idade.anos - a.f.aparencia.idade.anos)[0];
  const primeiros = fs.map((x) => x.f.nome.split(/\s+/)[0]);
  const curto = (x, i) => (primeiros.filter((n) => n === primeiros[i]).length > 1 ? x.f.nome : primeiros[i]);
  const cada = fs.map((x, i) => {
    const g = norm(x.p.genero || x.p.genero_pessoa);
    const papel = x === velho ? "cabeça"
      : velho.f.aparencia.idade.anos - x.f.aparencia.idade.anos >= IDADE_DE_PAI ? (g === "mulher" ? "filha" : g === "homem" ? "filho" : "filho(a)")
        : (g === "mulher" ? "irmã" : g === "homem" ? "irmão" : "irmão(ã)");
    return { x, g, rep: reputacaoDe(s, x.p).id, txt: `${curto(x, i)} (${papel}${x.f.morta ? ", já morto(a)" : ""})` };
  });
  /* a cabeça primeiro, e agrupados pelo que a cidade diz: três grupos
     cabem numa taverna cheia, quatro sentenças não (teste-mm8b §7) */
  cada.sort((a, b) => (a.x === velho ? -1 : 0) - (b.x === velho ? -1 : 0));
  const grupo = (id) => cada.filter((c) => c.rep === id);
  const adj = (lista, raiz) => (lista.length > 1 ? `${raiz}os` : lista[0].g === "mulher" ? `${raiz}a` : `${raiz}o`);
  const partes = [];
  const bem = grupo("bem"), mal = grupo("mal"), nada = grupo("nada");
  if (bem.length) partes.push(`${adj(bem, "bem-vist")}: ${bem.map((c) => c.txt).join(", ")}`);
  if (mal.length) partes.push(`${adj(mal, "mal-vist")}: ${mal.map((c) => c.txt).join(", ")}`);
  if (nada.length) partes.push(`ninguém repara em ${nada.map((c) => c.txt).join(", ")}`);
  return `${k.nome}: ${partes.join("; ")}`;
}

/* uma pessoa só, sem casa: o que a cidade diz dela, e porquê */
function linhaDaReputacao(s, p) {
  const r = reputacaoDe(s, p);
  return `${p.nome}: ${r.o} na cidade${r.porque ? ` — ${r.porque}` : ""}`;
}

/* MM14: os assuntos da frase, com a posição e o fim de cada um. A MESMA
   palavra não responde duas perguntas: "há quanto tempo tocas aqui?" é o
   posto, e o "há quanto" dentro dele não é também o passado — na mesma
   posição ganha a forma mais longa, e o que se sobrepõe a um assunto já
   tomado cai. O mesmo assunto só se responde uma vez. */
function assuntosDe(texto) {
  const todos = [];
  for (const p of PERGUNTAS_DA_GENTE) {
    const re = new RegExp(p.rx.source, "g");
    let m;
    while ((m = re.exec(texto))) {
      todos.push({ id: p.id, pos: m.index, fim: m.index + m[0].length });
      if (!m[0].length) re.lastIndex++;
    }
  }
  todos.sort((a, b) => a.pos - b.pos || (b.fim - b.pos) - (a.fim - a.pos));
  const out = [];
  for (const x of todos) {
    if (out.some((y) => x.pos < y.fim && y.pos < x.fim) || out.some((y) => y.id === x.id)) continue;
    out.push(x);
  }
  return out;
}

/* `ctx`: { semente, mapa, cidade, genero, molde, lex, base, npcs,
   presentes, grupo, heroi, recentes, lugar, dia, minuto, frase, nomes }.
   Devolve { pergunta: [], em: [] } — no máximo RESPOSTAS_DA_GENTE linhas,
   nenhuma se a frase não pergunta por ninguém; `em` é a posição, na
   frase, do assunto de cada linha (a mesa junta as fichas por ela).
   MM14: a frase pode ser um envelope do sistema (vale o "Eu disse"), e o
   ASSUNTO procura-se sem os nomes próprios — "o Sino Calado" não pergunta
   pelo sino, "Teodoro das Tábuas" não pergunta por tábuas. */
export function genteParaPauta(ctx) {
  const o = obj(ctx);
  const out = { pergunta: [], em: [] };
  const dita = fraseDoJogador(o.frase);
  const frase = norm(dita);
  if (!frase.trim()) return out;
  const nomesDoApp = (Array.isArray(o.nomes) ? o.nomes : []).filter((x) => typeof x === "string");
  /* primeira leitura, barata: só com os nomes que já se sabem — sem assunto
     nenhum, nem se calcula a cidade */
  if (!assuntosDe(assuntoDaFrase(dita, [txt(o.cidade), ...nomesDoApp])).length) return out;

  const s = String(o.semente == null ? "" : o.semente);
  const ctxF = { ...o, frase: undefined };
  let q = null, locais = [];
  try {
    if (txt(o.cidade)) {
      q = oQueExisteAqui(s, o.mapa, o.cidade, o.base, o.genero || "Fantasia medieval", o.molde, o.lex);
      locais = (q && q.locais) || [];
    }
  } catch { q = null; locais = []; }
  if (!locais.length && q && q.cidade) {
    try { locais = locaisDaCidade(s, q.cidade, o.genero || "Fantasia medieval", o.molde, o.lex); } catch { locais = []; }
  }
  const gente = juntarGente(o, q);
  /* a segunda leitura, com os nomes que a cidade tem: a gente, as casas e
     as cidades do mapa */
  const cidades = Array.isArray(obj(o.mapa).cidades) ? o.mapa.cidades.map((c) => c && c.nome).filter(Boolean) : [];
  const assunto = assuntoDaFrase(dita, [txt(o.cidade), ...nomesDoApp, ...gente.map((p) => p.nome), ...locais.map((l) => l.nome), ...cidades]);
  const achados = assuntosDe(assunto);
  if (!achados.length) return out;
  /* o elenco só se calcula quando a frase pergunta por alguém */
  let el = null;
  const elenco = () => {
    if (el) return el;
    /* MM8e: com o que a campanha mudou (promovidos e saídos) */
    try { el = elencoDoMundo(s, o.mapa, { genero: o.genero, molde: o.molde, lex: o.lex, espinha: o.espinha, guildas: o.guildas, base: o.base, estado: o.estado, npcs: o.npcs }); } catch { el = { pessoas: [], lacos: [], casas: [] }; }
    return el;
  };
  /* MM8b: o elenco é o último a ser procurado, e SÓ PELO NOME — o mestre de
     guilda e o chefe não estão na gente da cidade nem no registo, mas o
     jogador que diz o nome deles pergunta por eles. Nunca por pronome nem
     por eliminação: quem está longe não é "ele" de uma frase dita aqui. */
  /* MM14 (o resto do nº 6): e quem a frase chama pelo nome e ninguém conhece
     não é achado por pronome nem por eliminação — "Maren, a senhora…" não é
     o último citado da conversa nem a única pessoa da cena. Chamado sem
     nome, ao balcão, é a gente da casa onde se está (`quemDaCasa`). */
  let alvo = null, resolvido = false;
  const doElencoPeloNome = () => {
    const vistos = new Set(gente.map((p) => norm(p.nome)));
    const doElenco = elenco().pessoas.filter((p) => !vistos.has(norm(p.nome)) && citaNome(frase, p.nome) >= 0);
    return doElenco.sort((a, b) => String(b.nome).length - String(a.nome).length)[0] || null;
  };
  const pessoa = () => {
    if (resolvido) return alvo;
    resolvido = true;
    alvo = peloNome(frase, gente);
    if (alvo) return alvo;
    const desconhecido = nomeQueNinguemConhece(dita, [txt(o.cidade), ...nomesDoApp, ...gente.map((p) => p.nome), ...locais.map((l) => l.nome), ...cidades]);
    if (desconhecido) { alvo = doElencoPeloNome(); return alvo; }
    alvo = peloContexto(frase, gente, o) || doElencoPeloNome() || quemDaCasa(frase, locais, gente, o);
    return alvo;
  };
  const ficha = (p) => fichaDaPessoa(s, p, ctxF);

  for (const a of achados) {
    let linha = "";
    if (a.id === "familia" || a.id === "cadaUm") {
      const k = familiaDaFrase(frase, elenco(), gente, o, pessoa, assunto, { daFamilia: a.id === "familia" });
      if (k && a.id === "familia") linha = linhaDaFamilia(k, o.cidade);
      else if (k) linha = linhaDeCadaUm(k, s, ctxF, gente);
      else if (a.id === "cadaUm") { const p = pessoa(); if (p) linha = linhaDaReputacao(s, p); }
      /* MM14: perguntado o poder DAQUI e não havendo casa daqui, a verdade é
         essa — e não a casa de outra cidade (T9) */
      else if (a.id === "familia" && txt(o.cidade) && FAMILIA_DAQUI.test(assunto)) linha = `${txt(o.cidade)}: nenhuma casa notável tem sede aqui`;
    } else if (a.id === "casa") {
      const l = casaDaFrase(frase, locais, o);
      if (l) linha = linhaDaCasa(s, l, ctxF, gente);
    } else if (a.id === "rotina" && AUSENCIA.test(frase) && !gente.some((p) => citaNome(frase, p.nome) >= 0)) {
      /* quem pergunta por quem falta não pergunta por quem está à frente
         dele: a resposta é a casa — quem está de turno e quem folga */
      const l = casaDaFrase(frase, locais, o)
        || (/plantao|guarda|vigia/.test(frase) ? locais.find((x) => x.tipo === "quartel") : null);
      if (l) linha = linhaDaCasa(s, l, ctxF, gente);
    } else if (a.id === "idade" && COMPARA.test(frase) && !gente.some((p) => citaNome(frase, p.nome) >= 0)) {
      linha = linhaDaComparacao(gente.filter((p) => p._tier === 0).map(ficha));
    } else {
      const p = pessoa();
      if (p) {
        const f = ficha(p);
        linha = a.id === "idade" || a.id === "aparencia" ? linhaDaAparencia(f)
          : a.id === "jeito" ? linhaDoJeito(f)
            : a.id === "passado" ? linhaDoPassado(f)
              : a.id === "adversario" ? linhaDoAdversario(f)
              : a.id === "ferida" ? linhaDaFerida(f)
              : a.id === "posto" ? linhaDoPosto(f)
                : linhaDaRotina(f);
      } else if (a.id === "rotina") {
        /* "cadê aquele que devia estar de plantão?" sem nome: a casa de
           que se fala, com quem está e quem folga */
        const l = casaDaFrase(frase, locais, o)
          || (/plantao|guarda|vigia/.test(frase) ? locais.find((x) => x.tipo === "quartel") : null);
        if (l) linha = linhaDaCasa(s, l, ctxF, gente);
      }
    }
    if (linha && !out.pergunta.includes(linha)) {
      out.pergunta.push(linha); out.em.push(a.pos);
      if (out.pergunta.length >= RESPOSTAS_DA_GENTE) break;
    }
  }
  return out;
}
