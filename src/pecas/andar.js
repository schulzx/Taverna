/* ============================================================
   AS PEÇAS · ANDAR (17/11/2026, Fase A da prova) — src/pecas/andar.js

   resolver(peca, solucao, dado, estado, opcoes) → { estado, registo, resultado }
     O dado já rolado (pelo App, pela semente do turno — aqui não há sorte)
     decide; a peça diz o que acontece:
       · sucesso que escreve — o facto entra no livro de factos na forma
         que o livro limpa (garantirFactos), o mesmo que a quest lê;
       · sucesso que abre — a outra solução fica aberta, com a vantagem;
       · recuar (fugir) — sai, e o relógio anda;
       · falha com seta — a outra abre (com a vantagem ou a desvantagem da
         seta);
       · toda falha QUEIMA a solução: a mesma via não volta a rolar (a lei
         do catálogo, EFEITOS_DA_FALHA «fecha»), até o mundo cobrar e a
         etapa reabrir (calor.js);
       · falha com preço — o preço cobra-se pelas portas do quadro
         (aplicarPrecoDoQuadro); `escreve`: o facto entra na mesma (a carta
         essencial vira sempre); `continua`: a etapa fica aberta.
     A carta de escolha (escolheu) vai pela porta da biblioteca
     (escolherNaQuest), e é a única que fecha sem dado.

   oQueONarradorRecebe(peca, resultado) → o pacote do Narrador: a cena
     fechada, o que aconteceu (já decidido), a pista a plantar, e a lista
     do que ele PODE citar. Só dado — nem prompt, nem pauta.

   PURO E DETERMINÍSTICO. O estado recebido nunca é mutado.
   ============================================================ */
import { questPorId, escolherNaQuest } from "../biblioteca-de-quests.js";
import { garantirFactos } from "../livro-de-factos.js";
import { PRECO_DA_FALHA, aplicarPrecoDoQuadro } from "../quadro-da-quest.js";
import { memoriaDe, comMemoria, RELOGIO_DAS_PECAS } from "./calor.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (x) => (Number.isFinite(Number(x)) ? Math.trunc(Number(x)) : 0);
const RX_PAPEL = /^(papel|lugar|item):([a-z0-9_]+)$/;

/* a marca de dias do livro (a forma de marcaLimpa) */
const marca = (m, dia, turno) => (obj(m) ? { ...m, ate: Math.max(inteiro(m.ate), dia), vezes: inteiro(m.vezes) + 1, turno } : { de: dia, ate: dia, vezes: 1, turno });

/* ---------------- ESCREVER UM FACTO ----------------
   escreverFato(estado, atomo, registo, { dia, turno, como }) → estado novo.
   Cada predicado no sítio onde a condição o lê (condicoes-da-quest.js,
   LEITURAS): o livro de factos (pessoas/lugares, por id), a ficha do
   registo (consultas), o grupo, a bolsa, o sítio onde o herói está. */
