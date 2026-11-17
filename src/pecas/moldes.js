/* ============================================================
   AS PEÇAS · O MOLDE POR FATO (17/11/2026, Fase A da prova) — src/pecas/moldes.js

   A proposta da pessoa (mente/lancamento/as-pecas.md): o jogo como
   quebra-cabeça. A etapa sabe O QUE tem de ser verdade (o facto do
   `conclui`); este módulo diz COMO se chega lá — a lista das soluções
   plausíveis de cada facto, cada uma com a ação do catálogo, o número
   (pela régua que o catálogo já tem), o que o sucesso escreve e para onde
   a falha vai. «A falha não é um beco, é uma seta.»

   Uma solução:
     id       — único dentro do molde
     acao     — um id de DESAFIOS, um verbo de luta (ACOES_SEM_CATALOGO) ou
                «escolher» (a carta de escolha, sem dado)
     pede     — o que a cena tem de ter para a solução se acionar:
                "presente" (a pessoa do facto está na cena fechada),
                "noLugar" (o herói está no lugar do facto),
                "alguem" (há alguém na cena a quem pedir), "rumo" (nada:
                é o caminho até lá)
     sucesso  — { fato: true } escreve o facto do molde (`como`: a forma
                da queda); { para, vantagem } abre outra solução com
                vantagem; { recua: true } sai sem fechar (fugir)
     falha    — { para } abre outra solução do molde (`vantagem` negativa
                quando a falha deixa pior); { preco, continua: true } cobra
                e mantém a etapa aberta; { preco, escreve: true } escreve o
                facto com preço (a regra do quadro: a carta essencial vira
                sempre, e a falha paga)
     fecha    — false só na solução que não fecha a etapa (fugir)

   PURO E DETERMINÍSTICO: só tabelas e leituras delas.
   ============================================================ */
import { DESAFIOS, DIFICULDADES, desafioPorId } from "../desafios.js";
import { PRECO_DA_FALHA, CAMINHOS_DA_CARTA } from "../quadro-da-quest.js";
import { ESCOLHAS_DO_CONFRONTO, ESCOLHAS_DO_ENCONTRO } from "../encontro-na-estrada.js";
import { O_CONFRONTO_DA_QUEST } from "../o-confronto-da-quest.js";

/* As ações que não estão no catálogo de desafios: a luta tem o seu
   tabuleiro (o d20 de ataque e a previsão), e fugir e capturar têm a CD do
   cartão do encontro (encontro-na-estrada.js) — por ameaça, nunca à mão.
   Pagar e trocar são o «convencer» com a bolsa aberta (o caminho «pagar»
   do quadro), e cobram o que o caminho cobra. */
const pagarDoQuadro = CAMINHOS_DA_CARTA.pessoa.find((c) => c.id === "pagar");
export const ACOES_SEM_CATALOGO = Object.freeze({
  lutar: Object.freeze({ numero: Object.freeze({ de: "luta" }), porque: "a luta rola no tabuleiro: o número é o da defesa de quem se enfrenta" }),
  fugir: Object.freeze({ numero: Object.freeze({ de: "ameaca", tabela: "fugir" }), porque: "a CD do «voltar atrás» do encontro, pela ameaça" }),
  capturar: Object.freeze({ numero: Object.freeze({ de: "ameaca", tabela: "capturar" }), porque: "a CD do «capturar» do confronto, pela ameaça" }),
  pagar: Object.freeze({ numero: Object.freeze({ de: "desafio", desafio: "convencer" }), custa: pagarDoQuadro ? pagarDoQuadro.custa : null, porque: "pagar é convencer com a bolsa aberta — o caminho «pagar» do quadro" }),
  trocar: Object.freeze({ numero: Object.freeze({ de: "desafio", desafio: "convencer" }), custa: null, porque: "trocar é convencer com o que se leva" }),
  escolher: Object.freeze({ numero: null, porque: "a carta de escolha: decisão, não dado" }),
});

/* A família de cada ação — é por ela que «três soluções diferentes» se
   conta (três vias de convencer não são três caminhos), e é por ela que a
   frase que não aciona nada aponta para onde aquece (encaixe.js). */
export const FAMILIA_DA_ACAO = Object.freeze({
  lutar: "luta", capturar: "corpo", fugir: "fuga",
  convencer: "social", fazer_falar: "social", impressionar: "social",
  intimidar: "ameaca", mentir: "engano", falsificar: "engano",
  pagar: "troca", trocar: "troca",
  atuar: "arte",
  furtar_se: "furtiva", seguir_alguem: "furtiva", bater_carteira: "furtiva",
  buscar: "olhar", investigar: "olhar", escutar: "olhar",
  rastrear: "caminho", orientar: "caminho",
  lembrar: "saber", mentira: "saber", heraldica: "saber", arcano: "saber", fraqueza: "saber", diagnosticar: "saber",
  escalar: "corpo", tranca: "corpo", saltar: "corpo", forcar: "corpo", arrebentar: "corpo", nadar: "corpo", equilibrio: "corpo", escapar: "corpo", aguentar: "corpo",
  estancar: "cuidado", acalmar_bicho: "cuidado", cavalgar: "cuidado",
  desarmar: "furtiva",
  escolher: "escolha",
});

