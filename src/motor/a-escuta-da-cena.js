/* motor/a-escuta-da-cena.js (M5 · 18/11/2026) — «a escuta da cena».

   O exame do Mestre (mente/lancamento/o-mestre-vivo.md §11–§13) mostrou de
   onde vem o buraco maior: dois terços do que uma mesa real rolaria passam
   sem dado porque o catálogo (`lerAcao`, desafios.js) não reconhece a frase.
   E ensinar o catálogo verbo a verbo não generalizou — a metade que ninguém
   afinou quase não mexeu. Esta escuta ataca pela ESTRUTURA da frase:

     1. a MOLDURA que esconde o ato — «dá pra eu…?», «consigo…?», «será que
        consigo…», «queria ver se…», «posso…?», «vou tentar…» —: tira-se a
        moldura e lê-se o ato de dentro, como declaração;
     2. a FALA que pede algo a alguém (o pedido, a barganha, a ameaça, a
        afirmação falsa sobre si) — só quando há na cena quem a ouça;
     3. o ATO dito sem o verbo do catálogo (descer pela corda, passar a
        ponte, pé ante pé, vasculhar, seguir de longe): famílias de formas,
        por tabela;
     4. a PERGUNTA que é gesto de saber (o assunto raro, o rastro, o que há
        ali) — só quando a cena diz que há o que saber ou achar, e não há a
        quem perguntar.

   A escuta NÃO decide se rola: ela traduz a frase do jogador para a frase que
   o catálogo já ouve (a mesma gramática de `comoSeDiz`) e devolve o veredito
   do próprio catálogo. Quem decide é a régua (a-regua-do-momento.js), pela
   cena. Por isso a escuta só existe atrás da régua: sem cena ela nem é
   chamada, e o Mestre de hoje (sem cena) fica exatamente como era — ouvir
   «pulo da carroça» sem cena seria pedir dado na carroça parada.

   As formas saíram de três fontes, e só delas: os erros da metade A do exame,
   e as frases dos nossos dois corpus (corpus-da-mesa, corpus-das-situacoes)
   que o catálogo não ouvia. Nunca da metade B do exame, nunca de texto de
   mesa real.

   RODADA 3 DO TREINO (18/11/2026) — como o jogador brasileiro diz o que faz
   (estudo-das-mesas.md §10.4). Seis portas novas, todas por tabela:
     - a ESCRITA da mesa («vc», «cê», «q», «n»): vira a forma inteira antes
       de tudo (o acento o catálogo já tirava);
     - «(eu) vou + infinitivo» e «a gente vai…»: o verbo de dentro, no
       presente (`noPresente`), que é a forma em que o catálogo foi escrito;
     - a moldura «tu acha que…», «preciso rolar… pra…», «quero…»;
     - o jogador que NOMEIA a perícia («mando uma percepção», «meu
       stealth»): a perícia diz o desafio, e a régua decide pela cena se ele
       tem razão de existir (`PERICIA_NOMEADA`);
     - a moldura como SINAL (`molduraDe`): «posso…?» rolou 8 de 9 na mesa em
       português, «eu vou + verbo» 3 de 54. A régua usa o sinal como peso,
       nunca sozinho contra a cena;
     - as ações encadeadas («aí eu…», «vou fazer o seguinte:»): `atosDaFrase`
       parte a frase, e a régua fica com o ato que tem oposição na cena.
   E formas novas nas tabelas de sempre: a barganha («e se eu…», «pelo
   menos…»), a ameaça pela arma à mostra, a furtividade pelo advérbio, ler
   a pessoa pela cara dela, a hora e o rumo; e o PALPITE DA CENA (porta 5):
   a moldura de risco sem ato ouvido, e a cena diz qual é o risco.
   Formas tiradas dos erros da A-treino que deram zero na A-validação (a
   mentira sobre quem se é, a mão leve «sem ninguém ver», o curativo, o pé
   de cabra, a pergunta pela magia, a barganha de feira) foram desfeitas:
   eram decoreba (o-mestre-vivo.md §14).
   Fonte, como na M5: só os erros da A-treino (2/3 da metade A, repartida
   por semente) e o estudo; o que ficou foi decidido pela A-validação (o
   outro terço). A metade B foi medida duas vezes, antes e depois.

   Nada aqui sorteia, e nada muta. */
import { lerAcao, comoSeDiz, desafioPorPericia } from "../desafios.js";
import { lerCena } from "../cena-do-momento.js";

const nrm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9?\s'-]/g, " ").replace(/\s+/g, " ").trim();
const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);

/* ---------------- 0. A ESCRITA DA MESA ----------------
   Rodada 3: a abreviação do chat vira a palavra inteira. Só as que não
   colidem com palavra de verdade («ta» fica: «tá caro» e «está» se leem
   iguais no catálogo). */
export const ESCRITA_DA_MESA = Object.freeze([
  Object.freeze({ rx: /\b(vc|vcs|ce|voces?)\b/g, por: "voce" }),
  Object.freeze({ rx: /\bq\b/g, por: "que" }),
  Object.freeze({ rx: /\bn\b/g, por: "nao" }),
  Object.freeze({ rx: /\b(tb|tbm)\b/g, por: "tambem" }),
  Object.freeze({ rx: /\bmt\b/g, por: "muito" }),
  Object.freeze({ rx: /\bmsm\b/g, por: "mesmo" }),
  Object.freeze({ rx: /\bpq\b/g, por: "porque" }),
  Object.freeze({ rx: /\bdps\b/g, por: "depois" }),
  Object.freeze({ rx: /\b(aki|aq)\b/g, por: "aqui" }),
  Object.freeze({ rx: /\btd\b/g, por: "tudo" }),
]);
const escrita = (t) => ESCRITA_DA_MESA.reduce((s, x) => s.replace(x.rx, x.por), t);

/* ---------------- 1. AS MOLDURAS ----------------
   A moldura é a parte da frase que pergunta pela possibilidade ou anuncia a
   intenção; o ato mora no grupo capturado. A ordem importa: a moldura mais
   longa primeiro. */
