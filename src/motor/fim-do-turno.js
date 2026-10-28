/* src/motor/fim-do-turno.js (Fase T1-A, 4.ª fatia, 28/10/2026) — o fim do turno, fora do App

   Depois da luta, o `aplicarResposta` ainda fazia três coisas que são
   regra, e regra pura: o CÓDEX (o local e a pessoa da base que a narração
   pôs em cena viram história, os nomes à mão que ela usou viram gente, e o
   peso do deus que entrou), a CHEGADA que o Mestre narrou e não anotou, e
   o PORTÃO (o que a narração contradiz e o sistema conserta). Moram aqui,
   na MESMA ordem e com os porquês de cada linha; o App ficou com a fiação
   — o estado que cada peça lê, e os efeitos que ela descreve, aplicados
   num lugar só (`aplicarOsEfeitos`).

   Cada peça devolve { estado, efeitos, paraOCronista, msgs } — como as do
   meio do turno — e nunca escreve em ref nem chama setX. Os efeitos novos:
   `base` (a base do mundo com o que se revelou), `portao` (o contexto e as
   violações do turno). A chegada devolve ainda `minutos`: o relógio que a
   travessia custa é um órgão do App (os dias do reino, os festivais, a
   invocação que expira), e quem o faz andar é ele.

   Provado byte a byte contra o App de antes (702cedf, lido do git por
   `gerar-fim-dourado.mjs`) em `teste-motor-fim-do-turno.mjs`. */

import { mencionadosNaCena, idDoLocal, idDaGente, revelar as revelarNaBase } from "../mundo-base.js";
import { aindaSoUmNome } from "../abertura.js";
import { criarNPC } from "../npcs.js";
import { nomesAMaoNaProsa } from "../nomes.js";
import { grauDe } from "../divindades.js";
import { presencaDoHeroi } from "../presenca-divina.js";
import { detectarChegada, descobrirCidade, notaDaChegada } from "../geografia.js";

const objeto = (x) => (x && typeof x === "object" ? x : {});
const mundoDe = (op) => objeto(typeof op.mundo === "function" ? op.mundo() : op.mundo);

/* ============================================================
   O CÓDEX — DA BASE PARA O CÂNONE (v9.14)

     aplicarOCodex(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }

   O outro lado do consumo. Quando um local ou uma pessoa da base entra na
   narrativa, ele deixa de ser estoque e vira história: o sistema marca
   como revelado (o prompt passa a mostrar ✓, e o Mestre para de
   reapresentar quem o herói já conhece) e a pessoa entra no registro do
   códex por código — sem depender de o Mestre lembrar de enviá-la.

   Isto RATIFICA a narração, não a contradiz: por isso continua depois da
   luta, e não no portão.

   `estado`: { personagem (a ficha do turno), fichaDoRef, mapa, cidadeAtual,
   base, abertura, lugar, missoes, npcs, npcTurno, dia, oferecidos (os nomes
   à mão que a pauta ofereceu),
   divindade }; `ctx`: { mundo }. Os efeitos: `base`, `npcs`.
   ============================================================ */
