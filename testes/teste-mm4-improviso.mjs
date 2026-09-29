/* teste-mm4-improviso.mjs (Fase MM, etapa MM4) — toda ação ganha um dado

   "Atiro a cadeira", "salto do balcão para o lustre", "tento lembrar onde
   vi esse brasão": a frase que não casava o catálogo de desafios virava
   ficção sem dado, e o Narrador decidia sozinho. O Matt nunca faz isso —
   escolhe o atributo, diz a dificuldade e manda rolar.

   Esta suíte prova as três metades do gesto:

   1. O QUE GANHA DADO — a família do verbo dá o atributo, a régua dá a CD,
      e o veredito tem a MESMA forma de um desafio do catálogo (é isso que
      deixa o App rolar, mostrar e mandar à pauta sem saber que ele existe).
   2. O QUE NÃO GANHA — o CORPUS: frases reais de jogador, de todos os
      tipos, cada uma com o veredito esperado. A taxa é impressa; o piso é
      100%, porque o falso positivo custa uma rolagem que ninguém pediu e
      quebra a cena ("o portão morde só o necessário").
   3. O QUE NÃO SE ROUBA — o golpe, a disputa e a luta inteira ficam com
      quem já os resolve. */
import {
  lerAcao, desfechoDaFalha, custoPorAlvo, CUSTO_DE_FALHAR, DIFICULDADES, registrarTentativa,
  FAMILIAS_DO_IMPROVISO, CD_DO_IMPROVISO, NAO_E_IMPROVISO, DESAFIOS,
} from "../src/desafios.js";
import { NAO_E_AGRESSAO, RX_AGRESSAO } from "../src/agressao.js";
import { periciaPorId } from "../src/pericias.js";
import { envelopeDoTeste } from "../src/testes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const heroi = { nivel: 3, inventario: [], habilidades: [], equipado: {} };
const base = { personagem: heroi, semente: "mm4", lugar: "o Corvo das Três Luas", tentativas: {}, dia: 2 };
const ler = (f, extra = {}) => lerAcao(f, { ...base, ...extra });

sec("1. as tabelas — nomeadas, e cada número sai da régua da casa");
{
  const dc = (id) => DIFICULDADES.find((d) => d.id === id).dc;
  t("a CD padrão é um degrau da régua, não um número solto", !!DIFICULDADES.find((d) => d.id === CD_DO_IMPROVISO.degrau));
  t("e é o obstáculo comum (13)", dc(CD_DO_IMPROVISO.degrau) === 13);
  t("a ousadia sobe UM degrau", CD_DO_IMPROVISO.ousadia.sobe === 1);
  t("são seis famílias, uma por atributo da ficha",
    FAMILIAS_DO_IMPROVISO.length === 6 && new Set(FAMILIAS_DO_IMPROVISO.map((f) => f.atributo)).size === 6);
  const perdidas = [];
  for (const f of FAMILIAS_DO_IMPROVISO) {
    for (const v of [{ pericia: f.pericia }, ...f.verbos]) {
      const p = periciaPorId(v.pericia || f.pericia);
      if (!p || p.atributo !== f.atributo) perdidas.push(`${f.id}:${v.pericia || f.pericia}`);
    }
  }
  t("toda perícia de um verbo mora no atributo da família dele", perdidas.length === 0, perdidas.join(", "));
  t("toda família tem o custo da falha escrito na tabela da casa",
    FAMILIAS_DO_IMPROVISO.every((f) => !!custoPorAlvo(f.custo)));
  /* MM5: era "o custo é SECO em todas as seis" — a promessa de que o meio
     seria a etapa seguinte. Chegou: cinco famílias aceitam o meio, e a
     Percepção fica de fora (perceber é instantâneo, como a escuta). A
     intenção de antes continua provada: quem tem meio tem o preço escrito. */
  t("o meio chegou (MM5): cinco famílias o aceitam, a Percepção não",
    FAMILIAS_DO_IMPROVISO.filter((f) => custoPorAlvo(f.custo).porPouco).length === 5
      && custoPorAlvo("improviso_percepcao").porPouco === false
      && FAMILIAS_DO_IMPROVISO.every((f) => !custoPorAlvo(f.custo).porPouco || (custoPorAlvo(f.custo).preco || "").length > 20));
  t("todo custo novo diz a falha numa frase de verdade",
    CUSTO_DE_FALHAR.filter((c) => /^improviso_/.test(c.alvo)).every((c) => c.seca.length > 20));
  t("todo verbo tem regra, núcleo e infinitivo",
    FAMILIAS_DO_IMPROVISO.every((f) => f.verbos.every((v) => v.rx instanceof RegExp && v.nucleo instanceof RegExp && v.faz != null)));
}

