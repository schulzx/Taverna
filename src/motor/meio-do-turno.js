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
import { garantirDevocao, fieisTotais, espalharFieis, depositarFieis, perderFieis } from "../devocao.js";
import { portaDaMasmorra } from "../rastro.js";
import { registrarMarco, virarEtapa, envelopeDeVirada } from "../historia.js";
import { sortearDadiva } from "../regras.js";
import { gerarDadivaUnica, envelopeDaUnica } from "../dadivas.js";
import { MAGNITUDE_FE, fieisPorFeito, caminhoPorId, grauDe, gdMaximoPorNivel, GRAUS, tituloDe, milagrePorId } from "../divindades.js";
import { podeAbrirRaid } from "../raids.js";
import { gerarLoot, RARIDADE_ROTULO } from "../loot.js";
import { empilhar, efeitoDeMilagre } from "../efeitos.js";
import { calcularFama } from "../fama.js";
import { dominiosDe } from "../gestao.js";

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

/* ============================================================
   A 2.ª ETAPA (28/10): AS DÁDIVAS, O ARCO, A FÉ, O MILAGRE, AS MISSÕES E
   OS SINAIS

   As regras que o App guardava em closures (`concederDadivas`,
   `marcarNoArco`, `ganharFe`, `invocarMilagre`) moram aqui, puras; o App
   ficou com quatro fiações finas com os mesmos nomes, porque os botões, o
   descanso, as missões e o Cronista também as chamam. E os dois blocos do
   `aplicarResposta` que as usavam — as missões (o evento global que se
   encerra) e os sinais do Mestre — vieram com elas.

   UMA TROCA DECLARADA, a única desta etapa: `ganharFe` lia o nível do
   herói em `personagem` — o do render. O `aplicarResposta` é um
   `useCallback` com `[pushMsgs]`, nasce no primeiro render, e lá
   `personagem` é `null`: todo sinal "fe:" com o deus desperto estourava
   `personagem.nivel` e levava o turno inteiro. Aqui o nível vem do estado
   (`estado.nivel`, a ficha do turno). O dourado (`gerar-meio-dourado.mjs`)
   faz a mesma troca no código de antes, e só essa.
   ============================================================ */

/* ---------------- DÁDIVA ÉPICA (v8.1) ----------------
   No ápice mortal, cada 30k XP rende uma dádiva: o sistema sorteia da
   tabela; 15% das vezes ela é ÚNICA, e o sistema gera nome e número (v9.32:
   a única deixou de ser um pedido ao Mestre — quando ele narrava e esquecia
   de registrar, o jogador lia o nome de uma dádiva que não existia).
     dadivasConcedidas(ficha, divindade) → { personagem, msgs, notas } */
export function dadivasConcedidas(personagem, divindade) {
  let p = personagem;
  const msgs = [], notas = [];
  while ((p.dadivasPendentes || 0) > 0) {
    const r = sortearDadiva(p.dadivas || []);
    p = { ...p, dadivasPendentes: p.dadivasPendentes - 1 };
    if (r.unica) {
      const u = gerarDadivaUnica(p, {
        dominio: (divindade && divindade.dominio) || "",
        titulo: (divindade && divindade.despertar) ? tituloDe(grauDe(divindade)) : "",
        quantas: (p.dadivasUnicas || []).length,
      });
      const ef = u.efeito || {};
      p = {
        ...p,
        dadivasUnicas: [...(p.dadivasUnicas || []), u],
        vidaMax: (p.vidaMax || 10) + (ef.vidaMax || 0),
        vida: Math.min((p.vidaMax || 10) + (ef.vidaMax || 0), (p.vida || 0) + (ef.vidaMax || 0)),
        manaMax: (p.manaMax || 8) + (ef.manaMax || 0),
        mana: Math.min((p.manaMax || 8) + (ef.manaMax || 0), (p.mana || 0) + (ef.manaMax || 0)),
        bonusDefesa: (p.bonusDefesa || 0) + (ef.defesa || 0),
      };
      msgs.push(`🌠 DÁDIVA ÉPICA ÚNICA: ${u.nome} — ${u.desc}`);
      notas.push(envelopeDaUnica(u, p));
    } else {
      const d = r.dadiva;
      const ef = d.efeito || {};
      p = {
        ...p,
        dadivas: [...(p.dadivas || []), d.id],
        vidaMax: (p.vidaMax || 10) + (ef.vidaMax || 0),
        vida: Math.min((p.vidaMax || 10) + (ef.vidaMax || 0), (p.vida || 0) + (ef.vidaMax || 0)),
        manaMax: (p.manaMax || 8) + (ef.manaMax || 0),
        mana: Math.min((p.manaMax || 8) + (ef.manaMax || 0), (p.mana || 0) + (ef.manaMax || 0)),
        bonusDefesa: (p.bonusDefesa || 0) + (ef.defesa || 0),
      };
      msgs.push(`🌠 DÁDIVA ÉPICA: ${d.nome} — ${d.desc}`);
      notas.push(`[DÁDIVA ÉPICA CONCEDIDA PELO SISTEMA] "${d.nome}": ${d.desc} Já aplicada na ficha — narre o momento em que esse poder desperta nele, com o peso que merece. NÃO invente outro nome, NÃO mude o efeito e NÃO envie "adicionar_habilidades".`);
    }
  }
  return { personagem: p, msgs, notas };
}

