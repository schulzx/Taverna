/* ============================================================
   O CENÁRIO COMO ARQUIVO (Fase T, T4-B · o começo do modo autor, 28/10)

   "Um cenário novo (gêneros, ocupações, bestiário, preços, nomes, deuses)
   entra sem editar módulo" (mente/plano-motor.md, Fase 4). Até aqui o mundo
   morava DENTRO do motor: o preço da caneca era uma linha de economia.js, o
   Ferreiro uma linha de classes.js — e acrescentar um mundo era editar dez
   módulos. Quem compra o motor tem de trocar o mundo, e não o código.

   A DECISÃO DE FORMATO: um objeto de dados puro, JSON-compatível.
   - O cenário é só o que o JSON tem (texto, número, booleano, null, lista,
     objeto). Nada de função, regex literal ou conta: a regex é o TEXTO dela
     (`rx`), e o catálogo a compila. O validador recusa o que não for JSON.
   - Por isso o arquivo de um autor pode ser um `.json` de verdade — chega
     como texto, `JSON.parse`, `carregarCenario` —, e é assim que entra um
     mundo que não estava no bundle. Não executa nada do autor.
   - O cenário PADRÃO (o mundo de hoje) mora em `cenario-padrao.js`, um
     módulo que exporta esse mesmo objeto, porque importar `.json` pede
     `with { type: "json" }` no Node e não no Vite; um `.js` de dados abre
     igual nos dois, sem carregador.
   - O cenário é COMPLETO, nunca um remendo sobre o padrão: um campo que
     falta é recusado com o caminho dele ("precos.raridade.lendario: falta"),
     em vez de herdar em silêncio um preço de outro mundo. E o campo que o
     motor não lê também é recusado — um mundo escrito e que não acontece é
     o export morto do autor.

   AS SECÇÕES: `precos` e `ocupacoes` (1.ª fatia: economia.js, classes.js);
   `generos` (2.ª fatia: lexico.js e classes.js — o gênero que se assume
   quando o mundo não diz o seu, os gêneros cuja gente é a do futuro, e as
   marcas que, na descrição, fazem o mundo sair da fantasia clássica);
   `bestiario` (3.ª fatia: bestiario.js — as criaturas do mundo, os
   arquétipos genéricos e o corte por gênero; o motor chega-lhe por
   mundo-base.js, que chama `criaturasDoGenero` e por isso já vê o mundo
   novo sem ser tocado); `gente` e `panteao` (4.ª fatia: nomes.js — os
   bancos de nome de cada gênero, os povos, os ofícios e os traços do
   elenco; divindades.js — as metades do nome de um deus, os domínios e os
   cultos. A REGRA dos deuses — a escala de graus, a fé, o milagre, o
   despertar — fica no código: o cenário dá o céu, não a física dele. O
   motor lê os dois módulos por funções, nunca pelas tabelas, e por isso
   vê o mundo novo sem ser tocado); `lugares` e `racas` (5.ª fatia:
   toponimia.js — as palavras com que se nomeia a taverna e cada tipo de
   local, por gênero; classes.js e lexico.js — as raças e as origens da
   criação, com o bônus, a frase do traço e o efeito que tracos.js lê; e,
   no `panteao`, os títulos dos cinco graus e o sinal de cada temperamento,
   que eram um caso escrito no código. A REGRA fica: os padrões do nome, a
   escala de fiéis, o que cada efeito de raça faz); e, na 6.ª fatia, o que
   ainda prendia gente ao código: os `prontos` (prontos.js — os oito do
   roster, com a raça e o ofício do mundo; o feitio deles — classe, arma,
   índole — é vocabulário do motor) e, nas `racas`, o povo do companheiro
   (companheiros.js — a demografia com que o companheiro sorteado nasce, e
   as formas com que o registo do mundo diz uma raça) e, no `panteao`, as
   palavras do céu que o Narrador ainda lia escritas no código: os três
   estágios da ascensão (divindades.js DIVINDADE_PROMPT) e as palavras que só
   a fé dá (prompt.js, a linha "Palavras divinas") — e, na 7.ª fatia, a
   prosa do que um deus faz no mundo (divindades.js, os eventos divinos:
   os paladinos e o relicário eram texto do código); e, nos `generos`, os
   que a criação oferece (constantes.js GENEROS: o cartão, o rótulo e a dica
   de cada um), de que o gênero padrão é o de recuo do códex e do prompt
   quando o mundo não diz o seu. Os
   ofícios que o léxico renomeia (lexico.js PROFISSOES_DO_SISTEMA) não são
   secção: derivam dos nomes de `ocupacoes`, para que um mundo com outros
   ofícios não perca o léxico gerado.

   COMO OS CATÁLOGOS LEEM: cada catálogo assina `aoTrocarDeCenario(fn)` e
   deriva dali as suas tabelas, que exporta como antes (economia.js
   PRECOS_COMUNS, classes.js PROFISSOES…, agora `export let`: a ligação viva
   do ESM faz quem importou ver a tabela nova). Nada no App muda.
   `usarCenario` troca o mundo: valida primeiro, e só então avisa os
   catálogos. Trocar é ato de ARRANQUE — antes da campanha começar; quem
   copiou uma tabela no import fica com a antiga.

   Imutabilidade: o cenário carregado é uma cópia congelada a fundo; o dado
   que o autor passou não é tocado. Determinismo: o cenário não sorteia
   nada — a mesma semente com o mesmo cenário dá o mesmo resultado.
   ============================================================ */
import { DADOS_DO_CENARIO_PADRAO } from "./cenario-padrao.js";