sec("2. a peneira REUSA a da agressão — não é uma segunda");
{
  t("as travas de agressao.js são as primeiras linhas, as mesmas",
    NAO_E_AGRESSAO.every((n, i) => NAO_E_IMPROVISO[i] === n));
  t("e a declaração de golpe é a regex de lá, a mesma", NAO_E_IMPROVISO.some((n) => n.rx === RX_AGRESSAO));
  t("toda linha diz por que existe", NAO_E_IMPROVISO.every((n) => n.porque && n.porque.length > 30));
  t("ids únicos", new Set(NAO_E_IMPROVISO.map((n) => n.id)).size === NAO_E_IMPROVISO.length);
}

sec("3. o que ganha dado — o atributo, a CD, e a MESMA forma do catálogo");
{
  const v = ler("Salto do balcão para o lustre");
  t("virou teste", v && v.tipo === "teste");
  t("é Destreza", v.atributo === "destreza");
  t("com a perícia que cobre o gesto (o treino conta)", v.pericia === "acrobacia");
  t("contra a CD comum", v.dc === 13);
  t("o jogador lê o atributo e o degrau, na voz do mundo", v.deOnde === "Destreza, obstáculo comum");
  t("e o rótulo é o que ELE fez, no infinitivo e com os acentos dele", v.rotulo === "saltar do balcão para o lustre");
  /* a forma: os campos que rolarDesafio, concluirRolagem e fecharTentativa
     leem de um desafio do catálogo — nenhum a menos */
  const cat = ler("salto o vão até o outro telhado");
  const faltam = Object.keys(cat).filter((k) => !(k in v));
  t("tem todos os campos de um veredito do catálogo", faltam.length === 0, faltam.join(","));
  t("tem chave no livro de tentativas", typeof v.chave === "string" && v.chave.includes("improviso"));
  t("custa o tempo da família", v.minutos === 0 && ler("Tento lembrar onde vi esse brasão").minutos === 5);
  t("o corpo é o corpo: não se dispensa", v.corpo === true && v.dispensavel === false);
  t("lembrar é só saber: o mestre pode conceder", ler("Tento lembrar onde vi esse brasão").dispensavel === true);
  t("quebrar faz barulho; saltar não", ler("Quebro a cadeira contra a parede").barulho === true && v.barulho === false);

  /* O SISTEMA NÃO FALA DE SI: nada de "improviso" no que vai à tela */
  const vistos = ["Salto do balcão para o lustre", "Ergo o baú sozinho", "Faço um discurso para a multidão", "Decifro o mapa antigo"]
    .map((f) => ler(f)).map((x) => `${x.rotulo} ${x.deOnde}`);
  t("nem o rótulo nem a etiqueta falam do mecanismo", vistos.every((s) => !/improvis|famil|tabela|sistema/i.test(s)), vistos.join(" | "));
}