export const MOLDURAS_DO_ATO = Object.freeze([
  /* rodada 3: «tu acha que dá pra eu…», «preciso rolar alguma coisa pra…» */
  /^(?:e\s+)?(?:tu|voce)\s+(?:acha|acredita)\s+que\s+(?:eu\s+)?(?:consigo\s+|da\s+(?:pra|para)\s+(?:eu\s+)?)?(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:preciso|tenho\s+que|devo|posso|da\s+(?:pra|para))\s+rolar\s+(?:alguma\s+coisa\s+|algo\s+|um\s+dado\s+|o\s+dado\s+|\w+\s+)?(?:pra|para)\s+(?:eu\s+)?(.+)$/,
  /^(?:e\s+)?(?:sera\s+que\s+)?da\s+tempo\s+de\s+(?:eu\s+)?(.+)$/,
  /^(?:e\s+)?(?:sera\s+que\s+)?da\s+(?:pra|para)\s+(?:eu\s+|mim\s+|a\s+gente\s+)?(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?queria\s+(?:ver\s+se|saber\s+se)\s+(?:eu\s+)?(?:consigo\s+|da\s+(?:pra|para)\s+)?(.+)$/,
  /^(?:e\s+)?sera\s+que\s+(?:eu\s+)?(?:consigo\s+|da\s+(?:pra|para)\s+)?(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:consigo|conseguiria|posso|poderia|daria\s+(?:pra|para))\s+(.+)$/,  /^(?:e\s+)?(?:eu\s+)?(?:vou|quero|vou\s+ver\s+se|deixa\s+eu)\s+tentar\s+(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:tento|tentarei)\s+(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:quero|queria)\s+(.+)$/,
]);

/* ---------------- 1b. A MOLDURA COMO SINAL ----------------
   Rodada 3 (estudo §10.3, nº 1, e §10.4): a moldura prevê o dado melhor que
   o verbo. A primeira que casa diz o sinal:
     pedido     o jogador pede o dado («posso rolar…?», «mando uma X»)
     licenca    pede licença: sabe que é arriscado («posso…?», «dá pra…?»)
     tentativa  já sinaliza a incerteza («vou tentar», «tento»)
     anuncio    anuncia no futuro: a ação acontece («vou até…», «deixa eu…»)
   A régua usa o sinal como PESO, junto com a cena — nunca sozinho contra
   ela: com a cena calma, «posso abrir a porta?» não rola. */
export const MOLDURAS_COMO_SINAL = Object.freeze([
  Object.freeze({ id: "pedido", rx: /\b(posso|preciso|tenho que|da (pra|para)|devo|vou|quero) rolar\b/ }),
  Object.freeze({ id: "licenca", rx: /^(e )?(sera que |tu acha que |voce acha que )?(eu )?(posso|poderia|consigo|conseguiria|da (pra|para)|daria (pra|para)|sera que)\b/ }),
  Object.freeze({ id: "tentativa", rx: /\b(vou tentar|tento|tentarei|tentando|vou ver se|deixa eu ver se)\b/ }),
  Object.freeze({ id: "anuncio", rx: /^(e |ai |entao )?(eu |a gente )?(vou|vamos|vai) (?!tentar)\w+(ar|er|ir|or)\b|^(e )?deixa eu\b/ }),
]);
export function molduraDe(frase) {
  if (typeof frase !== "string" || !frase.trim()) return "";
  const t = escrita(nrm(frase));
  if (periciaNomeada(t)) return "pedido";
  const m = MOLDURAS_COMO_SINAL.find((x) => x.rx.test(t));
  return m ? m.id : "";
}

/* ---------------- 1c. «(EU) VOU + INFINITIVO» ----------------
   Rodada 3 (§10.4 nº 1, a moldura mais comum da mesa: 35% das ações): o
   catálogo foi escrito no presente («escalo», «me escondo»). O infinitivo
   volta ao presente por regra, e os irregulares por tabela. */
export const PRESENTE_IRREGULAR = Object.freeze({
  fazer: "faco", dizer: "digo", trazer: "trago", ver: "vejo", por: "ponho", sair: "saio", cair: "caio",
  subir: "subo", seguir: "sigo", perseguir: "persigo", conseguir: "consigo", pedir: "peco", ouvir: "ouco",
  descer: "desco", sentir: "sinto", mentir: "minto", dormir: "durmo", fugir: "fujo", servir: "sirvo",
  vestir: "visto", ler: "leio", ter: "tenho", vir: "venho", poder: "posso", saber: "sei", querer: "quero",
  perder: "perco", medir: "meco", cobrir: "cubro", descobrir: "descubro", tossir: "tusso", ir: "vou",
  dar: "dou", estar: "estou", ficar: "fico", sumir: "sumo", engolir: "engulo", repetir: "repito",
});
export function noPresente(inf) {
  const v = String(inf || "");
  if (PRESENTE_IRREGULAR[v]) return PRESENTE_IRREGULAR[v];
  let m;
  if ((m = v.match(/^(\w+)(guir|guer)$/))) return m[1] + "go";
  if ((m = v.match(/^(\w+)(ger|gir)$/))) return m[1] + "jo";
  if ((m = v.match(/^(\w+)cer$/))) return m[1] + "co";
  if ((m = v.match(/^(\w{2,})(ar|er|ir)$/))) return m[1] + "o";
  return "";
}
const VOU_MAIS_INFINITIVO = /^(?:(?:e|ai|entao)\s+)?(?:eu\s+|a gente\s+)?(?:vou|vamos|vai)\s+(?:(me|se|nos)\s+)?([a-z]+?(?:ar|er|ir|or))\b(.*)$/;
const doFuturo = (t) => {
  const m = t.match(VOU_MAIS_INFINITIVO);
  if (!m || m[2] === "tentar") return "";
  const p = noPresente(m[2]);
  return p ? ((m[1] ? "me " : "") + p + m[3]).trim() : "";
};

/* ---------------- 1d. AS AÇÕES ENCADEADAS ----------------
   Rodada 3 (§10.4 nº 3 e 14): «aí eu pego a tocha e desço», «vou fazer o
   seguinte: distraio o guarda e…». A frase se parte nos conectores; a régua
   julga cada ato e fica com o que tem oposição na cena. */
export const CONECTORES_DE_ATOS = /\s*[.;!:?]\s+|\s+e\s+(?=[a-z]+(?:ar|er|ir)\b)|\s*:\s*|,?\s+(?:e\s+)?(?:ai|depois|entao|enquanto isso|em seguida|logo depois)\s+(?:eu\s+)?|,\s*e\s+(?=eu\s)/;
export function atosDaFrase(frase) {
  if (typeof frase !== "string") return Object.freeze([]);
  /* a pontuação some no `nrm`; antes, cada ponto vira a interrogação, que ele
     guarda e que os conectores partem */
  const cru = escrita(nrm(String(frase).replace(/[.;!:]+(?=\s|$)/g, " ? ")));
  const t = cru.replace(/^(?:entao\s+)?(?:eu\s+)?vou fazer o seguinte\s*\??\s*/, "").replace(/^(?:e\s+)?ai\s+(?:eu\s+)?/, "");
  /* o plano («vou fazer o seguinte:») parte também no «e»: cada um faz uma
     coisa, e a régua julga a arriscada */
  const plano = t !== cru && /^(?:entao\s+)?(?:eu\s+)?vou fazer o seguinte/.test(cru);
  /* o ato que começa no infinitivo herda a tentativa da frase («tento
     acalmar o povo e convencer eles…» → «tento convencer eles…») */
  const partes = t.split(CONECTORES_DE_ATOS).flatMap((x) => (plano ? String(x || "").split(/\s+e\s+/) : [x])).map((x) => (x || "").replace(/\?/g, " ").trim().replace(/^(?:e\s+)?(?:ai|depois|entao|em seguida|logo depois)\s+(?:eu\s+)?/, "")).filter((x) => x.split(/\s+/).length >= 2)
    .map((x) => (/^[a-z]+(?:ar|er|ir)\b/.test(x) && !/^(?:e|ai|entao)\b/.test(x) ? "tento " + x : x));
  return Object.freeze(partes.length >= 2 ? partes : []);
}

/* ---------------- 1e. A PERÍCIA NOMEADA ----------------
   Rodada 3 (§10.4 nº 11 e 12): «mando uma percepção», «jogo um intimidante»,
   «meu stealth» — também em inglês. A perícia diz o desafio do catálogo (o
   mesmo de `desafioPorPericia`); se aquilo tem razão de existir, quem diz é
   a régua, pela cena. */
export const PERICIA_NOMEADA = Object.freeze([
  Object.freeze({ pericia: "furtividade", rx: /stealth|furtiv\w*|sneak/ }),
  Object.freeze({ pericia: "percepcao", rx: /percep\w*|perception|perceber/ }),
  Object.freeze({ pericia: "intuicao", rx: /intui\w*|insight/ }),
  Object.freeze({ pericia: "intimidacao", rx: /intimida\w*|intimidation/ }),
  Object.freeze({ pericia: "persuasao", rx: /persua\w*|diplomacia|persuasion/ }),
  Object.freeze({ pericia: "enganacao", rx: /engana\w*|deception|blefe/ }),
  Object.freeze({ pericia: "investigacao", rx: /investiga\w*|investigation/ }),
  Object.freeze({ pericia: "atletismo", rx: /atletismo|athletics/ }),
  Object.freeze({ pericia: "acrobacia", rx: /acrobac\w*|acrobatics/ }),
  Object.freeze({ pericia: "arcanismo", rx: /arcan\w*/ }),
  Object.freeze({ pericia: "saberes", rx: /historia|history|religi\w*|natureza|nature|saberes/ }),
  Object.freeze({ pericia: "sobrevivencia", rx: /sobreviv\w*|survival/ }),
  Object.freeze({ pericia: "medicina", rx: /medicina|medicine/ }),
  Object.freeze({ pericia: "prestidigitacao", rx: /prestidigit\w*|sleight/ }),
  Object.freeze({ pericia: "atuacao", rx: /atuacao|performance/ }),
]);
const PEDE_A_PERICIA = /\b(?:jogo|mando|dou|rolo|rolar|solto|tiro|faco|uso|testo|passo|meu|minha|teste de|rolagem de|check de)\s+(?:um\s+|uma\s+|de\s+|o\s+|a\s+)?([a-z]+(?:\s+of\s+hand)?)/;
export function periciaNomeada(frase) {
  const t = escrita(nrm(frase));
  const m = t.match(PEDE_A_PERICIA);
  const alvo = m ? m[1] : "";
  if (!alvo) return "";
  const p = PERICIA_NOMEADA.find((x) => x.rx.test(alvo));
  return p ? p.pericia : "";
}

/* «dar uma intimidada», «dar uma geral»: o ato virou substantivo. A troca
   devolve o verbo ao catálogo. */
export const ATO_EM_SUBSTANTIVO = Object.freeze([
  Object.freeze({ rx: /\bdar? uma geral\b/, por: "revistar" }),
  Object.freeze({ rx: /\bdar? uma (?:olhada|espiada|conferida|checada|vistoria)\b/, por: "examinar" }),
  Object.freeze({ rx: /\bdar? uma (?:prensa|apertada|enquadrada)\b/, por: "intimidar" }),
  Object.freeze({ rx: /\bdar? uma (\w+)ada\b/, por: "$1ar" }),
]);

/* as condições da cena que as formas pedem */
const inerte = (p) => p.estados.includes("morta") || p.estados.includes("desacordada");
const temPessoa = (c) => c.pessoas.some((p) => !inerte(p));
const temPessoaQueNota = (c) => c.pessoas.some((p) => !p.estados.includes("do_grupo") && !inerte(p));
const temCriatura = (c) => c.criaturas.length > 0;
const haRaro = (c) => c.cena.estados.includes("assunto_raro");
const haAchado = (c) => c.coisas.some((x) => x.estados.includes("ha_algo_escondido") || x.estados.includes("armadilhado") || x.estados.includes("suspeito"));
const haRastro = (c) => c.coisas.some((x) => ["rastro_fresco", "rastro_velho"].includes(x.estados.find((e) => e.startsWith("rastro_")) || ""));
/* a pergunta só é gesto quando não há a quem perguntar: com um estranho vivo
   em cena, «há estalagem no caminho?» é para ele, e pergunta não rola */
const ninguemAQuemPerguntar = (c) => !temPessoaQueNota(c);

/* ---------------- 2. A FALA QUE PEDE ----------------
   A forma da fala diz o ato social, mesmo sem o verbo do catálogo. Só vale
   quando há quem ouça (uma pessoa viva na cena); a régua decide pelo estado
   dela — e, porque é a leitura mais fraca, a fala ouvida aqui só rola quando
   quem ouve tem motivo para negar (a linha `falaSemOposicao` da régua). A
   ordem é a da força: a ameaça antes da mentira, a mentira antes do pedido.
   `diz`: como o catálogo ouve o ato — o verbo dele à frente da frase do
   jogador, para a conta do pedido (social.js) ler o pedido inteiro. */
export const FORMAS_DA_FALA = Object.freeze([
  /* rodada 3: a ameaça sem o verbo — a arma à mostra (§10.4 nº 16; a
     condicional já estava na linha seguinte) */
  Object.freeze({ id: "intimidar", diz: "ameaço ele:", rx: /^(?!.*\batac).*\b((mostro|ergo|levanto|aponto|encosto|exibo|bato com) (a|o|minha|meu|as|os)\s+(\w+\s+)?(faca|adaga|espada|machado|lamina|arma|punhal|cabeca|besta|arco|martelo|clava|porrete))\b/ }),
  Object.freeze({ id: "intimidar", diz: "ameaço ele:", rx: /\b(se (ele|ela|voce|vc|tu|o senhor) nao\b[^?.!]{0,60}\b(vai|vou|a guarda|morre|quebro|conto|acabo)|pressiono|aperto (ele|ela)|encosto (ele|ela) na parede|bato (a mao|o punho|com a mao) na mesa|ameac\w*|senao (eu|a guarda|vai)|ou (ele|ela|voce|vc) (me )?(fala|diz|conta|abre|entrega)|ou eu (te |lhe |a |o )?(levo|conto|entrego|mato|quebro|corto|chamo))\b/ }),
  /* 19/11 (o-mestre-vivo.md §18): a ameaça pela condição com a consequência
     depois («se ela não me disser o nome agora, as chaves voltam — a vírgula
     some na normalização, então conta o que vem depois da exigência
     pro conselho»), e pelo fim que a frase promete («ou não sai daqui
     inteiro», «ou vai se arrepender») — sessão mv-2, T8 e T30 */
  Object.freeze({ id: "intimidar", diz: "ameaço ele:", rx: /^(?!.*\bpergunt).*\b(se (ele|ela|voce|o senhor|a senhora) nao (me |nos )?(diz|disser|conta|contar|fala|falar|abre|abrir|entrega|entregar|der|devolve|devolver|paga|pagar|obedece|obedecer|sai|sair)\b(\s+[a-z]+){4,}|ou (ele |ela |voce )?(nao )?(sai|saira) (daqui |dali )?(vivo|viva|inteiro|inteira|de pe)|ou (ele |ela |voce )?vai se arrepender|pensa (bem )?no que vai (responder|dizer|fazer)|aperto (o|a) \w+ ate (ele|ela) (cuspir|falar|contar|abrir|entregar))/ }),
  /* 19/11 (§18): a mentira dita direto, sem verbo de dizer — «sou primo do
     barão, ele tá me esperando» (exame A, E330): o herói se dá um parentesco,
     um cargo ou uma licença logo de saída */
  Object.freeze({ id: "mentir", diz: "minto para ele:", rx: /^(?:eu )?sou (?:o |a |um |uma )?(?:primo|prima|sobrinho|sobrinha|filho|filha|irmao|irma|enviado|enviada|mensageiro|mensageira|fiscal|inspetor|inspetora|agente|emissario|emissaria|oficial|representante|criado|criada)\b/ }),
  Object.freeze({ id: "mentir", diz: "minto para ele:", rx: /\b((digo|falo|afirmo|juro|garanto|conto|explico)\b[^?.!]{0,40}\bque\b[^?.!]{0,30}\b(venho|sou|estou|trabalho|fui mandad\w*|me mand\w*|me espera\w*|a servico d\w*|em nome d\w*|autorizad\w*|tenho permissao|sou amigo)|me faco passar|faco-me passar|me passo por|finjo ser|nego que)\b/ }),
  /* rodada 3: a barganha (§10.4 nº 15): «e se eu…», «pelo menos…» */
  Object.freeze({ id: "convencer", diz: "tento convencer ele:", rx: /\b(e se eu (te |lhe )?[a-z]+(ar|er|ir)|pelo menos (me )?(deixa|da|libera|vende|conta|mostra))\b/ }),
  Object.freeze({ id: "convencer", diz: "tento convencer ele:", rx: /\b(peco|pecar|insisto|imploro|suplico|negocio|pechincho|barganh\w*|descont\w*|suborn\w*|exijo|chega de mentir|quero o nome|e eu (te |lhe )?(dou|entrego|pago|limpo|ajudo|conto)|eu (te |lhe )?(dou|entrego|pago) [^?.!]{0,20}se|pago [^?.!]{0,30}(pra|para) (ele|ela) (fechar|deixar|esquecer|me deixar|olhar)|vamos conversar|vamos fazer um trato|(vc|voce|ele|ela|o senhor) (solta|soltar|deixa|libera|abre|me da|me vende)|grito (pra|para) (todo mundo|todos|a multidao|o povo|a gente)|virar (amigo|parceiro|camarada)|faco amizade|conto umas piadas)\b/ }),
  /* 19/11 (o-mestre-vivo.md §17): a barganha pelo preço — «faz pelo preço
     normal ou eu procuro outro», «pela metade do preço» (sessão mv-1) */
  Object.freeze({ id: "convencer", diz: "tento convencer ele:", rx: /\b(preco (normal|justo|de sempre|de tabela|certo|menor)|metade do preco|(faz|deixa|fica|sai) (por )?mais barato|abatimento|faz (por|pelo) (menos|\d+|dez|vinte|trinta|quarenta|cinquenta)|baix\w* o preco|(pagar|pago|ofereco|oferecer) (bem |muito |um pouco )?menos)\b/ }),
  /* a fala dirigida sem forma de pedido: o verbo de dizer, a quem tem motivo
     para negar. A pergunta fica de fora (pergunta não rola). */
  Object.freeze({ id: "convencer", diz: "tento convencer ele:", se: (c) => c.pessoas.some((p) => !inerte(p) && p.estados.some((e) => OPOEM_A_FALA.includes(e))),
    rx: /^(?!.*\bpergunt)(?!.*\?\s*$).*\b(digo|falo|grito|explico|conto|aviso|mando|ordeno|proponho|ofereco|prometo|garanto|juro|argumento|lembro (a|ao|ele|ela))\b/ }),
]);
/* a fala direta: aspas, ou um vocativo curto antes da vírgula no começo */
const FALA_DIRETA = /["“”«»—]|^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?,\s/;
/* os estados de pessoa que fazem a fala dirigida virar tentativa */
const OPOEM_A_FALA = Object.freeze(["motivo_para_negar", "hostil", "desconfiada"]);

/* ---------------- 3. O ATO, POR FAMÍLIA DE FORMAS ----------------
   `id` é o desafio do catálogo; a frase que o catálogo ouve é a dele
   (`comoSeDiz`), ou, com `sobre`, «o que eu sei sobre…» com a frase dentro
   (para a régua do saber comum comparar o assunto com a ficha). `se`
   (opcional) é a condição da cena para a forma valer. A ordem decide: a
   memória antes do «vasculhar», o ouvido antes do olho. */
export const FORMAS_DO_ATO = Object.freeze([
  /* 21/11 (o-mestre-vivo.md §20): três atos da quarta sessão que o catálogo
     não ouve, ouvidos só pela escuta (o Mestre vivo) para o jogo com a chave
     desligada não mudar: a fala que a própria frase desmente («falo pro Perrin
     que perdi as chaves, mas elas estão no meu bolso»); a fuga em primeira
     pessoa («fujo da Isolde armada» — a régua decide o perigo pela fuga
     declarada); e os obstáculos pulados no caminho («pulando os caixotes»).
     «Grito pra todo mundo fugir» não é a fuga do herói (o exame, E103). */
  Object.freeze({ id: "mentir", rx: /\b(digo|falo|conto|juro|garanto|explico)\b[^?.!]{0,60}\bmas (na verdade|e mentira|nao e verdade|el[ae]s? (esta|estao)|(esta|estao) (no|na|nos|nas) (meu|minha|meus|minhas))\b/ }),
  /* a fuga só com o corpo em jogo dito (o obstáculo pulado, a arma de quem vem
     atrás): «Fujo da aranha gigante» é movimento (o corpus das situações) */
  Object.freeze({ id: "saltar", rx: /\b(fujo|tento fugir|saio correndo d[aeo]s?)\b[^?.!]{0,60}\b(pulando|saltando|armad[oa]s?|de (faca|espada|adaga|arco|besta)( na mao| em punho)?)\b/ }),
  Object.freeze({ id: "saltar", rx: /\b(pulando|saltando) ((os|as|uns|umas) )?(caixotes|barris|cercas?|bancas|mesas|caixas|carrocas|muretas?|grades|obstaculos|barracas)\b/ }),
  Object.freeze({ id: "lembrar", sobre: true, rx: /\b(procuro na memoria|puxo pela memoria|vasculho a memoria|reviro a memoria|lembro (de )?(alguma coisa|algo))\b/ }),
  Object.freeze({ id: "escutar", rx: /\b(ouvir (o que|alguma|algo|se|a conversa|melhor)|escut(o|ar) (o que|atras|na|pela|a conversa)|apuro o ouvido|encosto o ouvido|colo o ouvido|ouvido (na|a|colado)|presto atencao (ao|aos|a|as|no|na) (som|sons|barulho|ruido|conversa|vozes)|fico quieto e escuto|paro e escuto|o que (se passa|dizem) (la|do outro lado|atras))\b/ }),
  /* as duas seguintes vêm do classificador do protótipo (mente/classificador-
     prototipo.md), usado como farejador: os traços de maior peso dele para
     «investigar», treinados só com os nossos corpus (o de «atuar» foi
     tentado e saiu: ouvia o canto entre os seus como encenação) */
  Object.freeze({ id: "investigar", rx: /\b(deduz\w*|analis\w*|vestigios|quem fez (isto|isso)|o que aconteceu aqui|me agacho e (olho|examino|observo))\b/ }),
  /* ler a pessoa: a frase julga a sinceridade, a intenção ou o nervo de
     alguém da cena (dita ao Mestre, não a ela: sem «você») */
  /* rodada 3: ler a pessoa pela cara dela («muda de cara», «sacar se») */
  Object.freeze({ id: "mentira", se: temPessoaQueNota, rx: /^(?!.*\b(voce|tu)\b).*\b((falando|dizendo|contando) a verdade|de rolo com|mud\w* de (cara|cor)|se (ele|ela) (treme|hesita|vacila|gagueja|engole seco|desvia)|sacar (se|qual)|qual (e|eh) a (dele|dela))\b/ }),
  Object.freeze({ id: "mentira", se: temPessoaQueNota, rx: /^(?!.*\b(voce|vc|tu)\b).*\b(mentindo|sincer\w*|confiar nel\w*|confiavel|blef\w*|escondendo (algo|alguma coisa)|nervos\w*|enrolando|me enganando|quer de verdade|intencao|intencoes|a cara del\w*|os olhos del\w*|a reacao del\w*|o jeito del\w*|leio (ele|ela|o rosto|a expressao))\b/ }),
  Object.freeze({ id: "seguir_alguem", se: temPessoaQueNota, rx: /\b(sig\w*|acompanho)\b[^?.!]{0,30}\b(discretamente|de longe|a (uma )?distancia|pela multidao|no meio da multidao|ate ver (onde|para onde|pra onde)|sem (que|ser))\b/ }),
  /* rodada 3: a furtividade pelo advérbio (§10.4 nº 13) */
  Object.freeze({ id: "furtar_se", rx: /\b(discretamente|sorrateiramente|devagarinho|sem chamar (a )?atencao|na moita|na miuda|sem ninguem (reparar|ver|notar|perceber)|sem que (ninguem|ele|ela|eles|elas) (veja|vejam|perceba|percebam|note|notem|repare|reparem)|(encostad|colad|rente)\w* (na|a|com a) parede|sumir (dali|daqui)|dou no pe)\b/ }),
  Object.freeze({ id: "furtar_se", rx: /\b(pe ante pe|ponta dos pes|de fininho|de mansinho|sem fazer (barulho|ruido)|sem ser (vist|notad|percebid)\w*|na surdina|escapo pela|escapulo|me escapo|saio escondid\w*|me esgueir\w*|sem ninguem (ver|notar|perceber)|me misturo (na|no|com)|fico nas sombras|pelas sombras|me abaixo atras|me agacho atras)\b/ }),
  /* 19/11 (§17): o furto dito pelo verbo de roubar e pelo que se tira — a
     vítima está na frase («do bolso de um bêbado»), e a régua decide se
     alguém pode notar (A_VITIMA_DO_FURTO); por isso sem condição de cena */
  Object.freeze({ id: "bater_carteira", rx: /\b(roub\w*|furt(o|ar|ei)|bato a carteira|bater a carteira)\b[^?.!]{0,30}\b(bolsa|bolsinha|bolso|carteira|algibeira|moedas|anel|colar)\b/ }),
  /* 19/11 (§18): o furto dito por «tirar» e por DE ONDE se tira — «tento
     tirar a bolsa de moedas do cinto dele sem ele sentir» (sessão mv-2, T9):
     o cinto, o bolso, o pescoço de alguém é a vítima na frase */
  Object.freeze({ id: "bater_carteira", rx: /\b(tiro|tirar|pego|pegar|puxo|puxar|surrupio|surrupiar|afano|afanar|arranco|arrancar|solto|soltar)\b[^?.!]{0,40}\b(bolsa|bolsinha|carteira|algibeira|moedas|anel|colar|chaves?|amuleto|medalhao)\b[^?.!]{0,30}\b(d[oa] (bolso|cinto|cinturao|pescoco|pulso|dedo|mao) (dele|dela|d[oa] \w+)|sem (que )?(ele|ela) (sentir|sinta|perceber|perceba|notar|note|ver|veja))/ }),
  /* a mão leve sem o verbo do catálogo: guardar escondido o que é de outro */
  Object.freeze({ id: "bater_carteira", se: temPessoaQueNota, rx: /\b(embolso|escondo na manga|enfio no bolso|guardo no bolso|passo a mao n\w*|afano|surrupio)\b/ }),
  Object.freeze({ id: "saltar", rx: /\b((pulo|salto|pular|saltar|me jogo|me atiro)\s+(da|do|de|das|dos|pela|pelo|para fora)|dou um (pulo|salto))\b/ }),
  Object.freeze({ id: "escalar", rx: /\b(desco|descer|subo|subir|trepo|trepar|me penduro|me pendurar|escorrego|deslizo)\b[^?.!]{0,30}\b(muro|muralha|parede|corda|arvore|penhasco|telhado|janela|torre|rocha|barranco|encosta|poco|fosso)\b/ }),
  Object.freeze({ id: "equilibrio", rx: /\b(passo|passar|atravesso|atravessar|cruzo|cruzar|vou passando|corro|correr)\b[^?.!]{0,30}\b(ponte|pinguela|viga|tabua|corda bamba|beiral|parapeito|tronco|borda|beirada)\b/ }),
  Object.freeze({ id: "escapar", rx: /\b(escapo|me solto|me livro|me desvencilho|passo espremid\w*|passo de lado)\b[^?.!]{0,30}\b(abraco|agarr\w*|cordas?|grade|correntes?|algemas?|maos|pegada|fresta|vao)\b/ }),
  Object.freeze({ id: "nadar", rx: /\b(mergulho|mergulhar)\b/ }),
  Object.freeze({ id: "buscar", rx: /\b(reviro|revirar|vasculh\w*|revist\w*|fuco|fucar|apalpo|dou uma geral|olho bem|examino bem)\b/ }),
  Object.freeze({ id: "buscar", rx: /\b(olho|procuro|corro os olhos|passo os olhos)\b[^?.!]{0,40}\b(pra|para) ver se (acho|encontro|vejo|tem|ha)\b/ }),
  Object.freeze({ id: "buscar", rx: /\bfico (olhando|observando|de olho|atento)\b[^?.!]{0,20}\bse\b/ }),
  Object.freeze({ id: "buscar", rx: /\b(cheiro|farejo|provo um pouco)\b/ }),
  Object.freeze({ id: "bater_carteira", se: temPessoaQueNota, rx: /\b((pego|tiro|puxo|levo|afano|surrupio|arranco)\s+(a|o|as|os)\s+(bolsa|bolsinha|carteira|chave|chaves|anel|colar|moedas|faca|adaga|algibeira|sacola)\s+(dele|dela|do|da)|(pego|tiro|puxo|levo)\b[^?.!]{0,30}\benquanto (ele|ela) (olha|esta distraid\w*|nao ve|vira|se vira))\b/ }),
  Object.freeze({ id: "acalmar_bicho", se: temCriatura, rx: /\b(sussurro|falo baixo|falo manso|estendo a mao|acaricio|afago|faco carinho)\b/ }),
  Object.freeze({ id: "forcar", rx: /\b(queda de braco|braco de ferro|faco (toda a )?forca|empurro com tudo|puxo com (toda|tudo)|(dobr\w*|entort\w*|afasto|ergo|levanto|arrasto)\b[^?.!]{0,20}\b(barras?|laje|pedregulho|rocha|bloco|viga|tronco caido|grade))\b/ }),
  Object.freeze({ id: "aguentar", se: temPessoa, rx: /\b(agarro|seguro|pego)\s+(a mao|o braco|o pulso|a corda)\b[^?.!]{0,40}\b(puxo|ergo|levanto|ico|seguro firme)\b/ }),
  Object.freeze({ id: "aguentar", rx: /\b(resist\w* (a|ao|as|aos) (veneno|febre|frio|dor|fome|sede|cansaco|gas|fumaca|calor|doenca|sono)|nao desmaiar|mesmo desconfiando)\b/ }),
  Object.freeze({ id: "heraldica", rx: /\b(emblema|brasao|insignia|tatuagem|sinete|estandarte|flamula)\b[^?.!]{0,40}\b(de onde|de quem|origem|a quem pertence|que casa|que ordem)\b/ }),
  Object.freeze({ id: "arcano", rx: /\b((ler|leio|decifr\w*|entender|traduzir)\b[^?.!]{0,30}\b(livro|grimorio|runas?|inscric\w*|pergaminho|feitic\w*)|(sentir|sinto)\b[^?.!]{0,20}\b(magia|encant\w*|feitic\w*|o que (e|ela e|ele e)))\b/ }),
  Object.freeze({ id: "falsificar", rx: /\b(imitando a letra|imito a letra|imito a assinatura|forjo|copio o selo)\b/ }),
  Object.freeze({ id: "orientar", rx: /^(?!.*\bpergunt).*\b(que horas (sao|devem ser)|ideia d[ae] (que )?hora|(pra|para) que lado (fica|e)|onde fica o norte|qual (e o|o) (rumo|norte)|(leio|consulto|estudo) o mapa|pelas estrelas|pelo sol|acho o (rumo|caminho|norte))\b/ }),
]);

/* ---------------- 4. A PERGUNTA QUE É GESTO ----------------
   Perguntar não rola (estudo das mesas §6) — salvo quando a pergunta É o
   gesto: lembrar um assunto raro, procurar o rastro, ver o que há ali. A
   condição da cena é o que separa a pergunta do gesto: há o que saber ou
   achar, e não há a quem perguntar. */
export const PERGUNTAS_QUE_SAO_GESTO = Object.freeze([
  Object.freeze({ id: "rastrear", rx: /\b(rastros?|pegadas?|pisadas?|trilha de)\b/, se: (c) => (haAchado(c) || haRastro(c)) && ninguemAQuemPerguntar(c) }),
  Object.freeze({ id: "buscar", rx: /\b(tem|ha|existe)\b[^?.!]{0,40}\b(aqui|ali|por aqui|nas|nos|no|na|dentro)\b/, se: (c) => haAchado(c) && ninguemAQuemPerguntar(c) }),
  Object.freeze({ id: "lembrar", sobre: true, rx: /\?\s*$/, se: (c) => haRaro(c) && ninguemAQuemPerguntar(c) }),
]);

/* a pergunta dirigida a alguém (a fala entre aspas, o «pergunto», o você)
   nunca é gesto de saber */
const FALA_DIRIGIDA = /["“”«»]|\b(pergunto|digo|falo|peco|respondo|voce|vc|tu|senhor|senhora)\b/;

/* o veredito do catálogo para a frase traduzida, se for teste */
function oCatalogoOuve(frase, leitura) {
  let v = null;
  try { v = lerAcao(frase, leitura); } catch { v = null; }
  return v && v.tipo === "teste" ? v : null;
}
const semMoldura = (t) => {
  for (const rx of MOLDURAS_DO_ATO) { const m = t.match(rx); if (m && m[1] && m[1].trim()) return m[1].trim(); }
  return "";
};
const verbal = (t) => ATO_EM_SUBSTANTIVO.reduce((s, x) => s.replace(x.rx, x.por), t);
/* A primeira do plural vira a do singular: «-amos/-emos/-imos» → «-o», e o
   «nos» átono antes do verbo vira «me». Os verbos que não são ação de
   ninguém («vamos», «somos», «estamos», «temos») ficam como estão. */
export const PLURAL_QUE_FICA = Object.freeze(["vamos", "somos", "estamos", "temos", "podemos", "devemos", "queremos", "precisamos", "fomos", "ficamos"]);
const emSingular = (t) => t
  .replace(/\bnos (?=\w+(amos|emos|imos)\b)/g, "me ")
  .replace(/\b(\w{2,}?)(amos|emos|imos)\b/g, (m, raiz) => (PLURAL_QUE_FICA.includes(m) ? m : raiz + "o"));
const pelaForma = (lista, t, c) => lista.find((f) => f.rx.test(t) && (!f.se || f.se(c))) || null;
const fraseDe = (f, t, ctx) => oCatalogoOuve(f.sobre ? `o que eu sei sobre ${t}?` : comoSeDiz(f.id), ctx);

/* ---------------- 5. O PALPITE DA CENA (rodada 3) ----------------
   A ordem é a da força da regra no estudo (§6): a conversa com quem tem
   motivo para negar, o esgueirar onde alguém vigia, a busca onde há o que
   achar, a travessia onde o chão pune. */
/* só a moldura que ABRE a frase e tem um ato depois: «tentando respirar» no
   meio de uma narração não é pedir licença */
export const MOLDURA_DO_PALPITE = /^(?:e |entao )?(?:eu )?(?:posso|poderia|consigo|conseguiria|da (?:pra|para)(?: eu)?|daria (?:pra|para)|sera que(?: eu)?(?: consigo)?|vou tentar|tento|queria ver se(?: eu)?(?: consigo)?)\s+\w+/;
export const PERGUNTA_DE_INFORMACAO = /\b(onde|quem|quanto|quantos|quantas|qual|quais|quando|por que|porque|o que|pergunt\w*|sabe|sei|conhec\w*|lembr\w*)\b/;
export const PALPITE_DA_CENA = Object.freeze([
  Object.freeze({ id: "convencer", se: (c) => c.pessoas.some((p) => !inerte(p) && p.estados.some((e) => OPOEM_A_FALA.includes(e))) }),
  Object.freeze({ id: "furtar_se", se: (c) => c.coisas.some((x) => x.estados.includes("vigiado")) || c.cena.estados.includes("territorio_de_alguem") }),
  Object.freeze({ id: "buscar", se: (c) => haAchado(c) }),
  Object.freeze({ id: "escalar", se: (c) => c.cena.estados.includes("perigo_fisico") || c.coisas.some((x) => x.estados.some((e) => ["fragil", "escorregadio", "em_movimento"].includes(e))) }),
]);

/* ---------------- A ESCUTA ----------------
   `frase`: o que o jogador escreveu. `cena`: a cena (crua ou lida); sem
   cena, devolve null (a escuta não existe sem cena). `leitura`: o contexto
   de `lerAcao` (personagem, lugar, pessoaDe…). Devolve o veredito do
   catálogo para o ato que a frase esconde, com `escuta` dizendo por qual
   porta ele foi ouvido — ou null. */
export function escutarComCena(frase, cena, leitura) {
  const c = lerCena(cena);
  if (!c || typeof frase !== "string" || !frase.trim()) return null;
  const ctx = obj(leitura) ? leitura : {};
  const t = escrita(nrm(frase));
  const semInterrogacao = t.replace(/\?\s*$/, "").trim();
  const pergunta = /\?\s*$/.test(t);
  const marca = (v, porta) => (v ? Object.freeze({ ...v, escuta: porta }) : null);
  /* rodada 3: «(eu) vou + infinitivo» — o verbo de dentro, no presente */
  const futuro = doFuturo(semInterrogacao);
  if (futuro) {
    const v = oCatalogoOuve(futuro, ctx);
    if (v) return marca(v, "futuro");
  }
  /* rodada 3: a perícia nomeada diz o desafio */
  const nomeada = periciaNomeada(semInterrogacao);
  if (nomeada) {
    const d = desafioPorPericia(nomeada);
    const v = d ? oCatalogoOuve(comoSeDiz(d.id), ctx) : null;
    if (v) return marca(v, "pericia");
  }
  /* 1. a moldura: o ato de dentro, como declaração */
  const dentro = semMoldura(semInterrogacao);
  const corpo = verbal(dentro || semInterrogacao);
  /* 0. a mesa fala em grupo: «nos escondemos», «tentamos abrir» — o
     catálogo foi escrito na primeira do singular */
  const singular = emSingular(semInterrogacao);
  if (singular !== semInterrogacao) {
    const v = oCatalogoOuve(singular, ctx);
    if (v) return marca(v, "grupo");
  }
  if (dentro) {
    /* rodada 3: o ato de dentro da moldura vem no infinitivo («posso forçar
       a fechadura?»); se o catálogo não o ouve depois de «tento», ouve-o no
       presente («forço a fechadura»), como ouve o «vou + infinitivo» */
    const v = oCatalogoOuve("tento " + corpo, ctx) || (doFuturo(corpo) ? oCatalogoOuve(doFuturo(corpo), ctx) : null)
      || (doFuturo("vou " + corpo) ? oCatalogoOuve(doFuturo("vou " + corpo), ctx) : null);
    /* o improviso é a família do verbo, a leitura mais vaga do catálogo:
       se a forma do ato diz mais («consigo ouvir…?» é escutar, não «olhar
       com atenção»), vale a forma */
    const a = v && v.id === "improviso" ? pelaForma(FORMAS_DO_ATO, corpo, c) : null;
    const pela = a ? fraseDe(a, corpo, ctx) : null;
    if (pela) return marca(pela, "moldura");
    if (v) return marca(v, "moldura");
  }
  /* 2. a fala que pede, se há quem ouça */
  if (temPessoa(c)) {
    /* a fala direta — entre aspas, ou chamando alguém pelo nome ou pelo
       ofício antes da vírgula («chefe, …») — é dirigida, mesmo sem verbo de
       dizer; vale como a última forma da tabela (a quem tem motivo para
       negar, e nunca a pergunta) */
    const direta = !pergunta && FALA_DIRETA.test(String(frase).trim());
    const f = pelaForma(FORMAS_DA_FALA, corpo, c)
      || (direta ? pelaForma(FORMAS_DA_FALA.slice(-1).map((x) => ({ ...x, rx: /./ })), corpo, c) : null);
    if (f) {
      /* 21/11 (a sexta sessão, T28/T33): a fala que o catálogo ouve e o livro
         de tentativas já fechou (o mesmo pedido à mesma pessoa) fica fechada —
         a frase-modelo do catálogo («tento convencer o guarda…») não é outra
         porta para o mesmo pedido, e a chave dela é a do guarda */
      let lida = null;
      try { lida = lerAcao(`${f.diz} ${frase}`, ctx); } catch { lida = null; }
      if (lida && lida.tipo !== "teste" && lida.chave) return null;
      const v = (lida && lida.tipo === "teste" ? lida : null) || oCatalogoOuve(comoSeDiz(f.id), ctx);
      if (v) return marca(v, "fala");
    }
  }
  /* 3. o ato pela forma */
  const a = pelaForma(FORMAS_DO_ATO, corpo, c) || (futuro ? pelaForma(FORMAS_DO_ATO, futuro, c) : null);
  if (a) {
    const v = fraseDe(a, corpo, ctx);
    if (v) return marca(v, "ato");
  }
  /* 5 (rodada 3). o palpite da cena: o catálogo e as formas não ouviram ato
     nenhum, mas a moldura pede licença ou tenta («posso…?», «vou tentar…»)
     — o jogador sabe que é arriscado. A cena diz o que é: quem tem motivo
     para negar, quem vigia, o que esconde, o chão que pune. Nunca a
     pergunta pela informação, e nunca sem cena que se oponha. */
  if (MOLDURA_DO_PALPITE.test(semInterrogacao) && !PERGUNTA_DE_INFORMACAO.test(t)) {
    const p = PALPITE_DA_CENA.find((x) => x.se(c));
    const v = p ? oCatalogoOuve(comoSeDiz(p.id), ctx) : null;
    if (v) return marca(v, "palpite");
  }
  /* 4. a pergunta que é gesto — nunca a dirigida a alguém */
  if ((pergunta || dentro) && !FALA_DIRIGIDA.test(String(frase).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""))) {
    const p = pelaForma(PERGUNTAS_QUE_SAO_GESTO, t, c);
    if (p) {
      const v = fraseDe(p, semInterrogacao, ctx);
      if (v) return marca(v, "pergunta");
    }
  }
  return null;
}

/* ---------------- A DÍVIDA DITA (21/11/2026, o-mestre-vivo.md §25) ----------------
   A quinta sessão jogada (T31): «regateio com Torvald, que me deve um favor,
   o preço das tochas do balcão» — e a prosa respondeu «Já me deves um favor»,
   com a dívida invertida. O Narrador não tinha, no turno, a direção da dívida
   que o jogador disse. Uma linha curta na pauta do turno (o canal por turno,
   nunca bloco estático) diz quem deve a quem, como o JOGADOR disse — o
   sistema não afirma que a dívida existe, só não deixa a prosa virá-la.
     aDividaDita(frase, quem) → null | { acabou: [linha], naoPode: [veto] }
   `quem`: a pessoa a quem a frase se dirige (a régua a achou), para o
   «ele me deve» sem nome. Sem «me deve» na frase, nada. */
export const A_DIVIDA_DITA = Object.freeze({
  deve: /\bme\s+(?:deve|devem|devia|deviam|esta devendo|ta devendo|estao devendo)\b/,
  nome: "([A-ZÀ-Ý][a-zà-ÿ]{2,})\\s*,?\\s+(?:que\\s+)?(?:ainda\\s+)?me\\s+(?:deve|devem|devia|deviam|est[aá] devendo|t[aá] devendo)",
  linha: "Eu disse que {quem} me deve um favor: se a dívida aparecer, é de {quem} comigo — nunca minha com {quem}.",
  veto: "fazer {quem} dizer ou dar a entender que sou eu quem deve um favor a {quem}",
});
const RX_DO_DEVEDOR = new RegExp(A_DIVIDA_DITA.nome, "u");
export function aDividaDita(frase, quem) {
  try {
    if (typeof frase !== "string" || !A_DIVIDA_DITA.deve.test(nrm(frase))) return null;
    const m = frase.match(RX_DO_DEVEDOR);
    const q = (m && m[1]) || (typeof quem === "string" ? quem.trim() : "");
    if (!q) return null;
    return Object.freeze({
      acabou: Object.freeze([A_DIVIDA_DITA.linha.replaceAll("{quem}", q)]),
      naoPode: Object.freeze([A_DIVIDA_DITA.veto.replaceAll("{quem}", q)]),
    });
  } catch { return null; }
}