/* ---------------- O ESQUEMA ----------------
   A tabela que o validador lê, e que a suíte lê de volta. Cada campo diz o
   seu tipo (um nome de `TIPOS`, abaixo); `?` no fim é campo opcional. */
export const ESQUEMA_DO_CENARIO = Object.freeze({
  formato: 1,
  raiz: Object.freeze({ formato: "inteiro", id: "texto", nome: "texto", precos: "objeto", ocupacoes: "lista", generos: "objeto", bestiario: "objeto", gente: "objeto", panteao: "objeto", lugares: "objeto", racas: "objeto", prontos: "lista" }),
  precos: Object.freeze({ escala: "textos", raridade: "objeto", semRaridade: "preco", miudeza: "preco", comuns: "lista" }),
  /* as raridades do motor (loot.js RARIDADES): as cinco que se vendem têm
     preço obrigatório; a única não se compra em banca, e o preço é opcional */
  raridade: Object.freeze({ comum: "preco", incomum: "preco", raro: "preco", epico: "preco", lendario: "preco", unico: "preco?" }),
  comum: Object.freeze({ id: "texto", nome: "texto", curto: "texto?", base: "preco", faixa: "faixa", rua: "booleano?", porPalavra: "booleano?", rx: "regex" }),
  ocupacao: Object.freeze({ nome: "texto", desc: "texto", beneficio: "texto", efeito: "objeto" }),
  /* o vocabulário do ofício (classes.js, PROFISSOES): cada campo tem UM
     ponto de consumo em profissoes.js; um nome fora daqui não faria nada */
  efeito: Object.freeze({ bancada: "mapa?", colher: "numero?", navegar: "numero?", teste: "mapa?", curaDescanso: "numero?", curaGrupo: "numero?", venda: "fracao?", compra: "fracao?", espolio: "fracao?", despojos: "numero?" }),
  /* os gêneros (lexico.js, classes.js racasDoGenero): `padrao` é o que o
     pedido do léxico assume quando o mundo não diz o seu; `futuristas`, os
     gêneros cuja gente é a do futuro (as origens, e não as raças de
     fantasia); `marcasProprias`, os textos das regexes que, na descrição
     (comparada sem acento e sem caixa), fazem o mundo de gênero próprio —
     e a ficha passa a dizer "Caçador Desperto (Humano)". As duas listas
     podem vir vazias: um mundo sem futuro, ou sem marca nenhuma. */
  generos: Object.freeze({ padrao: "texto", futuristas: "textos", marcasProprias: "regexes", criacao: "lista" }),
  /* 6.ª fatia (constantes.js GENEROS): os gêneros que a criação oferece, um
     cartão cada — `label` é o nome do gênero em todo o motor (é por ele que
     os bancos, o bestiário e o corte do futuro o chamam), `dica` a linha do
     cartão, `id` a chave da tela (o "livre" é o Universo próprio, que a tela
     põe à parte). O gênero padrão e os do futuro são gêneros da criação. */
  generoDaCriacao: Object.freeze({ id: "texto", label: "texto", dica: "texto", glifo: "glifo?" }),
  /* o glifo do cartão (29/10, trilha A): o JSON de um mundo não leva componente,
     então o cartão diz o NOME de um ícone deste vocabulário, e a tela (App.jsx,
     GLIFO_DO_GENERO) desenha cada um. Fechado: um nome fora daqui seria um ícone
     que nenhuma tela sabe desenhar. Sem glifo, o cartão vai sem ícone — como ia
     o gênero que a tabela da tela não conhecia. */
  glifos: Object.freeze(["castelo", "foguete", "terminal", "olho", "caveira", "bussola", "faiscas"]),
  /* o bestiário (bestiario.js): `generosDasCriaturas` veem as criaturas do
     mundo e os `emprestados` primeiros arquétipos; os outros gêneros, os
     arquétipos e as `emprestados` primeiras criaturas. Os nomes são únicos
     nas duas listas juntas (sem olhar a caixa): é por eles que
     `completarInimigo` acha a ficha do inimigo que o Narrador abre. */
  bestiario: Object.freeze({ generosDasCriaturas: "textos", emprestados: "contagem", criaturas: "lista", arquetipos: "lista" }),
  /* uma ficha: os campos que bestiario.js daFicha copia, nem mais nem menos */
  criatura: Object.freeze({ nome: "texto", ameaca: "ameaca", nivelRef: "nivel", des: "inteiro", desc: "texto", perfil: "objeto?", degrau: "degrau?", importante: "booleano?", genero: "generoDaFicha?" }),
  /* o gênero de uma ficha (29/10, trilha B): o gênero GRAMATICAL do nome — o
     de que a frase do desfecho concorda («a Quimera ficou cega») —, no
     vocabulário da gente (nucleo.js generoDaPessoa). Não é o gênero do MUNDO
     (`generos`, acima). Opcional: sem ele, o masculino genérico, como antes
     de o campo existir — e um mundo escrito antes dele continua válido. */
  generosDaFicha: Object.freeze(["mulher", "homem"]),
  /* o perfil de dano: os quatro campos que danos.js perfilDe lê */
  perfil: Object.freeze({ ataque: "elemento?", resist: "elementos?", fraqueza: "elementos?", imune: "elementos?" }),
  /* o vocabulário do motor que uma ficha pode usar: as ameaças (combate.js,
     degraus.js DEGRAU_POR_AMEACA), os degraus da mente (degraus.js DEGRAUS)
     e os tipos de dano (danos.js TIPOS_DANO). A suíte lê-os de volta. */
  ameacas: Object.freeze(["fraco", "comum", "competente", "elite", "lendario"]),
  degraus: Object.freeze(["animal", "bruto", "astuto", "treinado", "brilhante"]),
  elementos: Object.freeze(["fisico", "fogo", "gelo", "raio", "veneno", "sagrado", "sombrio", "arcano"]),
  /* a gente (nomes.js): `bancos` por gênero — o gênero sem banco usa o de
     `generos.padrao`, que por isso é obrigatório — e os traços do elenco */
  gente: Object.freeze({ tracos: "nomes", bancos: "objeto" }),
  /* um banco: os campos que nomes.js sorteia. `cidadeUnica` pode vir vazia
     (toda cidade é então prefixo + sufixo); as outras listas sorteiam
     sempre, e uma lista vazia daria uma pessoa sem nome */
  banco: Object.freeze({ cidadePre: "nomes", cidadeSuf: "nomes", cidadeUnica: "textos", masc: "nomes", fem: "nomes", sobrenome: "nomes", povos: "nomes", oficios: "nomes" }),
  /* o panteão (divindades.js): o nome de um deus é `inicio` + `fim`, o
     domínio traz o ícone e os temperamentos possíveis, e o culto é
     "<culto> de <nome>" */
  panteao: Object.freeze({ nomes: "objeto", dominios: "lista", cultos: "nomes", titulos: "lista", estagios: "nomes", palavrasDivinas: "nomes", eventos: "lista" }),
  /* 7.ª fatia (divindades.js gerarEventoDivino): o que um deus faz no mundo
     depois do despertar. `texto` e `gancho` são moldes com as marcas de
     `marcasDoEvento`; `dois` é o evento que precisa de um segundo deus (a
     guerra de fé) — sem ele no panteão, o evento não acontece e sorteia-se
     outro. QUAL evento sai é a sorte do motor; a prosa é do mundo. */
  eventoDivino: Object.freeze({ icone: "texto", texto: "texto", gancho: "texto", dois: "booleano?" }),
  /* as marcas que o molde de um evento pode usar, e o que cada uma diz:
     as do deus; as do segundo deus (só com `dois`); `lugar` leva duas formas
     ("com @|sem" — o @ é o lugar); `sorte` leva duas ou mais, e sorteia uma */
  marcasDoEvento: Object.freeze(["nome", "dominio", "icone", "culto", "sinal", "nome2", "icone2", "lugar", "sorte"]),
  nomeDivino: Object.freeze({ inicio: "nomes", fim: "nomes" }),
  /* `sinais` (5.ª fatia): o sinal impossível que o evento divino descreve,
     por temperamento — só dos temperamentos do próprio domínio */
  dominio: Object.freeze({ dominio: "texto", icone: "texto", temper: "nomes", sinais: "textosPorChave?" }),
  /* um grau da escala divina: só as palavras (os fiéis são física) */
  titulo: Object.freeze({ titulo: "texto", desc: "texto" }),
  /* os lugares (toponimia.js): `bancos` por gênero — o gênero sem banco usa
     o de `generos.padrao`, que por isso é obrigatório — e os substantivos de
     cada tipo de local que o motor nomeia (todos, nem mais nem menos) */
  lugares: Object.freeze({ bancos: "objeto", tipos: "objeto" }),
  bancoDeLugar: Object.freeze({ subst: "substantivos", adj: "adjetivos", compl: "nomes" }),
  /* os tipos de local que mundo-base.js e guildas.js pedem a nomeDeLocal; um
     tipo fora daqui nunca seria pedido. A suíte lê-os de volta dos moldes */
  tiposDeLocal: Object.freeze(["mercado", "templo", "forja", "quartel", "cadeia", "biblioteca", "docas", "arena", "cemitério", "guilda", "casa de banhos"]),
  /* as raças da criação (classes.js RACAS e ORIGENS): `fantasia` para os
     mundos que não são do futuro, `futuro` para os de `generos.futuristas`.
     O nome é o identificador — a ficha guarda-o, o léxico renomeia-o —, e é
     único nas duas listas juntas (sem olhar a caixa) */
  racas: Object.freeze({ fantasia: "lista", futuro: "lista", doCompanheiro: "lista", registo: "textosPorChave" }),
  /* 6.ª fatia (companheiros.js): `doCompanheiro` é o povo de quem o
     companheiro sorteado pode ser, com o peso de cada um — uma raça deste
     mundo, pelo nome exato (é ele que a pintura procura); `registo` são as
     palavras com que o registo do mundo diz uma raça que não é o nome do
     catálogo ("anã" → "Anão"), comparadas sem acento e sem caixa */
  povo: Object.freeze({ raca: "texto", peso: "nivel" }),
  /* um pronto (prontos.js): a raça e o ofício são do mundo; a classe, a
     subclasse, o antecedente, a arma, a armadura e a índole são vocabulário
     do motor (o montador devolve null se um deles não existir) */
  pronto: Object.freeze({ id: "texto", nome: "texto", papel: "texto", linha: "texto", sexo: "texto", raca: "texto", classe: "texto", subclasse: "texto", profissao: "texto", antecedente: "texto", atributos: "bonus", arma: "texto", armadura: "texto", escudo: "texto?", indole: "objeto", sementes: "textos", conceito: "texto" }),
  indole: Object.freeze({ tracos: "nomes", proposito: "texto" }),
  raca: Object.freeze({ nome: "texto", desc: "texto", bonus: "bonus", traco: "texto", efeito: "objeto" }),
  /* o vocabulário do traço: cada campo tem UM leitor em tracos.js (a suíte
     confere que é o que ele lê, nem mais nem menos) */
  efeitoDeRaca: Object.freeze({ refazer: "contagem?", vantagem: "atributos?", vantagemMental: "booleano?", imune: "condicoes?", resistencia: "elementos?", reduzDano: "reducao?", veNoEscuro: "medida?", ignoraDificil: "booleano?", oficio: "numero?", iniciativa: "numero?", sorteDoUm: "booleano?", firme: "booleano?", pedra: "booleano?", dom: "objeto?" }),
  /* o dom: a habilidade que a origem entrega pronta, na forma das da árvore */
  dom: Object.freeze({ nome: "texto", nivel: "nivel", custo: "contagem", tipo: "tipoDeHabilidade", descricao: "texto" }),
  /* o vocabulário do motor que uma raça pode usar: os atributos
     (constantes.js ATRIBUTOS), as condições de que um traço pode imunizar —
     as RUINS de condicoes.js CONDICOES (imune ao que ajuda não é traço) — e
     os tipos de habilidade (classes.js). A suíte lê-os de volta. */
  atributos: Object.freeze(["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao"]),
  condicoes: Object.freeze(["envenenado", "sangrando", "queimando", "atordoado", "paralisado", "caido", "agarrado", "cego", "amedrontado", "enfeiticado", "enfraquecido", "lento", "exausto", "marcado"]),
  tiposDeHabilidade: Object.freeze(["ataque", "defesa", "suporte", "utilidade", "passiva"]),
  /* os cinco graus da escala divina (GD 0–4): o número é o de divindades.js,
     e o cenário dá um título a cada um, nem mais nem menos */
  /* os três estágios da ascensão (o servo, o receptáculo, a divindade nova):
     o Narrador lê "os três estágios", e o número é o da trilha do motor */
  exato: Object.freeze({ titulos: 5, prontos: 8, estagios: 3 }),
  /* os mínimos: a criação abre na primeira ocupação, a rua mostra ao menos
     uma coisa, o encontro tem ao menos uma criatura para sortear, a gente
     ao menos um banco, o céu ao menos um domínio, e a criação ao menos uma
     raça de fantasia (e uma do futuro, se o mundo tem gêneros do futuro); o
     companheiro sorteado, ao menos um povo. E os prontos são OITO, nem mais
     nem menos: as quartas do torneio e o rodízio da arena contam com oito */
  minimo: Object.freeze({ ocupacoes: 1, comuns: 1, escala: 1, criaturas: 1, bancos: 1, dominios: 1, racas: 1, povo: 1, generos: 1, eventos: 1 }),
});

const ehObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const ehTexto = (v) => typeof v === "string" && v.trim().length > 0;
const ehNum = (v) => typeof v === "number" && Number.isFinite(v);
/* a forma que toponimia.js lê: "Palavra|g" (o gênero gramatical, e o p do
   plural) e "masculino|feminino" — uma barra a mais e o nome sairia torto */
const ehSubstantivo = (v) => ehTexto(v) && /^[^|]+(\|(m|f|mp|fp))?$/.test(v) && ehTexto(v.split("|")[0]);
const ehAdjetivo = (v) => ehTexto(v) && v.split("|").length <= 2 && v.split("|").every(ehTexto);
const regexOk = (v) => { if (!ehTexto(v)) return false; try { new RegExp(v); return true; } catch { return false; } };
/* cada tipo: o teste e o que a mensagem diz que se esperava */
const TIPOS = {
  texto: [ehTexto, "texto"],
  textos: [(v) => Array.isArray(v) && v.every(ehTexto), "lista de textos"],
  nomes: [(v) => Array.isArray(v) && v.length > 0 && v.every(ehTexto), "lista de textos, com ao menos um"],
  inteiro: [(v) => Number.isInteger(v), "número inteiro"],
  numero: [ehNum, "número"],
  preco: [(v) => ehNum(v) && v >= 0, "número ≥ 0"],
  fracao: [(v) => ehNum(v) && v >= 0 && v < 1, "fração entre 0 e 1"],
  booleano: [(v) => typeof v === "boolean", "verdadeiro ou falso"],
  objeto: [ehObj, "objeto"],
  lista: [Array.isArray, "lista"],
  mapa: [(v) => ehObj(v) && Object.values(v).every(ehNum), "objeto de números"],
  faixa: [(v) => v === null || (Array.isArray(v) && v.length === 2 && v.every(ehNum) && v[0] <= v[1]), "[mínimo, máximo] ou null"],
  regex: [regexOk, "texto de uma regex válida"],
  regexes: [(v) => Array.isArray(v) && v.every(regexOk), "lista de textos de regex válidas"],
  nivel: [(v) => Number.isInteger(v) && v >= 1, "número inteiro ≥ 1"],
  contagem: [(v) => Number.isInteger(v) && v >= 0, "número inteiro ≥ 0"],
  glifo: [(v) => ESQUEMA_DO_CENARIO.glifos.includes(v), `um glifo da tela (${ESQUEMA_DO_CENARIO.glifos.join(", ")})`],
  ameaca: [(v) => ESQUEMA_DO_CENARIO.ameacas.includes(v), `uma ameaça do motor (${ESQUEMA_DO_CENARIO.ameacas.join(", ")})`],
  degrau: [(v) => ESQUEMA_DO_CENARIO.degraus.includes(v), `um degrau do motor (${ESQUEMA_DO_CENARIO.degraus.join(", ")})`],
  elemento: [(v) => ESQUEMA_DO_CENARIO.elementos.includes(v), `um tipo de dano do motor (${ESQUEMA_DO_CENARIO.elementos.join(", ")})`],
  elementos: [(v) => Array.isArray(v) && v.every((x) => ESQUEMA_DO_CENARIO.elementos.includes(x)), `lista de tipos de dano do motor (${ESQUEMA_DO_CENARIO.elementos.join(", ")})`],
  generoDaFicha: [(v) => ESQUEMA_DO_CENARIO.generosDaFicha.includes(v), `o gênero do nome (${ESQUEMA_DO_CENARIO.generosDaFicha.join(" ou ")})`],
  /* 5.ª fatia */
  medida: [(v) => ehNum(v) && v >= 0, "número ≥ 0"],
  substantivos: [(v) => Array.isArray(v) && v.length > 0 && v.every(ehSubstantivo), "lista de substantivos (\"Palavra\" ou \"Palavra|g\", g = m, f, mp ou fp), com ao menos um"],
  adjetivos: [(v) => Array.isArray(v) && v.length > 0 && v.every(ehAdjetivo), "lista de adjetivos (\"masculino|feminino\", ou uma forma só), com ao menos um"],
  textosPorChave: [(v) => ehObj(v) && Object.values(v).every(ehTexto), "objeto de textos"],
  bonus: [(v) => ehObj(v) && Object.entries(v).every(([k, x]) => ESQUEMA_DO_CENARIO.atributos.includes(k) && Number.isInteger(x)), `objeto de atributos do motor (${ESQUEMA_DO_CENARIO.atributos.join(", ")}) com números inteiros`],
  atributos: [(v) => Array.isArray(v) && v.every((x) => ESQUEMA_DO_CENARIO.atributos.includes(x)), `lista de atributos do motor (${ESQUEMA_DO_CENARIO.atributos.join(", ")})`],
  condicoes: [(v) => Array.isArray(v) && v.every((x) => ESQUEMA_DO_CENARIO.condicoes.includes(x)), "lista de condições ruins do motor (condicoes.js)"],
  reducao: [(v) => ehObj(v) && Object.entries(v).every(([k, x]) => ESQUEMA_DO_CENARIO.elementos.includes(k) && ehNum(x)), `objeto de tipos de dano do motor (${ESQUEMA_DO_CENARIO.elementos.join(", ")}) com números`],
  tipoDeHabilidade: [(v) => ESQUEMA_DO_CENARIO.tiposDeHabilidade.includes(v), `um tipo de habilidade do motor (${ESQUEMA_DO_CENARIO.tiposDeHabilidade.join(", ")})`],
};