export function escreverFato(estado, atomo, registo, opcoes) {
  const E = obj(estado) || {};
  const R = obj(registo) || {};
  const o = obj(opcoes) || {};
  const dia = inteiro(o.dia != null ? o.dia : E.dia);
  const turno = inteiro(o.turno);
  const pred = Array.isArray(atomo) ? atomo[0] : "";
  const m = typeof atomo[1] === "string" ? atomo[1].match(RX_PAPEL) : null;
  const p = m ? obj((obj(R.papeis) || {})[m[2]]) || {} : {};
  const id = typeof p.id === "string" ? p.id : "";
  const livro = garantirFactos(E.factos);
  const pessoas = { ...livro.pessoas };
  const lugares = { ...livro.lugares };
  const naPessoa = (f) => { if (!id) return; const a = pessoas[id] || { nome: p.nome || "" }; pessoas[id] = f({ ...a, visto: a.visto || marca(null, dia, turno) }); };
  const noLugar = (f) => { if (!id) return; const a = lugares[id] || { nome: p.nome || "" }; lugares[id] = f({ ...a }); };
  let out = { ...E };
  const irPara = () => ({ lugar: { nome: p.nome, cidade: p.cidade || E.cidadeAtual || "" }, cidadeAtual: p.cidade || E.cidadeAtual });
  switch (pred) {
    case "conheceu": naPessoa((a) => a); break;
    case "conversou": naPessoa((a) => ({ ...a, falou: marca(a.falou, dia, turno) })); break;
    case "derrotou": case "poupou": naPessoa((a) => ({ ...a, derrotado: { dia, como: o.como || (pred === "poupou" ? "rendido" : "morto") } })); break;
    case "encontrou": naPessoa((a) => ({ ...a, encontrado: { dia, como: "encontro" } })); break;
    case "afeicao": naPessoa((a) => ({ ...a, afeicao: { grau: Math.max(inteiro(atomo[2]) || 1, inteiro(obj(a.afeicao) && a.afeicao.grau)), dia } })); break;
    case "esteve": noLugar((a) => ({ ...a, esteve: marca(a.esteve, dia, turno) })); out = { ...out, ...irPara() }; break;
    case "esta_em": out = { ...out, ...irPara() }; break;
    case "descobriu": noLugar((a) => ({ ...a, descobriu: { dia } })); break;
    case "consultou": {
      const npcs = { ...(obj(E.npcs) || {}) };
      const chave = Object.keys(npcs).find((k) => obj(npcs[k]) && npcs[k].nome === p.nome) || p.nome;
      if (chave) { const f = obj(npcs[chave]) || { nome: p.nome }; npcs[chave] = { ...f, consultas: Math.max(inteiro(f.consultas) + 1, inteiro(atomo[2]) || 1) }; }
      out = { ...out, npcs };
      naPessoa((a) => ({ ...a, falou: marca(a.falou, dia, turno) }));
      break;
    }
    case "acompanha": {
      const pers = obj(E.personagem) || {};
      if (p.nome && !arr(pers.grupo).some((g) => obj(g) && g.nome === p.nome)) out = { ...out, personagem: { ...pers, grupo: [...arr(pers.grupo), { nome: p.nome }] } };
      break;
    }
    case "tem": {
      const pers = obj(out.personagem) || {};
      const nome = p.nome || id;
      if (nome) out = { ...out, personagem: { ...pers, inventario: [...arr(pers.inventario), { nome }] } };
      break;
    }
    default: break;
  }
  return { ...out, factos: garantirFactos({ ...livro, pessoas, lugares }) };
}

/* aplica um preço da tabela pelas portas do quadro; → { estado, minutos, aplicados } */
function cobrar(E, precoId, custo) {
  const P = precoId ? PRECO_DA_FALHA[precoId] : null;
  const r = aplicarPrecoDoQuadro(E, P ? { id: precoId, linha: P.linha, efeitos: P.efeitos.map((e) => ({ ...e })) } : null, custo ? { custo } : {});
  if (!r) return { estado: E, minutos: 0, aplicados: [] };
  return { estado: { ...E, ...r.estado }, minutos: inteiro(r.minutos), aplicados: arr(r.aplicados) };
}