/* ---------------- O MARCO NO ARCO ----------------
   Um acontecimento do motor empurra o arco; se o empurrão bastar, o
   momento vira — em SILÊNCIO para o jogador. Quem recebe a virada é o
   Mestre, por envelope, e só como mudança de tom. `motor` é o motor do arco
   (valor, ou função chamada no instante da virada, como lá).
     arcoComOMarco(historia, tipo, rotulo, motor) → { historia, mudou, notas, remontar }
   O arco nunca pode derrubar o turno: o que estourar fica como estava. */
export function arcoComOMarco(historia, tipo, rotulo, motor) {
  const saida = { historia, mudou: false, notas: [], remontar: false };
  try {
    const r = registrarMarco(historia, tipo, rotulo);
    if (!r.ganhou) return saida;
    saida.historia = r.historia; saida.mudou = true;
    const v = virarEtapa(saida.historia, typeof motor === "function" ? motor() : motor);
    if (v.virou) {
      saida.historia = v.historia;
      saida.notas.push(envelopeDeVirada(v));
      saida.remontar = true;
    }
  } catch { /* o arco nunca pode derrubar o turno */ }
  return saida;
}

/* ---------------- A FÉ QUE SE GANHA ----------------
   A ÚNICA FONTE DE VERDADE DOS FIÉIS é o mapa: a fé cai numa cidade (ou
   nas estradas), e o número da ascensão é RECALCULADO, nunca somado à mão.
   `estado`: { divindade, devocao, mapa, cidadeAtual, dia, nivel, personagem }.
     ganhoDeFe(estado, fieis, pf, motivo, local) → { divindade, devocao, msgs, notas, efeitos } */
