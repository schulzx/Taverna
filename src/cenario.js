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
   novo sem ser tocado). Os
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
  raiz: Object.freeze({ formato: "inteiro", id: "texto", nome: "texto", precos: "objeto", ocupacoes: "lista", generos: "objeto", bestiario: "objeto" }),
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
  generos: Object.freeze({ padrao: "texto", futuristas: "textos", marcasProprias: "regexes" }),
  /* o bestiário (bestiario.js): `generosDasCriaturas` veem as criaturas do
     mundo e os `emprestados` primeiros arquétipos; os outros gêneros, os
     arquétipos e as `emprestados` primeiras criaturas. Os nomes são únicos
     nas duas listas juntas (sem olhar a caixa): é por eles que
     `completarInimigo` acha a ficha do inimigo que o Narrador abre. */
  bestiario: Object.freeze({ generosDasCriaturas: "textos", emprestados: "contagem", criaturas: "lista", arquetipos: "lista" }),
  /* uma ficha: os campos que bestiario.js daFicha copia, nem mais nem menos */
  criatura: Object.freeze({ nome: "texto", ameaca: "ameaca", nivelRef: "nivel", des: "inteiro", desc: "texto", perfil: "objeto?", degrau: "degrau?", importante: "booleano?" }),
  /* o perfil de dano: os quatro campos que danos.js perfilDe lê */
  perfil: Object.freeze({ ataque: "elemento?", resist: "elementos?", fraqueza: "elementos?", imune: "elementos?" }),
  /* o vocabulário do motor que uma ficha pode usar: as ameaças (combate.js,
     degraus.js DEGRAU_POR_AMEACA), os degraus da mente (degraus.js DEGRAUS)
     e os tipos de dano (danos.js TIPOS_DANO). A suíte lê-os de volta. */
  ameacas: Object.freeze(["fraco", "comum", "competente", "elite", "lendario"]),
  degraus: Object.freeze(["animal", "bruto", "astuto", "treinado", "brilhante"]),
  elementos: Object.freeze(["fisico", "fogo", "gelo", "raio", "veneno", "sagrado", "sombrio", "arcano"]),
  /* os mínimos: a criação abre na primeira ocupação, a rua mostra ao menos
     uma coisa, e o encontro tem ao menos uma criatura para sortear */
  minimo: Object.freeze({ ocupacoes: 1, comuns: 1, escala: 1, criaturas: 1 }),
});

const ehObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const ehTexto = (v) => typeof v === "string" && v.trim().length > 0;
const ehNum = (v) => typeof v === "number" && Number.isFinite(v);
const regexOk = (v) => { if (!ehTexto(v)) return false; try { new RegExp(v); return true; } catch { return false; } };
/* cada tipo: o teste e o que a mensagem diz que se esperava */
const TIPOS = {
  texto: [ehTexto, "texto"],
  textos: [(v) => Array.isArray(v) && v.every(ehTexto), "lista de textos"],
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
  ameaca: [(v) => ESQUEMA_DO_CENARIO.ameacas.includes(v), `uma ameaça do motor (${ESQUEMA_DO_CENARIO.ameacas.join(", ")})`],
  degrau: [(v) => ESQUEMA_DO_CENARIO.degraus.includes(v), `um degrau do motor (${ESQUEMA_DO_CENARIO.degraus.join(", ")})`],
  elemento: [(v) => ESQUEMA_DO_CENARIO.elementos.includes(v), `um tipo de dano do motor (${ESQUEMA_DO_CENARIO.elementos.join(", ")})`],
  elementos: [(v) => Array.isArray(v) && v.every((x) => ESQUEMA_DO_CENARIO.elementos.includes(x)), `lista de tipos de dano do motor (${ESQUEMA_DO_CENARIO.elementos.join(", ")})`],
};

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
