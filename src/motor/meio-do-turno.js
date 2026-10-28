/* ============================================================
   O MEIO DO TURNO, FORA DO COMPONENTE (Fase T1, trilha A, 3.ª fatia)

   No `aplicarResposta` (App.jsx), entre o `aplicar` (a ficha e a luta) e o
   registo (o cânone e a gente), corriam quatro blocos que eram closure de
   React: a dádiva pendente, o mapa e as facções, as missões e o arco, e os
   sinais do Mestre. Moram aqui, puros e na MESMA ORDEM, com a forma das
   outras peças do motor:

     peça(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }

   - `estado` entra e sai substituído (o que entrou não é tocado);
   - `efeitos` é o que o App ainda tem de fazer fora do estado — o ref e a
     tela de cada coisa que mudou, na ordem em que mudava lá —, aplicado
     num lugar só (`aplicarOsEfeitos`);
   - `paraOCronista` são as linhas da nota do turno, na ordem;
   - `msgs` são as linhas da tela, na ordem.

   ESTA PRIMEIRA ETAPA (28/10): o lugar dito (`registrarOLugar`, a régua de
   `registrarLugar` do App, que o Cronista também chama), a névoa da
   vizinhança e o bloco do MAPA (`aplicarOMapa`) — as cidades e as facções
   que o Mestre registrou, o lugar dito, a cidade em que se pisa (a jornada
   que termina, a névoa que abre, a cerimónia da chegada), o meio da
   jornada, a facção do jogador, a geografia e a devoção das cidades novas.

   O mundo (a semente, o gênero, o molde, o léxico) vem em `ctx.mundo`
   (valor, ou função chamada só onde o código de lá chamava `sementeMundo()`
   e os seus irmãos). Nada aqui lê ref, chama setX ou o relógio.

   A PROVA: `testes/teste-motor-aplicar.mjs` (secção 7), byte a byte contra
   o App de d776408 (`gerar-meio-dourado.mjs`, as 275 narrações reais).
   ============================================================ */
import { lerLugarDito, distanciaNaCidade, definirLugar, ehOMesmoLugar, textoDoLugar, comEm, ehAPropriaCidade } from "../lugar.js";
import { locaisDaCidade, masmorrasDoMundo } from "../mundo-base.js";
import { comodosDoLocal } from "../comodos.js";
import { arredoresDaCidade, arredorPorTexto } from "../arredores.js";
import { criarCidade, criarFaccao } from "../mapa.js";
import { garantirGeografia, descobrirCidade, pisarNaCidade, descobrirVizinhanca } from "../geografia.js";
import { garantirDevocao } from "../devocao.js";
import { portaDaMasmorra } from "../rastro.js";

const objeto = (x) => (x && typeof x === "object" ? x : {});
const mundoDe = (op) => objeto(typeof op.mundo === "function" ? op.mundo() : op.mundo);
/* a cidade do mapa por nome — a `cidadeDoMapa` do App, sobre o mapa dado */
const cidadeNoMapa = (mapa, nome) => ((mapa && mapa.cidades) || [])
  .find((c) => String(c.nome || "").toLowerCase() === String(nome || "").toLowerCase()) || null;

/* ============================================================
   O LUGAR DITO — `registrarLugar` do App, pura

     registrarOLugar(estado, nome, fonte, ctx) → { aviso, lugar, mudou, efeitos, paraOCronista }

   Vem de dois lados — o Mestre pelo campo "lugar_atual" (imediato) e o
   Cronista lendo a narração (no fim do turno) —, e os dois passam por aqui,
   para o anúncio e a limpeza serem um só. `null` é "voltei para dentro da
   cidade". `estado`: { cidadeAtual, lugar, espinha, ultimoPedido, combate,
   masmorra, mapa, dia }. O corpo é o de lá linha por linha (d776408); os
   refs viraram estado, a escrita no lugar virou `{ lugar, mudou }`, a nota
   da recusa `paraOCronista`, e `calou` um efeito.
   ============================================================ */
