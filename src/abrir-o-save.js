/* ============================================================
   O SAVE, ABERTO COMO O LOAD O ABRE (Fase 4, trilha B, 29/10/2026) —
   src/abrir-o-save.js

   O load do App (`continuar`) nunca entrega o save cru às peças: passa
   cada campo por uma regra, e boa parte delas não se limita ao campo — o
   mapa nasce do nome do herói, as guildas do mapa, os governos, o reino e a
   fé do mapa, a história da estrutura do mundo, as missões das quests
   antigas, o relógio do sono do dia e do minuto. Até aqui o servidor só
   sabia o `null` como a ausência (o `padrao()` das peças: motor/eco-do-
   turno.js), e dez campos ficavam como o save os trazia, não como o jogo os
   abre. Esta peça é a regra do load para esses dez, TIRADA do App sem lhe
   mexer (a troca no `continuar` é da trilha A, e está no diário):

   - `personagem`: `migrarPersonagem` (a ficha de um save antigo ganha o
     que as versões novas acrescentaram — o mesmo de `lerSave`);
   - `nomeCampanha`: `nomeDaCampanha` (o save mudo volta como «A saga de
     X», que é o que o App mostra, grava e semeia);
   - os oito de `NULO_QUE_O_LOAD_REFAZ` — `mapa` (a geografia, a névoa dos
     saves de antes da v9.14 e a cidade pisada), `guildas`, `missoes` (com
     as quests antigas, que a migração lê e reescreve), `historia`,
     `governos`, `reino`, `devocao` e `acordouAbs`.

   A SEMENTE das guildas é a do save (o nome da campanha e o gênero), e não
   a do App de hoje: no `continuar` o `sementeMundo()` lê `nomeCampanhaRef`
   e `mundoRef`, que o load ainda NÃO trocou (os efeitos do React correm
   depois) — numa página aberta de fresco a campanha sai «aventura|» e as
   guildas de um save sem guildas mudam conforme o que a aba abriu antes. A
   migração das tarefas (MM14), no mesmo load, já lê do `sv` pelo mesmo
   motivo, e é essa regra que se segue. A dos dados (o reino que nasce para
   um domínio sem registo, o id de uma missão sem id) é a casa do load — o
   `semearACasa` do topo do `continuar` —, refeita por `sorte` quando não
   vem uma.

   O QUE É DA SENTADA (`naSentada`). Duas regras do load só fazem sentido
   ao abrir uma campanha, e o App corre-as uma vez por sentada: o teto do
   sono (acordado há mais de 48 horas = acordou agora, o conserto do
   `acordouAbs = 0` dos saves antigos) e a oferta parada no diário que vai
   para o mural (v9.119). O servidor abre o save em TODO turno — corrê-las
   ali tiraria o cansaço a um herói dois dias acordado e mudaria de lugar a
   oferta que o Mestre acabou de pôr, o que o App, a meio da sentada, nunca
   faz. Com `naSentada: false` (o servidor) ficam de fora; o resto é
   idempotente (abrir o aberto dá o mesmo — a suíte prova-o) e corre sempre.

   O que a regra arrasta vai junto, como no load: a marca da névoa
   (`nevoaVersao`), as quests (que a migração das tarefas marca) e, na
   sentada, o mural.

   Puro: não muda o save, devolve um novo. Lixo (null, array, string) é o
   save vazio, aberto. As guardas de cada campo são as do App, e onde o load
   do App lançaria (um mapa cujas cidades não são lista) a peça lança também
   — no App o `continuar` corre num try, no servidor a rota dá 422.
   ============================================================ */
import { migrarPersonagem } from "./regras-jogo.js";
import { nomeDaCampanha } from "./arquivo.js";
import { garantirGeografia, gerarGeografia, pisarNaCidade } from "./geografia.js";
import { moldePorId, MOLDE_PADRAO } from "./moldes.js";
import { guildasDoMundo, garantirGuilda } from "./guildas.js";
import { garantirMissoes, recompensaDe } from "./missoes.js";
import { cartazDaProposta } from "./ofertas.js";
import { migrarTarefasAntigas } from "./tarefas-antigas.js";
import { garantirHistoria } from "./historia.js";
import { garantirGovernos } from "./dominios.js";
import { garantirReino } from "./reino.js";
import { garantirDevocao } from "./devocao.js";
import { garantirDivindade } from "./divindades.js";
import { AMANHECER } from "./calendario.js";
import { cenarioAtivo } from "./cenario.js";
import { SEMENTE_DA_CASA, comSorte, hashSemente, rng } from "./semente.js";