sec("4. a ousadia sobe um degrau — uma vez, e só fora do verbo");
{
  const c = ler("Salto de costas do telhado para a carroça");
  t("'de costas' sobe para incomum (15)", c.dc === 15 && /incomum — de costas/.test(c.deOnde));
  t("'no escuro' também", ler("Salto no escuro para a outra margem").dc === 15);
  t("'com uma mão só' também", ler("Ergo o portão com uma mão só").dc === 15);
  t("duas bravatas ainda são um degrau só", ler("Salto de costas no escuro para a carroça").dc === 15);
  t("'bebo de uma vez' é o gesto, não a bravata", ler("Bebo o caneco inteiro de uma vez").dc === 13);
  t("a etiqueta guarda o acento do jogador", /às cegas/.test(ler("Salto às cegas para o outro lado").deOnde));
}

sec("5. O CORPUS — frases de jogador, e o que cada uma é");
{
  /* [frase, esperado] — esperado é o atributo quando ganha dado improvisado,
     "catalogo:<id>" quando o catálogo já a cobre, e "nada" quando não pode
     ganhar dado nenhum (null ou livre). */
  const CORPUS = [
    /* --- ações improvisadas: ganham dado --- */
    ["Salto do balcão para o lustre", "destreza"],
    ["Tento lembrar onde vi esse brasão antes", "intelecto"],
    ["Arremesso a cadeira contra a janela", "forca"],
    ["Pego a caneca no ar antes que caia", "destreza"],
    /* o olhar que dobra alguém é Intimidação, e nesta casa Intimidação é da
       Força — mora no catálogo (`intimidar`, social), não numa família */
    ["Encaro o guarda nos olhos até ele desviar", "catalogo:intimidar"],
    ["Salto de costas do telhado para a carroça", "destreza"],
    ["Bebo o caneco inteiro de uma vez", "vigor"],
    ["Viro a mesa para me proteger", "forca"],
    ["Seduzo a taverneira", "presenca"],
    ["Corro sem parar até a ponte", "vigor"],
    ["Tento perceber quem está mais fraco entre eles", "percepcao"],
    ["Arremesso a corda para o outro lado do abismo", "forca"],
    ["Ergo o baú sozinho", "forca"],
    ["Me balanço no lustre até a outra mesa", "destreza"],
    ["Decifro o mapa antigo", "intelecto"],
    ["Faço um discurso para a multidão", "presenca"],
    ["Pulo da carroça em movimento", "destreza"],
    ["Desvio da flecha que vem do telhado", "destreza"],
    ["Vasculho a memória atrás do nome dele", "intelecto"],
    ["Quebro a cadeira contra a parede", "forca"],
    ["Finjo um desmaio no meio do salão", "presenca"],
    ["Fico de vigia na janela", "percepcao"],
    ["Arranco a porta das dobradiças", "forca"],
    ["Forço a janela emperrada", "forca"],
    ["Calculo a distância até o outro telhado", "intelecto"],
    ["Imito a voz do capitão", "presenca"],
    ["Atravesso a nevasca sem capa", "vigor"],
    ["Estudo o mecanismo da fechadura", "intelecto"],
    ["Rolo por baixo da carroça", "destreza"],
    ["Distraio o guarda enquanto a Ione passa", "presenca"],
    ["Ergo o portão com uma mão só", "forca"],
    ["Identifico a erva pelo cheiro", "intelecto"],
    ["Puxo a corda com toda a força", "forca"],

    /* --- falas, perguntas, hipóteses, figuras, triviais: nada --- */
    ["Atiro a cadeira no bandido", "nada"],
    ["Derrubo a mesa em cima dele", "nada"],
    ["Arremesso a faca no guarda", "nada"],
    ["Empurro com força o bandido", "nada"],
    ["Tento derrubar no chão o bandido", "nada"],
    ["Levanto a caneca e brindo", "nada"],
    ["Quebro o pão e divido", "nada"],
    ["Digo: \"vou quebrar sua cara\"", "nada"],
    ["Isso me mata de rir", "nada"],
    ["E se eu saltar do balcão?", "nada"],
    ["Não salto, fico onde estou", "nada"],
    ["Lanço um olhar para ela", "nada"],
    ["Peço uma cerveja", "nada"],
    ["Ando até o balcão", "nada"],
    ["Mestre, posso saltar?", "nada"],
    ["Ontem eu saltei daquele muro", "nada"],
    ["Resisto ao veneno", "nada"],
    ["Sento na mesa do canto e espero", "nada"],
    ["Pergunto ao taverneiro se há quartos", "nada"],
    ["Penso em arremessar a cadeira, mas desisto", "nada"],
    ["Ergo a mão para chamar o taverneiro", "nada"],
    ["Quebro a cabeça tentando entender o enigma", "nada"],
    ["Vou dar um pulo na feira", "nada"],
    ["Bebo a cerveja devagar", "nada"],
    ["Pulo essa parte e vou direto ao ponto", "nada"],
    ["Salto de alegria com a notícia", "nada"],
    ["Treino saltos no quintal", "nada"],
    ["Será que consigo erguer esse baú?", "nada"],
    ["Lembro que o brasão era de uma casa do norte", "nada"],
    ["Quebro o gelo com uma piada", "catalogo:impressionar"],
    ["Ataco o bandido com a espada", "nada"],
    ["Posso soprar fogo pelas narinas?", "nada"],
    ["Pago a conta e saio", "nada"],
    /* a segunda leva do "nada": falsos positivos que a primeira versão das
       famílias tinha, achados numa varredura de frases de rotina — cada um
       ficou aqui para não voltar */
    ["Levanto um brinde à casa", "nada"],
    ["Faço um brinde à saúde do rei", "nada"],
    ["Ergo a espada em saudação", "nada"],
    ["Distraio-me olhando a chuva", "nada"],
    ["Finjo que não ouvi", "nada"],
    ["Imito o jeito dele de andar e todos riem", "nada"],
    ["Desvio da poça de lama", "nada"],
    ["Equilibro a bandeja e sirvo a mesa", "nada"],
    ["Estimo o tempo até o anoitecer", "nada"],
    ["Salto da cama assim que amanhece", "nada"],
    ["Pulo da carroça quando ela para", "nada"],
    ["Viro à esquerda na próxima rua", "nada"],
    ["Carrego a mochila nas costas", "nada"],
    ["Lanço a moeda para o mendigo", "nada"],
    /* e três do CATÁLOGO que a mesma varredura pegou mordendo demais (MM4
       os consertou com `naoSe`, no próprio desafio): */
    ["Subo a escada até o quarto", "nada"],
    ["Seguro a porta para ela passar", "nada"],
    ["Levanto a caneca e brindo", "nada"],
    ["Levanto a grade enferrujada", "catalogo:forcar"],

    /* --- o catálogo já cobre: o improviso não rouba --- */
    ["Escalo o muro pelo lado da hera", "catalogo:escalar"],
    ["Salto o vão até o outro telhado", "catalogo:saltar"],
    ["Tento convencer o guarda a me deixar passar", "catalogo:convencer"],
    ["Forço a porta com o ombro", "catalogo:tranca"],
    ["Empurro a pedra que trava a passagem", "catalogo:forcar"],
    ["Seguro o fôlego e sigo em frente", "catalogo:aguentar"],
    ["Canto para a taverna inteira", "catalogo:atuar"],
    ["Reviro o quarto atrás de um esconderijo", "catalogo:buscar"],
  ];
  const ctx = { ...base, pessoaDe: () => null, ehPessoaConhecida: () => false, achadoDe: () => null };
  const erros = [];
  const classe = (v) => {
    if (!v || v.tipo !== "teste") return "nada";
    if (v.id === "improviso") return v.atributo;
    return `catalogo:${v.id}`;
  };
  for (const [frase, esperado] of CORPUS) {
    const got = classe(lerAcao(frase, ctx));
    if (got !== esperado) erros.push(`"${frase}" deu ${got}, esperado ${esperado}`);
  }
  const n = CORPUS.length;
  const taxa = Math.round(((n - erros.length) / n) * 1000) / 10;
  const dados = CORPUS.filter(([, e]) => e !== "nada" && !e.startsWith("catalogo")).length;
  const nada = CORPUS.filter(([, e]) => e === "nada").length;
  console.log(`      corpus do improviso: ${n - erros.length}/${n} (${taxa}%) · ${dados} ganham dado · ${nada} não ganham · ${n - dados - nada} são do catálogo`);
  t(`o corpus tem ao menos 40 frases (${n})`, n >= 40);
  t("e mistura os três lados", dados >= 15 && nada >= 15 && n - dados - nada >= 5);
  t("toda frase do corpus sai com o veredito esperado", erros.length === 0, erros.join(" | "));
}

