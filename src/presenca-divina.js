/* ============================================================
   PRESENÇA DIVINA (v9.8) — o peso de estar perto de um deus

   O efeito já existia no App, mas dependia de UMA coisa frágil: o
   Mestre lembrar de mandar `"gd": 3` dentro do combate_iniciar. Se
   ele esquecesse — e ele esquece —, a divindade entrava na luta como
   um orc qualquer: sem Regra do Degrau, sem imunidade de escopo, sem
   presença nenhuma. O sistema tinha a mecânica e nunca a via.

   Aqui o GD deixa de ser um favor do Mestre. O sistema descobre
   sozinho, nesta ordem:

     1. o campo `gd`, se veio;
     2. o panteão do mundo — se o nome bate com um deus conhecido,
        o GD é o DELE, e nenhuma narração muda isso;
     3. o que o nome e a descrição anunciam ("Avatar de", "arauto
        divino", "encarnação de");
     4. mortal.

   E a presença vale para os DOIS lados: um deus em cena esmaga
   mortais, e o herói que ascendeu também faz joelho dobrar.
   ============================================================ */

import { criarCondicao } from "./condicoes.js";

/* Condições que a presença de um deus impõe a um mortal. Cegar está aqui
   porque é o efeito clássico: ninguém olha para o divino de frente. */
export const EFEITOS_PRESENCA = ["amedrontado", "cego", "enfeiticado"];

const MARCA_DIVINA = /\b(divindade|deus|deusa|avatar de|arauto divino|encarna[çc][ãa]o de|semideus)\b/i;

/* ---------------- DESCOBRIR O GRAU ----------------
   Nunca confia só no que o Mestre mandou. */
export function gdDeCriatura(inimigo, panteao = []) {
  if (!inimigo) return 0;
  const nome = String(inimigo.nome || "");
  /* o panteão manda: se é um deus conhecido, o GD é o dele */
  const doPanteao = (panteao || []).find((d) => d && d.nome && nome.toLowerCase().includes(String(d.nome).toLowerCase()));
  if (doPanteao) return Math.max(0, Math.min(4, Number(doPanteao.gd) || 3));
  const declarado = Math.max(0, Math.min(4, Number(inimigo.gd) || 0));
  if (declarado) return declarado;
  if (MARCA_DIVINA.test(`${nome} ${inimigo.desc || inimigo.ameaca || ""}`)) return 3;
  return 0;
}

/* Passa a lista inteira de inimigos pelo crivo, devolvendo-a com o gd certo.
   É isto que o App chama ao abrir um combate. */
export function reconciliarGraus(inimigos, panteao = []) {
  return (inimigos || []).map((e) => {
    const gd = gdDeCriatura(e, panteao);
    return gd === (e.gd || 0) ? e : { ...e, gd, gdPeloSistema: !e.gd };
  });
}

/* ---------------- A RESISTÊNCIA ----------------
   Uma vez por combate, e só quando a diferença é grande o bastante para a
   cena mudar: dois degraus. Menos que isso é rivalidade, não terror. */
export const DIFERENCA_MINIMA = 2;
export function dificuldadeDaPresenca(gd) { return 10 + 2 * Math.max(0, gd || 0); }

const temItemConsagrado = (ent) => [...(ent && ent.equipados ? Object.values(ent.equipados) : []), ...((ent && ent.inventario) || [])]
  .some((it) => it && /consagrad|abençoad|abencoad|sagrad|divin|relicári|relicari/i.test(it.nome || ""));

/* Devolve o desfecho SEM tocar em ninguém — quem aplica é o App. Assim dá
   para testar a regra inteira sem React e sem combate de verdade. */