/* os números e as palavras do load, cada um com o sítio do App de onde saiu */
export const ABRIR_O_SAVE = Object.freeze({
  /* `taverna|${nome do herói || "save"}`: a semente da geografia (v7.5) */
  sementeDaGeografia: "taverna",
  heroiSemNome: "save",
  /* o nome da campanha que a semente usa quando nem o herói o dá (o
     `sementeMundo` e a migração MM14) */
  semNome: "aventura",
  /* a história de um save sem estrutura parte da do mundo, ou desta */
  estruturaPadrao: "jornada",
  /* o minuto de um save sem relógio: uma hora depois do amanhecer */
  minutoDepoisDoAmanhecer: 60,
  /* RELÓGIO DO SONO (v9.5): acima disto acordado, o load trata como descansado */
  horasAcordadoMax: 48,
  /* a quest antiga entra como missão de UMA etapa num dia inalcançável (v9.27) */
  diaDoLegado: 999999,
  /* os dez campos que esta peça abre (a suíte confere cada um contra o App) */
  campos: Object.freeze(["personagem", "nomeCampanha", "mapa", "guildas", "missoes", "historia", "governos", "reino", "devocao", "acordouAbs"]),
});

const ehObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* A semente do mundo de um save: a do `semearACasa` do topo do load e a da
   migração das tarefas */
export const aSementeDoSave = (sv) => {
  const s = ehObj(sv) ? sv : {};
  return `${nomeDaCampanha(s) || ABRIR_O_SAVE.semNome}|${(ehObj(s.mundo) && s.mundo.genero) || ""}`;
};

/* O HERÓI NOVO NASCE COMO O LOAD O ABRE (Fase 4, trilha A, 29/10/2026).
   Duas regras do load que a criação de uma campanha não corria, e que por
   isso faziam a primeira sentada ser outra que a de depois de recarregar:
   - a FICHA: o herói recém-criado nunca passava por `migrarPersonagem` —
     sem `suprimentos`, a mochila lia 0 rações, 0 água, 0 tochas e nenhum
     kit (o balcão vendia-lhe o kit), e ao recarregar ganhava 10/10/5 e o
     kit de graça (regras-jogo.js, `suprimentos` da migração);
   - a CIDADE PISADA: a casa do herói abria descoberta, mas só ganhava a
     marca `pisada` (v9.54) no primeiro load.
   As duas são as mesmas que `abrirOSave` corre — uma regra, dois sítios
   (o `continuar` e o `iniciar` do App). Puras; o que não é ficha volta
   como veio, e sem cidade o mapa fica. */
export const aFichaAberta = (p) => (ehObj(p) ? migrarPersonagem(p) : p);
export const comACidadePisada = (mapa, cidade) => (cidade ? pisarNaCidade(mapa, cidade) : mapa);

/* o mapa: a geografia do save, ou o mundo inteiro gerado (save antigo sem
   cidades); a névoa (v9.14: save sem a marca tem TUDO revelado); a cidade
   onde o save parou, pisada (v9.54) */
function oMapa(sv) {
  const mundo = ehObj(sv.mundo) ? sv.mundo : {};
  const heroi = ehObj(sv.personagem) && sv.personagem.nome ? sv.personagem.nome : ABRIR_O_SAVE.heroiSemNome;
  const semente = `${ABRIR_O_SAVE.sementeDaGeografia}|${heroi}`;
  let mapa;
  if (sv.mapa && sv.mapa.cidades && sv.mapa.cidades.length) mapa = garantirGeografia(sv.mapa, semente);
  else {
    const geo = gerarGeografia(semente, moldePorId(mundo.molde || MOLDE_PADRAO), mundo.lexico);
    mapa = { cidades: geo.cidades, faccoes: (sv.mapa && sv.mapa.faccoes) || [], continente: geo.continente, regioes: geo.regioes, rotas: geo.rotas };
  }
  if (!sv.nevoaVersao) mapa = { ...mapa, cidades: (mapa.cidades || []).map((c) => ({ ...c, descoberta: true })) };
  return comACidadePisada(mapa, sv.cidadeAtual || "");
}

/* as missões: a lista do save, ou as quests antigas ativas como missão de
   uma etapa (v9.27); na sentada, a oferta parada vai ao mural (v9.119); e
   a lista antiga vira missão do sistema (MM14) */