sec("6. o que não se rouba — a luta, o golpe, a disputa");
{
  t("em combate, o improviso não abre (a economia da ação não cobra o desafio)",
    ler("Salto do balcão para o lustre", { emCombate: true }) === null);
  t("em combate, a cadeira atirada é golpe do tabuleiro, não teste",
    ler("Atiro a cadeira no bandido", { emCombate: true }) === null);
  t("mas o catálogo em combate continua como era",
    ler("salto o vão até o outro telhado", { emCombate: true }).tipo === "teste");
  t("fora da luta, coisa atirada em alguém não vira teste de Força",
    ler("Arremesso a caneca no bêbado") === null);
  t("mas atirada para o outro lado de um vão, vira",
    ler("Arremesso a corda para o outro lado do abismo").atributo === "forca");
  t("empurrar alguém é disputa (disputa.js), não CD fixa", ler("Empurro com força o bandido") === null);
  t("empurrar a carroça com força é Força", ler("Empurro a carroça atolada com toda a força") != null);
}

sec("7. o livro de tentativas vale para o improviso");
{
  const v = ler("Salto do balcão para o lustre");
  const reg = registrarTentativa({}, v.chave, { resultado: "falha", dia: 2, rotulo: v.rotulo, onde: base.lugar });
  const de2 = ler("Salto do balcão para o lustre", { tentativas: reg });
  t("insistir igual depois de falhar é 'você já tentou'", de2 && de2.tipo === "jaTentou");
  const outro = ler("Salto da janela para o telhado", { tentativas: reg });
  t("outro salto é outra tentativa", outro && outro.tipo === "teste");
  const ajuda = ler("Salto do balcão para o lustre com a ajuda do Bram", { tentativas: reg });
  t("com ajuda reabre, e facilita", ajuda && ajuda.tipo === "teste" && ajuda.dc === 11);
  const ok2 = registrarTentativa({}, v.chave, { resultado: "sucesso", dia: 2 });
  const refazer = ler("Salto do balcão para o lustre", { tentativas: ok2 });
  t("o que já deu certo aqui não se rola de novo", refazer && refazer.tipo === "livre");
  t("o lugar faz parte da chave", ler("Salto do balcão para o lustre", { lugar: "a Estalagem do Poço" }).chave !== v.chave);
}