export function registrarOLugar(estado, nome, fonte = "mestre", ctx = {}) {
  const e0 = objeto(estado);
  const op = objeto(ctx);
  const efeitos = [], paraOCronista = [];
  const calou = (onde, erro) => { efeitos.push({ tipo: "calou", onde, erro }); };
  const fica = (aviso) => ({ aviso, lugar: e0.lugar, mudou: false, efeitos, paraOCronista });
  const muda = (aviso, lugar) => ({ aviso, lugar, mudou: true, efeitos, paraOCronista });
  const cidade = e0.cidadeAtual || "";
  let cru = String(nome || "").trim();
  /* MM-C · C0: o sítio de cada marco de pé — o nome que a IA inventa não
     o troca (lugar.js, LUGAR_DO_MARCO) */
  let doMarco = [];
  try { doMarco = ((e0.espinha || {}).atos || []).flatMap((at) => ((at && at.marcos) || []).filter((m) => m && !m.feito && typeof m.onde === "string" && m.onde.trim()).map((m) => m.onde)); } catch (e) { calou("o sitio do marco", e); doMarco = []; }
  /* MM16 nº 4: NA LUTA E NA MASMORRA O LUGAR É DO SISTEMA (a regra mora em
     lugar.js, LUGAR_NA_CENA_DO_SISTEMA: dentro de uma luta ou de uma
     masmorra, o lugar dito é ignorado em silêncio — não move e não acusa).
     MM15: quem diz o lugar (o Cronista ou o Mestre) decide o que o "cidade"
     significa (`lerLugarDito`, QUEM_DIZ_O_LUGAR). Se a régua falhar, não
     mover é o erro barato. */
  let lido;
  try {
    lido = lerLugarDito(nome, { lugar: e0.lugar, cidade, pedido: e0.ultimoPedido, fonte, luta: !!e0.combate, masmorra: !!e0.masmorra, doMarco });
  } catch (e) { calou("registrarLugar/lerLugarDito", e); return fica(null); }
  if (lido.acao === "nada" || lido.acao === "ignora") return fica(null);
  /* o pedido apontou o sítio do marco: é ele que se regista */
  if (lido.acao === "novo" && typeof lido.nome === "string" && lido.nome.trim()) cru = lido.nome.trim();
  if (lido.acao === "recusa") {
    /* v9.48: SAIR DAQUI TAMBÉM É UM MOVIMENTO, e movimento é do jogador —
       o campo `lugar_atual: null` passa pela mesma régua da narração: só
       volta quem escreveu que volta. */
    paraOCronista.push(`[LUGAR — RECUSADO PELO SISTEMA] Você me tirou de onde eu estava — ${e0.lugar.nome} — sem que eu tenha dito que saio. O SISTEMA registra que eu continuo LÁ. Retome a cena ${comEm(e0.lugar.nome)} — eu não caminhei de volta e não cheguei a lugar nenhum. Só eu decido sair daqui, e só quando eu escrever isso.`);
    return fica(null);
  }
  if (lido.acao === "volta") {
    const antigo = e0.lugar;
    return muda(`📍 De volta ${cidade ? `a ${cidade}` : "à cidade"} — ${antigo.nome} fica para trás.`, null);
  }
  /* "novo": segue a régua de sempre.
     v9.55: se o nome é um local DESTA cidade, a distância é `dentro` — e
     não a de arredores que o classificador por texto daria a uma taverna. */
  const mapa = e0.mapa;
  const dist = (() => {
    const cid = (mapa.cidades || []).find((c) => (c.nome || "").toLowerCase() === String(cidade).toLowerCase());
    if (!cid) return null;
    try {
      const m = mundoDe(op);
      const locais = locaisDaCidade(m.semente, cid, m.genero, m.molde, m.lex);
      const semA = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
      const aqui = e0.lugar; const anfitriao = aqui && locais.find((l) => semA(l.nome) === semA(aqui.dentroDe || aqui.nome)); return distanciaNaCidade(cru, { locais, comodos: anfitriao ? comodosDoLocal(m.semente, anfitriao, m.genero, m.molde) : [], arredores: arredoresDaCidade(m.semente, cid), masmorras: masmorrasDoMundo(m.semente, mapa).filter((mm) => mm.cidadeProxima === cid.nome), foraDosMuros: !!(aqui && aqui.distancia !== "dentro") }); /* MM14: arredores só fora dos muros */
    } catch { return null; }
  })();
  /* v9.118: se o nome é um arredor que o sistema gerou, o ponto é o DELE —
     o moinho não muda de lado da cidade porque foi o Mestre quem o nomeou
     desta vez. Sem arredor, a cidade é a âncora e o nome decide o resto. */
  const cidAncora = e0.cidadeAtual ? ((mapa.cidades || []).find((c) => (c.nome || "").toLowerCase() === String(e0.cidadeAtual).toLowerCase()) || null) : null;
  const arr = cidAncora ? (() => { try { return arredorPorTexto(mundoDe(op).semente, cidAncora, cru); } catch { return null; } })() : null;
  const novo = definirLugar(cru, { cidade, dia: e0.dia, distancia: dist, ancora: cidAncora, coord: (arr && arr.coord) || null });
  if (!novo || ehOMesmoLugar(novo, e0.lugar)) return fica(null);
  return muda(`📍 Você está ${comEm(textoDoLugar(novo))}.`, novo);
}

/* ---------------- A NÉVOA AO REDOR (v9.51) ----------------
   Chegar a uma cidade abre a vizinhança dela: as cidades ligadas por uma
   rota direta entram no mapa marcadas como conhecidas DE OUVIR. Um mapa de
   um ponto é um alfinete. Devolve o mapa (o mesmo, se nada abriu) e a
   linha da tela (ou null). */
