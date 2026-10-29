/* ============================================================
   OS ÓRGÃOS DO DEPOIS DA RESPOSTA, NO MOTOR (Fase 4, trilha A, 29/10/2026) — src/motor/depois-do-turno.js

   O /api/turno já corre no servidor o resto do turno sobre a resposta (o
   aplicar, o fim do turno, o Juiz, o Cronista: 6b255cc). O que o App ainda
   fazia depois do aplicar, e o servidor não tinha, são órgãos com nome —
   funções do componente, não um trecho de `enviar`. Moram aqui, À LETRA,
   como o prelúdio e o pedido: cada órgão e o fecho das funções do
   componente que ele chama (pela árvore do @babel/parser,
   testes/gerar-depois-dourado.mjs), com as mesmas trocas mecânicas —
   `xRef.current` → `$ref.<campo>`, o estado React → `$render` — e estas
   PORTAS, que são o que o servidor injeta e o App já tem:
     - `pushMsgs`, os setters do React, `salvar` (a tela e o disco);
     - `calou`, e `aplicar` (o que se escreveu chega ao App antes de cada
       porta que lhe dá a palavra, e no fim de cada órgão — também quando
       estoura);
     - `sorte` (o gerador do turno: cada órgão corre dentro de `comSorte`;
       sem ela, a da casa, como no App);
     - `agora` (o `Date.now` do App).

   É UMA FÁBRICA, e não uma função: `osOrgaosDoDepois(estado, portas)`
   devolve os órgãos (`ORGAOS_DO_DEPOIS`) sobre aquele estado — porque mais
   de um deles é também PORTA de outra peça (o `pregarNoMural` é uma das
   portas que o Cronista chama, e no replay era dublê). Quem os usa cria a
   fábrica com o estado do instante e chama o que precisa; o que eles
   escrevem sai pelo `aplicar` (e fica em `escritas`).

   Os órgãos:
     - `oferecerTrabalhoDaqui` (v9.37, MM13, MM18): o mundo prega no mural,
       por conta própria, o trabalho de quem mora aqui — no máximo um por
       dia, fora de luta e de masmorra, com o diário com espaço;
     - `pregarNoMural`: a porta única do mural (uma pessoa, um trabalho; o
       que já está no diário não volta; quem já trabalha comigo não prega
       outro).

   A prova é testes/teste-motor-depois-do-turno.mjs: o recorte do App de
   HEAD (depois-dourado.json) e esta peça sobre os mesmos casos, lado a
   lado — os refs do fim, as portas na ordem (com o estado de cada uma) e
   o que cada órgão devolve.
   ============================================================ */

import { garantirAbertura, muralLiberado } from "../abertura.js";
import { cenarioAtivo } from "../cenario.js";
import { garantirMissoes } from "../missoes.js";
import { MOLDE_PADRAO, moldePorId } from "../moldes.js";
import { garantirBase } from "../mundo-base.js";
import { envelopeDoRecado, genteDaHistoria, ofertasDaqui } from "../ofertas.js";
import { garantirEspinha } from "../saga.js";
import { comSorte } from "../semente.js";

/* OS REFS QUE OS ÓRGÃOS DO DEPOIS TOCAM — um por campo, como no prelúdio:
   o nome do ref no App, se o save o guarda (o campo é o do save; senão é o
   do ref), se algum órgão o escreve, e o valor de partida (o mesmo
   `useRef(...)` do App). */