/* A vantagem que uma seta dá ou tira (somada ao dado da solução para onde
   aponta). 2 é o degrau que a régua da casa usa para «a situação ajuda»
   (SITUACAO_DA_CD: a chuva e o escuro pesam +2) — a emboscada é o espelho
   disso, e a fuga apanhada é ficar de costas. */
export const VANTAGEM_DA_SETA = Object.freeze({
  emboscada: 2,
  espreitou: 2,
  alcancado: -2,
  descoberto: -2,
});

const sol = (id, acao, pede, sucesso, falha, extra) => Object.freeze({ id, acao, pede, sucesso: Object.freeze(sucesso), falha: falha ? Object.freeze(falha) : null, ...(extra || {}) });
const FATO = { fato: true };

/* ---------------- OS MOLDES ----------------
   `alvo`: o tipo do argumento do facto (pessoa, lugar, objeto, escolha).
   A ordem das soluções é a ordem em que o Mestre as prefere quando o
   relógio força uma (calor.js): a primeira que fecha. */
export const MOLDE_DO_FATO = Object.freeze({
  derrotou: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("lutar", "lutar", "presente", FATO, { preco: "alerta", continua: true }),
    sol("emboscar", "furtar_se", "presente", { para: "lutar", vantagem: "emboscada" }, { para: "lutar", vantagem: "descoberto" }),
    sol("intimidar", "intimidar", "presente", { fato: true, como: "rendido" }, { para: "lutar" }),
    sol("capturar", "capturar", "presente", { fato: true, como: "rendido" }, { para: "lutar" }),
    sol("fugir", "fugir", "presente", { recua: true }, { para: "lutar", vantagem: "alcancado" }, { fecha: false }),
  ]) }),
  /* o confronto do covil (ESCOLHAS_DO_CONFRONTO): a etapa que JÁ era peça,
     e o facto que O_CLIMAX_DA_QUEST exige à etapa de confronto */
  encontrou: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("espreitar", "furtar_se", "presente", FATO, { para: "lutar", vantagem: "descoberto" }),
    sol("falar", "convencer", "presente", FATO, { para: "lutar" }),
    sol("capturar", "capturar", "presente", { fato: true, como: "rendido" }, { para: "lutar" }),
    /* perder a luta é ter estado frente a frente: o encontro escreve-se, e
       paga-se (a besta vence e o vilão fica a saber — O_CONFRONTO_DA_QUEST.derrota) */
    sol("lutar", "lutar", "presente", FATO, { preco: "alerta", escreve: true }),
    sol("recuar", "fugir", "presente", { recua: true }, { para: "lutar", vantagem: "alcancado" }, { fecha: false }),
  ]) }),
  conversou: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("convencer", "convencer", "presente", FATO, { para: "pagar" }),
    sol("fazer_falar", "fazer_falar", "presente", FATO, { para: "pagar" }),
    sol("impressionar", "impressionar", "presente", FATO, { para: "convencer" }),
    sol("intimidar", "intimidar", "presente", FATO, { preco: "alerta", escreve: true }),
    sol("mentir", "mentir", "presente", FATO, { para: "intimidar" }),
    sol("pagar", "pagar", "presente", FATO, { preco: "cobra", escreve: true }),
  ]) }),
  consultou: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("convencer", "convencer", "presente", FATO, { para: "pagar" }),
    sol("fazer_falar", "fazer_falar", "presente", FATO, { para: "intimidar" }),
    sol("ler", "mentira", "presente", FATO, { para: "fazer_falar" }),
    sol("intimidar", "intimidar", "presente", FATO, { preco: "alerta", escreve: true }),
    sol("pagar", "pagar", "presente", FATO, { preco: "cobra", escreve: true }),
  ]) }),
  conheceu: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("abordar", "convencer", "presente", FATO, { para: "pagar" }),
    sol("seguir", "seguir_alguem", "presente", FATO, { preco: "alerta", escreve: true }),
    sol("procurar", "investigar", "alguem", FATO, { preco: "tempo", escreve: true }),
    sol("pagar", "pagar", "alguem", FATO, { preco: "cobra", escreve: true }),
  ]) }),
  afeicao: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("impressionar", "impressionar", "presente", FATO, { para: "convencer" }),
    sol("convencer", "convencer", "presente", FATO, { preco: "tempo", continua: true }),
    sol("atuar", "atuar", "presente", FATO, { para: "impressionar" }),
    sol("presentear", "pagar", "presente", FATO, { preco: "cobra", escreve: true }),
  ]) }),
  acompanha: Object.freeze({ alvo: "pessoa", solucoes: Object.freeze([
    sol("convencer", "convencer", "presente", FATO, { para: "pagar" }),
    sol("intimidar", "intimidar", "presente", FATO, { preco: "alerta", continua: true }),
    sol("mentir", "mentir", "presente", FATO, { para: "convencer" }),
    sol("pagar", "pagar", "presente", FATO, { preco: "cobra", escreve: true }),
  ]) }),
  descobriu: Object.freeze({ alvo: "lugar", solucoes: Object.freeze([
    sol("revistar", "buscar", "noLugar", FATO, { para: "investigar" }),
    sol("investigar", "investigar", "noLugar", FATO, { preco: "incompleta", escreve: true }),
    sol("escutar", "escutar", "noLugar", FATO, { preco: "alerta", escreve: true }),
    sol("perguntar", "fazer_falar", "alguem", FATO, { para: "pagar" }),
    sol("pagar", "pagar", "alguem", FATO, { preco: "alerta", escreve: true }),
    sol("lembrar", "lembrar", "rumo", FATO, { para: "revistar" }),
    sol("rastrear", "rastrear", "rumo", FATO, { preco: "tempo", escreve: true }),
  ]) }),
  esteve: Object.freeze({ alvo: "lugar", solucoes: Object.freeze([
    sol("rastrear", "rastrear", "rumo", FATO, { preco: "tempo", escreve: true }),
    sol("orientar", "orientar", "rumo", FATO, { preco: "tempo", escreve: true }),
    sol("seguir", "seguir_alguem", "alguem", FATO, { para: "orientar" }),
    sol("esgueirar", "furtar_se", "rumo", FATO, { preco: "alerta", escreve: true }),
    sol("escalar", "escalar", "rumo", FATO, { para: "arrombar" }),
    sol("arrombar", "tranca", "rumo", FATO, { preco: "alerta", escreve: true }),
    sol("convencer", "convencer", "alguem", FATO, { para: "pagar" }),
    sol("pagar", "pagar", "alguem", FATO, { preco: "alerta", escreve: true }),
  ]) }),
  tem: Object.freeze({ alvo: "objeto", solucoes: Object.freeze([
    sol("comprar", "pagar", "alguem", FATO, { preco: "cobra", escreve: true }),
    sol("furtar", "bater_carteira", "alguem", FATO, { preco: "alerta", continua: true }),
    sol("convencer", "convencer", "alguem", FATO, { para: "comprar" }),
    sol("procurar", "buscar", "rumo", FATO, { preco: "tempo", continua: true }),
    sol("arrombar", "tranca", "rumo", FATO, { preco: "danificado", escreve: true }),
  ]) }),
  /* a carta de escolha: o ganho e o custo escritos, e nenhum dado — a
     escolha é a decisão do jogador (as-pecas.md §6.3) */
  escolheu: Object.freeze({ alvo: "escolha", carta: true, solucoes: Object.freeze([
    sol("escolher", "escolher", null, FATO, null, { semDado: true }),
  ]) }),
  /* `pelo_menos` não é predicado, é combinador (COMBINADORES da
     condicoes-da-quest.js): o molde dele é a junção dos moldes dos filhos,
     feita em peca.js */
  pelo_menos: Object.freeze({ combinador: true, solucoes: Object.freeze([]) }),
});