export function ganhoDeFe(estado, fieis, pf, motivo, local) {
  const e0 = objeto(estado);
  const dv = e0.divindade;
  const saida = { divindade: dv, devocao: e0.devocao, msgs: [], notas: [], efeitos: [] };
  if (!dv || !dv.despertar) return saida;
  const antes = grauDe(dv);
  let onde = "";
  let virada = null;
  let dev = e0.devocao;
  if (fieis > 0) {
    const dep = depositarFieis(dev, e0.mapa, local || e0.cidadeAtual, fieis, e0.dia);
    dev = dep.devocao;
    onde = dep.cidade
      ? ` em ${dep.cidade.nome} (+${dep.pontos}% de devoção${dep.sobra ? `; ${dep.sobra} transbordam para as estradas` : ""})`
      : " pelas estradas (andarilhos)";
    /* virou de patamar? isso é notícia — para o jogador e para o Mestre */
    if (dep.cidade && dep.estadoAntes && dep.estadoDepois && dep.estadoAntes.chave !== dep.estadoDepois.chave) {
      virada = { cidade: dep.cidade.nome, de: dep.estadoAntes, para: dep.estadoDepois };
    }
  } else if (fieis < 0) {
    dev = perderFieis(dev, e0.mapa, -fieis);
  }
  if (fieis) { saida.devocao = dev; saida.efeitos.push({ tipo: "devocao", devocao: dev }); }
  const totalFieis = fieisTotais(e0.mapa, dev);
  const novo = { ...dv, fieis: totalFieis, pf: Math.max(0, dv.pf + (pf || 0)) };
  saida.divindade = novo; saida.efeitos.push({ tipo: "divindade", divindade: novo });
  const tetoGd = gdMaximoPorNivel(e0.nivel || 1);
  const depois = Math.min(grauDe(novo), tetoGd);
  const msgs = saida.msgs;
  if (fieis) msgs.push(`${dv.iconeFe || "🙏"} ${fieis > 0 ? "+" : ""}${fieis} fiéis${onde} (${novo.fieis} no total)${motivo ? ` — ${motivo}` : ""}`);
  if (virada) {
    msgs.push(`${virada.para.icone} ${virada.cidade} agora é ${virada.para.rotulo.toLowerCase()} — ${virada.para.recepcao}.`);
    saida.notas.push(`[FÉ NA GEOGRAFIA — REGISTRO DO SISTEMA] ${virada.cidade} passou de "${virada.de.rotulo}" para "${virada.para.rotulo}" em relação ao herói. Daqui em diante o povo de lá ${virada.para.recepcao} — trate isso como fato ao narrar qualquer cena naquela cidade.`);
  }
  if (fieis > 0 && grauDe(novo) > tetoGd) msgs.push(`⛓ A fé cresce além do que seu corpo suporta — é preciso mais poder (nível) para encarnar o próximo grau.`);
  if (pf) msgs.push(`✨ ${pf > 0 ? "+" : ""}${pf} Pontos de Fé (${novo.pf} PF)`);
  if (depois > antes) {
    msgs.push(`🌟 ASCENSÃO! Seu nome ganha peso no cosmos: agora você é ${tituloDe(depois)} (GD ${depois}).`);
    saida.efeitos.push({ tipo: "remontarPrompt", personagem: e0.personagem });
    saida.notas.push(`[ASCENSÃO — REGISTRO DO SISTEMA] O jogador subiu para GD ${depois} (${tituloDe(depois)}). Isso é fato: narre os sinais dessa transformação aos poucos, à altura do marco.`);
  }
  return saida;
}

/* ---------------- MILAGRE (v7.6) ----------------
   Gasta PF e o SISTEMA aplica o efeito; serve ao botão do jogador e ao
   sinal "milagre:<id>" do Mestre. v9.32: o milagre volta a acontecer — a
   ficha nova é calculada sobre a ficha que o App tem (`fichaDoRef`) e sai
   num efeito `ficha` (o ref, a tela e o save juntos), e as linhas saem na
   hora, não de dentro de uma função atualizadora que só rodaria no render
   seguinte. `estado`: o da fé, mais { fichaDoRef, combate, fama }.
     milagreInvocado(estado, id, origem) → { divindade, devocao, ficha, combate, msgs: [{autor, texto}], notas, efeitos } */
