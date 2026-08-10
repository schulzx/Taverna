/* ============================================================
   ASCENSÃO PELO SISTEMA (v9.6) — deicídio com provas de verdade

   O relato que originou este arquivo: o herói era Semideus (GD 2),
   derrotou uma Divindade Menor (GD 3), "assimilou o poder dela" —
   sem nenhum teste — e o Mestre narrou a ascensão. Na ficha, ele
   continuou GD 2. A narração e o sistema contavam histórias
   diferentes, e a do sistema era a única que valia.

   Aqui a ascensão vira MECÂNICA:

     1. o sistema RECONHECE quando um deus tomba em combate;
     2. abre o RITO — três provas, roladas de verdade, com
        dificuldade fixada pelo código;
     3. só as três provas vencidas sobem o grau e transferem
        os fiéis;
     4. e um cão de guarda lê a narração: se o Mestre disser que
        você virou deus sem o rito, o sistema o corrige na hora.

   O Mestre nunca decide isto. Ele narra o que o dado resolveu.
   ============================================================ */

import { GRAUS, grauDe, tituloDe, gdMaximoPorNivel } from "./divindades.js";

/* ---------------- AS PROVAS ----------------
   Três, na ordem, cada uma uma cena. A dificuldade é fixa e alta de
   propósito: roubar a divindade de alguém deve ser a coisa mais difícil
   que o herói já tentou. */
export const PROVAS_DEICIDIO = [
  { id: "corpo",    nome: "Encontrar o corpo verdadeiro", teste: "percepcao", dificuldade: 20, nota: "deuses não morrem onde parecem estar", motivo: "achar o corpo verdadeiro do deus caído" },
  { id: "proteca",  nome: "Romper a proteção divina",     teste: "presenca",  dificuldade: 22, nota: "o domínio se fecha em volta do dono como uma casca", motivo: "romper a casca de proteção do domínio" },
  { id: "absorver", nome: "Absorver o domínio",           teste: "intelecto", dificuldade: 24, nota: "falhar aqui não mata: dispersa o poder e queima quem tentou", motivo: "absorver o domínio no instante exato da morte" },
];

export const PROVAS_RELIQUIA = [
  { id: "decifrar",  nome: "Decifrar o ritual",        teste: "intelecto", dificuldade: 20, nota: "línguas que precedem a escrita", motivo: "decifrar o ritual da fonte milenar" },
  { id: "sustentar", nome: "Sustentar a canalização",  teste: "vigor",     dificuldade: 22, nota: "o corpo mortal não foi feito para isso", motivo: "sustentar a canalização da fonte" },
  { id: "manter",    nome: "Não se perder no que entra", teste: "percepcao", dificuldade: 23, nota: "falhar aqui não mata — apaga quem você era", motivo: "não se perder no poder que entra" },
];

export function provasDoCaminho(caminho) {
  return caminho === "reliquia" ? PROVAS_RELIQUIA : PROVAS_DEICIDIO;
}

/* ---------------- RECONHECER O DEUS ABATIDO ----------------
   Um inimigo é divindade se estiver no panteão conhecido, se vier
   marcado, ou se o nome/descrição o anunciar como tal. O sistema não
   pode depender do Mestre lembrar de avisar. */
const MARCA_DIVINA = /\b(divindade|deus|deusa|semideus|avatar de|arauto divino|encarna[çc][ãa]o de)\b/i;

export function identificarDivindadeAbatida(inimigos, divindade) {
  const lista = (inimigos || []).filter((e) => e && (e.derrotado || (e.vida != null && e.vida <= 0)));
  if (!lista.length) return null;
  const panteao = (divindade && divindade.panteao) || [];
  const jaTomados = new Set(((divindade && divindade.deicidios) || []).map((d) => String(d.nome || "").toLowerCase()));
  for (const e of lista) {
    const nome = String(e.nome || "");
    if (jaTomados.has(nome.toLowerCase())) continue;
    const doPanteao = panteao.find((d) => d.nome && nome.toLowerCase().includes(String(d.nome).toLowerCase()));
    if (doPanteao) return { nome: doPanteao.nome, gd: doPanteao.gd || 3, fieis: doPanteao.fieis || 0, dominio: doPanteao.dominio || "", icone: doPanteao.icone || "✦", doPanteao: true };
    if (e.divindade || e.gd != null) return { nome, gd: Number(e.gd) || 3, fieis: Number(e.fieis) || 0, dominio: e.dominio || "", icone: "✦", doPanteao: false };
    if (MARCA_DIVINA.test(`${nome} ${e.desc || ""}`)) return { nome, gd: 3, fieis: 0, dominio: "", icone: "✦", doPanteao: false };
  }
  return null;
}

/* Vale a pena abrir o rito? Só se o alvo tinha grau igual ou maior — matar
   um semideus não faz de um semideus uma divindade. */