export const REFS_DO_DEPOIS = Object.freeze({
  abertura: Object.freeze({ ref: "aberturaMundoRef", salvo: true, escreve: false, padrao: () => (garantirAbertura(null)) }),
  baseMundo: Object.freeze({ ref: "baseMundoRef", salvo: true, escreve: false, padrao: () => (garantirBase(null)) }),
  cidadeAtual: Object.freeze({ ref: "cidadeAtualRef", salvo: true, escreve: false, padrao: () => ("") }),
  combate: Object.freeze({ ref: "combateRef", salvo: true, escreve: false, padrao: () => (null) }),
  dia: Object.freeze({ ref: "diaRef", salvo: true, escreve: false, padrao: () => (1) }),
  espinha: Object.freeze({ ref: "espinhaRef", salvo: true, escreve: false, padrao: () => (garantirEspinha(null)) }),
  mapa: Object.freeze({ ref: "mapaRef", salvo: true, escreve: false, padrao: () => ({ cidades: [], faccoes: [] }) }),
  masmorra: Object.freeze({ ref: "masmorraRef", salvo: true, escreve: false, padrao: () => (null) }),
  missoes: Object.freeze({ ref: "missoesRef", salvo: true, escreve: false, padrao: () => ([]) }),
  mundo: Object.freeze({ ref: "mundoRef", salvo: false, escreve: false, padrao: () => (null) }),
  mural: Object.freeze({ ref: "muralRef", salvo: true, escreve: true, padrao: () => ([]) }),
  nomeCampanha: Object.freeze({ ref: "nomeCampanhaRef", salvo: false, escreve: false, padrao: () => ("") }),
  nota: Object.freeze({ ref: "notaRef", salvo: false, escreve: true, padrao: () => ("") }),
  npcs: Object.freeze({ ref: "npcsRef", salvo: true, escreve: false, padrao: () => ({}) }),
  personagem: Object.freeze({ ref: "personagemRef", salvo: false, escreve: false, padrao: () => (null) }),
  trabalhoPendente: Object.freeze({ ref: "trabalhoPendenteRef", salvo: false, escreve: true, padrao: () => ([]) }),
  ultimoTrabalhoDia: Object.freeze({ ref: "ultimoTrabalhoDiaRef", salvo: false, escreve: true, padrao: () => (0) }),
});

/* O ESTADO REACT QUE ELES LEEM: o do último render, em `estado.render`;
   sem ele, o do estado. */
export const RENDER_DO_DEPOIS = Object.freeze(["mundo","nomeCampanha","personagem"]);

/* OS ÓRGÃOS que a fábrica devolve, e AS PORTAS, pelo nome. */
export const ORGAOS_DO_DEPOIS = Object.freeze(["oferecerTrabalhoDaqui","pregarNoMural"]);
export const PORTAS_DO_DEPOIS = Object.freeze(["aplicar", "calou", "pushMsgs", "salvar", "agora", "sorte", ...["setMural"]]);

/* ---------------- o que é do módulo do App, à letra ---------------- */


/* ============================================================
   OS ÓRGÃOS DO DEPOIS
   osOrgaosDoDepois(estado, portas) → { ...ORGAOS_DO_DEPOIS, escritas, descarregar }
   ============================================================ */