export function resolverPresenca({ fonte, jogador, grupo = [], gdJogador = 0, rolar = () => 1 + Math.floor(Math.random() * 20), sortear = Math.random }) {
  const gdF = Math.max(0, Number(fonte && fonte.gd) || 0);
  if (gdF - (gdJogador || 0) < DIFERENCA_MINIMA) return null;
  const dc = dificuldadeDaPresenca(gdF);

  const bonusJ = Math.max((jogador.atributos && jogador.atributos.vigor) || 0, (jogador.atributos && jogador.atributos.presenca) || 0)
    + (temItemConsagrado(jogador) ? 4 : 0)
    + ((jogador.nivel || 1) >= 15 ? 2 : 0);
  const rJ = rolar() + bonusJ;
  const passouJ = rJ >= dc;
  const condId = EFEITOS_PRESENCA[Math.floor(sortear() * EFEITOS_PRESENCA.length)] || "amedrontado";
  const condJ = passouJ ? null : criarCondicao(condId, { turnos: 3, origem: `presença de ${fonte.nome}` });

  /* companheiros: vínculo 4+ é imune — quem convive com o herói já viu
     coisas demais para ajoelhar por causa de brilho */
  const afetados = [];
  for (const g of grupo) {
    if ((g.vinculo ?? 0) >= 4) continue;
    const rG = rolar() + Math.max((g.atributos && g.atributos.vigor) || 0, 1) + (temItemConsagrado(g) ? 4 : 0);
    if (rG >= dc) continue;
    afetados.push({ nome: g.nome, cond: criarCondicao("amedrontado", { turnos: 3, origem: `presença de ${fonte.nome}` }), rolagem: rG });
  }

  const linhas = [passouJ
    ? `🌑 A presença de ${fonte.nome} (GD ${gdF}) pesa como chumbo — você firma os pés e RESISTE (${rJ} vs ${dc}).`
    : `🌑 A presença de ${fonte.nome} (GD ${gdF}) esmaga o ar: você resiste (${rJ} vs ${dc})… e falha — ${condJ.nome.toLowerCase()} por 3 turnos (${condJ.efeito}).`];
  for (const a of afetados) linhas.push(`🌑 ${a.nome} não suporta olhar para ${fonte.nome} — fica amedrontado.`);

  return {
    dc, rolagemJogador: rJ, passouJogador: passouJ, condJogador: condJ, afetados, linhas,
    nota: passouJ
      ? `[PRESENÇA DIVINA — SISTEMA ROLOU] Encarei ${fonte.nome} (GD ${gdF}) e RESISTI (${rJ} vs ${dc}). Narre o peso da presença e o esforço de continuar de pé — sem aplicar efeito nenhum, porque não houve.`
      : `[PRESENÇA DIVINA — SISTEMA ROLOU E APLICOU] Falhei na resistência contra ${fonte.nome} (GD ${gdF}): estou ${condJ.nome.toLowerCase()} (${condJ.efeito}) por 3 turnos${afetados.length ? `, e ${afetados.map((a) => a.nome).join(", ")} ficaram amedrontados` : ""}. O efeito JÁ está na ficha — narre a manifestação e NÃO aplique outra condição por causa disso.`,
  };
}

/* ---------------- O OUTRO LADO ----------------
   O herói que ascendeu também pesa no ar. A promessa estava no prompt do
   Mestre desde o começo e nunca teve código atrás. Fora de combate isto é
   TEMPERO: só dispara contra quem não convive com ele. */
export function presencaDoHeroi({ gdJogador, alvos = [], nomeHeroi = "você", rolar = () => 1 + Math.floor(Math.random() * 20) }) {
  if ((gdJogador || 0) < 3) return null;
  const dc = dificuldadeDaPresenca(gdJogador);
  const dobrados = [];
  for (const a of alvos) {
    if ((a.vinculo ?? 0) >= 3) continue;             // conhecidos não se curvam
    const r = rolar() + Math.max((a.atributos && a.atributos.vigor) || 0, 1);
    if (r >= dc) continue;
    dobrados.push({ nome: a.nome, rolagem: r });
  }
  if (!dobrados.length) return null;
  return {
    dc, dobrados,
    texto: `👁 A presença de ${nomeHeroi} pesa: ${dobrados.map((d) => d.nome).join(", ")} não ${dobrados.length > 1 ? "conseguem" : "consegue"} encarar.`,
    nota: `[PRESENÇA DIVINA DO HERÓI — SISTEMA ROLOU] Diante de mim, ${dobrados.map((d) => d.nome).join(", ")} falharam na resistência: desviam o olhar, baixam a voz, alguns se ajoelham sem decidir. Narre isso como cor da cena — não como controle mental e não como combate.`,
  };
}

export const PRESENCA_PROMPT = `PRESENÇA DIVINA (v9.8 — o sistema rola, você narra):
- Quando uma divindade entra em cena, o SISTEMA identifica o grau dela sozinho (pelo panteão do mundo) e rola a resistência de todo mundo. Você não precisa mandar o campo "gd" — se mandar, ótimo; se esquecer, o sistema resolve. O que você NUNCA faz é aplicar medo, cegueira ou paralisia por presença divina por conta própria.
- O envelope "[PRESENÇA DIVINA — SISTEMA ROLOU]" chega com o resultado pronto. Narre o peso da cena com toda a força — e nada além do que o envelope disse.
- Vale para o herói ascendido também: se ele for GD 3+, mortais desconhecidos desviam o olhar perto dele. É cor de cena, nunca controle mental, e nunca vale para o grupo íntimo.`;