export function nevoaDaVizinhanca(mapa, nomeCidade) {
  const viz = descobrirVizinhanca(mapa, nomeCidade);
  if (!viz.novas.length) return { mapa, msg: null };
  const n = viz.novas.length;
  return { mapa: viz.mapa, msg: `🗺 De ${nomeCidade} você fica sabendo de ${n === 1 ? "mais um lugar" : `mais ${n} lugares`}: ${viz.novas.join(", ")} — ouvido no mercado, não visto de perto.` };
}

/* ============================================================
   O MAPA E AS FACÇÕES — o bloco do `aplicarResposta`, puro

     aplicarOMapa(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }

   `estado`: { personagem, mapa, cidadeAtual, lugar, jornada, faccaoJogador,
   devocao, divindade, combate, acampado, masmorra, espinha, ultimoPedido,
   dia }. Os efeitos: `mapa`, `cidadeAtual`, `lugar`, `jornada`,
   `faccaoJogador`, `devocao`, e a cerimónia — `lugarNovo` (a primeira
   pisada) ou `chegada` (a faixa; a chave dela, `Date.now()`, põe-na o App).

   UMA COISA QUE O CÓDIGO DE LÁ FAZ E QUE SE MANTÉM, por ser prova byte a
   byte e não conserto: as cidades e facções do Mestre caem numa CÓPIA do
   mapa (`mp`) feita no começo, e no fim, se ela mudou, é ela que vira o
   mapa — por cima do que a cidade pisada, a névoa e a descoberta tinham
   escrito no mesmo turno. Está no diário de 28/10, como achado.
   ============================================================ */