export function podeAbrirRito(divindade, alvo, nivel) {
  if (!divindade || !divindade.despertar) return { pode: false, motivo: "você ainda não despertou" };
  if (divindade.rito) return { pode: false, motivo: "já há um rito em curso" };
  if (!alvo) return { pode: false, motivo: "não há deus abatido" };
  const meu = grauDe(divindade, nivel);
  if ((alvo.gd || 0) < meu) return { pode: false, motivo: `${alvo.nome} era GD ${alvo.gd} e você já é GD ${meu} — não há domínio maior a tomar` };
  if (meu >= 4) return { pode: false, motivo: "você já está no ápice da escala" };
  const teto = gdMaximoPorNivel(nivel);
  if (meu >= teto) return { pode: false, motivo: `seu nível ainda não sustenta GD ${meu + 1} (teto atual: GD ${teto})` };
  return { pode: true, motivo: "" };
}

/* ---------------- O RITO ---------------- */
export function iniciarRito(divindade, alvo, caminho = "deicidio") {
  return {
    ...divindade,
    rito: {
      caminho, alvo,
      etapa: 0,                     // qual prova vem agora
      resultados: [],               // o que já foi rolado
      aberto: Date.now(),
    },
  };
}

export function provaAtual(divindade) {
  const r = divindade && divindade.rito;
  if (!r) return null;
  const provas = provasDoCaminho(r.caminho);
  if (r.etapa >= provas.length) return null;
  return { ...provas[r.etapa], indice: r.etapa, total: provas.length };
}

/* Registra o resultado de uma prova. Devolve { divindade, desfecho, texto, nota }. */
export function registrarProva(divindade, sucesso, nivel) {
  const r = divindade && divindade.rito;
  const prova = provaAtual(divindade);
  if (!r || !prova) return { divindade, desfecho: "nenhum", texto: "", nota: "" };
  const resultados = [...r.resultados, { id: prova.id, sucesso }];

  if (!sucesso) {
    /* falhar em qualquer prova encerra o rito. O poder se dispersa e o herói
       fica com a marca da tentativa — não com o domínio. */
    const dv = { ...divindade, rito: null, ritoFalho: { alvo: r.alvo, prova: prova.id, quando: Date.now() } };
    return {
      divindade: dv, desfecho: "falhou",
      texto: `✖ ${prova.nome}: falhou. O rito se desfaz — o domínio de ${r.alvo.nome} se dispersa no ar.`,
      nota: `[RITO DE ASCENSÃO — RESOLVIDO PELO SISTEMA] Falhei na prova "${prova.nome}" (${prova.nota}). O rito ACABOU e eu NÃO ascendi: continuo ${tituloDe(grauDe(divindade, nivel))}. Narre a dispersão do poder e o custo disso em duas ou três frases — algo doeu, algo se perdeu. NÃO me chame de deus, NÃO diga que absorvi nada e NÃO ofereça uma segunda chance nesta cena.`,
    };
  }

  if (r.etapa + 1 < provasDoCaminho(r.caminho).length) {
    const prox = provasDoCaminho(r.caminho)[r.etapa + 1];
    const dv = { ...divindade, rito: { ...r, etapa: r.etapa + 1, resultados } };
    return {
      divindade: dv, desfecho: "avancou",
      texto: `✓ ${prova.nome}: vencida. Falta: ${prox.nome}.`,
      nota: `[RITO DE ASCENSÃO — RESOLVIDO PELO SISTEMA] Venci a prova "${prova.nome}". O rito continua e a próxima é "${prox.nome}" (${prox.nota}). Narre esta etapa como uma CENA curta e tensa, e termine devolvendo a palavra para mim — não pule para a próxima prova, não conceda o poder ainda e não diga que ascendi.`,
    };
  }

  /* as três venceram: o sistema aplica o grau */
  return concluirRito({ ...divindade, rito: { ...r, resultados } }, nivel);
}

export function concluirRito(divindade, nivel) {
  const r = divindade.rito;
  const alvo = r.alvo;
  const antes = grauDe(divindade, nivel);
  const herdados = Math.round((alvo.fieis || 0) * 0.5);
  const dv = {
    ...divindade,
    rito: null,
    grausGanhos: Math.max(Number(divindade.grausGanhos) || 0, antes + 1),
    fieis: Math.max(0, (divindade.fieis || 0) + herdados),
    dominio: divindade.dominio || alvo.dominio || "",
    deicidios: [...(divindade.deicidios || []), { nome: alvo.nome, gd: alvo.gd, dominio: alvo.dominio, quando: Date.now() }],
    /* o panteão perde um nome — e o culto dele ganha um inimigo eterno */
    panteao: (divindade.panteao || []).filter((d) => d.nome !== alvo.nome),
  };
  const depois = grauDe(dv, nivel);
  return {
    divindade: dv, desfecho: "ascendeu", grau: depois, herdados,
    texto: `★ RITO CONCLUÍDO — você tomou o domínio de ${alvo.nome}: GD ${antes} → GD ${depois} (${tituloDe(depois)})${herdados ? ` · ${herdados} fiéis mudaram de nome` : ""}`,
    nota: `[ASCENSÃO — RESOLVIDA E APLICADA PELO SISTEMA] Venci as três provas e absorvi o domínio de ${alvo.nome}. A ficha JÁ FOI ALTERADA: sou ${tituloDe(depois)} (GD ${depois})${herdados ? ` e ${herdados} fiéis dele passaram a rezar para mim` : ""}. Narre a ascensão à altura — isto muda o mundo, não só a minha ficha — e trate os números como fato consumado. NÃO invente grau, título nem poder além deste. O culto de ${alvo.nome} agora me odeia para sempre; anote isso no mundo.`,
  };
}