/* ---------------- RESOLVER ---------------- */
export function resolver(peca, solucao, dado, estado, opcoes) {
  try {
    if (!obj(peca)) return null;
    const s = peca.solucoes.find((x) => x.id === (obj(solucao) ? solucao.id : solucao));
    if (!s) return null;
    const o = obj(opcoes) || {};
    let E = obj(estado) || {};
    let R = obj(o.registo) || null;
    const d = obj(dado) || {};
    let m = memoriaDe(E, peca);
    const resultado = { solucao: s.id, acao: s.acao, alvo: s.alvo, passou: true, tipo: "sucesso", fatos: [], para: null, preco: null, aplicados: [], minutos: 0 };
    /* a carta de escolha: sem dado, pela porta da biblioteca */
    if (s.semDado) {
      const F = questPorId(peca.quest);
      if (F && R) R = escolherNaQuest(F, R, s.alvo.papel, s.alvo.opcao, { estado: E, mundo: o.mundo || null });
      resultado.fatos = s.fatos;
      return { estado: E, registo: R, resultado };
    }
    const bonus = inteiro(d.bonus);
    const passou = typeof d.passou === "boolean" ? d.passou : typeof d.venceu === "boolean" ? d.venceu
      : Number.isFinite(Number(d.total)) && Number.isFinite(Number(d.dc)) ? Number(d.total) + bonus >= Number(d.dc) : false;
    resultado.passou = passou;
    /* o que a solução custa à partida (pagar): cobra-se tente-se ou não */
    if (s.custa) { const c = cobrar(E, null, s.custa); E = c.estado; resultado.aplicados.push(...c.aplicados); }
    const abertas = { ...m.abertas };
    delete abertas[s.id];
    m = { ...m, abertas };
    const lado = passou ? s.sucesso : s.falha;
    const escreve = (lista) => { for (const a of lista) E = escreverFato(E, a, R, { dia: o.dia, turno: o.turno, como: s.como }); resultado.fatos = lista; };
    if (passou) {
      if (lado && lado.fato) escreve(s.fatos);
      else if (lado && lado.para) { resultado.tipo = "abriu"; resultado.para = lado.para; m = { ...m, abertas: { ...m.abertas, [lado.para]: inteiro(lado.bonus) } }; }
      else if (lado && lado.recua) { resultado.tipo = "recuou"; m = { ...m, relogio: m.relogio + RELOGIO_DAS_PECAS.porFalhaQueContinua }; }
    } else {
      resultado.tipo = "falha";
      m = { ...m, queimadas: [...new Set([...m.queimadas, s.id])], falhas: { ...m.falhas, [s.id]: (m.falhas[s.id] || 0) + 1 } };
      if (lado && lado.para) {
        resultado.para = lado.para;
        if (!m.queimadas.includes(lado.para)) m = { ...m, abertas: { ...m.abertas, [lado.para]: inteiro(lado.bonus) } };
      } else if (lado && lado.preco) {
        const c = cobrar(E, lado.preco, null);
        E = c.estado;
        resultado.preco = { id: lado.preco, linha: PRECO_DA_FALHA[lado.preco].linha };
        resultado.aplicados.push(...c.aplicados);
        resultado.minutos = c.minutos;
        if (lado.escreve) escreve(arr(s.fatosNaFalha).length ? s.fatosNaFalha : s.fatos);
        else m = { ...m, relogio: m.relogio + RELOGIO_DAS_PECAS.porFalhaQueContinua };
      }
    }
    E = comMemoria(E, peca, m);
    return { estado: E, registo: R, resultado };
  } catch {
    return null;
  }
}

/* ---------------- O QUE O NARRADOR RECEBE ----------------
   Tudo decidido; ele só narra. `podeCitar`: os nomes da cena fechada e os
   alvos da peça que o herói conhece (o nome que a peça lhe dá — a alcunha
   de quem ainda não viu). Nome fora desta lista é erro exato, e a fase B
   poda-o (as-pecas.md §3.7). */
export function oQueONarradorRecebe(peca, resultado) {
  if (!obj(peca)) return null;
  const r = obj(resultado) || {};
  const quem = [...new Set(peca.cena.quem.map((q) => q.nome).filter(Boolean))];
  const lugares = [...new Set([peca.cena.onde.nome, ...peca.cena.oQue.filter((x) => x.tipo === "lugar").map((x) => x.nome)].filter(Boolean))];
  const coisas = [...new Set(peca.cena.oQue.filter((x) => x.tipo !== "lugar").map((x) => x.nome))];
  const s = r.solucao ? peca.solucoes.find((x) => x.id === r.solucao) : null;
  const pistaId = r.tipo === "aquecimento" ? null : r.para || (s && s.id);
  const pista = typeof r.pista === "string" && r.pista ? r.pista : ((peca.pistas.find((p) => p.solucao === pistaId) || peca.pistas[0] || {}).diz || "");
  return Object.freeze({
    cena: { onde: peca.cena.onde, quem, oQue: [...lugares, ...coisas] },
    aconteceu: r.tipo === "aquecimento" || r.tipo === "livre" ? { tipo: r.tipo } : {
      tipo: r.tipo || "", acao: r.acao || (s && s.acao) || "", alvo: (s && s.alvo && s.alvo.nome) || "",
      passou: r.passou !== false, fatos: arr(r.fatos).map((a) => a[0]), preco: r.preco ? r.preco.linha : "",
    },
    pista,
    podeCitar: Object.freeze({ quem, lugares, coisas }),
  });
}