export function aplicarOMapa(estado, resposta, ctx = {}) {
  const e0 = objeto(estado);
  const op = objeto(ctx);
  const resp = objeto(resposta);
  const msgs = [], notas = [], efeitosDoTurno = [];
  const ef = (x) => { efeitosDoTurno.push(x); };
  const calou = (onde, erro) => { ef({ tipo: "calou", onde, erro }); };
  const pers = e0.personagem;
  let mapa = e0.mapa, cidadeAtual = e0.cidadeAtual, lugar = e0.lugar, jornada = e0.jornada, faccaoJogador = e0.faccaoJogador, devocao = e0.devocao;
  if (resp.mudancas) {
    const md = resp.mudancas;
    let mp = { ...mapa, cidades: [...(mapa.cidades || [])], faccoes: [...(mapa.faccoes || [])] };
    let mudouMapa = false;
    (md.mapa_cidades || []).forEach((cd) => {
      if (!cd || !cd.nome) return;
      const i = mp.cidades.findIndex((c) => c.nome.toLowerCase() === cd.nome.toLowerCase());
      if (i === -1) { mp.cidades.push(criarCidade(cd.nome, cd)); msgs.push(`🗺 ${cd.nome} registrada no mapa`); }
      else mp.cidades[i] = { ...mp.cidades[i], ...cd, x: mp.cidades[i].x, y: mp.cidades[i].y };
      mudouMapa = true;
    });
    (md.mapa_faccoes || []).forEach((fc) => {
      if (!fc || !fc.nome) return;
      const i = mp.faccoes.findIndex((f) => f.nome.toLowerCase() === fc.nome.toLowerCase());
      if (i === -1) mp.faccoes.push(criarFaccao(fc.nome, fc));
      else mp.faccoes[i] = { ...mp.faccoes[i], ...fc };
      if (fc.doJogador) { faccaoJogador = fc.nome; ef({ tipo: "faccaoJogador", faccao: faccaoJogador }); }
      mudouMapa = true;
    });
    /* v9.39: onde estou, quando não é a cidade. Vem antes de `cidade_atual`
       de propósito: chegar a uma cidade apaga o sublocal, e a ordem inversa
       deixaria um fantasma de fazenda pendurado na cidade nova. */
    /* MM16 nº 4: O TURNO QUE ABRE A MASMORRA PELO SINAL. A porta só abre
       400 ms depois, e um null do Mestre à boca era julgado contra o lugar
       de antes da porta e virava recusa. Se a porta deste turno vai abrir (a
       mesma régua que o sinal usa, lida antes), o lugar dito cala. */
    const abreAMasmorraAgora = (() => {
      try {
        if (e0.combate || e0.acampado || e0.masmorra) return false;
        const sinais = Array.isArray(md.sinais) ? md.sinais.slice(0, 6) : [];
        return sinais.some((bruto) => {
          const txt = String(bruto || "").trim();
          const ix = txt.indexOf(":");
          if ((ix < 0 ? txt : txt.slice(0, ix)).trim().toLowerCase() !== "masmorra") return false;
          const arg = ix < 0 ? "" : txt.slice(ix + 1).trim();
          const pm = portaDaMasmorra({ nome: arg }, { cidadeAtual, emViagem: !!jornada, lugar, masmorras: masmorrasDoMundo(mundoDe(op).semente, mapa) });
          return !!(pm && pm.ok);
        });
      } catch (e) { calou("lugar_atual/abreAMasmorraAgora", e); return false; }
    })();
    if (Object.prototype.hasOwnProperty.call(md, "lugar_atual") && !abreAMasmorraAgora) {
      const r = registrarOLugar({ cidadeAtual, lugar, espinha: e0.espinha, ultimoPedido: e0.ultimoPedido, combate: e0.combate, masmorra: e0.masmorra, mapa, dia: e0.dia }, md.lugar_atual, "mestre", op);
      efeitosDoTurno.push(...r.efeitos); notas.push(...r.paraOCronista);
      if (r.mudou) { lugar = r.lugar; ef({ tipo: "lugar", lugar }); }
      if (r.aviso) msgs.push(r.aviso);
    }
    if (md.cidade_atual) {
      /* v9.48: repetir a cidade em que já estou não é chegar a lugar
         nenhum — só MUDAR de cidade encerra o que estava fora dela. */
      const trocouCidade = !ehAPropriaCidade(md.cidade_atual, cidadeAtual || "") && String(md.cidade_atual).trim().toLowerCase() !== String(cidadeAtual || "").trim().toLowerCase();
      cidadeAtual = md.cidade_atual; ef({ tipo: "cidadeAtual", cidade: cidadeAtual });
      if (trocouCidade && lugar) { lugar = null; ef({ tipo: "lugar", lugar: null }); }
      /* CHEGADA: registrar uma cidade encerra a jornada — a partir daqui eu
         ESTOU nessa cidade (e o descanso pode ser em estalagem/aposentos). */
      if (jornada) {
        jornada = null; ef({ tipo: "jornada", jornada: null });
        msgs.push(`🧭 Chegada: agora você está em ${md.cidade_atual}.`);
      }
      /* A NÉVOA ABRE ONDE O PÉ PISA (v9.14): chegar revela o lugar. */
      const dsc = descobrirCidade(mapa, md.cidade_atual);
      if (dsc.nova) {
        mapa = dsc.mapa; ef({ tipo: "mapa", mapa });
        msgs.push(`🗺 ${dsc.nova} entrou no seu mapa.`);
      }
      /* PRIMEIRA PISADA, ANTES DE PISAR (v9.181): depois de `pisarNaCidade`
         ninguém consegue mais saber se era a primeira vez. */
      const primeiraPisada = !((cidadeNoMapa(mapa, md.cidade_atual) || {}).pisada);
      mapa = pisarNaCidade(mapa, md.cidade_atual); ef({ tipo: "mapa", mapa });
      const viz = nevoaDaVizinhanca(mapa, md.cidade_atual);
      if (viz.msg) { mapa = viz.mapa; ef({ tipo: "mapa", mapa }); msgs.push(viz.msg); }
      /* A FAIXA DE CHEGADA (v9.163): só quando de fato se TROCOU de cidade.
         E QUEM PISA PELA PRIMEIRA VEZ ganha a cerimônia inteira em vez da
         faixa: chegar acontece toda viagem, descobrir uma vez por cidade. */
      if (trocouCidade) {
        const cid = cidadeNoMapa(mapa, md.cidade_atual) || {};
        if (primeiraPisada) ef({ tipo: "lugarNovo", cidade: { ...cid, nome: cid.nome || md.cidade_atual } });
        else ef({ tipo: "chegada", chegada: { cidade: md.cidade_atual, regiao: cid.regiao || "", bioma: cid.bioma || "", tipo: cid.tipo || "" } });
      }
    }
    if (md.jornada_meio && jornada) {
      jornada = { ...jornada, meio: String(md.jornada_meio).slice(0, 40) };
      ef({ tipo: "jornada", jornada });
    }
    if (md.faccao_jogador) { faccaoJogador = md.faccao_jogador; ef({ tipo: "faccaoJogador", faccao: faccaoJogador }); }
    if (mudouMapa) {
      mp = garantirGeografia(mp, pers && pers.nome ? `taverna|${pers.nome}` : "taverna"); mapa = mp; ef({ tipo: "mapa", mapa });
      /* as cidades novas entram no registro de devoção sozinhas (zeradas) */
      devocao = garantirDevocao(devocao, mapa, e0.divindade); ef({ tipo: "devocao", devocao });
    }
  }
  return {
    estado: { ...e0, mapa, cidadeAtual, lugar, jornada, faccaoJogador, devocao },
    efeitos: efeitosDoTurno, paraOCronista: notas, msgs,
  };
}