/* 7.ª fatia: o molde de um evento divino. Devolve os erros de UMA frase:
   a marca que o motor não conhece, a forma que falta, o segundo deus num
   evento de um só, e a chave solta (que sairia escrita no ecrã). */
function errosDoMolde(molde, onde, dois) {
  const erros = [];
  if (typeof molde !== "string") return erros;
  const sobra = molde.replace(/\{([^{}]*)\}/g, (_, dentro) => {
    const i = dentro.indexOf(":");
    const k = i < 0 ? dentro : dentro.slice(0, i);
    const formas = i < 0 ? null : dentro.slice(i + 1).split("|");
    if (!ESQUEMA_DO_CENARIO.marcasDoEvento.includes(k)) erros.push(`${onde}: marca desconhecida {${dentro}} (as do motor: ${ESQUEMA_DO_CENARIO.marcasDoEvento.join(", ")})`);
    else if (k === "lugar") { if (!formas || formas.length !== 2 || !formas[0].includes("@")) erros.push(`${onde}: {lugar} leva duas formas, com e sem o lugar ({lugar:perto de @|na região})`); }
    else if (k === "sorte") { if (!formas || formas.length < 2 || !formas.every((x) => x.trim())) erros.push(`${onde}: {sorte} leva duas formas ou mais ({sorte:aviso|promessa})`); }
    else if (formas) erros.push(`${onde}: {${k}} não leva formas`);
    else if ((k === "nome2" || k === "icone2") && dois !== true) erros.push(`${onde}: {${k}} é do segundo deus, e o evento não tem \`dois\``);
    return "";
  });
  if (/[{}]/.test(sobra)) erros.push(`${onde}: chave solta (uma marca é {nome}, entre chaves)`);
  return erros;
}