export function aplicarOCodex(estado, resposta, ctx = {}) {
  const e0 = objeto(estado);
  const op = objeto(ctx);
  const resp = objeto(resposta);
  const msgs = [], notas = [], efeitosDoTurno = [];
  const ef = (x) => { efeitosDoTurno.push(x); };
  const calou = (onde, erro) => { ef({ tipo: "calou", onde, erro }); };
  const pers = e0.personagem;
  let base = e0.base, npcs = e0.npcs;
  try {
    const mu = mundoDe(op);
    const m = mencionadosNaCena(mu.semente, e0.mapa, e0.cidadeAtual, base, mu.genero, resp.narrativa, mu.molde, mu.lex, { grupo: (e0.fichaDoRef || pers || {}).grupo || [] });
    /* MM13: a menção não é presença — a pista (ou o alvo) da abertura não
       conta como revelada nem entra no registo só por ser citada. */
    const genteRevelavel = m.gente.filter((p) => !aindaSoUmNome(e0.abertura, p.nome, { lugar: e0.lugar, missoes: e0.missoes }));
    const ids = [
      ...m.locais.map((l) => idDoLocal(e0.cidadeAtual, l)),
      ...genteRevelavel.map((p) => idDaGente(e0.cidadeAtual, p)),
    ];
    if (ids.length) {
      /* o que o App fazia em `registrarRevelacao`: cada id marcado na base */
      const lista = [].concat(ids || []).filter(Boolean);
      if (lista.length) {
        let b = base;
        for (const id of lista) b = revelarNaBase(b, id);
        base = b; ef({ tipo: "base", base });
      }
      if (genteRevelavel.length) {
        let reg = npcs, tocou = false;
        for (const p of genteRevelavel) {
          if (Object.keys(reg).some((k) => k.toLowerCase() === p.nome.toLowerCase())) continue;
          if (!tocou) { reg = { ...reg }; tocou = true; }
          reg[p.nome] = criarNPC(p.nome, { papel: p.papel, local: e0.cidadeAtual, notas: `${p.traco}; quer ${p.vontade}`, ultimaVez: e0.npcTurno, conhecidoEm: e0.dia });
        }
        if (tocou) { npcs = reg; ef({ tipo: "npcs", npcs }); }
      }
    }
    /* E1 (o Narrador só narra): o NOME À MÃO que a narração usou vira
       gente do registo — e morto, se a oração o pôs morto. Sai da lista
       do turno seguinte por estar no registo. */
    try {
      /* não se limpa: o usado sai da lista seguinte por estar no registo */
      const usados = nomesAMaoNaProsa(resp.narrativa, e0.oferecidos || []);
      if (usados.length) {
        let reg = npcs, tocou = false;
        for (const u of usados) {
          const chave = Object.keys(reg).find((k) => k.toLowerCase() === String(u.nome).toLowerCase());
          if (chave) {
            if (u.morto && String(reg[chave].status || "vivo").toLowerCase() === "vivo") { if (!tocou) { reg = { ...reg }; tocou = true; } reg[chave] = { ...reg[chave], status: "morto" }; }
            continue;
          }
          if (!tocou) { reg = { ...reg }; tocou = true; }
          const nome = String(u.nome).slice(0, 40);
          reg[nome] = criarNPC(nome, { genero: u.genero === "ela" ? "mulher" : "homem", local: e0.cidadeAtual || "", ultimaVez: e0.npcTurno, conhecidoEm: e0.dia, ...(u.morto ? { status: "morto" } : {}) });
        }
        if (tocou) { npcs = reg; ef({ tipo: "npcs", npcs }); }
      }
    } catch (e) { calou("os nomes à mão na prosa", e); }
    /* ---- O PESO DO DEUS QUE ENTROU (v9.14) ----
       `presencaDoHeroi` estava escrita e testada desde a v9.8, e nunca foi
       importada: o herói virava GD 4 e ninguém na taverna sentia nada. O
       gatilho certo é este — as pessoas que ACABARAM de entrar na cena são
       exatamente quem ainda não convive com ele. Quem já tem vínculo não
       se curva, e o grupo nunca entra na conta. */
    if (m.gente.length) {
      const gd = grauDe(e0.divindade, pers.nivel || 1);
      const noGrupo = new Set((pers.grupo || []).map((g) => (g.nome || "").toLowerCase()));
      const alvos = m.gente
        .filter((p) => !noGrupo.has(p.nome.toLowerCase()))
        .map((p) => ({ nome: p.nome, vinculo: 0, atributos: { vigor: 1 } }));
      const pr = alvos.length ? presencaDoHeroi({ gdJogador: gd, alvos, nomeHeroi: pers.nome }) : null;
      if (pr) {
        msgs.push(pr.texto);
        notas.push(pr.nota);
      }
    }
  } catch { /* o códex nunca derruba o turno */ }
  return { estado: { ...e0, base, npcs }, efeitos: efeitosDoTurno, paraOCronista: notas, msgs };
}

/* ============================================================
   A CHEGADA — CHEGUEI E NINGUÉM ANOTOU (v9.43)

     aplicarAChegada(estado, resposta) → { estado, efeitos, paraOCronista, msgs, minutos }

   O Mestre narrou a travessia do portal com todas as letras e esqueceu
   de mandar `cidade_atual`: a ficção subiu para o Andar 2, o mapa ficou
   no Andar 1. Este cão de guarda RATIFICA — a narração está certa, o
   que falta é o registro, e registro é trabalho do sistema.

   Só morde quando o destino fica a UM PASSO daqui (rota de meio dia ou
   menos). Onde viajar custa dias, "chegar" numa frase é quase sempre
   plano ou lembrança, e mover o herói por isso seria pior que o bug.

   `estado`: { cidadeAtual, lugar, mapa, combate, jornada }. Os efeitos:
   `cidadeAtual`, `lugar`, `mapa`. `minutos`: quanto o relógio do mundo anda
   pela travessia (o App o faz andar, ANTES de a nota da chegada entrar —
   como fazia); 0 quando não houve chegada.
   ============================================================ */
export function aplicarAChegada(estado, resposta) {
  const e0 = objeto(estado);
  const resp = objeto(resposta);
  const msgs = [], notas = [], efeitosDoTurno = [];
  const ef = (x) => { efeitosDoTurno.push(x); };
  let cidadeAtual = e0.cidadeAtual, lugar = e0.lugar, mapa = e0.mapa, minutos = 0;
  try {
    const jaVeio = !!(resp.mudancas && resp.mudancas.cidade_atual);
    if (!jaVeio && !e0.combate && !e0.jornada) {
      const ch = detectarChegada(resp.narrativa, { mapa, cidade: cidadeAtual });
      if (ch) {
        const de = cidadeAtual;
        cidadeAtual = ch.nome; ef({ tipo: "cidadeAtual", cidade: cidadeAtual });
        if (lugar) { lugar = null; ef({ tipo: "lugar", lugar: null }); }
        const dsc = descobrirCidade(mapa, ch.nome);
        if (dsc.nova) { mapa = dsc.mapa; ef({ tipo: "mapa", mapa }); }
        msgs.push(`🧭 Você está em ${ch.nome}${dsc.nova ? " — e o lugar entrou no seu mapa" : ""}.`);
        minutos = Math.max(15, Math.round((ch.dias || 0) * 1440));
        notas.push(notaDaChegada(ch, de));
      }
    }
  } catch { /* a chegada nunca derruba o turno */ }
  return { estado: { ...e0, cidadeAtual, lugar, mapa }, efeitos: efeitosDoTurno, paraOCronista: notas, msgs, minutos };
}
