/* teste-a-frase-que-rola.mjs (Fase MC, MC1 · 10/11/2026) — «o catálogo ouve
   a frase».

   Na 18.ª sessão a luta já era jogo e os dados fora dela eram ritual: cinco
   momentos em que o jogador escreveu o gesto certo e o catálogo
   (`lerAcao`, desafios.js) não viu teste nenhum, ou viu o errado. A planta
   (mente/plano-o-mestre-chama-o-dado.md, §1.2 e §3.1) mediu-os um a um; esta
   suíte é a tabela de §3.1 como catraca — cada linha, a frase, o desafio e a
   perícia. As frases da sessão 18 são as primeiras.

   Das frases que chegaram cortadas («…» no meio, o receptor da sessão foi
   bloqueado), a suíte usa a forma comum completa: o mecanismo foi provado
   com a variante, e é ele que se prova aqui. */
import { lerAcao, comoSeDiz, DESAFIOS, chaveDaTentativa, registrarTentativa, marcarLimpo, garantirTentativas } from "../src/desafios.js";
import { detectarPedidoDeTeste } from "../src/testes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const LUGAR = "Largo do Cereal";
const base = { personagem: { nivel: 1, inventario: [], habilidades: [], equipado: {} }, semente: "mc1|sessao18", lugar: LUGAR, tentativas: {}, dia: 4 };
const ler = (f, ctx = base) => lerAcao(f, ctx);
const tipoDe = (v) => (v ? (v.tipo === "teste" ? `${v.id}:${v.pericia}` : v.tipo) : "null");

sec("1. as frases da 18.ª sessão viram o teste certo, com a perícia certa");
{
  const SESSAO_18 = [
    /* o rasto — a palavra do próprio passo da quest */
    ["Sigo o rasto.", "rastrear", "sobrevivencia"],
    ["Sigo o rastro até onde a besta dorme.", "rastrear", "sobrevivencia"],
    /* a carcaça — examinar um vestígio é ler, não revirar */
    ["Examino o corte na carcaça.", "investigar", "investigacao"],
    /* o que se sabe — de lugar, de gente, de bicho */
    ["O que sei de Alto Negro, da Agulha, de bichos assim?", "lembrar", "saberes"],
    ["O que eu sei sobre a Agulha de Sal?", "lembrar", "saberes"],
    /* estancar — as cinco formas comuns, e a frase que dava `livre` */
    ["Cuido das feridas de Elowen.", "estancar", "medicina"],
    ["Faço um torniquete na perna dela.", "estancar", "medicina"],
    ["Pressiono o ferimento com as duas mãos.", "estancar", "medicina"],
    ["Enfaixo o braço de Elowen.", "estancar", "medicina"],
    ["Socorro a minha irmã.", "estancar", "medicina"],
    ["Deito Elowen no chão e cuido das feridas dela.", "estancar", "medicina"],
    /* as amarras — a frase limpa e a que rolava `naoSePede` */
    ["Forço os pulsos contra as raízes para arrebentá-las.", "arrebentar", "atletismo"],
    ["Rolo de lado e forço os pulsos com toda a força contra as raízes.", "arrebentar", "atletismo"],
  ];
  for (const [frase, id, pericia] of SESSAO_18) {
    const v = ler(frase);
    t(`«${frase}» → ${id} · ${pericia} (deu ${tipoDe(v)})`, v && v.tipo === "teste" && v.id === id && v.pericia === pericia);
  }
}

sec("2. a tabela de §3.1, linha a linha");
{
  const TABELA = [
    /* rastrear */
    ["Sigo as marcas no chão.", "rastrear"], ["Sigo as pegadas até o rio.", "rastrear"],
    ["Descubro por onde ela fugiu.", "rastrear"], ["Sigo o rasto do lobo até o rio.", "rastrear"],
    /* MC8 (11/11): ler as marcas NO chão é rastrear (dava null) */
    ["Leio as marcas no chão.", "rastrear"], ["Leio as pegadas.", "rastrear"],
    /* investigar, examinando o vestígio */
    ["Examino a ferida no flanco do boi.", "investigar"], ["Examino a marca na porta.", "investigar"],
    ["Examino a carcaça.", "investigar"], ["Examino o vestígio de cinza.", "investigar"],
    /* lembrar */
    ["O que eu lembro da família Voss?", "lembrar"], ["Já ouvi falar desta ponte?", "lembrar"],
    /* estancar */
    ["Estanco o sangue.", "estancar"], ["Presto os primeiros socorros ao guarda.", "estancar"],
    /* arrebentar e escapar */
    ["Arrebento as cordas com um puxão.", "arrebentar"], ["Me contorço até soltar as amarras.", "escapar"],
  ];
  for (const [frase, id] of TABELA) {
    const v = ler(frase);
    t(`«${frase}» → ${id} (deu ${tipoDe(v)})`, v && v.tipo === "teste" && v.id === id);
  }
}