/* só o que o JSON tem — o arquivo de um autor não carrega código */
function foraDoJSON(v, onde, erros) {
  if (v === null || typeof v === "string" || typeof v === "boolean") return;
  if (typeof v === "number") { if (!Number.isFinite(v)) erros.push(`${onde}: número inválido`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => foraDoJSON(x, `${onde}[${i}]`, erros)); return; }
  if (typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) { for (const [k, x] of Object.entries(v)) foraDoJSON(x, onde ? `${onde}.${k}` : k, erros); return; }
  erros.push(`${onde || "o cenário"}: não é dado de JSON (${v instanceof RegExp ? "regex literal — escreva o texto dela" : typeof v})`);
}

/* um objeto contra uma linha do esquema: o que falta, o que está torto, o que sobra */
function conferir(obj, campos, onde, erros) {
  for (const [k, tipo] of Object.entries(campos)) {
    const opcional = tipo.endsWith("?");
    const [ok, esperado] = TIPOS[opcional ? tipo.slice(0, -1) : tipo];
    const p = onde ? `${onde}.${k}` : k;
    if (!(k in obj) || obj[k] === undefined) { if (!opcional) erros.push(`${p}: falta (${esperado})`); continue; }
    if (!ok(obj[k])) erros.push(`${p}: devia ser ${esperado}`);
  }
  for (const k of Object.keys(obj)) if (!(k in campos)) erros.push(`${onde ? `${onde}.${k}` : k}: campo desconhecido (este motor não o lê)`);
}