function asMissoes(sv, e, naSentada) {
  const pers = e.personagem;
  const nivel = (pers && pers.nivel) || 1;
  let quests = Array.isArray(sv.quests) ? sv.quests : [];
  let mural = Array.isArray(sv.mural) ? sv.mural : [];
  let missoes;
  if (Array.isArray(sv.missoes)) missoes = garantirMissoes(sv.missoes);
  else missoes = garantirMissoes((sv.quests || [])
    .filter((q) => q && q.titulo && q.status === "ativa")
    .map((q) => ({
      titulo: q.titulo, tipo: q.tipo === "principal" ? "principal" : "favor",
      descricao: q.descricao || q.objetivo || "", status: "ativa",
      etapas: [{ tipo: "aguentar", dia: ABRIR_O_SAVE.diaDoLegado, rotulo: q.objetivo || q.titulo, feito: false }],
      legado: true,
      recompensa: recompensaDe({ tipo: q.tipo === "principal" ? "principal" : "favor", nivel, etapas: 1 }),
      criadaEm: sv.dia || 0,
    })));
  let muralMudou = false;
  if (naSentada) {
    const oferecidas = missoes.filter((q) => q.status === "oferecida");
    if (oferecidas.length) {
      const jaNoMural = new Set(mural.map((c) => semAcento(c.titulo)));
      const novos = [], ficam = [];
      for (const q of oferecidas) {
        const c = jaNoMural.has(semAcento(q.titulo)) ? null : cartazDaProposta(
          { ...q, paga: (q.recompensa && q.recompensa.moedas) != null ? q.recompensa.moedas : q.moedasPrometidas },
          { cidade: sv.cidadeAtual || "", nivel });
        if (c) novos.push(c); else ficam.push(q.titulo);
      }
      if (novos.length) {
        mural = [...mural, ...novos]; muralMudou = true;
        missoes = missoes.filter((q) => q.status !== "oferecida" || ficam.includes(q.titulo));
      }
    }
  }
  try {
    const mw = ehObj(sv.mundo) ? sv.mundo : {};
    const mg = migrarTarefasAntigas(quests, missoes, {
      semente: aSementeDoSave(sv),
      mapa: e.mapa,
      cidadeAtual: sv.cidadeAtual || "",
      genero: mw.genero || cenarioAtivo().generos.padrao,
      molde: moldePorId(mw.molde || MOLDE_PADRAO),
      lex: mw.lexico || null,
      nivel,
      dia: sv.dia || 0,
    });
    if (mg.migradas.length) { quests = mg.quests; missoes = mg.missoes; }
  } catch { /* o calou do App: a migração nunca custa a abertura */ }
  return { missoes, quests, ...(muralMudou ? { mural } : {}) };
}

/* O SAVE ABERTO. `opcoes`: { naSentada = true, sorte }. Devolve o save
   com os dez campos como o load os deixa; os outros campos, intactos. */
export function abrirOSave(save, opcoes) {
  const sv = ehObj(save) ? save : {};
  const op = ehObj(opcoes) ? opcoes : {};
  const naSentada = op.naSentada !== false;
  const sorte = typeof op.sorte === "function" ? op.sorte : rng(hashSemente(`${SEMENTE_DA_CASA}|${aSementeDoSave(sv)}`));
  return comSorte(sorte, () => {
    const e = { ...sv };
    if (ehObj(sv.personagem)) e.personagem = aFichaAberta(sv.personagem);
    e.nomeCampanha = nomeDaCampanha(sv);
    const mundo = ehObj(sv.mundo) ? sv.mundo : {};
    e.mapa = oMapa(sv);
    e.nevoaVersao = 1;
    e.reino = garantirReino(ehObj(sv.reino) ? sv.reino : {}, e.mapa) || {};
    e.governos = garantirGovernos(sv.governos, e.mapa);
    e.devocao = garantirDevocao(sv.devocao, e.mapa, garantirDivindade(sv.divindade));
    e.historia = garantirHistoria(sv.historia && sv.historia.estrutura ? sv.historia : { estrutura: mundo.estrutura || ABRIR_O_SAVE.estruturaPadrao, etapa: 0 });
    e.guildas = Array.isArray(sv.guildas) && sv.guildas.length
      ? sv.guildas.map(garantirGuilda)
      : guildasDoMundo(aSementeDoSave(sv), e.mapa, mundo.genero || cenarioAtivo().generos.padrao, mundo.lexico);
    Object.assign(e, asMissoes(sv, e, naSentada));
    const dia = sv.dia || 1;
    const minuto = sv.minuto != null ? sv.minuto : AMANHECER + ABRIR_O_SAVE.minutoDepoisDoAmanhecer;
    const agoraAbs = (dia - 1) * 1440 + minuto;
    const bruto = sv.acordouAbs != null ? sv.acordouAbs : agoraAbs;
    e.acordouAbs = naSentada && (agoraAbs - bruto) > ABRIR_O_SAVE.horasAcordadoMax * 60 ? agoraAbs : bruto;
    return e;
  });
}