export function milagreInvocado(estado, id, origem = "jogador") {
  const e0 = objeto(estado);
  const dv = e0.divindade;
  const mil = milagrePorId(id);
  const saida = { divindade: dv, devocao: e0.devocao, ficha: e0.fichaDoRef, combate: e0.combate, msgs: [], notas: [], efeitos: [] };
  if (!dv || !dv.despertar || !mil) return saida;
  const gd = grauDe(dv);
  if (mil.gd > gd) { saida.msgs.push({ autor: "sistema", texto: `⛔ ${mil.nome} exige GD ${mil.gd} — você é GD ${gd}.` }); return saida; }
  if ((dv.pf || 0) < mil.pf) { saida.msgs.push({ autor: "sistema", texto: `⛔ ${mil.nome} custa ${mil.pf} PF — você tem ${dv.pf}.` }); return saida; }

  const novo = { ...dv, pf: Math.max(0, dv.pf - mil.pf), ultimoFeitoDia: e0.dia };
  saida.divindade = novo; saida.efeitos.push({ tipo: "divindade", divindade: novo });
  const msgs = saida.msgs;
  msgs.push({ autor: "sistema", texto: `${mil.icone} MILAGRE — ${mil.nome} (−${mil.pf} PF · restam ${novo.pf})` });
  const ef = mil.efeito || {};
  let notaMestre = `[MILAGRE INVOCADO — efeito JÁ APLICADO pelo sistema] "${mil.nome}": ${mil.desc} Custou ${mil.pf} PF${origem === "jogador" ? " (o jogador invocou)" : ""}. Narre a manifestação à altura do domínio${novo.dominio ? ` (${novo.dominio})` : ""} — visceral, pública, inesquecível. NÃO recalcule números.`;
  const aplicarNaFicha = (fn) => {
    const base = saida.ficha;
    if (!base) return null;
    const novoP = fn(base);
    saida.ficha = novoP; saida.efeitos.push({ tipo: "ficha", personagem: novoP });
    return novoP;
  };

  if (ef.tipo === "cura") {
    let curou = 0;
    const nomes = [];
    aplicarNaFicha((p) => {
      curou = Math.round((p.vidaMax || 10) * (ef.fracao || 0.5));
      const grupo = (p.grupo || []).map((g) => {
        const ganho = Math.round((g.vidaMax || 10) * (ef.fracao || 0.5));
        const antes = g.vida || 0;
        const depois = Math.min(g.vidaMax || g.vida || 1, antes + ganho);
        if (depois > antes) nomes.push(`${g.nome} +${depois - antes}`);
        /* quem estava caído levanta: um milagre de restauração que deixa o
           companheiro no chão não é restauração nenhuma */
        return { ...g, vida: depois, morrendo: depois > 0 ? false : g.morrendo };
      });
      return { ...p, vida: Math.min(p.vidaMax, (p.vida || 0) + curou), morrendo: false, morte: { sucessos: 0, falhas: 0 }, grupo };
    });
    msgs.push({ autor: "sistema", texto: `🩶 +${curou} PV em ${(saida.ficha || {}).nome || "você"}${nomes.length ? ` · ${nomes.join(" · ")}` : ""}` });
    notaMestre += ` A cura JÁ está nas fichas: eu recuperei ${curou} PV${nomes.length ? ` e o grupo também (${nomes.join(", ")})` : ""}. Narre o alívio, não os números.`;
  } else if (ef.tipo === "efeito") {
    aplicarNaFicha((p) => ({ ...p, efeitos: empilhar(p.efeitos, efeitoDeMilagre(ef, mil.desc)) }));
    msgs.push({ autor: "sistema", texto: `✧ ${ef.nome} ativo por ${ef.turnos} turnos` });
  } else if (ef.tipo === "dano_area" && saida.combate) {
    const c = saida.combate;
    const alvos = (c.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
    const novos = (c.inimigos || []).map((e) => {
      if (e.derrotado || e.vida <= 0) return e;
      const dano = Math.max(1, Math.round((e.vidaMax || e.vida) * (ef.fracao || 0.35)));
      const pv = Math.max(0, e.vida - dano);
      msgs.push({ autor: "sistema", texto: `⚡ ${e.nome}: ${dano} de dano · ${pv}/${e.vidaMax || e.vida}${pv <= 0 ? " ☠" : ""}` });
      return { ...e, vida: pv, derrotado: pv <= 0 };
    });
    const nc = { ...c, inimigos: novos };
    saida.combate = nc; saida.efeitos.push({ tipo: "combate", combate: nc });
    notaMestre += ` Alvos atingidos: ${alvos.map((a) => a.nome).join(", ")}.`;
  } else if (ef.tipo === "ressurreicao") {
    const voltaram = [];
    aplicarNaFicha((p) => {
      const grupo = (p.grupo || []).map((g) => {
        if (!(g.vida <= 0 || g.morrendo)) return g;
        voltaram.push(g.nome);
        return { ...g, vida: Math.max(1, Math.round((g.vidaMax || 10) / 2)), morrendo: false, morte: { sucessos: 0, falhas: 0 } };
      });
      if (p.vida <= 0 || p.morrendo) voltaram.push(p.nome);
      return { ...p, grupo, vida: p.vida <= 0 ? Math.max(1, Math.round(p.vidaMax / 2)) : p.vida, morrendo: false, morte: { sucessos: 0, falhas: 0 } };
    });
    msgs.push({ autor: "sistema", texto: voltaram.length ? `🩹 Voltam: ${voltaram.join(", ")} — a morte devolve o que é seu.` : "🩹 Ninguém havia tombado — o domínio guarda o gesto." });
    if (voltaram.length) notaMestre += ` Quem voltou: ${voltaram.join(", ")} — já de pé na ficha.`;
  } else if (ef.tipo === "vinculo") {
    notaMestre += " O NPC presente mais relevante jura lealdade de forma irreversível — trate como fato firmado.";
  }
  if (ef.fe) {
    const g = fieisPorFeito(ef.fe, typeof e0.fama === "function" ? e0.fama() : e0.fama);
    const r = ganhoDeFe({ ...e0, divindade: saida.divindade, devocao: saida.devocao }, g, 0, `${mil.nome} — testemunhado por multidões`);
    saida.divindade = r.divindade; saida.devocao = r.devocao;
    saida.efeitos.push(...r.efeitos); saida.notas.push(...r.notas);
    msgs.push(...r.msgs.map((t) => ({ autor: "sistema", texto: t })));
  }
  saida.notas.push(notaMestre);
  return saida;
}

/* ============================================================
   AS MISSÕES E O ARCO — o bloco do `aplicarResposta`, puro

     aplicarAsMissoes(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }

   O evento global que o Mestre encerra na ficção: o arco maior acaba, o
   marco empurra o arco (o motor do arco lê o evento de AGORA — `ctx.motorDoArco`
   recebe `{ eventos }`), e a lista das missões redesenha-se (`quests`).
   "quest_nova", "quest_atualizar" e "historia_avancar" morreram (v9.27,
   v9.28, MM14): um modelo antigo que os mande é ignorado em silêncio — quem
   move o arco é o marco, contando o que o motor resolveu de fato.
   `estado`: { eventos, historia, dia }.
   ============================================================ */
export function aplicarAsMissoes(estado, resposta, ctx = {}) {
  const e0 = objeto(estado);
  const op = objeto(ctx);
  const resp = objeto(resposta);
  const msgs = [], notas = [], efeitosDoTurno = [];
  const ef = (x) => { efeitosDoTurno.push(x); };
  let eventos = e0.eventos, historia = e0.historia;
  if (resp.mudancas) {
    const md2 = resp.mudancas;
    /* EVENTO GLOBAL resolvido na ficção: o mestre encerra o arco maior */
    if (md2.evento_global_encerrar && eventos.global) {
      const g = eventos.global;
      eventos = { ...eventos, global: null, semGlobalDesde: e0.dia };
      ef({ tipo: "eventos", eventos });
      const a = arcoComOMarco(historia, "global", `${g.nome} chegou ao fim`, () => (typeof op.motorDoArco === "function" ? op.motorDoArco({ eventos }) : op.motorDoArco));
      if (a.mudou) {
        historia = a.historia; ef({ tipo: "historia", historia });
        notas.push(...a.notas);
        if (a.remontar) ef({ tipo: "remontarPrompt" });
      }
      msgs.push(`🌍 ${g.nome}: desfecho alcançado — a região entra numa nova era.`);
    }
    ef({ tipo: "quests" });
  }
  return { estado: { ...e0, eventos, historia }, efeitos: efeitosDoTurno, paraOCronista: notas, msgs };
}

/* ============================================================
   OS SINAIS (v7.6) — o bloco do `aplicarResposta`, puro

     aplicarOsSinais(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }

   O Mestre não manda números — manda um sinal curto ("fe:proeza",
   "milagre:cura", "dominio:da Forja") e o SISTEMA converte pelas tabelas.
   Mais barato em tokens e impossível de inflacionar. Seis por turno.
   `estado`: { personagem, fichaDoRef, divindade, devocao, mapa, cidadeAtual,
   lugar, jornada, combate, acampado, masmorra, raid, dia, contadores,
   nivelDaFama }; `ctx`: { mundo, sorteDoTurno }.
   Os efeitos novos: `divindade`, `ficha` (o milagre), `combate`,
   `sinalViagem`, `sinalMasmorra`, `sinalRaid`, `loot` (o achado entra pela
   função atualizadora da ficha, como entrava), `espolio` (raro para cima
   abre a revelação, v9.163), e o prompt remontado quando a fé ascende.
   ============================================================ */
export function aplicarOsSinais(estado, resposta, ctx = {}) {
  const e0 = objeto(estado);
  const op = objeto(ctx);
  const resp = objeto(resposta);
  const msgs = [], notas = [], efeitosDoTurno = [];
  const ef = (x) => { efeitosDoTurno.push(x); };
  const pers = e0.personagem;
  const mapa = e0.mapa;
  let fichaDoRef = e0.fichaDoRef, divindade = e0.divindade, devocao = e0.devocao, combate = e0.combate;
  const fama = () => calcularFama(e0.contadores, e0.nivelDaFama, dominiosDe(mapa).length);
  const daFe = () => ({ divindade, devocao, mapa, cidadeAtual: e0.cidadeAtual, dia: e0.dia, nivel: pers && pers.nivel, personagem: pers });
  if (resp.mudancas && Array.isArray(resp.mudancas.sinais)) {
    for (const bruto of resp.mudancas.sinais.slice(0, 6)) {
      const txt = String(bruto || "").trim();
      if (!txt) continue;
      const ix = txt.indexOf(":");
      const chave = (ix < 0 ? txt : txt.slice(0, ix)).trim().toLowerCase();
      const arg = ix < 0 ? "" : txt.slice(ix + 1).trim();
      const dvAtual = divindade;
      if (chave === "fe" && dvAtual && dvAtual.despertar) {
        const mag = MAGNITUDE_FE[arg.toLowerCase()] ? arg.toLowerCase() : "feito";
        const ganho = fieisPorFeito(mag, fama());
        divindade = { ...divindade, ultimoFeitoDia: e0.dia }; ef({ tipo: "divindade", divindade });
        const r = ganhoDeFe(daFe(), ganho, 0, `${MAGNITUDE_FE[mag].rotulo} — ${MAGNITUDE_FE[mag].desc}`);
        divindade = r.divindade; devocao = r.devocao; efeitosDoTurno.push(...r.efeitos); notas.push(...r.notas);
        msgs.push(...r.msgs);
      } else if (chave === "milagre" && dvAtual && dvAtual.despertar) {
        const r = milagreInvocado({ ...daFe(), fichaDoRef, combate, fama }, arg.toLowerCase(), "mestre");
        divindade = r.divindade; devocao = r.devocao; fichaDoRef = r.ficha; combate = r.combate;
        efeitosDoTurno.push(...r.efeitos); notas.push(...r.notas);
        r.msgs.forEach((m2) => msgs.push(m2.texto));
      } else if (chave === "viagem") {
        if (!combate && !e0.acampado && !e0.masmorra) {
          ef({ tipo: "sinalViagem", destino: arg || "" });
          msgs.push(arg ? `🧭 A caminho de ${arg}.` : "🧭 Pé na estrada.");
        }
      } else if (chave === "masmorra") {
        if (!combate && !e0.acampado && !e0.masmorra) {
          /* MM14: o sinal abria sem pergunta nenhuma — agora passa pela porta */
          const pm = portaDaMasmorra({ nome: arg }, { cidadeAtual: e0.cidadeAtual, emViagem: !!e0.jornada, lugar: e0.lugar, masmorras: (() => { try { return masmorrasDoMundo(mundoDe(op).semente, mapa); } catch (e) { return []; } })() });
          if (pm.ok) ef({ tipo: "sinalMasmorra", nome: pm.nome || arg || "" });
          else notas.push(`[MASMORRA — RECUSADA PELO SISTEMA] Não há masmorra aqui: ${pm.motivo}. A cena continua onde estou.`);
        }
      } else if (chave === "raid") {
        /* A TRAVA É AQUI, e não na cena: um chamado a um herói que não o
           alcança é recusado e o sistema DIZ por quê */
        const persR = pers || fichaDoRef || {};
        const chk = podeAbrirRaid(persR);
        if (!chk.pode) {
          msgs.push(`⚑ O chamado não é para você ainda: ${chk.motivo}.`);
        } else if (combate || e0.acampado || e0.masmorra || e0.raid) {
          /* silêncio: um chamado no meio de outra cena grande apagaria a
             que já está em curso */
        } else {
          ef({ tipo: "sinalRaid", nome: arg || "" });
        }
      } else if (chave === "ascender" && dvAtual && dvAtual.despertar) {
        const cam = caminhoPorId(arg.toLowerCase());
        const gdAtual = grauDe(dvAtual);
        /* v9.22: o teto é o da ficha do TURNO, nunca a do render */
        const persTeto = pers || fichaDoRef || {};
        const teto = gdMaximoPorNivel(persTeto.nivel || 1);
        if (gdAtual >= teto) {
          msgs.push(`⛓ ${cam.nome}: o poder existe, mas seu corpo mortal ainda não o comporta (nível ${persTeto.nivel || 1}).`);
        } else {
          const alvo = GRAUS[Math.min(4, gdAtual + 1)];
          const fieisNovos = Math.max(alvo.fieis, Math.round(alvo.fieis * (1 + (cam.ganho?.fieis || 0))));
          /* v8.9: a fé tomada de um deus morto (ou drenada de uma fonte) não
             nasce no vácuo — ela cai sobre o mapa, cidade a cidade. */
          const faltando = Math.max(0, fieisNovos - fieisTotais(mapa, devocao));
          const devNova = espalharFieis(devocao, mapa, faltando, 70);
          devocao = devNova; ef({ tipo: "devocao", devocao });
          const dv2 = { ...divindade, fieis: fieisTotais(mapa, devNova), ultimoFeitoDia: e0.dia, caminho: cam.id };
          divindade = dv2; ef({ tipo: "divindade", divindade });
          msgs.push(`🌟 ASCENSÃO POR ${cam.nome.toUpperCase()} — você alcança GD ${grauDe(dv2)} (${tituloDe(grauDe(dv2))}).`);
          notas.push(`[ASCENSÃO — ${cam.nome.toUpperCase()} — APLICADA PELO SISTEMA] O herói subiu para GD ${grauDe(dv2)} (${tituloDe(grauDe(dv2))}) por este caminho. ${cam.id === "deicidio" ? "O culto da divindade morta jura vingança eterna — registre isso no cânone e faça o mundo reagir: outros deuses passam a vigiá-lo." : cam.id === "reliquia" ? "A fonte primordial se apagou — registre no cânone o que restou dela e o preço que o ritual cobrou do herói." : ""} Narre a transformação à altura: virar deus deve doer, custar e mudar o jogo.`);
        }
      } else if (chave === "loot") {
        const rar = ["comum", "incomum", "raro", "epico", "lendario", "unico"].includes(arg.toLowerCase()) ? arg.toLowerCase() : "comum";
        const it = gerarLoot(rar, { nivel: (pers || fichaDoRef || {}).nivel || 1, lex: mundoDe(op).lex, rnd: typeof op.sorteDoTurno === "function" ? op.sorteDoTurno("loot") : undefined });
        ef({ tipo: "loot", item: it });
        /* raro para cima abre a REVELAÇÃO (v9.163); o comum fica na linha
           de sistema, que é o tamanho dele */
        if (["raro", "epico", "lendario", "unico"].includes(it.raridade)) ef({ tipo: "espolio", item: it });
        msgs.push(`◆ Achado: ${it.nome} (${RARIDADE_ROTULO[it.raridade] || it.raridade})${it.poder ? ` — ${it.poder}` : ""}`);
        notas.push(`[ITEM GERADO PELO SISTEMA] ${it.nome}, ${it.raridade}${it.poder ? `, poder: ${it.poder}` : ""}. Já está na mochila do herói — descreva o achado usando ESTE nome e estas propriedades, sem inventar outras.`);
      } else if (chave === "dominio" && dvAtual && dvAtual.despertar && arg && !dvAtual.dominio) {
        divindade = { ...divindade, dominio: arg.slice(0, 60) }; ef({ tipo: "divindade", divindade });
        msgs.push(`🌌 Domínio revelado: ${divindade.dominio}`);
      } else if (chave === "patrono" && dvAtual && dvAtual.despertar && arg && !dvAtual.patrono) {
        divindade = { ...divindade, patrono: arg.slice(0, 60) }; ef({ tipo: "divindade", divindade });
        msgs.push(`🌟 Patrono declarado: ${divindade.patrono}`);
      }
    }
  }
  return { estado: { ...e0, fichaDoRef, divindade, devocao, combate }, efeitos: efeitosDoTurno, paraOCronista: notas, msgs };
}