sec("8. determinismo, lixo e imutabilidade");
{
  const a = JSON.stringify(ler("Salto de costas do telhado para a carroça"));
  const b = JSON.stringify(ler("Salto de costas do telhado para a carroça"));
  t("mesma frase, mesmo lugar: o mesmo veredito, byte a byte", a === b);
  t("contexto null não quebra", lerAcao("Salto do balcão para o lustre", null).tipo === "teste");
  t("contexto vazio não quebra", lerAcao("Salto do balcão para o lustre", {}).tipo === "teste");
  t("texto lixo não quebra", lerAcao(undefined, base) === null && lerAcao(42, base) === null);
  const tent = Object.freeze({});
  const ctx = Object.freeze({ ...base, tentativas: tent });
  let explodiu = false;
  try { lerAcao("Ergo o baú sozinho", ctx); } catch { explodiu = true; }
  t("não muta o contexto recebido (congelado, e nada estoura)", !explodiu);
  t("envelope do sistema continua não sendo ação", lerAcao("[SISTEMA] salto do balcão", base) === null);
  t("o pedido de teste continua não se pedindo — nem pelo improviso",
    lerAcao("peço um teste de Força para erguer o baú", base).tipo === "naoSePede");
}

sec("9. a falha: o custo da família, e a MARGEM que a etapa seguinte vai ler");
{
  const v = ler("Salto do balcão para o lustre");
  /* MM5: aqui dizia "falhar por 1 é falhar — seco (MM5 decide o meio)", e
     o MM5 decidiu: falhar por 1 é o meio, o sim pago, com o preço da
     família. A falha seca continua provada, agora onde ela mora — por 3. */
  const d = desfechoDaFalha(v, v.dc - 1, v.dc);
  t("falhar por 1 é o meio (MM5): o sim, pago", d && d.porPouco === true && d.faixa === "quase");
  t("com o preço da família", d.diz === custoPorAlvo("improviso_destreza").preco);
  t("e a margem viaja no desfecho", d.faltou === 1);
  const seco = desfechoDaFalha(v, v.dc - 3, v.dc);
  t("falhar por 3 é seco, com a frase da família", seco && seco.porPouco === false && seco.diz === custoPorAlvo("improviso_destreza").seca);
  t("passar não tem desfecho de falha", desfechoDaFalha(v, v.dc + 3, v.dc) === null);
  const soc = ler("Seduzo a taverneira");
  t("o social não tem custo de tabela — quem diz o preço é o envelope social",
    soc.social && soc.alvoDoCusto === "" && desfechoDaFalha(soc, soc.dc - 5, soc.dc) === null);
}