export function cancelarRito(divindade) {
  return { ...divindade, rito: null };
}

/* ---------------- CÃO DE GUARDA ----------------
   O Mestre narrou uma ascensão que o sistema não deu? Corrige na hora.
   É a mesma lógica dos cães de guarda de condição e de morte: a narração
   não pode criar fato mecânico. */
/* A frase que abriu esta discussão — "Você ascende: agora é uma divindade de
   grau 3" — passava batida: o padrão exigia o substantivo colado ao verbo, e
   ali vinha dois-pontos no meio. As duas últimas alternativas fecham isso sem
   abrir a porta para falso positivo: exigem palavra DIVINA na vizinhança, então
   "ascende ao trono" ou "ascende a escadaria" continuam de fora. */
const NARROU_ASCENSAO = /(voc[êe]|tu)\s+(agora\s+)?(se\s+)?(torn(a|ou|aste)|vira(ste|)|ascende(u|ste|)|[ée])\s+(um[a]?\s+)?(deus|deusa|divindade|semideus|ser divino)|ascendeu a (deus|divindade|semideus)|sua ascens[ãa]o (est[áa] )?(completa|consumada)|voc[êe] absorve(u)? o (poder|dom[íi]nio) (de|da|do)|assimil(a|ou) o (poder|dom[íi]nio)|voc[êe] ascende(u)?[^.!?]{0,70}(deus|deusa|divindade|semideus|divin[oa]|grau \d|gd ?\d)|(voc[êe]|tu) (agora )?[ée] (um[a]?\s+)?(deus|deusa|divindade|semideus)\b/i;

export function detectarAscensaoNarrada(texto, divindade, nivel) {
  if (!texto || !NARROU_ASCENSAO.test(texto)) return null;
  const gd = grauDe(divindade, nivel);
  const emRito = !!(divindade && divindade.rito);
  return {
    gd, emRito,
    nota: emRito
      ? `[CORREÇÃO DO SISTEMA — ASCENSÃO] Você narrou como se eu já tivesse absorvido o poder, mas o RITO AINDA ESTÁ EM CURSO: falta vencer "${(provaAtual(divindade) || {}).nome || "as provas restantes"}". Eu continuo ${tituloDe(gd)} (GD ${gd}). Reescreva mentalmente: o poder está ali, ao alcance, e ainda NÃO é meu. Daqui em diante trate meu grau como GD ${gd} até o sistema avisar o contrário.`
      : `[CORREÇÃO DO SISTEMA — ASCENSÃO] Você narrou que eu me tornei um ser divino de grau maior, mas o SISTEMA não registrou nenhuma ascensão: eu continuo ${tituloDe(gd)} (GD ${gd}). Ascensão não acontece por narrativa — ela exige o rito, e o rito é rolado pelo sistema. Daqui em diante trate meu grau como GD ${gd}, e se um deus tombou nesta cena, diga apenas que o poder dele ficou solto e ao alcance: o sistema abrirá o rito.`,
  };
}

/* ---------------- RESUMO PARA O RODAPÉ ---------------- */
export function resumoRitoPrompt(divindade, nivel) {
  const r = divindade && divindade.rito;
  if (!r) return "";
  const p = provaAtual(divindade);
  if (!p) return "";
  return `RITO DE ASCENSÃO EM CURSO (${r.caminho === "reliquia" ? "Fonte Milenar" : `deicídio de ${r.alvo.nome}`}): prova ${p.indice + 1} de ${p.total} — "${p.nome}" (${p.nota}). Conduza esta prova como uma CENA e espere a rolagem do sistema. Eu ainda sou ${tituloDe(grauDe(divindade, nivel))}: não me trate como algo maior até o sistema anunciar.`;
}

export const ASCENSAO_SISTEMA_PROMPT = `ASCENSÃO (v9.6 — só o sistema promove):
- Grau de Divindade NUNCA muda por narrativa. Nem matar um deus, nem absorver um domínio, nem um ritual bonito sobem o GD sozinhos: existe um RITO de três provas, e quem rola e aplica é o SISTEMA.
- Quando um deus tombar numa luta, você narra o corpo caindo e o poder ficando SOLTO — nada mais. O sistema reconhece o abate e abre o rito; as provas chegam como pedidos de rolagem. Conduza cada prova como uma cena curta e tensa e devolva a palavra ao jogador.
- Só depois do envelope "[ASCENSÃO — RESOLVIDA E APLICADA PELO SISTEMA]" você pode chamá-lo pelo título novo. Antes disso, use sempre o título atual, mesmo que a cena pareça pedir outra coisa.
- Se falhar uma prova, o rito acaba ali: narre a perda com peso e não ofereça segunda chance na mesma cena.`;