/* esta_em é «estar lá agora»: o caminho até lá é o mesmo do esteve */
export const MOLDE_IGUAL = Object.freeze({ esta_em: "esteve", poupou: "derrotou" });

/* o molde de um predicado, com os aliases; null se não há */
export function moldeDe(predicado) {
  const k = MOLDE_IGUAL[predicado] || predicado;
  return MOLDE_DO_FATO[k] || null;
}

/* ---------------- O NÚMERO ----------------
   numeroDaSolucao(solucao, { ameaca }) → { dc, pericia, de } | { luta: true } | null
   O número sai do catálogo: a CD padrão do desafio (ou a do degrau comum,
   para a tranca, cuja CD real é da porta — trancaDe), a CD por ameaça do
   cartão do encontro, ou a luta. */
export function numeroDaSolucao(s, opcoes) {
  if (!s || typeof s !== "object") return null;
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const sem = ACOES_SEM_CATALOGO[s.acao];
  const n = sem ? sem.numero : { de: "desafio", desafio: s.acao };
  if (!n) return null;
  if (n.de === "luta") return { luta: true, dc: null, pericia: "", de: "luta" };
  if (n.de === "ameaca") {
    const t = n.tabela === "fugir" ? ESCOLHAS_DO_ENCONTRO.escolhas.fugir : ESCOLHAS_DO_CONFRONTO.escolhas[n.tabela];
    const ameaca = (t && t.cd && t.cd[o.ameaca]) != null ? o.ameaca : O_CONFRONTO_DA_QUEST.ameacaSemFicha;
    return t && t.cd ? { dc: t.cd[ameaca], pericia: t.pericia, de: "ameaca:" + ameaca } : null;
  }
  const d = desafioPorId(n.desafio);
  if (!d) return null;
  const comum = DIFICULDADES.find((x) => x.id === "comum").dc;
  return { dc: d.dcPadrao || d.dcBase || comum, pericia: d.pericia || "", de: "desafio:" + d.id };
}