sec("3. o pedido de teste: fronteira de palavra e objeto obrigatório");
{
  /* o corpo que rola não é o dado que se rola */
  t("«Rolo de lado e forço…» deixa de ser pedido",
    detectarPedidoDeTeste("Rolo de lado e forço os pulsos com toda a força contra as raízes.") === null);
  t("e deixa de ser `naoSePede`", ler("Rolo de lado e forço os pulsos com toda a força contra as raízes.").tipo !== "naoSePede");
  t("«controlo», «enrolo» não têm «rolo»",
    detectarPedidoDeTeste("Controlo a respiração e enrolo a corda no braço com força.") === null);
  t("«testemunha» não tem «teste»", detectarPedidoDeTeste("Faço sinal à testemunha com força.") === null);
  t("«faço» solto não é pedir", detectarPedidoDeTeste("Faço força e rolo a pedra.") === null);
  /* e o pedido de verdade continua a sê-lo — a regra da v9.64 não amolece */
  for (const f of ["peço um teste de Força", "Peço um teste de Força.", "peço teste de percepção", "quero rolar Intimidação",
    "rolo Sobrevivência", "faço uma checagem de Investigação", "peço uma jogada de Medicina", "posso rolar um dado de Furtividade?"]) {
    const v = ler(f);
    t(`«${f}» continua \`naoSePede\``, v && v.tipo === "naoSePede");
  }
  t("o pedido de Força ainda leva o atributo", (detectarPedidoDeTeste("peço um teste de Força") || {}).tipo === "forca");
}

sec("4. a chave própria: a oferta do Mestre não queima o verbo do jogador");
{
  /* §1.1: a oferta «Olhar à volta» é busca, e com sucesso sem achado fecha
     `largo do cereal|busca`. Os verbos do jogador têm outras chaves. */
  const oferta = ler("Olho em volta com atenção.");
  t("a oferta é busca, na chave do lugar", oferta.id === "buscar" && oferta.chave === chaveDaTentativa(LUGAR, "busca"));
  let reg = registrarTentativa(garantirTentativas({}), oferta.chave, { resultado: "sucesso", dia: 4, limpo: true });
  reg = marcarLimpo(reg, oferta.chave);
  const ctx = { ...base, tentativas: reg };
  const corte = ler("Examino o corte na carcaça.", ctx);
  t("«Examino o corte na carcaça» ainda rola, depois da oferta", corte.tipo === "teste" && corte.id === "investigar");
  t("com a chave do objeto, não a do lugar", corte.chave !== oferta.chave && /corte/.test(corte.chave));
  t("«Investigo o que aconteceu aqui» também rola, noutra chave",
    ler("Investigo o que aconteceu aqui.", ctx).tipo === "teste" && ler("Investigo o que aconteceu aqui.", ctx).chave !== corte.chave);
  t("«Procuro o que o Largo esconde» é a busca de antes: já revirado",
    ler("Procuro o que o Largo do Cereal esconde.", ctx).tipo === "vasculhado");
  /* e a mesma pergunta duas vezes é a mesma tentativa */
  const reg2 = registrarTentativa(reg, corte.chave, { resultado: "falha", dia: 4 });
  t("examinar o mesmo corte depois de falhar é «já tentou»", ler("Examino o corte na carcaça.", { ...base, tentativas: reg2 }).tipo === "jaTentou");
  t("e a outra carcaça é outra tentativa", ler("Examino a marca na porta.", { ...base, tentativas: reg2 }).tipo === "teste");
  /* lembrar: o assunto é a chave */
  const alto = ler("O que sei de Alto Negro?");
  const agulha = ler("O que sei da Agulha de Sal?");
  t("perguntar por Alto Negro e pela Agulha são duas tentativas", alto.chave !== agulha.chave);
  t("e o assunto viaja no veredito (para o facto do sucesso)", /alto negro/.test(alto.sobre) && /agulha de sal/.test(agulha.sobre));
  /* estancar: com quem */
  const elowen = ler("Cuido das feridas de Elowen.");
  t("estancar sabe quem se trata", elowen.quem === "Elowen");
  t("e tratar Elowen não fecha tratar a irmã", elowen.chave !== ler("Socorro a minha irmã.").chave);
  t("o pronome não inventa nome", ler("Faço um torniquete na perna dela.").quem === "");
}

sec("5. o que não podia mudar");
{
  /* MC1 tirou «o que sei sobre» da fraqueza só quando o objeto não é a
     criatura; a criatura continua a ser a fraqueza, e vale na luta */
  t("«o que sei sobre essa criatura?» é a fraqueza", ler("o que sei sobre essa criatura?").id === "fraqueza");
  t("«tento lembrar onde vi esse brasão» continua improviso de Intelecto",
    (() => { const v = ler("Tento lembrar onde vi esse brasão"); return v && v.id === "improviso" && v.atributo === "intelecto"; })());
  t("examinar o corpo é Medicina", ler("examino o corpo para saber de que ele morreu").id === "diagnosticar");
  t("examinar o quarto é busca", ler("examino o quarto").id === "buscar");
  t("examinar o selo é o arcano (a frase de exemplo dele caía na busca)", ler("examino o selo para reconhecer a magia").id === "arcano");
  t("perguntar por onde ele foi é conversa", (ler("Pergunto ao velho por onde ele foi.") || {}).id !== "rastrear");
  t("«socorro!» sozinho não é tratar ninguém", (ler("Socorro!") || {}).id !== "estancar");
  t("torcer os pulsos do guarda não é escapar", (ler("Torço os pulsos dele até largar a faca.") || {}).id !== "arrebentar");
  t("todo desafio novo ensina a frase, e o leitor reconhece-a",
    ["lembrar", "arrebentar"].every((id) => comoSeDiz(id) && (ler(comoSeDiz(id)) || {}).id === id));
  t("o catálogo continua sem ids repetidos", new Set(DESAFIOS.map((d) => d.id)).size === DESAFIOS.length);
}

console.log(`\na frase que rola (MC1): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