/* ---------------- A VALIDAÇÃO ----------------
   Devolve todos os erros de uma vez, cada um com o caminho do campo: quem
   escreve um mundo corrige a lista inteira, não um erro por tentativa. */
export function validarCenario(dados) {
  const E = ESQUEMA_DO_CENARIO;
  const erros = [];
  if (!ehObj(dados)) return { ok: false, erros: ["o cenário: devia ser um objeto (o conteúdo do arquivo)"] };
  foraDoJSON(dados, "", erros);
  if (erros.length) return { ok: false, erros };
  conferir(dados, E.raiz, "", erros);
  if (Number.isInteger(dados.formato) && dados.formato !== E.formato) erros.push(`formato: este motor lê o formato ${E.formato}, e o arquivo é do ${dados.formato}`);
  const pr = dados.precos;
  if (ehObj(pr)) {
    conferir(pr, E.precos, "precos", erros);
    if (ehObj(pr.raridade)) conferir(pr.raridade, E.raridade, "precos.raridade", erros);
    if (Array.isArray(pr.escala) && pr.escala.length < E.minimo.escala) erros.push(`precos.escala: precisa de ao menos ${E.minimo.escala} linha`);
    if (Array.isArray(pr.comuns)) {
      if (pr.comuns.length < E.minimo.comuns) erros.push(`precos.comuns: precisa de ao menos ${E.minimo.comuns} coisa`);
      const ids = new Set();
      pr.comuns.forEach((c, i) => {
        const onde = `precos.comuns[${i}]`;
        if (!ehObj(c)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(c, E.comum, onde, erros);
        if (ehTexto(c.id)) { if (ids.has(c.id)) erros.push(`${onde}.id: "${c.id}" repetido`); ids.add(c.id); }
      });
    }
  }
  const oc = dados.ocupacoes;
  if (Array.isArray(oc)) {
    if (oc.length < E.minimo.ocupacoes) erros.push(`ocupacoes: precisa de ao menos ${E.minimo.ocupacoes} ocupação`);
    const nomes = new Set();
    oc.forEach((o, i) => {
      const onde = `ocupacoes[${i}]`;
      if (!ehObj(o)) { erros.push(`${onde}: devia ser objeto`); return; }
      conferir(o, E.ocupacao, onde, erros);
      if (ehObj(o.efeito)) conferir(o.efeito, E.efeito, `${onde}.efeito`, erros);
      if (ehTexto(o.nome)) { const n = o.nome.toLowerCase(); if (nomes.has(n)) erros.push(`${onde}.nome: "${o.nome}" repetido`); nomes.add(n); }
    });
  }
  const be = dados.bestiario;
  if (ehObj(be)) {
    conferir(be, E.bestiario, "bestiario", erros);
    if (Array.isArray(be.criaturas) && be.criaturas.length < E.minimo.criaturas) erros.push(`bestiario.criaturas: precisa de ao menos ${E.minimo.criaturas} criatura`);
    const nomes = new Set();
    for (const lista of ["criaturas", "arquetipos"]) {
      if (!Array.isArray(be[lista])) continue;
      be[lista].forEach((c, i) => {
        const onde = `bestiario.${lista}[${i}]`;
        if (!ehObj(c)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(c, E.criatura, onde, erros);
        if (ehObj(c.perfil)) conferir(c.perfil, E.perfil, `${onde}.perfil`, erros);
        if (ehTexto(c.nome)) { const n = c.nome.toLowerCase(); if (nomes.has(n)) erros.push(`${onde}.nome: "${c.nome}" repetido`); nomes.add(n); }
      });
    }
  }
  const ge = dados.generos;
  if (ehObj(ge)) {
    conferir(ge, E.generos, "generos", erros);
    /* a lista torta diz QUAL linha está torta, não só que a lista está */
    if (Array.isArray(ge.marcasProprias)) ge.marcasProprias.forEach((rx, i) => { if (!regexOk(rx)) erros.push(`generos.marcasProprias[${i}]: devia ser texto de uma regex válida`); });
    if (Array.isArray(ge.futuristas)) ge.futuristas.forEach((g, i) => { if (!ehTexto(g)) erros.push(`generos.futuristas[${i}]: devia ser texto`); });
    /* 6.ª fatia: os cartões da criação, e o padrão e o futuro entre eles */
    if (Array.isArray(ge.criacao)) {
      if (ge.criacao.length < E.minimo.generos) erros.push(`generos.criacao: precisa de ao menos ${E.minimo.generos} gênero`);
      const ids = new Set(), rotulos = new Set();
      ge.criacao.forEach((g, i) => {
        const onde = `generos.criacao[${i}]`;
        if (!ehObj(g)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(g, E.generoDaCriacao, onde, erros);
        if (ehTexto(g.id)) { if (ids.has(g.id)) erros.push(`${onde}.id: "${g.id}" repetido`); ids.add(g.id); }
        if (ehTexto(g.label)) { if (rotulos.has(g.label)) erros.push(`${onde}.label: "${g.label}" repetido`); rotulos.add(g.label); }
      });
      if (ehTexto(ge.padrao) && !rotulos.has(ge.padrao)) erros.push(`generos.padrao: "${ge.padrao}" não é gênero da criação (generos.criacao)`);
      if (Array.isArray(ge.futuristas)) ge.futuristas.forEach((g, i) => { if (ehTexto(g) && !rotulos.has(g)) erros.push(`generos.futuristas[${i}]: "${g}" não é gênero da criação (generos.criacao)`); });
    }
  }
  const gn = dados.gente;
  if (ehObj(gn)) {
    conferir(gn, E.gente, "gente", erros);
    if (ehObj(gn.bancos)) {
      const generos = Object.keys(gn.bancos);
      if (generos.length < E.minimo.bancos) erros.push(`gente.bancos: precisa de ao menos ${E.minimo.bancos} banco`);
      for (const g of generos) {
        /* o gênero entra no caminho entre aspas: "Fantasia medieval" tem espaço */
        const onde = `gente.bancos[${JSON.stringify(g)}]`;
        if (!ehTexto(g)) erros.push(`${onde}: o gênero do banco devia ser texto`);
        if (!ehObj(gn.bancos[g])) { erros.push(`${onde}: devia ser objeto`); continue; }
        conferir(gn.bancos[g], E.banco, onde, erros);
      }
      /* o gênero sem banco cai no do padrão: sem ele, a pessoa nasceria sem nome */
      if (ehObj(ge) && ehTexto(ge.padrao) && !Object.hasOwn(gn.bancos, ge.padrao)) erros.push(`gente.bancos: falta o banco do gênero padrão (generos.padrao, "${ge.padrao}")`);
    }
  }
  const pa = dados.panteao;
  if (ehObj(pa)) {
    conferir(pa, E.panteao, "panteao", erros);
    if (ehObj(pa.nomes)) conferir(pa.nomes, E.nomeDivino, "panteao.nomes", erros);
    if (Array.isArray(pa.dominios)) {
      if (pa.dominios.length < E.minimo.dominios) erros.push(`panteao.dominios: precisa de ao menos ${E.minimo.dominios} domínio`);
      pa.dominios.forEach((d, i) => {
        const onde = `panteao.dominios[${i}]`;
        if (!ehObj(d)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(d, E.dominio, onde, erros);
        /* o sinal de um temperamento que o deus deste domínio nunca tem não acontece */
        if (ehObj(d.sinais) && Array.isArray(d.temper)) for (const tp of Object.keys(d.sinais)) if (!d.temper.includes(tp)) erros.push(`${onde}.sinais[${JSON.stringify(tp)}]: temperamento que este domínio não tem (temper)`);
      });
    }
    if (Array.isArray(pa.titulos)) {
      if (pa.titulos.length !== E.exato.titulos) erros.push(`panteao.titulos: são ${E.exato.titulos}, um por grau (GD 0 a ${E.exato.titulos - 1}), e vieram ${pa.titulos.length}`);
      pa.titulos.forEach((x, i) => { const onde = `panteao.titulos[${i}]`; if (!ehObj(x)) { erros.push(`${onde}: devia ser objeto`); return; } conferir(x, E.titulo, onde, erros); });
    }
    if (Array.isArray(pa.estagios) && pa.estagios.length !== E.exato.estagios) erros.push(`panteao.estagios: são ${E.exato.estagios} (o servo, o receptáculo e a divindade nova), e vieram ${pa.estagios.length}`);
    /* 7.ª fatia: os eventos divinos, e o molde de cada frase */
    if (Array.isArray(pa.eventos)) {
      if (pa.eventos.length < E.minimo.eventos) erros.push(`panteao.eventos: precisa de ao menos ${E.minimo.eventos} evento`);
      pa.eventos.forEach((ev, i) => {
        const onde = `panteao.eventos[${i}]`;
        if (!ehObj(ev)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(ev, E.eventoDivino, onde, erros);
        for (const campo of ["texto", "gancho"]) erros.push(...errosDoMolde(ev[campo], `${onde}.${campo}`, ev.dois));
      });
    }
  }
  const lu = dados.lugares;
  if (ehObj(lu)) {
    conferir(lu, E.lugares, "lugares", erros);
    if (ehObj(lu.bancos)) {
      const generos = Object.keys(lu.bancos);
      if (generos.length < E.minimo.bancos) erros.push(`lugares.bancos: precisa de ao menos ${E.minimo.bancos} banco`);
      for (const g of generos) {
        const onde = `lugares.bancos[${JSON.stringify(g)}]`;
        if (!ehTexto(g)) erros.push(`${onde}: o gênero do banco devia ser texto`);
        if (!ehObj(lu.bancos[g])) { erros.push(`${onde}: devia ser objeto`); continue; }
        conferir(lu.bancos[g], E.bancoDeLugar, onde, erros);
      }
      if (ehObj(ge) && ehTexto(ge.padrao) && !Object.hasOwn(lu.bancos, ge.padrao)) erros.push(`lugares.bancos: falta o banco do gênero padrão (generos.padrao, "${ge.padrao}")`);
    }
    if (ehObj(lu.tipos)) conferir(lu.tipos, Object.fromEntries(E.tiposDeLocal.map((tp) => [tp, "substantivos"])), "lugares.tipos", erros);
  }
  const ra = dados.racas;
  /* os nomes exatos das raças deste mundo: o povo do companheiro, o registo e os prontos apontam para eles */
  const nomesDeRaca = new Set();
  if (ehObj(ra)) {
    conferir(ra, E.racas, "racas", erros);
    if (Array.isArray(ra.fantasia) && ra.fantasia.length < E.minimo.racas) erros.push(`racas.fantasia: precisa de ao menos ${E.minimo.racas} raça`);
    /* o mundo com gêneros do futuro abre a criação nas origens: sem nenhuma, ninguém nasce */
    if (Array.isArray(ra.futuro) && ra.futuro.length < E.minimo.racas && ehObj(ge) && Array.isArray(ge.futuristas) && ge.futuristas.length) erros.push(`racas.futuro: precisa de ao menos ${E.minimo.racas} origem, porque generos.futuristas não está vazio`);
    const nomes = new Set();
    for (const lista of ["fantasia", "futuro"]) {
      if (!Array.isArray(ra[lista])) continue;
      ra[lista].forEach((r, i) => {
        const onde = `racas.${lista}[${i}]`;
        if (!ehObj(r)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(r, E.raca, onde, erros);
        if (ehObj(r.efeito)) {
          conferir(r.efeito, E.efeitoDeRaca, `${onde}.efeito`, erros);
          if (ehObj(r.efeito.dom)) conferir(r.efeito.dom, E.dom, `${onde}.efeito.dom`, erros);
        }
        if (ehTexto(r.nome)) { const n = r.nome.toLowerCase(); if (nomes.has(n)) erros.push(`${onde}.nome: "${r.nome}" repetido`); nomes.add(n); nomesDeRaca.add(r.nome); }
      });
    }
    /* 6.ª fatia: o povo do companheiro e o registo só apontam para raças deste mundo */
    if (Array.isArray(ra.doCompanheiro)) {
      if (ra.doCompanheiro.length < E.minimo.povo) erros.push(`racas.doCompanheiro: precisa de ao menos ${E.minimo.povo} povo`);
      ra.doCompanheiro.forEach((p, i) => {
        const onde = `racas.doCompanheiro[${i}]`;
        if (!ehObj(p)) { erros.push(`${onde}: devia ser objeto`); return; }
        conferir(p, E.povo, onde, erros);
        if (ehTexto(p.raca) && !nomesDeRaca.has(p.raca)) erros.push(`${onde}.raca: "${p.raca}" não é raça deste mundo (racas.fantasia ou racas.futuro, o nome exato)`);
      });
    }
    if (ehObj(ra.registo)) for (const [forma, raca] of Object.entries(ra.registo)) if (ehTexto(raca) && !nomesDeRaca.has(raca)) erros.push(`racas.registo[${JSON.stringify(forma)}]: "${raca}" não é raça deste mundo`);
  }
  /* 6.ª fatia: os oito do roster, com a gente deste mundo */
  const pp = dados.prontos;
  if (Array.isArray(pp)) {
    if (pp.length !== E.exato.prontos) erros.push(`prontos: são ${E.exato.prontos} (as quartas do torneio e o rodízio da arena contam com oito), e vieram ${pp.length}`);
    const ofic = new Set(Array.isArray(oc) ? oc.filter(ehObj).map((o) => o.nome) : []);
    const ids = new Set();
    pp.forEach((p, i) => {
      const onde = `prontos[${i}]`;
      if (!ehObj(p)) { erros.push(`${onde}: devia ser objeto`); return; }
      conferir(p, E.pronto, onde, erros);
      if (ehObj(p.indole)) conferir(p.indole, E.indole, `${onde}.indole`, erros);
      if (ehTexto(p.id)) { if (ids.has(p.id)) erros.push(`${onde}.id: "${p.id}" repetido`); ids.add(p.id); }
      if (ehTexto(p.raca) && !nomesDeRaca.has(p.raca)) erros.push(`${onde}.raca: "${p.raca}" não é raça deste mundo`);
      if (ehTexto(p.profissao) && !ofic.has(p.profissao)) erros.push(`${onde}.profissao: "${p.profissao}" não é ocupação deste mundo`);
    });
  }
  return { ok: erros.length === 0, erros };
}

const congelarAFundo = (v) => {
  if (v && typeof v === "object") { for (const x of Object.values(v)) congelarAFundo(x); Object.freeze(v); }
  return v;
};

/* ---------------- O CARREGADOR ----------------
   Dado bruto (o objeto do arquivo) → cenário validado, copiado e congelado.
   Recusa com UM erro que lista tudo o que está errado. O que sai daqui fica
   marcado (`carregados`), e carregá-lo de novo devolve o mesmo objeto. */
const carregados = new WeakSet();
export function carregarCenario(dados) {
  if (dados && typeof dados === "object" && carregados.has(dados)) return dados;
  const v = validarCenario(dados);
  if (!v.ok) throw new Error(`O cenário não abre — ${v.erros.length} problema${v.erros.length > 1 ? "s" : ""}:\n  - ${v.erros.join("\n  - ")}`);
  const c = congelarAFundo(JSON.parse(JSON.stringify(dados)));
  carregados.add(c);
  return c;
}

export const CENARIO_PADRAO = carregarCenario(DADOS_DO_CENARIO_PADRAO);

/* ---------------- O MUNDO EM USO ---------------- */
let ativo = CENARIO_PADRAO;
const ouvintes = [];

export function cenarioAtivo() { return ativo; }

/* o catálogo assina e recebe já o mundo em uso */
export function aoTrocarDeCenario(fn) {
  if (typeof fn !== "function") return;
  ouvintes.push(fn);
  fn(ativo);
}

/* troca o mundo: valida antes de avisar alguém; se um catálogo estourar a
   meio, todos voltam ao mundo de antes — nunca meio mundo de cada lado */
export function usarCenario(dados) {
  const novo = carregarCenario(dados);
  const antes = ativo;
  ativo = novo;
  try { for (const fn of ouvintes) fn(novo); }
  catch (e) { ativo = antes; for (const fn of ouvintes) fn(antes); throw e; }
  return novo;
}