/* ---------------- A PROVA DO MOLDE (o que a suíte lê) ----------------
   problemasDoMolde(predicado) → [texto]. Vazio = o molde é bom:
   · toda ação existe (catálogo ou ACOES_SEM_CATALOGO), todo preço existe
     em PRECO_DA_FALHA, toda seta aponta para uma solução do molde;
   · nenhum ciclo de falhas sem saída: seguindo as setas da falha a partir
     de qualquer solução, chega-se a um preço ou a um facto;
   · a solução que não fecha (fugir) cai, na falha, numa que fecha;
   · ≥ 3 soluções que fecham, de famílias diferentes (salvo a carta de
     escolha, que não tem dado). */
export const MINIMO_DE_FAMILIAS = 3;
const ehAcao = (a) => !!ACOES_SEM_CATALOGO[a] || DESAFIOS.some((d) => d.id === a);
export function problemasDoMolde(predicado, outro) {
  /* `outro`: um molde à mão (o das exceções, ou o torto da suíte) */
  const m = outro && typeof outro === "object" && Array.isArray(outro.solucoes) ? outro : moldeDe(predicado);
  if (!m) return [`${predicado}: sem molde`];
  if (m.combinador) return [];
  const out = [];
  const ids = new Set(m.solucoes.map((s) => s.id));
  if (ids.size !== m.solucoes.length) out.push(`${predicado}: id repetido`);
  for (const s of m.solucoes) {
    if (!ehAcao(s.acao)) out.push(`${predicado}.${s.id}: ação «${s.acao}» não existe`);
    if (!FAMILIA_DA_ACAO[s.acao]) out.push(`${predicado}.${s.id}: ação sem família`);
    for (const lado of [s.sucesso, s.falha]) {
      if (!lado) continue;
      if (lado.para && !ids.has(lado.para)) out.push(`${predicado}.${s.id}: seta para «${lado.para}», que não é do molde`);
      if (lado.preco && !PRECO_DA_FALHA[lado.preco]) out.push(`${predicado}.${s.id}: preço «${lado.preco}» fora de PRECO_DA_FALHA`);
      if (lado.vantagem && VANTAGEM_DA_SETA[lado.vantagem] == null) out.push(`${predicado}.${s.id}: vantagem «${lado.vantagem}» sem número`);
    }
    if (!s.semDado && !s.falha) out.push(`${predicado}.${s.id}: solução com dado sem seta da falha`);
    if (s.falha && !s.falha.para && !s.falha.preco) out.push(`${predicado}.${s.id}: a falha não aponta para nada (beco)`);
    if (s.sucesso && !s.sucesso.fato && !s.sucesso.para && !s.sucesso.recua) out.push(`${predicado}.${s.id}: o sucesso não escreve nem abre nada`);
    /* o caminho da falha termina */
    const vistos = new Set();
    let x = s;
    while (x && x.falha && x.falha.para) {
      if (vistos.has(x.id)) { out.push(`${predicado}.${s.id}: ciclo de falhas sem saída`); break; }
      vistos.add(x.id);
      x = m.solucoes.find((y) => y.id === x.falha.para);
    }
    if (s.fecha === false) {
      const alvo = s.falha && s.falha.para ? m.solucoes.find((y) => y.id === s.falha.para) : null;
      if (!alvo || alvo.fecha === false) out.push(`${predicado}.${s.id}: a que não fecha tem de cair numa que fecha`);
    }
  }
  if (!m.carta) {
    const fecham = m.solucoes.filter((s) => s.fecha !== false && !s.semDado);
    const fams = new Set(fecham.map((s) => FAMILIA_DA_ACAO[s.acao]));
    if (fams.size < MINIMO_DE_FAMILIAS) out.push(`${predicado}: só ${fams.size} famílias que fecham`);
  } else if (m.solucoes.some((s) => !s.semDado)) out.push(`${predicado}: a carta de escolha não tem dado`);
  return out;
}