export function osOrgaosDoDepois(estado, portas) {
  const $E = estado && typeof estado === "object" ? estado : {};
  const $P = portas && typeof portas === "object" ? portas : {};
  const $render0 = $E.render && typeof $E.render === "object" ? $E.render : {};
  const escritas = {};
  let pendentes = {};
  const partida = {};
  /* o App muda por dentro o que está nos refs, e à letra a peça faz o
     mesmo: cada campo que é objeto é COPIADO na primeira leitura (e a foto
     dele guardada), para o estado que entra não mudar; o que mudou por
     dentro sem ser reescrito vira escrita antes de cada porta e no fim */
  const $copias = {};
  const copiar = (c, v0) => {
    if (!v0 || typeof v0 !== "object") return v0;
    $copias[c] = { v: structuredClone(v0), foto: JSON.stringify(v0) };
    return $copias[c].v;
  };
  const lerCampo = (c) => {
    if (Object.prototype.hasOwnProperty.call(escritas, c)) return escritas[c];
    if (c in $copias) return $copias[c].v;
    if ($E[c] !== undefined) return copiar(c, $E[c]);
    if (!REFS_DO_DEPOIS[c]) return undefined;
    if (!(c in partida)) partida[c] = copiar(c, REFS_DO_DEPOIS[c].padrao());
    return partida[c];
  };
  const mudouPorDentro = () => {
    for (const [c, x] of Object.entries($copias)) {
      if (Object.prototype.hasOwnProperty.call(escritas, c)) { delete $copias[c]; continue; }
      if (JSON.stringify(x.v) !== x.foto) { escritas[c] = x.v; pendentes[c] = x.v; delete $copias[c]; }
    }
  };
  const $ref = new Proxy({}, {
    get: (_, c) => (typeof c === "string" ? lerCampo(c) : undefined),
    set: (_, c, v) => { escritas[c] = v; pendentes[c] = v; return true; },
  });
  const $partidaDoRender = {
    mundo: () => (null),
    nomeCampanha: () => (""),
    personagem: () => (null),
  };
  const $render = {};
  for (const n of RENDER_DO_DEPOIS) {
    const v = Object.prototype.hasOwnProperty.call($render0, n) ? $render0[n] : $E[n];
    $render[n] = v !== undefined ? v : $partidaDoRender[n]();
  }
  const descarregar = () => {
    mudouPorDentro();
    const x = pendentes;
    pendentes = {};
    if (Object.keys(x).length && typeof $P.aplicar === "function") $P.aplicar(x);
  };
  /* AS PORTAS. Antes de o App ter a palavra, recebe o que já se escreveu. */
  const calou = (onde, e) => { try { if (typeof $P.calou === "function") $P.calou(onde, e); } catch { /* o calou nunca custa o turno */ } return []; };
  /* a porta pode DEVOLVER a lista nova (o App: a luta carimba as
     mensagens); sem lista devolvida (o servidor), a peça junta as novas */
  const pushMsgs = (novas) => {
    descarregar();
    const lista = typeof $P.pushMsgs === "function" ? $P.pushMsgs(novas) : undefined;
    if (Array.isArray(lista)) { escritas.mensagens = lista; delete $copias.mensagens; }
    else $ref.mensagens = [...($ref.mensagens || []), ...(Array.isArray(novas) ? novas : [])];
  };
  const salvar = (extra) => { descarregar(); if (typeof $P.salvar === "function") $P.salvar(extra); };
  const setMural = (v) => { descarregar(); if (typeof $P.setMural === "function") $P.setMural(v); };
  const $agora = typeof $P.agora === "function" ? $P.agora : () => Date.now();
  void $agora;

  /* v9.22: `mundoAtual()` e `nomeCampanhaRef` existem porque VÁRIOS callbacks
     desta casa são useCallback de deps estreitas, criados no primeiro render —
     quando mundo é null e o nome da campanha é "". Ler o estado direto lá
     dentro devolve esses valores de nascimento para sempre. Aqui a
     consequência era silenciosa e por isso pior: o system prompt era
     remontado com campanha sem nome e mundo vazio toda vez que o cânone ou o
     registro de pessoas mudava, e o Mestre perdia contexto sem ninguém ver. */
  const mundoAtual = () => $ref.mundo || $render.mundo || null;
  const sementeMundo = () => `${$ref.nomeCampanha || $render.nomeCampanha || "aventura"}|${(mundoAtual() && mundoAtual().genero) || ""}`;
  const generoMundo = () => (mundoAtual() && mundoAtual().genero) || cenarioAtivo().generos.padrao;
  /* v9.40: a FORMA do mundo desta campanha. Todo gerador que fala de lugar
     recebe isto ao lado do gênero — um decide o sabor, o outro a forma. */
  const moldeMundo = () => moldePorId((mundoAtual() && mundoAtual().molde) || MOLDE_PADRAO);
  /* ---------------- ANDAR DENTRO DA CIDADE (v9.55) ----------------
     "Vou até o Javali Cambaleante." O Mestre narrou a travessia da praça e
     a porta da taverna, e o sistema deixou o herói no centro — o marcador
     do mapa não saiu do lugar.

     O Mestre estava certo em não registrar nada: o prompt lhe diz que
     `lugar_atual` é o que fica FORA da cidade. A taverna não é fora da
     cidade. O modelo tinha dois estados — dentro e fora — e a cidade
     inteira cabia no primeiro.

     Quem move, então, é o CÓDIGO, e move ANTES de o Mestre responder: o
     jogador escreveu o nome de um lugar que o sistema conhece, com um
     verbo de deslocamento. Não há o que interpretar, e é justamente o
     tipo de coisa que esta casa não delega.

     Vale para os dois lados do muro: um local de dentro vira `dentro` (sair
     dele leva minutos); um do cinturão vira `arredores` (leva horas), que é
     o que já era. E o Mestre recebe o fato pronto, não um pedido. */
  const semNome = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  /* ---------------- O MUNDO OFERECE TRABALHO (v9.37) ----------------
     O outro lado do mural, e a inversão que faltava: em vez de esperar o
     Mestre inventar um nobre desesperado e o Cronista tentar extrair etapas
     da prosa dele, o SISTEMA monta o serviço inteiro — quem pede, o que
     pede, quanto paga — e manda o Mestre encenar a abordagem.

     Ele vem da base do mundo, então a pessoa existe, mora em algum lugar
     desta cidade e tem uma vontade própria desde a criação da campanha. A
     preferência é por quem o herói JÁ conhece: um rosto conhecido pedindo
     ajuda vale mais que um estranho, e poupa o Mestre de apresentar gente
     nova a cada duas cenas.

     Conservador de propósito: fora de combate, fora de masmorra, no máximo
     um por dia e só quando o diário está com espaço. Trabalho oferecido
     demais vira ruído, e ruído é o oposto de uma oferta que importa. */
  /* MM18 (11/10): A HISTÓRIA NÃO SE OFERECE. A preferência por quem o herói
     já conhece punha no mural, no começo, justamente a gente da história —
     o alvo da principal pregou "A caçada de Noé Laminado" (4.ª sessão).
     Quem é da história (a pista, o alvo, quem as missões que não se
     recusam e os marcos por fazer nomeiam) fica fora do mural e da
     proposta do Mestre. E o papel pregado vence (`CARTAZ_ESPERA`). */
  const historiaDoMural = () => {
    try { return genteDaHistoria({ abertura: $ref.abertura, missoes: $ref.missoes, espinha: $ref.espinha, grupo: ($ref.personagem || $render.personagem || {}).grupo || [] }); }
    catch (e) { calou("a gente da história", e); return []; }
  };
  const oferecerTrabalhoDaqui = () => {
    /* MM13: nenhuma oferta avulsa antes de o herói estar orientado. */
    if (!muralLiberado({ abertura: $ref.abertura, missoes: $ref.missoes })) return;
    if ($ref.combate || $ref.masmorra) return;
    if (!$ref.cidadeAtual) return;
    if ($ref.ultimoTrabalhoDia >= $ref.dia) return;
    const abertas = garantirMissoes($ref.missoes).filter((q) => ["ativa", "oferecida"].includes(q.status));
    if (abertas.length >= 3) return;
    const p = $ref.personagem || $render.personagem || {};
    const candidatas = ofertasDaqui({
      semente: sementeMundo(), mapa: $ref.mapa, cidade: $ref.cidadeAtual,
      base: $ref.baseMundo, genero: generoMundo(), nivel: p.nivel || 1, quantas: 6,
      molde: moldeMundo(), lex: (mundoAtual() || {}).lexico,
      evitar: abertas.flatMap((q) => [q.titulo, q.dador]),
      historia: historiaDoMural(),
    });
    if (!candidatas.length) return;
    const conhecidos = new Set(Object.keys($ref.npcs || {}).map((n) => n.toLowerCase()));
    const of = candidatas.find((c) => conhecidos.has(String(c.dador).toLowerCase())) || candidatas[0];
    /* v9.119: O TRABALHO VAI PARA O MURAL, NÃO PARA O DIÁRIO. Antes ele
       virava missão "oferecida" ali mesmo, com duas linhas no log e um
       aceita/recusa no diário — uma segunda fonte de missões, opcional,
       disputando as mesmas vagas com a trama da história, que não é
       opcional. Agora quem quer o herói num serviço prega o papel e
       menciona; o herói vai ao mural se quiser. */
    if (!pregarNoMural({ ...of, oferecido: true })) return;
    $ref.ultimoTrabalhoDia = $ref.dia;
    /* o aviso espera a cena: quem o solta é `aplicarResposta`, depois da
       narração em que o Mestre encena a menção. Uma linha, e só: o log é a
       cena, e o cartaz já diz o resto quando o jogador abrir o mural. */
    $ref.trabalhoPendente = [`📋 ${of.dador} tem um trabalho no mural.`];
    $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDoRecado(of)}`;
  };
  /* Prega um cartaz no mural. Uma porta só, para o trabalho que o sistema
     sorteia e o que a ficção inventa nunca discordarem sobre a forma nem
     sobre quando o papel já está lá. */
  const pregarNoMural = (cartaz) => {
    if (!cartaz || !cartaz.titulo) return false;
    const chave = (c) => `${semNome(c.dador || "")}|${semNome(c.titulo || "")}`;
    const atual = $ref.mural || [];
    if (atual.some((c) => chave(c) === chave(cartaz))) return false;
    /* ---------------- UMA PESSOA, UM TRABALHO (achado na tela) ----------------
       Zulmira do Sino apareceu DUAS vezes no mural no mesmo turno: uma pelo
       trabalho que o sistema escolheu pregar por ela (🏹) e outra pelo que o
       Mestre relatou da própria cena (📋). Títulos diferentes, mesma pessoa,
       mesmo serviço — e duas linhas iguais no log.

       A regra que resolve isso não é nova: `ofertas.js` a escreve desde a
       v9.37 na terceira decisão dele, "cada pessoa tem UM trabalho, para
       sempre". Faltava valer também para o que a ficção prega. */
    if (cartaz.dador && atual.some((c) => c.oferecido && semNome(c.dador || "") === semNome(cartaz.dador))) return false;
    /* o que já está no diário não volta ao mural: seria oferecer de novo o
       serviço que o herói já pegou */
    const jaNoDiario = garantirMissoes($ref.missoes)
      .filter((q) => ["ativa", "oferecida", "concluida"].includes(q.status))
      .some((q) => semNome(q.titulo) === semNome(cartaz.titulo));
    if (jaNoDiario) return false;
    /* A1 · B4 (10/10): QUEM JÁ TEM TRABALHO COMIGO NÃO PREGA OUTRO. O título
       muda de um turno para o outro ("O que há no Oratório" / "Encontrar a
       guarda do portão") e a régua acima, que compara títulos, deixava
       passar — no ANTES (T7) o mural anunciou o trabalho que eu tinha
       aceite no turno anterior. É a lei de `ofertas.js` ("cada pessoa tem
       UM trabalho"), que até aqui valia só para o que estava no mural e não
       para o que já estava na mão. */
    try {
      const comigo = !!cartaz.dador && garantirMissoes($ref.missoes)
        .some((q) => q && q.status === "ativa" && q.dador && semNome(q.dador) === semNome(cartaz.dador));
      if (comigo) return false;
    } catch (e) { calou("o mural e quem já trabalha comigo", e); }
    const doMundo = atual.filter((c) => !c.oferecido);
    /* MM18: o papel nasce com data — vence ao fim de CARTAZ_ESPERA */
    const oferecidos = [...atual.filter((c) => c.oferecido), { ...cartaz, pregadoEm: cartaz.pregadoEm != null ? cartaz.pregadoEm : $ref.dia }].slice(-TETO_OFERECIDOS);
    $ref.mural = [...doMundo, ...oferecidos];
    setMural($ref.mural);
    return true;
  };
  /* ---------------- o que o render calculava ---------------- */
  /* ---------------- MURAL DE CONTRATOS (v9.37 · o mundo é que oferece) ----------------
     O mural deixou de ser uma tabela de sorteio e virou uma JANELA: os
     cartazes são os trabalhos que a gente desta cidade já queria ver feitos,
     lidos direto da base do mundo. Cada pessoa tem um serviço, sempre o
     mesmo, e o cartaz é só o papel onde ele foi parar. */
  /* Quantos cartazes de gente que falou com o herói o mural guarda. Eles
     sobrevivem à renovação — foram pregados POR ALGUÉM, não sorteados —,
     e sem teto a pilha cresceria para sempre. */
  const TETO_OFERECIDOS = 6;

  /* cada órgão corre dentro da sorte do turno (`portas.sorte`; sem ela, a
     da casa, como no App) e descarrega no fim — também quando estoura */
  const envolver = (f) => (...args) => { try { return comSorte($P.sorte, () => f(...args)); } finally { descarregar(); } };
  return { oferecerTrabalhoDaqui: envolver(oferecerTrabalhoDaqui), pregarNoMural: envolver(pregarNoMural), escritas, descarregar };
}