sec("10. o envelope do gesto — o sucesso é o gesto acontecendo");
{
  const args = { tipo: "destreza", pericia: "acrobacia", motivo: "saltar do balcão para o lustre", valor: 15, mod: 2, total: 17, dc: 13, resultado: "sucesso", critico: false, desastre: false, nivelTreino: "nenhum" };
  const velho = envelopeDoTeste(args);
  const gesto = envelopeDoTeste({ ...args, gesto: true });
  t("sem a marca, o envelope é o de sempre (revela uma coisa)", /Revele UMA coisa/.test(velho));
  t("com a marca, o que declarei ACONTECE", /ACONTECE/.test(gesto) && !/Revele UMA coisa/.test(gesto));
  t("e o Narrador não acrescenta achado", /NÃO acrescente achado/.test(gesto));
  const falhou = envelopeDoTeste({ ...args, total: 9, resultado: "falha", gesto: true });
  t("na falha, o gesto não sai e não há meia-vitória", /NÃO acontece/.test(falhou) && /sem me dar metade/.test(falhou));
  t("o veredito do corpo leva a marca; o do saber, não",
    ler("Salto do balcão para o lustre").gesto === true && ler("Tento lembrar onde vi esse brasão").gesto === false);
  t("e o catálogo não a leva (o texto dele não muda)", DESAFIOS.length > 0 && ler("salto o vão até o outro telhado").gesto === false);
}

/* 4. A FIAÇÃO — a marca do gesto chega ao envelope que o App manda. Sem
   ela o improviso do corpo rolava certo e o Narrador recebia "revele uma
   coisa" em cima de um salto. Corpo de concluirRolagem por âncora, nunca
   por linha. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const i = app.indexOf("const concluirRolagem = (");
  const corpo = i >= 0 ? app.slice(i, i + 20000) : "";
  const j = corpo.indexOf("envelopeDoTeste({");
  const chamada = j >= 0 ? corpo.slice(j, corpo.indexOf("})", j)) : "";
  t("concluirRolagem passa a marca do gesto ao envelope do teste", chamada.includes("gesto: !!(des && des.gesto)"), chamada.slice(0, 160));
}

console.log(`\nimproviso MM4: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
